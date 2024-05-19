import { LatLng } from "leaflet";

export type Position = [x: number, y: number];

/** @description object to tuple */
export function o2t({ lat, lng }: LatLng): Position {
  return [lat, lng];
}
