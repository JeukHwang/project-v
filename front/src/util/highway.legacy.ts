import ROADS_CACHED from "../../../data/highway/processed/ROADS.json";
import ROADS_PARSED_CACHED from "../../../data/highway/processed/ROADS_PARSED.json";

export const ROADS = new Map<string, [number, number][][]>(
  ROADS_CACHED as [string, [number, number][][]][]
);

export const ROADS_NAME = Array.from(ROADS.keys());

type PARSED = {
  nodes: [number, number][][];
  points: [string, [number, number]][];
  edges: { start: number; end: number; time: string }[][];
};
export const ROADS_PARSED = new Map<string, PARSED>(
  ROADS_PARSED_CACHED as [string, PARSED][]
);
