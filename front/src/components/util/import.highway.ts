import { LatLngTuple } from "leaflet";
import ROADS_JSON from "../../../../back/data/highway/processed/etc.road.json";

import INTESECTIONS_JSON from "../../../../back/data/highway/processed/etc.intersection.json";

export type Position = [x: number, y: number];
export type RoadPointNode = {
  type: "roadPoint";
  point: LatLngTuple;
  roadName: string;
  index: number;
};
export type PointNode = {
  type: "point";
  point: LatLngTuple;
};
export type RoadPathNode = {
  type: "roadPath";
  roadName: string;
  points: LatLngTuple[];
  startIndex: number;
  endIndex: number;
};
export type Path = (PointNode | RoadPointNode | RoadPathNode)[];

export type Intersection = {
  road1: {
    name: string;
    index: number;
    position: Position;
  };
  road2: {
    name: string;
    index: number;
    position: Position;
  };
  position: Position;
  distance: number;
};

export const ROADS = {
  경부선: ROADS_JSON["경부선"],
  중앙선: ROADS_JSON["중앙선"],
} as unknown as {
  [road: string]: LatLngTuple[];
};
export const ROADS_NAME = Object.keys(ROADS);
export const INTESECTIONS = INTESECTIONS_JSON as Intersection[];
