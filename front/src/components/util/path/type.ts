import { LatLngTuple } from "leaflet";

export interface NormalNode {
  road: false;
}
export interface RoadNode {
  road: true;
  roadName: string;
}

export interface PointNode {
  type: "point";
  point: LatLngTuple;
}
/** @description Assert points[0] === pointFrom, points[points.length-1] === pointTo */
export interface LineNode {
  type: "path";
  distance: number;
  pointFrom: LatLngTuple;
  pointTo: LatLngTuple;
  points: LatLngTuple[];
}

export interface NormalPointNode extends NormalNode, PointNode {}
export interface RoadPointNode extends RoadNode, PointNode {
  index: number;
}
export interface NormalLineNode extends NormalNode, LineNode {}
/** @description Assert set of (ROADS[roadName][startIndex:endIndex+1]) === set of (points) */
export interface RoadLineNode extends RoadNode, LineNode {
  roadName: string;
  indexStart: number;
  indexEnd: number;
}
export interface IntersectionNode {
  type: "intersection";
  point1: RoadPointNode;
  point2: RoadPointNode;
  point: NormalPointNode;
  distance: number;
}

export interface PathNodes {
  nodes: (NormalPointNode | RoadPointNode | NormalLineNode | RoadLineNode)[];
  distance: number;
}

export type ROADS_OBJ_TYPE = {
  [road: string]: LatLngTuple[];
};
export type INTESECTIONS_OBJ_TYPE = IntersectionNode[];
