import L, { LatLngTuple } from "leaflet";
import { INTESECTIONS_OBJ, ROADS_OBJ } from "./import";
import {
  Intersection,
  NormalLineNode,
  RoadLineNode,
  RoadPointNode,
} from "./type";

export function findIntersection(
  roadName1: string,
  roadName2: string
): Intersection | null {
  return (
    INTESECTIONS_OBJ.find(
      ({ point1, point2 }) =>
        (point1.roadName === roadName1 && point2.roadName === roadName2) ||
        (point1.roadName === roadName2 && point2.roadName === roadName1)
    ) || null
  );
}

export function toDist(points: LatLngTuple[]): number {
  let sum = 0;
  for (let i = 0; i < points.length - 1; i++) {
    sum += L.latLng(points[i]).distanceTo(L.latLng(points[i + 1]));
  }
  return sum;
}

export function findLocalClosestPoint(
  points: LatLngTuple[],
  point: LatLngTuple
): { point: LatLngTuple; index: number; distance: number }[] {
  const data = points.map((p, i) => {
    return {
      point: p,
      index: i,
      distance: L.latLng(point).distanceTo(L.latLng(p)),
    };
  });
  const localClosest = data.filter(
    ({ distance }, i, data) =>
      (i === 0 || data[i - 1].distance > distance) &&
      (i === data.length - 1 || data[i + 1].distance > distance)
  );
  return localClosest;
}

export function findClosestPoint(
  points: LatLngTuple[],
  point: LatLngTuple
): { point: LatLngTuple; index: number; distance: number } {
  let closest = null as unknown as ReturnType<typeof findClosestPoint>;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const d = L.latLng(point).distanceTo(L.latLng(p));
    if (closest === null || d < closest.distance) {
      closest = { point: p, index: i, distance: d };
    }
  }
  return closest;
}

/** @todo refactor */
export function findClosestNode(
  point: LatLngTuple,
  roadName: "ALL" | string,
  givenPointIsFrom: boolean
): [RoadPointNode & { distance: number }, NormalLineNode] {
  const domain: [string, LatLngTuple[]][] =
    roadName === "ALL"
      ? Object.entries(ROADS_OBJ)
      : [[roadName, ROADS_OBJ[roadName]]];
  let closest = null as unknown as RoadPointNode & { distance: number };
  for (let i = 0; i < domain.length; i++) {
    const [rN, points] = domain[i];
    const p = findClosestPoint(points, point);
    if (closest === null || p.distance < closest.distance) {
      closest = { type: "point", road: true, ...p, roadName: rN };
    }
  }
  const pointFrom = givenPointIsFrom ? point : closest.point;
  const pointTo = givenPointIsFrom ? closest.point : point;
  const line: NormalLineNode = {
    type: "path",
    road: false,
    distance: L.latLng(point).distanceTo(L.latLng(closest.point)),
    pointFrom,
    pointTo,
    points: [pointFrom, pointTo],
  };
  return [closest, line];
}

export function findPathBetweenNodes(
  from: RoadPointNode,
  to: RoadPointNode
): {
  points: [
    RoadPointNode,
    ...Intersection[],
    RoadPointNode
  ] /** @description Length N+1 */;
  lines: RoadLineNode[] /** @description Length N */;
} {
  const roadNameOrder = [
    from.roadName,
    to.roadName,
  ]; /** @todo @description Length N */

  const points: ReturnType<typeof findPathBetweenNodes>["points"] = [
    from,
    ...[...Array.from({ length: roadNameOrder.length - 1 })].map(
      (_, i) => findIntersection(roadNameOrder[i], roadNameOrder[i + 1])!
    ),
    to,
  ];
  const lines: ReturnType<typeof findPathBetweenNodes>["lines"] =
    roadNameOrder.map((roadName) => {
      const indexStart = Math.min(from.index, to.index);
      const indexEnd = Math.max(from.index, to.index) + 1;
      const points = ROADS_OBJ[roadName].slice(indexStart, indexEnd);
      return {
        type: "path",
        road: true,
        roadName,
        distance: toDist(points),
        points,
        indexStart,
        indexEnd,
        pointFrom: from.point,
        pointTo: to.point,
      };
    });
  return { points, lines };
}
