import path from "path";
import { readCSV } from "../util";
import { Intersection, Node, Position } from "./model";
import { distanceTo, toLatLng } from "./util";

export function buildRoads(): { [road: string]: Position[] } {
  const csvPath = path.join(
    __dirname,
    "../../data/highway/raw/ETC_도로중심선_1년_1년_2023.csv"
  );
  const content: string[][] = readCSV(csvPath);
  const [_header, ...rows] = content;
  rows.pop(); /** Remove empty last row */

  const nodes: Node[] = rows.map((row) => {
    return {
      노선번호: row[0],
      노선명: row[1],
      이정: parseFloat(row[2]),
      좌표: [parseFloat(row[3]), parseFloat(row[4])],
      좌표GRS80: [parseFloat(row[5]), parseFloat(row[6])],
    } as Node;
  });
  const roadNames = [...new Set(nodes.map((d) => d.노선명))];
  console.assert(nodes.length === 54259, "total node");
  console.assert(roadNames.length === 53, "total road");

  const object: { [road: string]: Position[] } = Object.fromEntries(
    roadNames
      .map((roadName: string): [string, Position[][]] => {
        const roadNodes: Position[][] = [];
        for (const node of nodes.filter((n) => n.노선명 === roadName)) {
          /** Accidental latitude-longitude reversal for some nodes */
          const [x, y] = node.좌표;
          const xyNode: Position = x > 100 ? [y, x] : [x, y];

          /** Separate sub-segments of each rode */
          if (roadNodes.length === 0) {
            roadNodes.push([xyNode]);
            continue;
          }
          const lastLine = roadNodes[roadNodes.length - 1];
          const lastNode = lastLine[lastLine.length - 1];
          const d = distanceTo(toLatLng(lastNode), toLatLng(xyNode));
          if (d > 1000) {
            roadNodes.push([xyNode]);
          } else {
            lastLine.push(xyNode);
          }
        }
        return [roadName, roadNodes];
      })
      .map(([roadName, lines]): [string, Position[]][] => {
        if (lines.length === 1) {
          return [[roadName, lines[0]]];
        } else {
          return lines.map((line, i) => [
            `${roadName}:${i + 1}/${lines.length}`,
            line,
          ]);
        }
      })
      .flat()
  );
  return object;
}

function intersect(
  line1: Position[],
  line2: Position[]
): { i: number; j: number; d: number }[] {
  const result: { i: number; j: number; d: number }[] = [];
  for (let i = 0; i < line1.length; i++) {
    for (let j = 0; j < line2.length; j++) {
      const d = distanceTo(toLatLng(line1[i]), toLatLng(line2[j]));
      if (d < 1000) {
        result.push({ i, j, d });
      }
    }
  }
  return result;
}

function midpoint(p1: Position, p2: Position): Position {
  return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
}

function buildPoints(roads: { [road: string]: Position[] }): Intersection[] {
  const result = [];
  const roadNames = Object.keys(roads);
  for (let i = 0; i < roadNames.length - 1; i++) {
    for (let j = i + 1; j < roadNames.length; j++) {
      const roadName1 = roadNames[i];
      const roadName2 = roadNames[j];
      const road1 = roads[roadName1];
      const road2 = roads[roadName2];
      const intersections = intersect(road1, road2);
      if (intersections.length === 0) continue;
      const overlap = intersections.filter((d) => d.d < 50).length > 50;
      if (overlap) {
        intersections.sort((a, b) => a.i - b.i || a.j - b.j);
        let firstIndex = 0;
        while (firstIndex < intersections.length - 1) {
          const a = intersections[firstIndex];
          const b = intersections[firstIndex + 1];
          if (a.d > 50 && a.d > b.d) {
            firstIndex += 1;
          } else {
            break;
          }
        }
        const first = intersections[firstIndex];
        let lastIndex = intersections.length - 1;
        while (lastIndex > 0) {
          const a = intersections[lastIndex];
          const b = intersections[lastIndex - 1];
          if (a.d > 50 && a.d > b.d) {
            lastIndex -= 1;
          } else {
            break;
          }
        }
        const last = intersections[lastIndex];
        result.push({
          road1: {
            name: roadName1,
            index: first.i,
            position: road1[first.i],
          },
          road2: {
            name: roadName2,
            index: first.j,
            position: road2[first.j],
          },
          position: midpoint(road1[first.i], road2[first.j]),
          distance: first.d,
        });
        result.push({
          road1: {
            name: roadName1,
            index: last.i,
            position: road1[last.i],
          },
          road2: {
            name: roadName2,
            index: last.j,
            position: road2[last.j],
          },
          position: midpoint(road1[last.i], road2[last.j]),
          distance: last.d,
        });
      } else {
        const shortest = intersections.sort((a, b) => a.d - b.d)[0];
        result.push({
          road1: {
            name: roadName1,
            index: shortest.i,
            position: road1[shortest.i],
          },
          road2: {
            name: roadName2,
            index: shortest.j,
            position: road2[shortest.j],
          },
          position: midpoint(road1[shortest.i], road2[shortest.j]),
          distance: shortest.d,
        });
      }
    }
  }
  return result;
}

const roads = buildRoads();
// console.table(Object.entries(roads).map(([r, ps]) => [r, ps.length]));
// const points = buildPoints(roads);
// console.log(Object.keys(roads).length, points.length);
// console.log(JSON.stringify(points, null, 2));

// pnpm start:road > ../data/highway/processed/ETC_도로중심선.json
console.log(Object.keys(roads))
console.log(JSON.stringify(roads, null, 2));