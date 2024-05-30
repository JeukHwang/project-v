import { LatLngTuple } from "leaflet";
import ICJC_JSON from "../../../../../back/data/highway/processed/etc.icjs.json";
import ROADS_JSON from "../../../../../back/data/highway/processed/ETC_도로중심선.json";
import { INTESECTIONS_OBJ_TYPE, ROADS_OBJ_TYPE } from "./type";
import { distance, findClosestPoint } from "./util";

export const ROADS_OBJ = Object.fromEntries(
  Object.entries(ROADS_JSON as unknown as ROADS_OBJ_TYPE).filter(([roadName]) =>
    ["경부선", "중앙선:2/2"].includes(roadName)
  )
);
export const ROADS_NAME = Object.keys(ROADS_OBJ);

// const INTERSECTION: INTESECTIONS_OBJ_TYPE = [];
// for (let i = 0; i < ROADS_NAME.length - 1; i++) {
//   for (let j = i + 1; j < ROADS_NAME.length; j++) {
//     const [nameI, nameJ] = [ROADS_NAME[i], ROADS_NAME[j]];
//     const [geoI, geoJ] = [ROADS_OBJ[nameI], ROADS_OBJ[nameJ]];
//     const enoughClosestPairs = geoI
//       .map((Ip, Ii) => {
//         return geoJ.map((Jp, Ji) => {
//           return { Ip, Ii, Jp, Ji, d: distance(Ip, Jp) };
//         });
//       })
//       .flat()
//       .filter(({ d }) => d < 10);

//     const localClosestPairs = enoughClosestPairs.filter(({ Ip, Jp }) => {
//       const pointsI = findLocalClosestPoints(geoI, Jp);
//       const pointsJ = findLocalClosestPoints(geoJ, Ip);
//       return (
//         pointsI.some(({ point }) => point[0] === Ip[0] && point[1] === Ip[1]) &&
//         pointsJ.some(({ point }) => point[0] === Jp[0] && point[1] === Jp[1])
//       );
//     });
//     console.log(i, j, localClosestPairs.length);
//     for (const { Ip, Ii, Jp, Ji, d } of localClosestPairs) {
//       INTERSECTION.push({
//         type: "intersection",
//         point1: {
//           type: "point",
//           road: true,
//           roadName: nameI,
//           index: Ii,
//           point: Ip,
//         },
//         point2: {
//           type: "point",
//           road: true,
//           roadName: nameJ,
//           index: Ji,
//           point: Jp,
//         },
//         point: {
//           type: "point",
//           road: false,
//           point: [(Ip[0] + Jp[0]) / 2, (Ip[1] + Jp[1]) / 2],
//         },
//         distance: d,
//       });
//     }
//   }
// }

export const ICJC = ICJC_JSON.map((icjc) => ({
  type: icjc["IC/JC명"].endsWith("IC") ? "IC" : "JC",
  name: icjc["IC/JC명"],
  point: [
    parseFloat(icjc["Y좌표값"]),
    parseFloat(icjc["X좌표값"]),
  ] as LatLngTuple,
}));
export const IC = ICJC.filter(({ type }) => type === "IC");
export const JC = ICJC.filter(({ type }) => type === "JC");
console.assert(JC.every(({ name }) => name.endsWith("JCT")));
console.log(IC.length, JC.length);

const INTERSECTION: INTESECTIONS_OBJ_TYPE = [];
for (let i = 0; i < ROADS_NAME.length - 1; i++) {
  for (let j = i + 1; j < ROADS_NAME.length; j++) {
    const [nameI, nameJ] = [ROADS_NAME[i], ROADS_NAME[j]];
    const [geoI, geoJ] = [ROADS_OBJ[nameI], ROADS_OBJ[nameJ]];
    JC.forEach(({ point, name }) => {
      const Ip = findClosestPoint(geoI, point);
      const Jp = findClosestPoint(geoJ, point);
      if (Ip.distance < 200 && Jp.distance < 200) {
        INTERSECTION.push({
          type: "intersection",
          name: name,
          point1: {
            type: "point",
            road: true,
            roadName: nameI,
            index: Ip.index,
            point: Ip.point,
          },
          point2: {
            type: "point",
            road: true,
            roadName: nameJ,
            index: Jp.index,
            point: Jp.point,
          },
          midPoint: {
            type: "point",
            road: false,
            point: [
              (Ip.point[0] + Jp.point[0]) / 2,
              (Ip.point[1] + Jp.point[1]) / 2,
            ],
          },
          rawPoint: point,
          distance: distance(Ip.point, Jp.point),
        });
      }
    });
  }
}

export const INTESECTIONS_OBJ = INTERSECTION;
// export const INTESECTIONS_OBJ: INTESECTIONS_OBJ_TYPE = [
//   {
//     type: "intersection",
//     point1: {
//       type: "point",
//       road: true,
//       roadName: "경부선",
//       index: 1213,
//       point: [35.881365138, 128.701473579],
//     },
//     point2: {
//       type: "point",
//       road: true,
//       roadName: "중앙선",
//       index: 0,
//       point: [35.886258353, 128.693777025],
//     },
//     point: {
//       type: "point",
//       road: false,
//       point: [35.8838117455, 128.697625302],
//     },
//     distance: 881.3824008941489,
//   },
// ];
