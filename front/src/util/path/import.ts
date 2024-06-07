import ICJC_JSON from "../../../../back/data/highway/processed/etc.icjs.json";
import ROADS_JSON from "../../../../back/data/highway/processed/ETC_도로중심선.json";
import ICJC_PROCESSED from "../../../../data/highway/icjc.json";
import { LatLngTuple } from "./leaflet";
import { ICNode, JCNode, ROADS_OBJ_TYPE } from "./type";
import { distance, findClosestPoint } from "./util";

export const ROADS_OBJ = Object.fromEntries(
  Object.entries(ROADS_JSON as unknown as ROADS_OBJ_TYPE)
//   .filter(([roadName]) =>
//     ["경부선", "중앙선:1/2", "중앙선:2/2", "중부선", "중앙선의 지선"].includes(
//       roadName
//     )
//   )
  //   .slice(0, 20)
);
export const ROADS_NAME = Object.keys(ROADS_OBJ);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function processICJC() {
  const ICJC: { type: "IC" | "JC"; name: string; point: LatLngTuple }[] = [];
  const names = new Set(ICJC_JSON.map(({ "IC/JC명": name }) => name));
  console.assert(
    [...names].every((name) => name.endsWith("IC") || name.endsWith("JCT"))
  );
  for (const rawName of names) {
    const places = ICJC_JSON.filter(({ "IC/JC명": n }) => n === rawName);
    const type = rawName.endsWith("IC") ? "IC" : "JC";
    const name = type === "JC" ? rawName.slice(0, -1) : rawName;
    const point: LatLngTuple = [
      places.reduce((s, { Y좌표값: y }) => s + parseFloat(y), 0) /
        places.length,
      places.reduce((s, { X좌표값: x }) => s + parseFloat(x), 0) /
        places.length,
    ];
    ICJC.push({
      type,
      name,
      point,
    });
  }
  console.assert(ICJC.length === names.size);
  const IC_JSON = ICJC.filter(({ type }) => type === "IC");
  const JC_JSON = ICJC.filter(({ type }) => type === "JC");

  const LIMIT_DISTANCE_WITH_RAW_IC = 200;
  const IC: ICNode[] = [];
  for (let i = 0; i < ROADS_NAME.length; i++) {
    const name = ROADS_NAME[i];
    const geo = ROADS_OBJ[name];
    IC_JSON.forEach(({ point: rawPoint, name: placeName }) => {
      const Ip = findClosestPoint(geo, rawPoint);
      if (Ip.distance < LIMIT_DISTANCE_WITH_RAW_IC) {
        IC.push({
          type: "point",
          rawPoint,
          placeName,
          road: true,
          roadName: name,
          point: Ip.point,
          index: Ip.index,
        });
      }
    });
  }

  const LIMIT_DISTANCE_WITH_RAW_JC = 200;
  const JC: JCNode[] = [];
  for (let i = 0; i < ROADS_NAME.length - 1; i++) {
    for (let j = i + 1; j < ROADS_NAME.length; j++) {
      const [nameI, nameJ] = [ROADS_NAME[i], ROADS_NAME[j]];
      const [geoI, geoJ] = [ROADS_OBJ[nameI], ROADS_OBJ[nameJ]];
      JC_JSON.forEach(({ point, name }) => {
        const Ip = findClosestPoint(geoI, point);
        const Jp = findClosestPoint(geoJ, point);
        if (
          Ip.distance < LIMIT_DISTANCE_WITH_RAW_JC &&
          Jp.distance < LIMIT_DISTANCE_WITH_RAW_JC
        ) {
          JC.push({
            type: "junction",
            placeName: name,
            rawPoint: point,
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
            distance: distance(Ip.point, Jp.point),
          });
        }
      });
    }
  }
  return { ROADS_NAME, IC, JC };
}

/** @description Build */
// const ICJC = processICJC();
// console.log(JSON.stringify(ICJC));

/** @description Load */
export const { IC, JC } = ICJC_PROCESSED as { ROADS_NAME: string[]; IC: ICNode[]; JC: JCNode[] };
