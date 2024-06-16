import { LatLngTuple } from "../lib/leaflet";
import { RoadName } from "../road/type";
import { Subtype } from "../util";

export type PlaceName = Subtype<string>;

interface PointNode {
  type: "point";
  position: LatLngTuple;
}
/**
 * @description
 * Assert `positions[0] === fromNode.position` and `positions[positions.length-1] === toNode.position`
 */
interface LineNode<T extends PointNode = PointNode> {
  type: "path";
  fromNode: T;
  toNode: T;
  positions: LatLngTuple[];
}
export type { LineNode, PointNode };

interface RoadNode<T> {
  roadName: RoadName;
  index: T;
}
interface PlaceNode {
  placeName: PlaceName;
  rawPosition: LatLngTuple;
}
export type { PlaceNode, RoadNode };

interface RoadPointNode extends PointNode, RoadNode<number> {}
/** @description Assert set of (ROAD[roadName][start:end]) === set of (points) */
interface RoadLineNode
  extends LineNode<RoadPointNode>,
    RoadNode<[start: number, end: number]> {}
interface ICNode extends RoadPointNode, PlaceNode {}
interface JCNode extends LineNode<RoadPointNode>, PlaceNode {}
export type { ICNode, JCNode, RoadLineNode, RoadPointNode };

type PathNode = PointNode | ICNode | LineNode | RoadLineNode | JCNode;
export type { PathNode };
