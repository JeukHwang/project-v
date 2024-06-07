// import path from "path";
// import { readCSV } from "./util";
// type Node = {
//   노선번호: string;
//   도로명: string;
//   이정: number;
//   X좌표값: number;
//   Y좌표값: number;
//   GRS80X좌표값: number;
//   GRS80Y좌표값: number;
// };

// function processROADS(): { [road: string]: [number, number][][] } {
//   const csvPath = path.join(
//     __dirname,
//     "../highway/raw/ETC_도로중심선_1년_1년_2023.csv"
//   );
//   const content: string[][] = readCSV(csvPath);
//   const [header, ...rows] = content;
//   rows.pop(); // last row is empty
//   const nodes: Node[] = rows.map((row) => {
//     return {
//       [header[0]]: row[0],
//       [header[1]]: row[1],
//       [header[2]]: parseFloat(row[2]),
//       [header[3]]: parseFloat(row[3]),
//       [header[4]]: parseFloat(row[4]),
//       [header[5]]: parseFloat(row[5]),
//       [header[6]]: parseFloat(row[6]),
//     } as Node;
//   });
//   const roads = [...new Set(nodes.map((d) => d.도로명))];

//   console.assert(nodes.length === 54259, "total node");
//   console.assert(roads.length === 53, "total road");

//   const object: { [road: string]: [number, number][][] } = Object.fromEntries(
//     roads.map((d: string) => {
//       const roadNodes: [number, number][][] = [[]];
//       for (const { X좌표값: x, Y좌표값: y } of nodes.filter(
//         (n) => n.도로명 === d
//       )) {
//         const xyNode: [number, number] = x > 100 ? [y, x] : [x, y];
//         const lastLine = roadNodes[roadNodes.length - 1];
//         const lastNode = lastLine[lastLine.length - 1];
//         const d =
//           ((xyNode[0] - lastNode[0]) ** 2 + (xyNode[1] - lastNode[1]) ** 2) **
//           0.5;
//         if (d > 0.1) {
//           roadNodes.push([xyNode]);
//         } else {
//           lastLine.push(xyNode);
//         }
//       }
//       return [d, roadNodes];
//     })
//   );
//   return object;
// }

// // L.CRS.EPSG3857
// // EPSG:4326 and Simple CRS : LonLat
// // EPSG:3395 CRS : Mercator
// // EPSG:3857 CRS : SphericalMercator - default

// const ROADS = processROADS();
// console.log(Object.keys(ROADS));
// console.log(Object.values(ROADS).map((d) => d.length));
// console.log(JSON.stringify(ROADS, null, 2));

// // pnpm start:highway > ./highway/processed/etc.road.json

// load;

// import SEOUL_JSON from "../data/highway/processed/seoul.shp.json";
// import { Position } from "./highway/model";
// import { convert } from "./highway/transform";

// interface Property {
//   EMD_CD: string;
//   EMD_KOR_NM: string;
//   EMD_ENG_NM: string;
// }
// const seoul = SEOUL_JSON as GeoJSON.FeatureCollection<
//   GeoJSON.Polygon,
//   Property
// >;

// const [x1, y1, x2, y2] = seoul.bbox!;
// const converted_bbox = [...convert([x1, y1]), ...convert([x2, y2])];

// const converted_seoul = {
//   ...seoul,
//   bbox: converted_bbox,
//   features: seoul.features.map((feature) => {
//     let coordinates;
//     if (feature.geometry.type === "Polygon") {
//       coordinates = feature.geometry.coordinates.map((c) =>
//         c.map((v) => convert(v as Position) as GeoJSON.Position)
//       );
//     } else if (feature.geometry.type === "MultiPolygon") {
//       coordinates = feature.geometry.coordinates.map((c) =>
//         c.map((c2) => c2.map((v) => convert(v as Position) as GeoJSON.Position))
//       );
//     } else {
//       throw new Error(feature.geometry.type);
//     }
//     return {
//       ...feature,
//       geometry: { ...feature.geometry, coordinates },
//     };
//   }),
// };
// console.log(JSON.stringify(converted_seoul, null, 2));

// read csv
import path from "path";
import { convert, convertAA, convertAAA } from "./highway/transform";
import { readCSV, readJson, saveJson } from "./util";

function processICJS() {
  const csvPath = path.resolve(
    "./data/highway/raw/ETC_고속도로 출입시설 위치정보(FILE)_1달_1개월_202404.csv"
  );
  const [header, ...content]: string[][] = readCSV(csvPath)
    .filter((row) => row.length >= 6)
    .map((row) => row.splice(0, 6));
  const obj = content.map((row) => {
    return Object.fromEntries(
      [...Array(6).keys()].map((i) => {
        const key = header[i].replace(/"/g, "");
        const value = row[i].replace(/"/g, "");
        return [key, value];
      })
    );
  });

  saveJson("../data/highway/processed/etc.icjs.json", obj);
}

// processICJS();

const districts = [
  "강원특별자치도",
  "경기도",
  "경상남도",
  "경상북도",
  "광주광역시",
  "대구광역시",
  "대전광역시",
  "부산광역시",
  "서울특별시",
  "세종특별자치시",
  "울산광역시",
  "인천광역시",
  "전라남도",
  "전북특별자치도",
  "제주특별자치도",
  "충청남도",
  "충청북도",
];
console.assert(districts.length === 17);

function printShpjsonScript() {
  for (const district of districts) {
    console.log(
      `npx shp2json "../data/raw/구역의도형_240505/전체분_비압축/${district}/TL_SCCO_GEMD.shp" --encoding euc-kr > ../data/processed/구역의도형_240505/${district}.shp.json`
    );
  }
}

// printShpjsonScript();

function convertFiles() {
  for (const district of districts) {
    const { bbox, features, ...others } = readJson(
      `../../data/processed/구역의도형_240505/${district}.shp.json`
    ) as GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, {}>;
    const converted_json = {
      ...others,
      bbox: bbox
        ? [...convert([bbox[0], bbox[1]]), ...convert([bbox[2], bbox[3]])]
        : null,
      features: features.map((feature) => {
        const { geometry, ...others2 } = feature;
        if (geometry.type === "Polygon") {
          return {
            ...others2,
            geometry: {
              ...geometry,
              coordinates: convertAA(geometry.coordinates),
            },
          };
        } else if (geometry.type === "MultiPolygon") {
          return {
            ...others2,
            geometry: {
              ...geometry,
              coordinates: convertAAA(geometry.coordinates),
            },
          };
        }
      }),
    };
    saveJson(`../../data/processed/구역의도형_240505/${district}.shp.converted.json`, converted_json);
  }
}

// convertFiles();