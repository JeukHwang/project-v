import L, { LatLngTuple } from "leaflet";
import { ROADS, ROADS_NAME } from "../import.highway";
import {
  NormalLineNode,
  NormalPointNode,
  PathNodes,
  RoadLineNode,
  RoadPointNode,
} from "./type";
import { findClosestNode } from "./util";

export function findShortestPathWith0Road(
  from: LatLngTuple,
  to: LatLngTuple
): PathNodes {
  const nodes: [NormalPointNode, NormalPointNode] = [
    { type: "point", road: false, point: from },
    { type: "point", road: false, point: to },
  ];
  return {
    nodes,
    distance: L.latLng(from).distanceTo(L.latLng(to)),
  };
}

export function findShortestPathWith1UniqueRoad(
  from: LatLngTuple,
  to: LatLngTuple
): PathNodes {
  let nodes = null as unknown as [
    NormalPointNode,
    NormalLineNode,
    RoadPointNode,
    RoadLineNode,
    RoadPointNode,
    NormalLineNode,
    NormalPointNode
  ];
  let shortestDistance = Infinity;

  for (let i = 0; i < ROADS_NAME.length; i++) {
    const roadName = ROADS_NAME[i];
    const road = ROADS[roadName];
    const [fromRoadPoint, fromRoadPath] = findClosestNode(from, roadName, true);
    const [toRoadPoint, toRoadPath] = findClosestNode(to, roadName, false);
    const [startIndex, endIndex] = [
      Math.min(fromRoadPoint.index, toRoadPoint.index),
      Math.max(fromRoadPoint.index, toRoadPoint.index),
    ];
    const line: RoadLineNode = {
      type: "path",
      road: true,
      roadName,
      indexStart: startIndex,
      indexEnd: endIndex,
      distance: (endIndex - startIndex) * 100,
      pointFrom: from,
      pointTo: to,
      points: road.slice(startIndex, endIndex + 1),
    };
    const distance =
      fromRoadPoint.distance + line.distance + toRoadPoint.distance;
    if (distance < shortestDistance) {
      nodes = [
        { type: "point", road: false, point: from },
        fromRoadPath,
        fromRoadPoint,
        line,
        toRoadPoint,
        toRoadPath,
        { type: "point", road: false, point: to },
      ];
      shortestDistance = distance;
    }
  }
  return {
    nodes,
    distance: shortestDistance,
  };
}

// IC, JC 위치 지도에서 수정할 수 있게 만들어두기 => dataset 구축 이후에 pathfinder 만들기
// IC, JC 를 일단 그리기, marker 움직이고 S 눌러서 저장하게 만들기
// -> 저장은 그냥 console.log 결과를 ctrl+V로 저장

// export function findShortestPathWith1MultipleRoad(
//   from: LatLngTuple,
//   to: LatLngTuple
// ): Path {
//   let nodes = null as unknown as [
//     NormalPointNode,
//     NormalLineNode,
//     RoadPointNode,
//     ...(RoadPointNode | RoadLineNode)[],
//     RoadPointNode,
//     NormalLineNode,
//     NormalPointNode
//   ];
//   let shortestDistance = Infinity;

//   const fromPoint = Object.entries(ROADS).flatMap(
//     ([roadName, points]): [
//       string,
//       { point: LatLngTuple; index: number; distance: number }
//     ][] => findLocalClosestPoint(points, from).map((v) => [roadName, v])
//   );
//   const toPoint = Object.entries(ROADS).flatMap(
//     ([roadName, points]): [
//       string,
//       { point: LatLngTuple; index: number; distance: number }
//     ][] => findLocalClosestPoint(points, to).map((v) => [roadName, v])
//   );
//   for (let i = 0; i < fromPoint.length; i++) {
//     for (let j = 0; j < toPoint.length; j++) {
//       const fromNode: RoadPointNode = {
//         type: "point",
//         road: true,
//         roadName: fromPoint[i][0],
//         index: fromPoint[i][1].index,
//         point: fromPoint[i][1].point,
//         ...fromPoint[i],
//       };
//       const toNode: RoadPointNode = {
//         type: "point",
//         road: true,
//         roadName: toPoint[j][0],
//         index: toPoint[j][1].index,
//         point: toPoint[j][1].point,
//         ...toPoint[j],
//       };
//       const path = findPathBetweenNodes(fromNode, toNode);
//       const distance =
//         fromPoint[i][1].distance +
//         path.lines.reduce((a, b) => a + b.distance, 0) +
//         toPoint[j][1].distance;
//       if (distance < shortestDistance) {
//         const mergedPath = [...Array.from({
//         nodes = [
//           { type: "point", road: false, point: from },
//           {
//             type: "path",
//             road: false,
//             distance: fromPoint[i][1].distance,
//             pointFrom: from,
//             pointTo: fromPoint[i][1].point,
//             points: [from, fromPoint[i][1].point],
//           },
//           ...(path as [RoadPointNode, ...RoadLineNode[], RoadPointNode]),
//           {
//             type: "path",
//             road: false,
//             distance: toPoint[j][1].distance,
//             pointFrom: to,
//             pointTo: toPoint[j][1].point,
//             points: [to, toPoint[j][1].point],
//           },
//           { type: "point", road: false, point: to },
//         ];
//         shortestDistance = distance;
//       }
//     }
//   }

//   return {
//     nodes,
//     distance: shortestDistance,
//   };
// }
