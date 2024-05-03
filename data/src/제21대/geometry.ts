import { Geometry } from "../model/geometry";
import { map2district, readJson, saveJson } from "../util";
import { district21 } from "./district";

function build(): Geometry {
  const MAP21_TYPED = readJson(
    "../election/raw/2020_21_Elec.json"
  ) as GeoJSON.FeatureCollection<
    GeoJSON.MultiPolygon,
    { SGG_Code: number; SGG_1: string; SGG_2: string; SGG_3: string }
  >;
  const SGG = MAP21_TYPED.features.map((feature) => feature.properties.SGG_3);
  const converter = map2district(district21.load(), SGG);
  return {
    ...MAP21_TYPED,
    features: MAP21_TYPED.features.map((feature) => {
      return { ...feature, properties: converter[feature.properties["SGG_3"]] };
    }),
  };
}

const path = "../election/processed/21/geometry.json";
export const geometry21 = {
  build: () => saveJson(path, build()),
  load: () => readJson<Geometry>(path),
};
