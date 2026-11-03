const light = { x: -0.62, y: 0.56, z: Math.sqrt(1 - 0.62 ** 2 - 0.56 ** 2) };
export const LIGHT_LEVELS = 16;

export function surfaceBrightness(horizontal: number, vertical: number, depth: number): number {
  const diffuse = Math.max(0, horizontal * light.x + vertical * light.y + depth * light.z);
  const limb = 0.4 + 0.6 * Math.sqrt(Math.max(0, depth));
  const sunwardRim = Math.max(0, horizontal * light.x + vertical * light.y) * (1 - depth) ** 3;
  return Math.min(1, (0.045 + diffuse * 0.955) * limb * 1.12 + sunwardRim * 0.25);
}

export function glyphForeshortening(horizontal: number, vertical: number) {
  return {
    scaleX: 0.28 + 0.72 * Math.sqrt(Math.max(0, 1 - horizontal * horizontal)),
    scaleY: 0.55 + 0.45 * Math.sqrt(Math.max(0, 1 - vertical * vertical)),
  };
}
