import { District } from "./district";

export type Geometry = GeoJSON.FeatureCollection<
  GeoJSON.Polygon | GeoJSON.MultiPolygon,
  District
>;
