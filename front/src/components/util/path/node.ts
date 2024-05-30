import { IC, JC, ROADS_OBJ } from "./import";
import { LatLngTuple } from "./leaflet";
import {
  ICNode,
  NormalLineNode,
  NormalPointNode,
  PathNodes,
  PointNode,
  RoadLineNode,
  RoadPointNode,
} from "./type";
import { distance, findClosestPoint } from "./util";

const IC_POINTS = IC.map(({ point }) => point);
export function findClosestIC(
  point: LatLngTuple,
  roadName = "ALL"
): {
  IC: ICNode;
  index: number;
  distance: number;
} {
  const doaminIC =
    roadName === "ALL"
      ? IC_POINTS
      : IC.filter(({ roadName }) => roadName === roadName).map(
          ({ point }) => point
        );
  const { index, distance } = findClosestPoint(doaminIC, point);
  return { IC: IC[index], index, distance };
}

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
): PathNodes<[RoadPointNode, NormalLineNode, RoadPointNode]>[] {
  const intersection = JC.filter(
    ({ point1, point2 }) =>
      (point1.roadName === fromRoadName && point2.roadName === toRoadName) ||
      (point1.roadName === toRoadName && point2.roadName === fromRoadName)
  );
  console.assert(intersection.length !== 0, "No intersection exist");
  return intersection.map(({ point1, point2 }) => {
    if (point1.roadName === fromRoadName) {
      const normal = findNormalLineFromPoints(point1, point2);
      return {
        nodes: [point1, normal, point2],
        distance: normal.distance,
      }; /** @todo change into Midpoint of ICJC */
    } else {
      const normal = findNormalLineFromPoints(point2, point1);
      return { nodes: [point2, normal, point1], distance: normal.distance };
    }
  });
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

export function findNormalPathToClosestIC<T extends boolean>(
  point: LatLngTuple,
  roadName: "ALL" | string,
  inverse: T = false as T
): PathNodes<Nodes<T>> {
  const closestNode: RoadPointNode = findClosestIC(point, roadName).IC;
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
    const paths = findIntersectionPathFromRoadNames(rNs[i], rNs[i + 1]);
    paths.sort((a, b) => {
      const aDist =
        a.nodes[1].distance +
        findRoadLineFromPoints(lastPoint, a.nodes[0]).distance;
      const bDist =
        b.nodes[1].distance +
        findRoadLineFromPoints(lastPoint, b.nodes[0]).distance;
      return aDist - bDist;
    });
    const shortestPath = paths[0];
    const road = findRoadLineFromPoints(lastPoint, shortestPath.nodes[0]);
    nodes.push(road, ...shortestPath.nodes);
    distance += road.distance + shortestPath.distance;
  }
  const lastPoint = nodes[nodes.length - 1] as RoadPointNode;
  const road = findRoadLineFromPoints(lastPoint, to);
  nodes.push(road, to);
  distance += road.distance;
  return { nodes, distance };
}
