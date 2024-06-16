import ROAD_GEOMETRY_JSON from "../../../../back/data/highway/processed/ETC_도로중심선.json";
import { RoadGeometry, RoadName } from "./type";

export const ROAD = {
  name: Object.keys(ROAD_GEOMETRY_JSON) as RoadName[],
  geometry: ROAD_GEOMETRY_JSON as Record<RoadName, RoadGeometry>,
};
