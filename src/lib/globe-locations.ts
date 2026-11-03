import locations from "./data/globe-locations.json";

export type GeoLocation = { latitude: number; longitude: number };
export const globeLocations: Record<string, GeoLocation> = locations;
