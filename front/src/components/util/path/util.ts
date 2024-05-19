import L, { LatLngTuple } from "leaflet";

export function distance(...points: LatLngTuple[]): number {
  let sum = 0;
  for (let i = 0; i < points.length - 1; i++) {
    sum += L.latLng(points[i]).distanceTo(L.latLng(points[i + 1]));
  }
  return sum;
}

export function findLocalClosestPoints(
  points: LatLngTuple[],
  point: LatLngTuple
): { point: LatLngTuple; index: number; distance: number }[] {
  return points
    .map((p, i) => ({ point: p, index: i, distance: distance(p, point) }))
    .filter(
      ({ distance }, i, data) =>
        (i === 0 || data[i - 1].distance > distance) &&
        (i === data.length - 1 || data[i + 1].distance > distance)
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
