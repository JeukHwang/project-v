import { IC, JC, ROADS_NAME, ROADS_OBJ } from "./import";
import { distanceTo, LatLngTuple } from "./leaflet";
import {
  ICNode,
  JCNode,
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

const EDGES: {
  [road: string]: [
    from: ICNode | JCNode,
    to: ICNode | JCNode,
    distance: number
  ][];
} = {};
for (const road of ROADS_NAME) {
  const roadIC = IC.filter(({ roadName }) => roadName === road);
  const roadJC = JC.filter(
    ({ point1, point2 }) => point1.roadName === road || point2.roadName === road
  );
  // IC <-> IC
  for (let i = 0; i < roadIC.length - 1; i++) {
    for (let j = i + 1; j < roadIC.length; j++) {
      const d = distance(roadIC[i].point, roadIC[j].point);
      if (EDGES[roadIC[i].placeName] === undefined)
        EDGES[roadIC[i].placeName] = [];
      if (EDGES[roadIC[j].placeName] === undefined)
        EDGES[roadIC[j].placeName] = [];
      EDGES[roadIC[i].placeName].push([roadIC[i], roadIC[j], d]);
      EDGES[roadIC[j].placeName].push([roadIC[j], roadIC[i], d]);
    }
  }
  // IC <-> JC
  for (const ic of roadIC) {
    for (const jc of roadJC) {
      const closePoint =
        jc.point1.roadName === ic.roadName ? jc.point1 : jc.point2;
      const d = distance(ic.point, closePoint.point);
      if (EDGES[ic.placeName] === undefined) EDGES[ic.placeName] = [];
      if (EDGES[jc.placeName] === undefined) EDGES[jc.placeName] = [];
      EDGES[ic.placeName].push([ic, jc, d]);
      EDGES[jc.placeName].push([jc, ic, d]);
    }
  }
}

export function findRoadPathFromNodes(
  from: RoadPointNode,
  to: RoadPointNode
): PathNodes<(RoadPointNode | RoadLineNode | NormalLineNode)[]> {
  // find current road, last road
  // copy EDGE
  // add edge between from and nodes in same road with from
  // add edge between from and nodes in same road with to
  // do dijkstra shortest path algorithm
  // backtracking to find

  if (
    from.roadName !== to.roadName &&
    (from.roadName === "남해선(영암순천)" || to.roadName === "남해선(영암순천)")
  ) {
    return {
      nodes: [from, to],
      distance: distanceTo(from.point, to.point),
    };
  }

  const fromICNode: ICNode = {
    ...from,
    placeName: "FROM",
    rawPoint: from.point,
  };
  const toICNode: ICNode = { ...to, placeName: "TO", rawPoint: to.point };

  const fromRoad = from.roadName;
  const toRoad = to.roadName;
  const fromIC = IC.filter(({ roadName }) => roadName === fromRoad);
  const fromJC = JC.filter(
    ({ point1, point2 }) =>
      point1.roadName === fromRoad || point2.roadName === fromRoad
  );
  const toIC = IC.filter(({ roadName }) => roadName === toRoad);
  const toJC = JC.filter(
    ({ point1, point2 }) =>
      point1.roadName === toRoad || point2.roadName === toRoad
  );

  const edges = { ...EDGES } as {
    [place: string]: [ICNode | JCNode, ICNode | JCNode, number][];
  };
  // from <-> fromIC
  for (const ic of fromIC) {
    const d = distanceTo(from.point, ic.point);
    if (edges["FROM"] === undefined) edges["FROM"] = [];
    if (edges[ic.placeName] === undefined) edges[ic.placeName] = [];
    edges["FROM"].push([fromICNode, ic, d]);
    edges[ic.placeName].push([ic, fromICNode, d]);
  }
  // from <-> fromJC
  for (const jc of fromJC) {
    const closePoint = jc.point1.roadName === fromRoad ? jc.point1 : jc.point2;
    const d = distanceTo(from.point, closePoint.point);
    if (edges["FROM"] === undefined) edges["FROM"] = [];
    if (edges[jc.placeName] === undefined) edges[jc.placeName] = [];
    edges["FROM"].push([fromICNode, jc, d]);
    edges[jc.placeName].push([jc, fromICNode, d]);
  }
  // to <-> toIC
  for (const ic of toIC) {
    const d = distanceTo(to.point, ic.point);
    if (edges["TO"] === undefined) edges["TO"] = [];
    if (edges[ic.placeName] === undefined) edges[ic.placeName] = [];
    edges["TO"].push([toICNode, ic, d]);
    edges[ic.placeName].push([ic, toICNode, d]);
  }
  // to <-> toJC
  for (const jc of toJC) {
    const closePoint = jc.point1.roadName === toRoad ? jc.point1 : jc.point2;
    const d = distanceTo(to.point, closePoint.point);
    if (edges["TO"] === undefined) edges["TO"] = [];
    if (edges[jc.placeName] === undefined) edges[jc.placeName] = [];
    edges["TO"].push([toICNode, jc, d]);
    edges[jc.placeName].push([jc, toICNode, d]);
  }

  const distance = {
    [fromICNode.placeName]: 0,
    [toICNode.placeName]: Infinity,
  } as { [key: string]: number };
  const prev = {
    [fromICNode.placeName]: null,
  } as { [key: string]: ICNode | JCNode | null };
  const will_visit: (ICNode | JCNode | null)[] = [fromICNode];
  const visited = [];
  while (will_visit.length > 0) {
    const current = will_visit.pop()!;
    visited.push(current);
    for (const [, toEdge, dist] of edges[current.placeName]) {
      if (visited.every((node) => node.placeName !== toEdge.placeName)) {
        if (
          distance[toEdge.placeName] === undefined ||
          distance[toEdge.placeName] > distance[current.placeName] + dist
        ) {
          distance[toEdge.placeName] = distance[current.placeName] + dist;
          prev[toEdge.placeName] = current;
          will_visit.push(toEdge);
        }
      }
    }
  }

  const minDistance = distance[toICNode.placeName];
  const nodes = [];
  let current: ICNode | JCNode | null = toICNode;
  while (current) {
    nodes.push(current);
    current = prev[current.placeName];
  }
  nodes.reverse();

  const roads: PathNodes<
    (RoadPointNode | RoadLineNode | NormalLineNode)[]
  >["nodes"] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const before = nodes[i];
    const after = nodes[i + 1];
    if (before.type === "point" && after.type === "point") {
      roads.push(before, findRoadLineFromPoints(before, after));
    } else if (before.type === "point" && after.type === "junction") {
      const closePoint =
        before.roadName === after.point1.roadName ? after.point1 : after.point2;
      const farPoint =
        before.roadName === after.point1.roadName ? after.point2 : after.point1;
      roads.push(before, findRoadLineFromPoints(before, closePoint));
      roads.push(closePoint, findRoadLineFromPoints(closePoint, farPoint));
    } else if (before.type === "junction" && after.type === "point") {
      const closePoint =
        before.point1.roadName === after.roadName
          ? before.point1
          : before.point2;
      roads.push(closePoint, findRoadLineFromPoints(closePoint, after));
    } else if (before.type === "junction" && after.type === "junction") {
      const closeBefore =
        before.point1.roadName === after.point1.roadName
          ? before.point1
          : before.point2;
      const farBefore =
        before.point1.roadName === after.point1.roadName
          ? before.point2
          : before.point1;
      const closeAfter =
        before.point1.roadName === after.point1.roadName
          ? after.point1
          : after.point2;
      const farAfter =
        before.point1.roadName === after.point1.roadName
          ? after.point2
          : after.point1;
      roads.push(closeBefore, findRoadLineFromPoints(closeBefore, closeAfter));
      roads.push(closeAfter, findRoadLineFromPoints(closeAfter, farAfter));
    }
  }
  roads.push(to);

  //   console.log(nodes, minDistance);

  //   1  function Dijkstra(Graph, source):
  //   2
  //   3      for each vertex v in Graph.Vertices:
  //   4          dist[v] ← INFINITY
  //   5          prev[v] ← UNDEFINED
  //   6          add v to Q
  //   7      dist[source] ← 0
  //   8
  //   9      while Q is not empty:
  //  10          u ← vertex in Q with minimum dist[u]
  //  11          remove u from Q
  //  12
  //  13          for each neighbor v of u still in Q:
  //  14              alt ← dist[u] + Graph.Edges(u, v)
  //  15              if alt < dist[v]:
  //  16                  dist[v] ← alt
  //  17                  prev[v] ← u
  //  18
  //  19      return dist[], prev[]

  return { nodes: roads, distance: minDistance };
}
