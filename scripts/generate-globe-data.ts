import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { geoCentroid, geoContains } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { countries } from "../src/lib/profile.ts";

type Atlas = Topology<{ countries: GeometryCollection<{ name: string }>; land: GeometryCollection }>;

const atlasPath = new URL("../node_modules/world-atlas/", import.meta.url);
const outlines = JSON.parse(readFileSync(new URL("countries-50m.json", atlasPath), "utf8")) as Atlas;
const lowResolution = JSON.parse(readFileSync(new URL("land-110m.json", atlasPath), "utf8")) as Atlas;
const land = feature(lowResolution, lowResolution.objects.land);
const shapes = feature(outlines, outlines.objects.countries).features;
const width = 360;
const height = 180;
const bits = Buffer.alloc(Math.ceil(width * height / 8));

for (let row = 0; row < height; row += 1) {
  for (let column = 0; column < width; column += 1) {
    const longitude = (column + 0.5) / width * 360 - 180;
    const latitude = 90 - (row + 0.5) / height * 180;
    if (geoContains(land, [longitude, latitude])) {
      const index = row * width + column;
      bits[index >> 3] |= 1 << (index & 7);
    }
  }
}

const locations = Object.fromEntries(countries.map(({ code, name }) => {
  const atlasName = name === "Macau" ? "Macao" : name;
  const shape = shapes.find(shape => shape.properties?.name === atlasName);
  if (!shape) throw new Error(`Missing geography for ${name}`);
  const [longitude, latitude] = geoCentroid(shape);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error(`Invalid coordinates for ${name}`);
  return [code, { latitude: Number(latitude.toFixed(3)), longitude: Number(longitude.toFixed(3)) }];
}));

const dataPath = new URL("../src/lib/data/", import.meta.url);
mkdirSync(dataPath, { recursive: true });
writeFileSync(new URL("globe-land.json", dataPath), JSON.stringify({ width, height, data: bits.toString("base64") }) + "\n");
writeFileSync(new URL("globe-locations.json", dataPath), JSON.stringify(locations, null, 2) + "\n");
copyFileSync(new URL("LICENSE", atlasPath), new URL("../public/world-atlas-license.txt", import.meta.url));
console.log(`Generated ${width}x${height} land mask and ${countries.length} reference points.`);
