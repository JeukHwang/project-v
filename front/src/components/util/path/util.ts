// import L, { LatLngTuple } from "leaflet";
import { IC } from "./import";
import { distanceTo, LatLngTuple } from "./leaflet";
import { ICNode } from "./type";

export function distance(...points: LatLngTuple[]): number {
  let sum = 0;
  for (let i = 0; i < points.length - 1; i++) {
    // sum += L.latLng(points[i]).distanceTo(L.latLng(points[i + 1]));
    sum += distanceTo(points[i], points[i + 1]);
  }
  return sum;
}

export function findLocalClosestPoints(
  points: LatLngTuple[],
  point: LatLngTuple,
  width: number = 1
): { point: LatLngTuple; index: number; distance: number }[] {
  return points
    .map((p, i) => ({ point: p, index: i, distance: distance(p, point) }))
    .filter(({ distance }, i, data) =>
      [...Array(width).keys()].every(
        (n) =>
          (data[i - n]?.distance ?? Infinity) >= distance &&
          (data[i + n]?.distance ?? Infinity) >= distance
      )
    );
}

export function findClosestPoint(
  points: LatLngTuple[],
  point: LatLngTuple
): { point: LatLngTuple; index: number; distance: number } {
  let closest = { distance: Infinity } as ReturnType<typeof findClosestPoint>;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const d = distance(p, point);
    if (d < closest.distance) {
      closest = { point: p, index: i, distance: d };
    }
  }
  return closest;
}

const IC_POINTS = IC.map(({ point }) => point);
export function findClosestIC(point: LatLngTuple): {
  IC: ICNode;
  index: number;
  distance: number;
} {
  const { index, distance } = findClosestPoint(IC_POINTS, point);
  return { IC: IC[index], index, distance };
}
