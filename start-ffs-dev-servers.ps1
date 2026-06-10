# FFS Expo Go dev-server launcher.
# Starts every app in dev-servers.json as an Expo Go dev server over Tailscale so they
# all appear in Expo Go's "Development servers" list on CJ's iPhone (phone is on the tailnet).
# Runs at logon via Task Scheduler task "FFS-DevServers-Logon". Safe to re-run anytime:
# ports already serving are skipped (port-discipline: never clobber a listening port).
#
# Usage:
#   .\start-ffs-dev-servers.ps1                # start anything not already running
#   .\start-ffs-dev-servers.ps1 -Restart       # stop ONLY the registry's FFS servers, then start fresh
#   .\start-ffs-dev-servers.ps1 -Add -Name my-game -Dir archive/apps/my-game
#                                              # register a new app on the next free port and start it

param(
    [switch]$Restart,
    [switch]$Add,
    [string]$Name,
    [string]$Dir
)

$ErrorActionPreference = 'Stop'
$RepoRoot = $PSScriptRoot
$Registry = Join-Path $RepoRoot 'dev-servers.json'
$LogFile  = Join-Path $RepoRoot '.pmloop\dev-servers.log'
New-Item -ItemType Directory -Force (Split-Path $LogFile) | Out-Null

function Log($msg) {
    $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $msg"
    Write-Host $line
    Add-Content -Path $LogFile -Value $line
}

# netstat is much faster than Get-NetTCPConnection on this box (huge TIME_WAIT tables).
# Returns the owning PID if something LISTENs on the port, else $null.
function Get-ListenerPid($port) {
    $hit = netstat -ano -p TCP | Select-String "LISTENING" | Select-String ":$port\s"
    if ($hit) { return ([regex]::Split($hit[0].Line.Trim(), '\s+'))[-1] }
    return $null
}

# --- Resolve the Tailscale address fresh every run (fixes stale-IP-after-rotation) ---
$tsIp = (& tailscale ip -4 2>$null | Select-Object -First 1)
if (-not $tsIp) {
    # Tailscale may still be coming up at logon; retry for up to 2 minutes
    foreach ($i in 1..24) {
        Start-Sleep -Seconds 5
        $tsIp = (& tailscale ip -4 2>$null | Select-Object -First 1)
        if ($tsIp) { break }
    }
}
if (-not $tsIp) { Log "FATAL: no Tailscale IP after 2 min. Servers NOT started."; exit 1 }
Log "Tailscale IP: $tsIp"

$reg = Get-Content $Registry -Raw | ConvertFrom-Json

# --- -Add: register a new app on the next free port in 8081-8089 ---
if ($Add) {
    if (-not $Name -or -not $Dir) { Log "FATAL: -Add requires -Name and -Dir"; exit 1 }
    if ($reg.apps | Where-Object { $_.name -eq $Name }) { Log "App '$Name' already registered."; }
    else {
        $used = $reg.apps | ForEach-Object { $_.port }
        $port = 8081..8089 | Where-Object { $used -notcontains $_ -and -not (Get-ListenerPid $_) } | Select-Object -First 1
        if (-not $port) { Log "FATAL: no free port in 8081-8089."; exit 1 }
        $reg.apps += [pscustomobject]@{ name = $Name; displayName = $Name; dir = $Dir; port = $port }
        $reg | ConvertTo-Json -Depth 5 | Set-Content $Registry
        Log "Registered '$Name' on port $port."
    }
}

foreach ($app in $reg.apps) {
    $appDir = Join-Path $RepoRoot ($app.dir -replace '/', '\')
    if (-not (Test-Path (Join-Path $appDir 'app.json'))) { Log "SKIP $($app.name): dir missing ($appDir)"; continue }

    $listenerPid = Get-ListenerPid $app.port
    if ($listenerPid -and $Restart) {
        # Only kill if the process is a node/Metro process (never clobber something else on our port)
        $owner = Get-Process -Id $listenerPid -ErrorAction SilentlyContinue
        if ($owner -and $owner.ProcessName -match 'node') {
            Log "RESTART $($app.name): stopping node PID $($owner.Id) on port $($app.port)"
            Stop-Process -Id $owner.Id -Force
            Start-Sleep -Seconds 2
            $listenerPid = $null
        } else {
            Log "WARN $($app.name): port $($app.port) held by '$($owner.ProcessName)' (not node) - leaving it alone"
        }
    }
    if ($listenerPid) {
        Log "SKIP $($app.name): port $($app.port) already serving"
        continue
    }

    Log "START $($app.name) on $tsIp`:$($app.port)"
    $env:EXPO_NO_DEPENDENCY_VALIDATION = '1'
    $env:REACT_NATIVE_PACKAGER_HOSTNAME = $tsIp
    # PS7 quirk: $env:CI = '' CREATES an empty var (PS5.1 deleted it); expo's getenv
    # throws "GetEnv.NoBoolean" on empty CI. Remove it outright so children never see it.
    Remove-Item Env:CI -ErrorAction SilentlyContinue
    $outLog = Join-Path $RepoRoot ".pmloop\dev-server-$($app.name).log"
    # Detached, hidden, output to per-app log. cmd /c so npx resolves on PATH.
    Start-Process -FilePath 'cmd.exe' `
        -ArgumentList "/c npx expo start --go --port $($app.port) >> `"$outLog`" 2>&1" `
        -WorkingDirectory $appDir -WindowStyle Hidden
}

# --- Verify: each port must come up and the manifest must advertise the Tailscale IP ---
Start-Sleep -Seconds 25
$allGood = $true
foreach ($app in $reg.apps) {
    try {
        $status = Invoke-RestMethod -Uri "http://127.0.0.1:$($app.port)/status" -TimeoutSec 10
        $manifest = Invoke-WebRequest -Uri "http://127.0.0.1:$($app.port)/" -Headers @{ 'expo-platform' = 'ios'; 'Accept' = 'application/expo+json,application/json' } -TimeoutSec 10 -UseBasicParsing
        # expo+json comes back as byte[] in PowerShell - decode before matching
        $body = if ($manifest.Content -is [byte[]]) { [System.Text.Encoding]::UTF8.GetString($manifest.Content) } else { [string]$manifest.Content }
        if ($body -match [regex]::Escape($tsIp)) {
            Log "OK $($app.displayName): port $($app.port), advertises $tsIp"
        } else {
            Log "BAD $($app.displayName): port $($app.port) is up but does NOT advertise $tsIp (stale server from before an IP change? re-run with -Restart)"
            $allGood = $false
        }
    } catch {
        Log "DOWN $($app.displayName): port $($app.port) not responding yet ($($_.Exception.Message)). Check .pmloop\dev-server-$($app.name).log"
        $allGood = $false
    }
}
Log ($(if ($allGood) { "ALL SERVERS HEALTHY - every app should show in Expo Go on the phone." } else { "ONE OR MORE SERVERS UNHEALTHY - see lines above." }))
