/** @see https://gist.github.com/seyuf/ab9c980776e4c2cb350a2d1e70976517?permalink_comment_id=4804822 */

import * as topojsonClient from "topojson-client";
import * as topojsonServer from "topojson-server";

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
