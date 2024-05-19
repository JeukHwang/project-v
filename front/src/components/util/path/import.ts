// import INTESECTIONS_JSON from "../../../../../back/data/highway/processed/etc.intersection.json";
import ROADS_JSON from "../../../../../back/data/highway/processed/etc.road.json";
import { INTESECTIONS_OBJ_TYPE, ROADS_OBJ_TYPE } from "./type";

export const ROADS_OBJ = {
  경부선: ROADS_JSON["경부선"],
  중앙선: ROADS_JSON["중앙선"],
} as unknown as ROADS_OBJ_TYPE;

export const ROADS_NAME = Object.keys(ROADS_OBJ);

// export const INTESECTIONS_OBJ =
//   INTESECTIONS_JSON as unknown as INTESECTIONS_OBJ_TYPE;
export const INTESECTIONS_OBJ: INTESECTIONS_OBJ_TYPE = [
  {
    point1: {
      type: "point",
      road: true,
      roadName: "경부선",
      index: 1213,
      point: [35.881365138, 128.701473579],
    },
    point2: {
      type: "point",
      road: true,
      roadName: "중앙선",
      index: 0,
      point: [35.886258353, 128.693777025],
    },
    point: {
      type: "point",
      road: false,
      point: [35.8838117455, 128.697625302],
    },
    distance: 881.3824008941489,
  },
];
