import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { geoBounds, geoContains } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { countries } from "../src/lib/profile.ts";

type Atlas = Topology<{
  countries: GeometryCollection<{ name: string }>;
  land: GeometryCollection;
}>;

const atlasPath = new URL("../node_modules/world-atlas/", import.meta.url);
const outlines = JSON.parse(
  readFileSync(new URL("countries-50m.json", atlasPath), "utf8"),
) as Atlas;
const lowResolution = JSON.parse(
  readFileSync(new URL("land-110m.json", atlasPath), "utf8"),
) as Atlas;
const land = feature(lowResolution, lowResolution.objects.land);
const shapes = feature(outlines, outlines.objects.countries).features;
const width = 360;
const height = 180;
const bits = Buffer.alloc(Math.ceil((width * height) / 8));

for (let row = 0; row < height; row += 1) {
  for (let column = 0; column < width; column += 1) {
    const longitude = ((column + 0.5) / width) * 360 - 180;
    const latitude = 90 - ((row + 0.5) / height) * 180;
    if (geoContains(land, [longitude, latitude])) {
      const index = row * width + column;
      bits[index >> 3] |= 1 << (index & 7);
    }
  }
}

const visitedWidth = 720;
const visitedHeight = 360;
const visitedBits = Buffer.alloc(Math.ceil((visitedWidth * visitedHeight) / 8));

for (const { name } of countries) {
  const atlasName = name === "Macau" ? "Macao" : name;
  const shape = shapes.find((shape) => shape.properties?.name === atlasName);
  if (!shape) throw new Error(`Missing geography for ${name}`);
  const [[west, south], [east, north]] = geoBounds(shape);
  for (let row = 0; row < visitedHeight; row += 1) {
    const latitude = 90 - ((row + 0.5) / visitedHeight) * 180;
    if (latitude < south || latitude > north) continue;
    for (let column = 0; column < visitedWidth; column += 1) {
      const longitude = ((column + 0.5) / visitedWidth) * 360 - 180;
      const withinLongitude =
        west <= east
          ? longitude >= west && longitude <= east
          : longitude >= west || longitude <= east;
      if (!withinLongitude) continue;
      const index = row * visitedWidth + column;
      if (geoContains(shape, [longitude, latitude])) visitedBits[index >> 3] |= 1 << (index & 7);
    }
  }
}

const dataPath = new URL("../src/lib/data/", import.meta.url);
mkdirSync(dataPath, { recursive: true });
writeFileSync(
  new URL("globe-land.json", dataPath),
  JSON.stringify({ width, height, data: bits.toString("base64") }) + "\n",
);
writeFileSync(
  new URL("globe-visited.json", dataPath),
  JSON.stringify({
    width: visitedWidth,
    height: visitedHeight,
    data: visitedBits.toString("base64"),
    codes: countries.map((country) => country.code),
  }) + "\n",
);
copyFileSync(
  new URL("LICENSE", atlasPath),
  new URL("../public/world-atlas-license.txt", import.meta.url),
);
console.log(`Generated land mask and visited polygon mask for ${countries.length} places.`);
