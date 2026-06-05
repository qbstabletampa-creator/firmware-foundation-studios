# Phone Testing Workflow (FFS)

Created June 4, 2026.

## The big correction: this is NOT an Expo app anymore

FFS pivoted off Expo/React Native to a **web-first Vite + React + Phaser** monorepo (June 1, 2026). The old Expo apps live in `archive/apps/` and are abandoned (native module crashes).

That means **Expo Go does not run the current games.** Expo Go only loads Expo-managed React Native projects. Pointing it at this repo does nothing.

The good news: the goal behind the Expo Go idea (test on a real phone without burning App Store / EAS builds) is already solved, and it's easier than Expo Go. These are web games. You just open a URL on your phone.

## How to test on your phone (no builds, ever)

The Vite dev server is now bound to the network (`server.host: true`, port `5173` in `vite.config.ts`).

1. On the PC, run the dev server:
   ```
   cd C:\Users\rodge\projects\firmware-foundation-studios
   npm run dev
   ```
2. On your phone, open one of these:
   - **Same Wi-Fi:** `http://192.168.68.50:5173`
   - **Anywhere (Tailscale):** `http://100.103.56.38:5173` — works off home Wi-Fi if the phone has Tailscale on (hostname `stable`).
3. Edit code on the PC. The phone reloads live (hot module reload). Zero builds.

### Notes / gotchas
- The PC Wi-Fi IP (`192.168.68.50`) can change after a router reboot. If the Wi-Fi URL stops working, re-check with `Get-NetIPAddress -AddressFamily IPv4`. The **Tailscale IP `100.103.56.38` is stable** and is the more reliable bet.
- Over a plain `http://` LAN IP the **PWA service worker will not register** (browsers require a secure context for SW outside localhost). Gameplay, sprites, sound, and Stripe links all work fine. Only the "install to home screen" / offline-cache behavior is suppressed in dev. To test the real PWA install, use the deployed Cloudflare Pages site (firmwarefoundation.com), not the LAN dev URL.
- If Windows Firewall blocks the phone, allow Node through on Private networks (one-time prompt the first time `npm run dev` binds to the network).
- Ports 5173-5176 can get squatted by stale dev servers from old sessions. If Vite says "Port 5173 is in use," kill stale node listeners:
  ```powershell
  Get-NetTCPConnection -LocalPort (5173..5176) -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
  ```

## When you DO need a real native build

Native packaging is **Capacitor**, not Expo. Scripts in `package.json`:
- `npm run cap:ios` — build web, sync, open Xcode
- `npm run cap:android` — build web, sync, open Android Studio

You only touch these when shipping to an actual app store. Day-to-day dev and testing never needs them — use the phone URL above.
