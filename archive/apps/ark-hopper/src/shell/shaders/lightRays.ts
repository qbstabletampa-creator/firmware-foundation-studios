import { Skia, type SkRuntimeEffect } from '@shopify/react-native-skia';

export const LIGHT_RAYS_SOURCE = `
uniform float2 uResolution;
uniform float2 uCenter;
uniform float uTime;
uniform float uRayIntensity;
uniform float uGlowRadius;
uniform float uRayCount;
uniform float3 uColor;

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / uResolution;
  float2 centered = uv - uCenter;
  float aspect = uResolution.x / uResolution.y;
  centered.x *= aspect;

  float dist = length(centered);
  float angle = atan(centered.y, centered.x);

  // Radial glow: warm golden light fading from center
  float glow = smoothstep(uGlowRadius, 0.0, dist);
  glow = pow(glow, 1.8);

  // Light rays: angular pattern using sin, modulated by time
  float rays = pow(abs(sin(angle * uRayCount + uTime * 0.12)), 6.0);
  // Rays fade toward center (avoid harsh center) and toward edges
  float rayMask = smoothstep(0.0, 0.08, dist) * smoothstep(0.65, 0.15, dist);
  rays *= rayMask * uRayIntensity;

  // Secondary subtle rays at different frequency for depth
  float rays2 = pow(abs(sin(angle * (uRayCount * 0.5) - uTime * 0.08)), 8.0);
  rays2 *= rayMask * uRayIntensity * 0.3;

  // Bloom: soft bright core
  float bloom = exp(-dist * dist * 18.0) * uGlowRadius * 1.5;

  // Combine all layers
  float intensity = glow * 0.5 + rays * 0.35 + rays2 * 0.15 + bloom * 0.4;
  intensity = clamp(intensity, 0.0, 1.0);

  // Color: gold core fading to warm amber at edges
  float3 warmWhite = float3(1.0, 0.97, 0.90);
  float3 color = mix(uColor, warmWhite, bloom * 0.6);

  return half4(color * intensity, intensity);
}
`;

let _cached: SkRuntimeEffect | null = null;

export function getLightRaysShader(): SkRuntimeEffect {
  if (!_cached) {
    _cached = Skia.RuntimeEffect.Make(LIGHT_RAYS_SOURCE)!;
  }
  return _cached;
}
