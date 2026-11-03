import type { CellKind } from "./globe";
import { LIGHT_LEVELS } from "./globe-lighting";
export type GlobeColors = { land: string; visited: string; water: string };
type Material = Exclude<CellKind, "space">;

function mixHex(base: string, target: string, amount: number): string {
  const expanded =
    base.length === 4 ? `#${[...base.slice(1)].map((value) => value + value).join("")}` : base;
  if (!/^#[0-9a-f]{6}$/i.test(expanded)) return base;
  const first = Number.parseInt(expanded.slice(1), 16);
  const second = Number.parseInt(target.slice(1), 16);
  const channels = [16, 8, 0].map((shift) =>
    Math.round(((first >> shift) & 255) * (1 - amount) + ((second >> shift) & 255) * amount),
  );
  return `rgb(${channels.join(",")})`;
}

export function materialPalette(colors: GlobeColors): Record<Material, string[]> {
  const shades = (kind: Material, target: string) =>
    Array.from({ length: LIGHT_LEVELS }, (_, level) => {
      const light = level / (LIGHT_LEVELS - 1);
      const warmth = Math.max(0, (light - 0.45) / 0.55);
      return mixHex(colors[kind], target, warmth * (kind === "water" ? 0.5 : 0.9));
    });
  return {
    land: shades("land", "#fff0b5"),
    visited: shades("visited", "#e2ef9a"),
    water: shades("water", "#83b1c9"),
  };
}
