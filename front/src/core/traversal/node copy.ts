// import { distanceTo } from "../lib/leaflet";
// import {
//   ICNode,
//   JCNode,
//   NormalLineNode,
//   PathNodes,
//   RoadLineNode,
//   RoadPointNode,
// } from "../node/type";
// import { IC, JC, ROADS_NAME } from "./import";
// import { distance } from "../util";

// const EDGES: {
//   [road: string]: [
//     from: ICNode | JCNode,
//     to: ICNode | JCNode,
//     distance: number
//   ][];
// } = {};
// for (const road of ROADS_NAME) {
//   const roadIC = IC.filter(({ roadName }) => roadName === road);
//   const roadJC = JC.filter(
//     ({ point1, point2 }) => point1.roadName === road || point2.roadName === road
//   );
//   // IC <-> IC
//   for (let i = 0; i < roadIC.length - 1; i++) {
//     for (let j = i + 1; j < roadIC.length; j++) {
//       const d = distance(roadIC[i].position, roadIC[j].position);
//       if (EDGES[roadIC[i].placeName] === undefined)
//         EDGES[roadIC[i].placeName] = [];
//       if (EDGES[roadIC[j].placeName] === undefined)
//         EDGES[roadIC[j].placeName] = [];
//       EDGES[roadIC[i].placeName].push([roadIC[i], roadIC[j], d]);
//       EDGES[roadIC[j].placeName].push([roadIC[j], roadIC[i], d]);
//     }
//   }
//   // IC <-> JC
//   for (const ic of roadIC) {
//     for (const jc of roadJC) {
//       const closePoint =
//         jc.point1.roadName === ic.roadName ? jc.point1 : jc.point2;
//       const d = distance(ic.position, closePoint.point);
//       if (EDGES[ic.placeName] === undefined) EDGES[ic.placeName] = [];
//       if (EDGES[jc.placeName] === undefined) EDGES[jc.placeName] = [];
//       EDGES[ic.placeName].push([ic, jc, d]);
//       EDGES[jc.placeName].push([jc, ic, d]);
//     }
//   }
// }

// export function findRoadPathFromNodes(
//   from: RoadPointNode,
//   to: RoadPointNode
// ): PathNodes<(RoadPointNode | RoadLineNode | NormalLineNode)[]> {
//   // find current road, last road
//   // copy EDGE
//   // add edge between from and nodes in same road with from
//   // add edge between from and nodes in same road with to
//   // do dijkstra shortest path algorithm
//   // backtracking to find

//   if (
//     from.roadName !== to.roadName &&
//     (from.roadName === "남해선(영암순천)" || to.roadName === "남해선(영암순천)")
//   ) {
//     return {
//       nodes: [from, to],
//       distance: distanceTo(from.position, to.position),
//     };
//   }

//   const fromICNode: ICNode = {
//     ...from,
//     placeName: "FROM",
//     rawPosition: from.position,
//   };
//   const toICNode: ICNode = { ...to, placeName: "TO", rawPosition: to.position };

//   const fromRoad = from.roadName;
//   const toRoad = to.roadName;
//   const fromIC = IC.filter(({ roadName }) => roadName === fromRoad);
//   const fromJC = JC.filter(
//     ({ point1, point2 }) =>
//       point1.roadName === fromRoad || point2.roadName === fromRoad
//   );
//   const toIC = IC.filter(({ roadName }) => roadName === toRoad);
//   const toJC = JC.filter(
//     ({ point1, point2 }) =>
//       point1.roadName === toRoad || point2.roadName === toRoad
//   );

//   const edges = { ...EDGES } as {
//     [place: string]: [ICNode | JCNode, ICNode | JCNode, number][];
//   };
//   // from <-> fromIC
//   for (const ic of fromIC) {
//     const d = distanceTo(from.position, ic.position);
//     if (edges["FROM"] === undefined) edges["FROM"] = [];
//     if (edges[ic.placeName] === undefined) edges[ic.placeName] = [];
//     edges["FROM"].push([fromICNode, ic, d]);
//     edges[ic.placeName].push([ic, fromICNode, d]);
//   }
//   // from <-> fromJC
//   for (const jc of fromJC) {
//     const closePoint = jc.point1.roadName === fromRoad ? jc.point1 : jc.point2;
//     const d = distanceTo(from.position, closePoint.point);
//     if (edges["FROM"] === undefined) edges["FROM"] = [];
//     if (edges[jc.placeName] === undefined) edges[jc.placeName] = [];
//     edges["FROM"].push([fromICNode, jc, d]);
//     edges[jc.placeName].push([jc, fromICNode, d]);
//   }
//   // to <-> toIC
//   for (const ic of toIC) {
//     const d = distanceTo(to.position, ic.position);
//     if (edges["TO"] === undefined) edges["TO"] = [];
//     if (edges[ic.placeName] === undefined) edges[ic.placeName] = [];
//     edges["TO"].push([toICNode, ic, d]);
//     edges[ic.placeName].push([ic, toICNode, d]);
//   }
//   // to <-> toJC
//   for (const jc of toJC) {
//     const closePoint = jc.point1.roadName === toRoad ? jc.point1 : jc.point2;
//     const d = distanceTo(to.position, closePoint.point);
//     if (edges["TO"] === undefined) edges["TO"] = [];
//     if (edges[jc.placeName] === undefined) edges[jc.placeName] = [];
//     edges["TO"].push([toICNode, jc, d]);
//     edges[jc.placeName].push([jc, toICNode, d]);
//   }

