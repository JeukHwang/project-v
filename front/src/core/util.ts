import { distanceTo, LatLngTuple } from "./lib/leaflet";

export type Subtype<T> = T & { readonly __type: unique symbol };

export function length(...positions: LatLngTuple[]): number {
  let sum = 0;
  for (let i = 0; i < positions.length - 1; i++) {
    sum += distanceTo(positions[i], positions[i + 1]);
  }
  return sum;
}

export function findClosestPoint(
  points: LatLngTuple[],
  point: LatLngTuple
): { point: LatLngTuple; index: number; distance: number } {
  let closest = { distance: Infinity } as ReturnType<typeof findClosestPoint>;
  for (let i = 0; i < points.length; i++) {
    const d = distanceTo(points[i], point);
    if (d < closest.distance) {
      closest = { point: points[i], index: i, distance: d };
    }
  }
  return closest;
}
