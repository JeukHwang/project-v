import highwayData from "./export.json";

export type Way = {
  type: "way";
  id: number;
  nodes: number[];
  tags: {
    highway: string;
    lanes: string;
    maxspeed: string;
    "maxspeed:hgv": string;
    minspeed: string;
    name: string;
    "name:el": string;
    "name:en": string;
    "name:ko": string;
    "name:ko-Hani": string;
    "name:ko-Latn": string;
    "name:zh": string;
    "name:zh-Hant": string;
    oneway: string;
    ref: string;
    toll: string;
  };
};

export type Node = {
  type: "node";
  id: number;
  lat: number;
  lon: number;
};

export type HighwayData = {
  version: number;
  generator: string;
  osm3s: {
    timestamp_osm_base: Date;
    timestamp_areas_base: Date;
    copyright: string;
  };
  elements: (Way | Node)[];
};

export const RAW_DATA = highwayData as HighwayData;
export const NODES_MAP = new Map<number, Node>(
  (
    RAW_DATA.elements.filter((element) => element.type === "node") as Node[]
  ).map((node) => [node.id, node])
);
export const WAYS_MAP = new Map<number, Way>(
  (RAW_DATA.elements.filter((element) => element.type === "way") as Way[]).map(
    (way) => [way.id, way]
  )
);
