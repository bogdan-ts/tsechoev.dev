const light = { x: -0.45, y: 0.55, z: Math.sqrt(1 - 0.45 ** 2 - 0.55 ** 2) };

export function surfaceBrightness(horizontal: number, vertical: number, depth: number): number {
  const diffuse = Math.max(0, horizontal * light.x + vertical * light.y + depth * light.z);
  const illumination = 0.12 + diffuse * 0.88;
  const limb = 0.22 + 0.78 * Math.sqrt(Math.max(0, depth));
  return Math.min(1, illumination * limb);
}
