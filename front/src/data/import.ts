import MAP21_JSON from "../../../data/2020_21_Elec.json";
import MAP22_JSON from "../../../data/2024_22_Elec.json";

/** @description SGG means 선거구, not 시군구 */

type GeoMap = GeoJSON.FeatureCollection<
  GeoJSON.Polygon,
  { SGG_Code: string; SIDO_SGG: string; SIDO: string; SGG: string }
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

const MAP22_TYPED = MAP22_JSON as GeoMap;

const electionMap22 = rawElectionMap22 as GeoMap;

export const DATA = {
  MAP21: electionMap21,
  MAP22: MAP22_TYPED,
};

election.features.forEach((feature) => {
  const { SGG_Code, SGG_1, SGG_2, SGG_3 } = feature.properties;
  feature.properties = {
    SGG_Code: SGG_Code.toString(),
    SIDO_SGG: SGG_3,
    SIDO: SGG_1,
    SGG: SGG_3.replace(SGG_1 + " ", ""),
  };
});
// 21 "SGG_Code":2110601,"SGG_1":"서울","SGG_2":"서울특별시 동대문구갑","SGG_3":"서울 동대문갑"
// 22 "SGG_Code":"2413002","SIDO_SGG":"경기 군포","SIDO":"경기","SGG":"군포"
