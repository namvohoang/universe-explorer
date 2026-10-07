/**
 * Shader code shared by the faces of the Sun and of the other stars: ways to make blotches and
 * wisps that are the same every time and have no seam, because they are worked out from a
 * point's direction from the middle of the ball, not from a flat map.
 */
export const SURFACE_NOISE = /* glsl */ `
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 p) {
    vec3 cell = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(cell), hash(cell + vec3(1, 0, 0)), f.x),
          mix(hash(cell + vec3(0, 1, 0)), hash(cell + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(cell + vec3(0, 0, 1)), hash(cell + vec3(1, 0, 1)), f.x),
          mix(hash(cell + vec3(0, 1, 1)), hash(cell + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  float layers(vec3 p) {
    return 0.5 * noise(p) + 0.3 * noise(p * 2.1) + 0.2 * noise(p * 4.3);
  }

  // Thin bright wisps: the ridges of a few layers of noise, finer and fainter each time.
  float wisps(vec3 p) {
    float sum = 0.0;
    float weight = 0.5;
    for (int n = 0; n < 4; n += 1) {
      sum += weight * (1.0 - abs(2.0 * noise(p) - 1.0));
      p = p * 2.03 + 7.1;
      weight *= 0.5;
    }
    return sum;
  }
`;
