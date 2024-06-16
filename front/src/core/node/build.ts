import ICJC_JSON from "../../../../back/data/highway/processed/etc.icjs.json";
import { ROADS_NAME } from "../../util/highway.legacy";
import { ICJC_CANDIDATE } from "../../util/icjs.data";
import { ROADS_OBJ } from "../../util/path/import";

import { distance, findClosestPoint } from "../../util/path/util";
import { LatLngTuple } from "../lib/leaflet";
import { ICNode, JCNode, PlaceName } from "./type";

function parseToTypeAndName(name: string): { type: "IC" | "JC"; name: PlaceName } {
  if (name.includes("나들목") || name.includes("IC")) {
    return {
      type: "IC",
      name:
        name
          .replaceAll(" ", "")
          .replaceAll("나들목", "")
          .replaceAll("IC", "")
          .trim() + "IC",
    };
  } else if (
    name.includes("갈림목") ||
    name.includes("분기점") ||
    name.includes("JC")
  ) {
    return {
      type: "JC",
      name:
        name
          .replaceAll(" ", "")
          .replaceAll("갈림목", "")
          .replaceAll("분기점", "")
          .replaceAll("JCT", "")
          .replaceAll("JC", "")
          .trim() + "JC",
    };
  } else {
    console.error(name, "invalid ICJC candidate");
    return;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function build(): {
  ROADS_NAME: string[];
  IC: ICNode[];
  JC: JCNode[];
} {
  let ICJC: { type: "IC" | "JC"; name: PlaceName; point: LatLngTuple }[] = [];
  const names = new Set(ICJC_JSON.map(({ "IC/JC명": name }) => name));
  console.assert(
    [...names].every((name) => name.endsWith("IC") || name.endsWith("JCT"))
  );
  const ICJC_JSON_CANDIDATE = ICJC_JSON.map(
    ({ "IC/JC명": name, Y좌표값: y, X좌표값: x }) => ({
      name,
      point: [parseFloat(y), parseFloat(x)],
    })
  ) as { name: string; point: LatLngTuple }[];
  for (const { name, point } of [...ICJC_JSON_CANDIDATE, ...ICJC_CANDIDATE]) {
    const { type, name: newName } = parseToTypeAndName(name);
    ICJC.push({ type, name: newName, point });
  }
  const NEW_ICJC = [];
  const finalNames = new Set(ICJC.map(({ name: n }) => n));
  for (const name of finalNames) {
    const all = ICJC.filter(({ name: n }) => n === name);
    // remove all of them from ICJC if there are multiple points
    if (all.length > 1) {
      const point = all.reduce(
        (s, { point }) => [s[0] + point[0], s[1] + point[1]],
        [0, 0]
      );
      NEW_ICJC.push({
        type: all[0].type,
        name,
        point: [point[0] / all.length, point[1] / all.length] as LatLngTuple,
      });
    } else {
      NEW_ICJC.push(all[0]);
    }
  }
  ICJC = NEW_ICJC;
  console.assert(
    NEW_ICJC.length === finalNames.size,
    NEW_ICJC.length,
    finalNames.size
  );
  console.assert(
    NEW_ICJC.every(({ name }) => !name.includes(" ")),
    JSON.stringify(
      NEW_ICJC.filter(({ name }) => name.includes(" ")).map(({ name }) => name),
      null,
      2
    )
  );

  const IC_JSON = ICJC.filter(({ type }) => type === "IC");
  const JC_JSON = ICJC.filter(({ type }) => type === "JC");

  const LIMIT_DISTANCE_WITH_RAW_IC = 500;
  const IC: ICNode[] = [];
  for (let i = 0; i < ROADS_NAME.length; i++) {
    const name = ROADS_NAME[i];
    const geo = ROADS_OBJ[name];
    IC_JSON.forEach(({ point: rawPoint, name: placeName }) => {
      const Ip = findClosestPoint(geo, rawPoint);
      if (Ip.distance < LIMIT_DISTANCE_WITH_RAW_IC) {
        IC.push({
          type: "point",
          rawPosition: rawPoint,
          placeName,
          road: true,
          roadName: name,
          position: Ip.point,
          index: Ip.index,
        });
      }
    });
  }

  const LIMIT_DISTANCE_WITH_RAW_JC = 500;
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
            rawPosition: point,
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
/** Command : pnpm start > ../data/highway/icjc_vN.json */
console.log(JSON.stringify(build(), null, 2));
