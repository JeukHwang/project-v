/** @see https://gist.github.com/seyuf/ab9c980776e4c2cb350a2d1e70976517?permalink_comment_id=4804822 */

import { LatLng, LatLngTuple } from "leaflet";
import * as topojsonClient from "topojson-client";
import * as topojsonServer from "topojson-server";
import * as topojsonSimplify from "topojson-simplify";

/** @description Compatible with `GeoJSON.Position` */
export type Position = [lat: number, lng: number];
export type Ring = Position[];

export function area(ring: Ring): number {
  if (ring.length < 3) return 0;
  let s = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    s += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return s / 2;
}

function centroidSingle(ring: Ring, area: number): Position {
  if (ring.length === 1) {
    return ring[0];
  } else if (ring.length === 2) {
    return [(ring[0][0] + ring[1][0]) / 2, (ring[0][1] + ring[1][1]) / 2];
  }
  const c = [0, 0];
  for (let i = 0; i < ring.length - 1; i++) {
    const s = ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
    c[0] += (ring[i][0] + ring[i + 1][0]) * s;
    c[1] += (ring[i][1] + ring[i + 1][1]) * s;
  }
  return [c[0] / (area * 6), c[1] / (area * 6)];
}

export function centroid(rings: Ring[]): Position {
  return rings.reduce(
    ([pos, weight]: [Position, number], ring: Ring): [Position, number] => {
      const a = area(ring);
      if (a === 0) return [pos, weight];
      const p = centroidSingle(ring, a);
      return [
        [
          (pos[0] * weight + p[0] * a) / (weight + a),
          (pos[1] * weight + p[1] * a) / (weight + a),
        ],
        weight + a,
      ];
    },
    [[0, 0], 0]
  )[0];
}

export function merge<T extends GeoJSON.GeoJsonProperties>(
  features: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, T>[]
): GeoJSON.MultiPolygon {
  const collections: GeoJSON.FeatureCollection<
    GeoJSON.Polygon | GeoJSON.MultiPolygon,
    T
  > = {
    type: "FeatureCollection",
    features,
  };
  const topology = topojsonServer.topology({
    collections,
  });
  const merged = topojsonClient.merge(
    topology,
    (
      topology.objects.collections as TopoJSON.GeometryCollection<
        TopoJSON.Polygon | TopoJSON.MultiPolygon
      >
    ).geometries as (TopoJSON.Polygon | TopoJSON.MultiPolygon)[]
  );
  return merged;
}

/** coordinate to string */
export function c2s(coord: Position | LatLngTuple | LatLng): string {
  if (Array.isArray(coord)) {
    return `${coord[0].toFixed(3)} ${coord[1].toFixed(3)}`;
  } else {
    return `${coord.lat.toFixed(3)} ${coord.lng.toFixed(3)}`;
  }
}

export function flip<T extends [number, number]>([x, y]: T): T {
  return [y, x] as T;
}

/** @todo Type...??? */
/** @see 적도 경도 1도 <-> 100km / 1e-3 <-> 100m / 1e-6 <-> (100m)^2 */
export function simplified<T extends GeoJSON.GeoJsonProperties>(
  features: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, T>[],
): GeoJSON.Feature<GeoJSON.Geometry, TopoJSON.MultiPolygon>[] {
  const collections: GeoJSON.FeatureCollection<
    GeoJSON.Polygon | GeoJSON.MultiPolygon,
    T
  > = {
    type: "FeatureCollection",
    features,
  };
  const topology = topojsonServer.topology({
    collections,
  }) as TopoJSON.Topology<Exclude<GeoJSON.GeoJsonProperties, null>>;
  const filtered = topojsonSimplify.filter(
    topology,
    topojsonSimplify.filterWeight(topology, 1e-5)
  );
  const presimplified = topojsonSimplify.presimplify(filtered);
  const simplified = topojsonSimplify.simplify(presimplified, 1e-5);
  const geojson = topojsonClient.feature(
    simplified,
    simplified.objects
      .collections as TopoJSON.GeometryCollection<TopoJSON.MultiPolygon>
  );
  return geojson.features;
}
