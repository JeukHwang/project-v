import MAP21_JSON from "../../data/raw/2020_21_Elec.json";
import MAP22_JSON from "../../data/raw/2024_22_Elec.json";
import { ATTR } from "./attribution";

/** @description SGG means 선거구, not 시군구 */

export type GeoMapProperties = {
  SGG_Code: string;
  SIDO_SGG: string;
  SIDO: string;
  SGG: string;
};

export type GeoMap = GeoJSON.FeatureCollection<
  GeoJSON.Polygon | GeoJSON.MultiPolygon,
  GeoMapProperties
>;

const MAP21_TYPED = MAP21_JSON as GeoJSON.FeatureCollection<
  GeoJSON.MultiPolygon,
  { SGG_Code: number; SGG_1: string; SGG_2: string; SGG_3: string }
>;
const MAP21: GeoMap = {
  ...MAP21_TYPED,
  features: MAP21_TYPED.features.map((feature) => {
    const { SGG_Code, SGG_1: SIDO, SGG_3: SIDO_SGG } = feature.properties;
    return {
      ...feature,
      properties: {
        SGG_Code: SGG_Code.toString(),
        SIDO_SGG,
        SIDO,
        SGG: SIDO_SGG.replace(SIDO + " ", ""),
      },
    };
  }),
};

export const IMPORT_DATA = {
  MAP21: { data: MAP21 as GeoMap, attribution: ATTR.LeeJongho21 },
  MAP22: { data: MAP22_JSON as GeoMap, attribution: ATTR.LeeJongho22 },
};
