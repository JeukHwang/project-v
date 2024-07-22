import { LatLngTuple } from "../lib/leaflet";
import { ROAD } from "../road/import";
import { RoadName } from "../road/type";
import { findClosestPoint, length, Subtype } from "../util";
import { IC, JC } from "./import";
import {
  ICNode,
  JCNode,
  LineNode,
  PlaceName,
  PointNode,
  RoadLineNode,
  RoadPointNode,
} from "./type";

export class PointUtil {
  public static closestRoadPoint(
    point: LatLngTuple,
    roadName: RoadName | null
  ): RoadPointNode {
    let shortestDistance = Infinity;
    let rpn: RoadPointNode = null as unknown as RoadPointNode;
    for (const name of roadName ? [roadName] : ROAD.name) {
      const {
        distance: d,
        point: p,
        index: i,
      } = findClosestPoint(ROAD.geometry[name], point);
      if (d < shortestDistance) {
        shortestDistance = d;
        rpn = { type: "point", position: p, roadName: name, index: i };
      }
    }
    return rpn;
  }

  public static closestIC(
    point: LatLngTuple,
    roadName: RoadName | null
  ): ICNode {
    const ICs = roadName ? PlaceUtil.filterIC(roadName) : IC;
    const positions = ICs.map(({ position }) => position);
    const { point: p } = findClosestPoint(positions, point);
    return ICs.find(
      ({ position }) => position[0] === p[0] && position[1] === p[1]
    )!;
  }
}

export class LineUtil {
  public static midPosition(line: LineNode): LatLngTuple {
    const fromPosition = line.fromNode.position;
    const toPosition = line.toNode.position;
    return [
      (fromPosition[0] + toPosition[0]) / 2,
      (fromPosition[1] + toPosition[1]) / 2,
    ];
  }

  public static length(line: LineNode): number {
    return length(...line.positions);
  }

  public static alignPoint(
    line: LineNode<RoadPointNode>,
    roadName: RoadName
  ): { close: RoadPointNode; far: RoadPointNode } {
    const isFrom = line.fromNode.roadName === roadName;
    const isTo = line.toNode.roadName === roadName;
    if (isFrom && isTo) {
      throw new Error("2 valid roadName");
    } else if (isFrom) {
      return { close: line.fromNode, far: line.toNode };
    } else if (isTo) {
      return { close: line.toNode, far: line.fromNode };
    } else {
      throw new Error("0 valid roadName");
    }
  }

  public static fromPoint(from: PointNode, to: PointNode): LineNode {
    return {
      type: "path",
      fromNode: from,
      toNode: to,
      positions: [from.position, to.position],
    };
  }

  public static fromRoadPoint(
    from: RoadPointNode,
    to: RoadPointNode
  ): RoadLineNode {
    console.assert(from.roadName === to.roadName, "Different roadName");
    const roadName = from.roadName;
    const indexStart = Math.min(from.index, to.index);
    const indexEnd = Math.max(from.index, to.index);
    return {
      type: "path",
      fromNode: from,
      toNode: to,
      positions: ROAD.geometry[roadName].slice(indexStart, indexEnd),
      roadName,
      index: [indexStart, indexEnd],
    };
  }
}

export type PlaceId = Subtype<string>;
export class PlaceUtil {
  public static id(node: ICNode | JCNode): PlaceId {
    return JSON.stringify({
      position: node.position,
      roadName: node.roadName,
      index: node.index,
      placeName: node.placeName,
      pointType: node.pointType,
    }) as PlaceId;
  }

  public static get idList() {
    return [...IC, ...JC].map((node) => PlaceUtil.id(node));
  }

  public static isEqual(
    node1: ICNode | JCNode,
    node2: ICNode | JCNode
  ): boolean {
    return PlaceUtil.id(node1) === PlaceUtil.id(node2);
  }

  public static filter(roadName: RoadName): (ICNode | JCNode)[] {
    return [...PlaceUtil.filterIC(roadName), ...PlaceUtil.filterJC(roadName)];
  }

  public static filterIC(roadName: RoadName): ICNode[] {
    return IC.filter(({ roadName: name }) => name === roadName);
  }

  public static filterJC(roadName: RoadName): JCNode[] {
    return JC.filter(({ roadName: name }) => name === roadName);
  }

  public static groupJC(placeName: PlaceName): JCNode[] {
    return JC.filter(({ placeName: name }) => name === placeName);
  }

  public static get listJC(): PlaceName[] {
    return [...new Set(JC.map(({ placeName }) => placeName))];
  }
}
