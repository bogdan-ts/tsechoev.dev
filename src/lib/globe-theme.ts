export function globeOpacity(brightness: number, light: boolean): number {
  return light ? 0.55 + brightness * 0.45 : 0.16 + brightness * 0.84;
}