//   const distance = {
//     [fromICNode.placeName]: 0,
//     [toICNode.placeName]: Infinity,
//   } as { [key: string]: number };
//   const prev = {
//     [fromICNode.placeName]: null,
//   } as { [key: string]: ICNode | JCNode | null };
//   const will_visit: (ICNode | JCNode | null)[] = [fromICNode];
//   const visited: (ICNode | JCNode)[] = [];
//   while (will_visit.length > 0) {
//     const current = will_visit.pop()!;
//     if (visited.some((node) => node.placeName === current.placeName)) continue;
//     visited.push(current);
//     for (const [, toEdge, dist] of edges[current.placeName]) {
//       if (
//         distance[toEdge.placeName] === undefined ||
//         distance[toEdge.placeName] > distance[current.placeName] + dist
//       ) {
//         distance[toEdge.placeName] = distance[current.placeName] + dist;
//         prev[toEdge.placeName] = current;
//         will_visit.push(toEdge);
//       }
//     }
//   }

//   const minDistance = distance[toICNode.placeName];
//   const nodes = [];
//   let current: ICNode | JCNode | null = toICNode;
//   while (current) {
//     nodes.push(current);
//     current = prev[current.placeName];
//   }
//   nodes.reverse();

//   console.log(nodes);

//   const roads: PathNodes<
//     (RoadPointNode | RoadLineNode | NormalLineNode)[]
//   >["nodes"] = [];
//   for (let i = 0; i < nodes.length - 1; i++) {
//     const before = nodes[i];
//     const after = nodes[i + 1];
//     if (before.type === "point" && after.type === "point") {
//       roads.push(before, findRoadLineFromPoints(before, after));
//     } else if (before.type === "point" && after.type === "junction") {
//       const closePoint =
//         before.roadName === after.point1.roadName ? after.point1 : after.point2;
//       const farPoint =
//         before.roadName === after.point1.roadName ? after.point2 : after.point1;
//       roads.push(before, findRoadLineFromPoints(before, closePoint));
//       roads.push(closePoint, findRoadLineFromPoints(closePoint, farPoint));
//     } else if (before.type === "junction" && after.type === "point") {
//       const closePoint =
//         before.point1.roadName === after.roadName
//           ? before.point1
//           : before.point2;
//       roads.push(closePoint, findRoadLineFromPoints(closePoint, after));
//     } else if (before.type === "junction" && after.type === "junction") {
//       const closeBefore =
//         before.point1.roadName === after.point1.roadName
//           ? before.point1
//           : before.point2;
//       const farBefore =
//         before.point1.roadName === after.point1.roadName
//           ? before.point2
//           : before.point1;
//       const closeAfter =
//         before.point1.roadName === after.point1.roadName
//           ? after.point1
//           : after.point2;
//       const farAfter =
//         before.point1.roadName === after.point1.roadName
//           ? after.point2
//           : after.point1;
//       roads.push(closeBefore, findRoadLineFromPoints(closeBefore, closeAfter));
//       roads.push(closeAfter, findRoadLineFromPoints(closeAfter, farAfter));
//     }
//   }
//   roads.push(to);

//   //   console.log(nodes, minDistance);

//   //   1  function Dijkstra(Graph, source):
//   //   2
//   //   3      for each vertex v in Graph.Vertices:
//   //   4          dist[v] ← INFINITY
//   //   5          prev[v] ← UNDEFINED
//   //   6          add v to Q
//   //   7      dist[source] ← 0
//   //   8
//   //   9      while Q is not empty:
//   //  10          u ← vertex in Q with minimum dist[u]
//   //  11          remove u from Q
//   //  12
//   //  13          for each neighbor v of u still in Q:
//   //  14              alt ← dist[u] + Graph.Edges(u, v)
//   //  15              if alt < dist[v]:
//   //  16                  dist[v] ← alt
//   //  17                  prev[v] ← u
//   //  18
//   //  19      return dist[], prev[]

//   return { nodes: roads, distance: minDistance };
// }
