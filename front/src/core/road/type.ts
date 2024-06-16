import { LatLngTuple } from "../lib/leaflet";
import { Subtype } from "../util";

export type RoadName = Subtype<string>;

export type RoadGeometry = LatLngTuple[];
