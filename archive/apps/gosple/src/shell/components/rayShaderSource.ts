// FFS LOCKED SPLASH, canonical, do not redesign. Install/repair via the /ffs-splash
// skill; locked by ~/.claude/rules/ffs-splash-lock.md. GL ray-shader splash, company
// logo + "Romans 8:28". NEVER the Skia RadiantSplashScreen (it black-screens Release
// builds). Chief enforces this in the weekly audit.
// GLSL port of the DEPLOYED iOS Gosple splash shader
// (archive/apps/gosple/src/shell/shaders/lightRays.ts, Skia SkSL) so the native
// splash is identical to the shipped App Store build. Key match vs the web
// version: uRayCount = 14 (sin(angle*14) = denser rays), center at 0.42 from top
// (= 0.58 in WebGL's bottom-left coords), and ray intensity + glow animate in.
// Do not swap to the web rayShader.ts (that one uses angle*7 = half the rays).

export const VERT = `attribute vec2 a_pos; void main(){gl_Position=vec4(a_pos,0,1);}`;

export const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uResolution;
uniform float uTime;

void main(){
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 c = uv - vec2(0.5, 0.58);          // 0.58 bottom-left == 0.42 from top (deployed uCenter)
  float aspect = uResolution.x / uResolution.y;
  c.x *= aspect;
  float dist = length(c);
  float angle = atan(c.y, c.x);

  // Animated uniforms, matching RadiantSplash: rays break in ~400-1200ms, glow pulses.
  float rayIntensity = clamp((uTime - 0.4) / 0.8, 0.0, 1.0);
  float glowRadius = 0.5 + 0.05 * sin(uTime * 0.8);
  float rayCount = 14.0;                    // deployed uRayCount (web uses 7)
  vec3 uColor = vec3(0.831, 0.765, 0.416); // #D4C36A

  float glow = smoothstep(glowRadius, 0.0, dist);
  glow = pow(glow, 1.8);

  float rays = pow(abs(sin(angle * rayCount + uTime * 0.12)), 6.0);
  float rayMask = smoothstep(0.0, 0.08, dist) * smoothstep(0.65, 0.15, dist);
  rays *= rayMask * rayIntensity;

  float rays2 = pow(abs(sin(angle * (rayCount * 0.5) - uTime * 0.08)), 8.0);
  rays2 *= rayMask * rayIntensity * 0.3;

  float bloom = exp(-dist * dist * 18.0) * glowRadius * 1.5;

  float intensity = glow * 0.5 + rays * 0.35 + rays2 * 0.15 + bloom * 0.4;
  intensity = clamp(intensity, 0.0, 1.0);

  vec3 warmWhite = vec3(1.0, 0.97, 0.90);
  vec3 color = mix(uColor, warmWhite, bloom * 0.6);

  gl_FragColor = vec4(color * intensity, intensity);
}`;
