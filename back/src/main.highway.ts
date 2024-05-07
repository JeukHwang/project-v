import path from "path";
import { readCSV } from "./util";
type Node = {
  노선번호: string;
  도로명: string;
  이정: number;
  X좌표값: number;
  Y좌표값: number;
  GRS80X좌표값: number;
  GRS80Y좌표값: number;
};

function processROADS(): { [road: string]: [number, number][][] } {
  const csvPath = path.join(
    __dirname,
    "../highway/raw/ETC_도로중심선_1년_1년_2023.csv"
  );
  const content: string[][] = readCSV(csvPath);
  const [header, ...rows] = content;
  rows.pop(); // last row is empty
  const nodes: Node[] = rows.map((row) => {
    return {
      [header[0]]: row[0],
      [header[1]]: row[1],
      [header[2]]: parseFloat(row[2]),
      [header[3]]: parseFloat(row[3]),
      [header[4]]: parseFloat(row[4]),
      [header[5]]: parseFloat(row[5]),
      [header[6]]: parseFloat(row[6]),
    } as Node;
  });
  const roads = [...new Set(nodes.map((d) => d.도로명))];

  console.assert(nodes.length === 54259, "total node");
  console.assert(roads.length === 53, "total road");

  const object: { [road: string]: [number, number][][] } = Object.fromEntries(
    roads.map((d: string) => {
      const roadNodes: [number, number][][] = [[]];
      for (const { X좌표값: x, Y좌표값: y } of nodes.filter(
        (n) => n.도로명 === d
      )) {
        const xyNode: [number, number] = x > 100 ? [y, x] : [x, y];
        const lastLine = roadNodes[roadNodes.length - 1];
        const lastNode = lastLine[lastLine.length - 1];
        const d =
          ((xyNode[0] - lastNode[0]) ** 2 + (xyNode[1] - lastNode[1]) ** 2) **
          0.5;
        if (d > 0.1) {
          roadNodes.push([xyNode]);
        } else {
          lastLine.push(xyNode);
        }
      }
      return [d, roadNodes];
    })
  );
  return object;
}

// L.CRS.EPSG3857
// EPSG:4326 and Simple CRS : LonLat
// EPSG:3395 CRS : Mercator
// EPSG:3857 CRS : SphericalMercator - default

const ROADS = processROADS();
console.log(Object.keys(ROADS));
console.log(Object.values(ROADS).map((d) => d.length));
console.log(JSON.stringify(ROADS, null, 2));

// pnpm start:highway > ./highway/processed/etc.road.json
