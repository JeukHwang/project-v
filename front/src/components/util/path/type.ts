import { LatLngTuple } from "leaflet";

export type ROADS_OBJ_TYPE = {
  [road: string]: LatLngTuple[];
};
export type Intersection = {
  point1: RoadPointNode;
  point2: RoadPointNode;
  point: NormalPointNode;
  distance: number;
};
export type INTESECTIONS_OBJ_TYPE = Intersection[];

interface NormalNode {
  road: false;
}
interface RoadNode {
  road: true;
  roadName: string;
}
interface PointNode {
  type: "point";
  point: LatLngTuple;
}
/** @description Assert points[0] === pointFrom, points[points.length-1] === pointTo */
interface LineNode {
  type: "path";
  distance: number;
  pointFrom: LatLngTuple;
  pointTo: LatLngTuple;
  points: LatLngTuple[];
}

export interface NormalPointNode extends NormalNode, PointNode {}
export interface RoadPointNode extends RoadNode, PointNode {
  index: number;
}
export interface NormalLineNode extends NormalNode, LineNode {}
/** @description Assert set of (ROADS[roadName][startIndex:endIndex+1]) === set of (points) */
export interface RoadLineNode extends RoadNode, LineNode {
  roadName: string;
  indexStart: number;
  indexEnd: number;
}

export interface PathNodes {
  nodes: (NormalPointNode | RoadPointNode | NormalLineNode | RoadLineNode)[];
  distance: number;
}

// function intersect(
//   line1: Position[],
//   line2: Position[]
// ): { i: number; j: number; d: number }[] {
//   const result: { i: number; j: number; d: number }[] = [];
//   for (let i = 0; i < line1.length; i++) {
//     for (let j = 0; j < line2.length; j++) {
//       const d = L.latLng(line1[i]).distanceTo(L.latLng(line2[j]));
//       distanceTo(toLatLng(line1[i]), toLatLng(line2[j]));
//       if (d < 1000) {
//         result.push({ i, j, d });
//       }
//     }
//   }
//   return result;
// }

// function midpoint(p1: Position, p2: Position): Position {
//   return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
// }

// function buildPoints(roads: { [road: string]: Position[] }): Intersection[] {
//   const result = [];
//   const roadNames = Object.keys(roads);
//   for (let i = 0; i < roadNames.length - 1; i++) {
//     for (let j = i + 1; j < roadNames.length; j++) {
//       const roadName1 = roadNames[i];
//       const roadName2 = roadNames[j];
//       const road1 = roads[roadName1];
//       const road2 = roads[roadName2];
//       const intersections = intersect(road1, road2);
//       if (intersections.length === 0) continue;
//       const overlap = intersections.filter((d) => d.d < 50).length > 50;
//       if (overlap) {
//         intersections.sort((a, b) => a.i - b.i || a.j - b.j);
//         let firstIndex = 0;
//         while (firstIndex < intersections.length - 1) {
//           const a = intersections[firstIndex];
//           const b = intersections[firstIndex + 1];
//           if (a.d > 50 && a.d > b.d) {
//             firstIndex += 1;
//           } else {
//             break;
//           }
//         }
//         const first = intersections[firstIndex];
//         let lastIndex = intersections.length - 1;
//         while (lastIndex > 0) {
//           const a = intersections[lastIndex];
//           const b = intersections[lastIndex - 1];
//           if (a.d > 50 && a.d > b.d) {
//             lastIndex -= 1;
//           } else {
//             break;
//           }
//         }
//         const last = intersections[lastIndex];
//         result.push({
//           road1: {
//             name: roadName1,
//             index: first.i,
//             position: road1[first.i],
//           },
//           road2: {
//             name: roadName2,
//             index: first.j,
//             position: road2[first.j],
//           },
//           position: midpoint(road1[first.i], road2[first.j]),
//           distance: first.d,
//         });
//         result.push({
//           road1: {
//             name: roadName1,
//             index: last.i,
//             position: road1[last.i],
//           },
//           road2: {
//             name: roadName2,
//             index: last.j,
//             position: road2[last.j],
//           },
//           position: midpoint(road1[last.i], road2[last.j]),
//           distance: last.d,
//         });
//       } else {
//         const shortest = intersections.sort((a, b) => a.d - b.d)[0];
//         result.push({
//           road1: {
//             name: roadName1,
//             index: shortest.i,
//             position: road1[shortest.i],
//           },
//           road2: {
//             name: roadName2,
//             index: shortest.j,
//             position: road2[shortest.j],
//           },
//           position: midpoint(road1[shortest.i], road2[shortest.j]),
//           distance: shortest.d,
//         });
//       }
//     }
//   }
//   return result;
// }
