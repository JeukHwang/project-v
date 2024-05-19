import { LatLngTuple } from "leaflet";
import { INTESECTIONS_OBJ, ROADS_OBJ } from "./import";
import {
  NormalLineNode,
  NormalPointNode,
  PathNodes,
  PointNode,
  RoadLineNode,
  RoadPointNode,
} from "./type";
import { distance, findClosestPoint } from "./util";

export function findRoadLineFromPoints(
  from: RoadPointNode,
  to: RoadPointNode
): RoadLineNode {
  console.assert(
    from.roadName === to.roadName,
    "from.roadName === to.roadName"
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
    distance: distance(...points),
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
    distance: distance(from.point, to.point),
  };
}

export function findIntersectionPathFromRoadNames(
  fromRoadName: string,
  toRoadName: string
): PathNodes<[RoadPointNode, NormalLineNode, RoadPointNode]> {
  const intersection = INTESECTIONS_OBJ.find(
    ({ point1, point2 }) =>
      (point1.roadName === fromRoadName && point2.roadName === toRoadName) ||
      (point1.roadName === toRoadName && point2.roadName === fromRoadName)
  )!;
  console.assert(intersection !== null, "intersection !== null");
  const { point1, point2 } = intersection;
  if (point1.roadName === fromRoadName) {
    const normal = findNormalLineFromPoints(point1, point2);
    return { nodes: [point1, normal, point2], distance: normal.distance };
  } else {
    const normal = findNormalLineFromPoints(point2, point1);
    return { nodes: [point2, normal, point1], distance: normal.distance };
  }
}

type Nodes<T> = T extends true
  ? [RoadPointNode, NormalLineNode, NormalPointNode]
  : [NormalPointNode, NormalLineNode, RoadPointNode];
export function findNormalPathToClosestNode<T extends boolean>(
  point: LatLngTuple,
  roadName: "ALL" | string,
  inverse: T = false as T
): PathNodes<Nodes<T>> {
  const roads =
    roadName === "ALL" ? ROADS_OBJ : { [roadName]: ROADS_OBJ[roadName] };
  let closestDistance = Infinity;
  let closestNode = null as unknown as RoadPointNode;
  for (const [rN, points] of Object.entries(roads)) {
    const p = findClosestPoint(points, point);
    if (p.distance < closestDistance) {
      closestDistance = p.distance;
      closestNode = { type: "point", road: true, roadName: rN, ...p };
    }
  }
  const pointNode: NormalPointNode = { type: "point", road: false, point };
  if (!inverse) {
    const normal = findNormalLineFromPoints(pointNode, closestNode);
    return {
      nodes: [pointNode, normal, closestNode] as Nodes<T>,
      distance: normal.distance,
    };
  } else {
    const normal = findNormalLineFromPoints(closestNode, pointNode);
    return {
      nodes: [closestNode, normal, pointNode] as Nodes<T>,
      distance: normal.distance,
    };
  }
}

export function findRoadPathFromNodes(
  from: RoadPointNode,
  to: RoadPointNode
): PathNodes<(RoadPointNode | RoadLineNode | NormalLineNode)[]> {
  /** @todo */
  const rNs =
    from.roadName === to.roadName
      ? [from.roadName]
      : [from.roadName, to.roadName];

  let distance = 0;
  const nodes: (RoadPointNode | RoadLineNode | NormalLineNode)[] = [from];
  for (let i = 0; i < rNs.length - 1; i++) {
    const lastPoint = nodes[nodes.length - 1] as RoadPointNode;
    const path = findIntersectionPathFromRoadNames(rNs[i], rNs[i + 1]);
    const road = findRoadLineFromPoints(lastPoint, path.nodes[0]);
    nodes.push(road, ...path.nodes);
    distance += road.distance + path.distance;
  }
  const lastPoint = nodes[nodes.length - 1] as RoadPointNode;
  const road = findRoadLineFromPoints(lastPoint, to);
  nodes.push(road, to);
  distance += road.distance;
  return { nodes, distance };
}
