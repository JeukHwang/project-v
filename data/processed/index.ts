import { Node, Way } from "../raw";
import GROUPS_DATA_CACHED from "./GROUPS_DATA.json";
import WAYV_GROUP_MAP_CACHED from "./WAYV_GROUP_MAP.json";
import WAYV_MAP_CACHED from "./WAYV_MAP.json";

/** Visualizable Way */
type WayV = {
  id: Way["id"];
  nodes: [Node["lat"], Node["lon"]][];
  group: Way["tags"]["name"];
};

// export const WAYV_MAP = new Map<number, WayV>(
//   [...WAYS_MAP.values()].map((way) => {
//     const wayV = {
//       id: way.id,
//       nodes: way.nodes.map((nodeId) => [
//         NODES_MAP.get(nodeId)!.lat,
//         NODES_MAP.get(nodeId)!.lon,
//       ]),
//       group: way.tags.name,
//     } as WayV;
//     return [wayV.id, wayV];
//   })
// );
export const WAYV_MAP = new Map<number, WayV>(
  WAYV_MAP_CACHED as [number, WayV][]
);

// export const GROUPS_DATA = Array.from(
//   new Set([...WAYV_MAP.values()].map((way) => way.group))
// );
// Remove undefined from the result
export const GROUPS_DATA: string[] = GROUPS_DATA_CACHED as string[];

// export const WAYV_GROUP_MAP = new Map<string, WayV[]>(
//   GROUPS_DATA.map((group) => {
//     return [group, [...WAYV_MAP.values()].filter((way) => way.group === group)];
//   })
// );
export const WAYV_GROUP_MAP = new Map<string, WayV[]>(
  WAYV_GROUP_MAP_CACHED as [string, WayV[]][]
);


export const HIGHWAY_GROUPS = [
    "호남고속도로지선",
    "경부고속도로",
    "서산영덕고속도로",
    "통영대전고속도로",
    "평택제천고속도로",
    "중부고속도로",
    "중부내륙고속도로",
    "대전남부순환고속도로",
    "중앙고속도로",
    "광주대구고속도로",
    "서해안고속도로",
    "고창담양고속도로",
    "중부내륙고속도로지선",
    "남해고속도로",
    "남해고속도로제1지선",
    "동해고속도로",
    "무안광주고속도로",
    "서울양양고속도로",
    "수도권제1순환고속도로",
    "영동고속도로",
    "용인서울고속도로",
    "새만금포항고속도로",
    "제2경인고속도로",
    "제2중부고속도로",
    "논산천안고속도로",
    "호남고속도로",
    "인천국제공항고속도로",
    "울산고속도로",
    "중앙고속도로지선",
    "평택시흥고속도로",
    "경인고속도로",
    "평택파주고속도로",
    "순천완주고속도로",
    "수도권제2순환고속도로",
    "서천공주고속도로",
    "인천국제공항고속도로 하부도로",
    "미사대로;서울양양고속도로",
    "남해고속도로제2지선",
    "오산화성고속도로",
    "스마트하이웨이 체험도로",
    "광주원주고속도로",
    "남해고속도로제3지선",
    "세종포천고속도로",
    "당진청주고속도로",
    "대구외곽순환고속도로",
    "부산외곽순환고속도로",
    "상주영천고속도로",
    "광주외곽순환고속도로",
    "평택파주고속도로 지선",
    "함양울산고속도로"
]