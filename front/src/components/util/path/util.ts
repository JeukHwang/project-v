import L, { LatLngTuple } from "leaflet";
import { INTESECTIONS_OBJ, ROADS_OBJ } from "./import";
import {
  IntersectionNode,
  NormalLineNode,
  NormalPointNode,
  PathNodes,
  PointNode,
  RoadLineNode,
  RoadPointNode,
} from "./type";

export function distBetween(p1: LatLngTuple, p2: LatLngTuple): number {
  return L.latLng(p1).distanceTo(L.latLng(p2));
}

export function distE2E(points: LatLngTuple[]): number {
  let sum = 0;
  for (let i = 0; i < points.length - 1; i++) {
    sum += distBetween(points[i], points[i + 1]);
  }
  return sum;
}

export function findIntersection(
  roadName1: string,
  roadName2: string
): IntersectionNode | null {
  return (
    INTESECTIONS_OBJ.find(
      ({ point1, point2 }) =>
        (point1.roadName === roadName1 && point2.roadName === roadName2) ||
        (point1.roadName === roadName2 && point2.roadName === roadName1)
    ) || null
  );
}

export function findLocalClosestPoints(
  points: LatLngTuple[],
  point: LatLngTuple
): { point: LatLngTuple; index: number; distance: number }[] {
  const data = points.map((p, i) => {
    return { point: p, index: i, distance: distBetween(p, point) };
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
  let closest = { distance: Infinity } as ReturnType<typeof findClosestPoint>;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const d = distBetween(p, point);
    if (d < closest.distance) {
      closest = { point: p, index: i, distance: d };
    }
  }
  return closest;
}

/** @todo refactor */
export function findPathToClosestNode(
  point: LatLngTuple,
  roadName: "ALL" | string,
  notInverse: boolean
): [NormalPointNode, NormalLineNode, RoadPointNode] {
  const domain: [string, LatLngTuple[]][] =
    roadName === "ALL"
      ? Object.entries(ROADS_OBJ)
      : [[roadName, ROADS_OBJ[roadName]]];
  let closestDistance = Infinity;
  let closestNode = null as unknown as RoadPointNode;
  for (let i = 0; i < domain.length; i++) {
    const [rN, points] = domain[i];
    const p = findClosestPoint(points, point);
    if (p.distance < closestDistance) {
      closestDistance = p.distance;
      closestNode = { type: "point", road: true, ...p, roadName: rN };
    }
  }
  const pointFrom = notInverse ? point : closestNode.point;
  const pointTo = notInverse ? closestNode.point : point;
  const line: NormalLineNode = {
    type: "path",
    road: false,
    distance: closestDistance,
    pointFrom,
    pointTo,
    points: [pointFrom, pointTo],
  };
  return [{ type: "point", road: false, point }, line, closestNode];
}

export function findPathBetweenRoadNodes(
  from: RoadPointNode,
  to: RoadPointNode
): PathNodes {
  let distance = 0;
  const roadNameOrder =
    from.roadName === to.roadName
      ? [from.roadName]
      : [from.roadName, to.roadName]; /** @todo */
  const nodes: PathNodes["nodes"] = [from];
  for (let i = 0; i < roadNameOrder.length - 1; i++) {
    const lastPoint = nodes[nodes.length - 1] as RoadPointNode;
    const intersection = findIntersection(
      roadNameOrder[i],
      roadNameOrder[i + 1]
    )!;
    console.log(intersection, roadNameOrder, i);
    const fromPoint =
      intersection.point1.roadName === lastPoint.roadName
        ? intersection.point1
        : intersection.point2;
    const toPoint =
      intersection.point1.roadName === lastPoint.roadName
        ? intersection.point2
        : intersection.point1;
    const road = findRoadLineFromRoadPoints(lastPoint, fromPoint);
    nodes.push(road);
    nodes.push(fromPoint);
    const normal = findNormalLineFromPoints(fromPoint, toPoint);
    nodes.push(normal);
    nodes.push(toPoint);
    distance += road.distance + normal.distance;
  }
  const lastPoint = nodes[nodes.length - 1] as RoadPointNode;
  const road = findRoadLineFromRoadPoints(lastPoint, to);
  nodes.push(road);
  nodes.push(to);
  distance += road.distance;
  return { nodes, distance };
}

export function findRoadLineFromRoadPoints(
  from: RoadPointNode,
  to: RoadPointNode
): RoadLineNode {
  console.assert(
    from.roadName === to.roadName,
    "findRoadLineFromRoadPoints needs same roadName"
  );
  const indexStart = Math.min(from.index, to.index);
  const indexEnd = Math.max(from.index, to.index) + 1;
  const points = ROADS_OBJ[from.roadName].slice(indexStart, indexEnd);
  return {
    type: "path",
    road: true,
    roadName: from.roadName,
    pointFrom: from.point,
    pointTo: to.point,
    indexStart,
    indexEnd,
    points,
    distance: distE2E(points),
  };
}

export function findNormalLineFromPoints(
  from: PointNode,
  to: PointNode
): NormalLineNode {
  return {
    type: "path",
    road: false,
    pointFrom: from.point,
    pointTo: to.point,
    points: [from.point, to.point],
    distance: distBetween(from.point, to.point),
  };
}
