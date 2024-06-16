import { LatLngTuple } from "../lib/leaflet";
import { ROAD } from "../road/import";
import { RoadName } from "../road/type";
import { findClosestPoint, length } from "../util";
import { IC, JC } from "./import";
import {
  ICNode,
  JCNode,
  LineNode,
  PointNode,
  RoadLineNode,
  RoadPointNode,
} from "./type";

export class PointUtil {
  public static closestRoadPoint(
    point: LatLngTuple,
    roadName: RoadName | null
  ): ICNode {
    const positions = roadName
      ? ROAD.geometry[roadName]
      : Object.values(ROAD.geometry).flat();
    const { index } = findClosestPoint(positions, point);
    return IC[index];
  }

  public static closestIC(
    point: LatLngTuple,
    roadName: RoadName | null
  ): ICNode {
    const ICs = roadName ? ICUtil.filter(roadName) : IC;
    const positions = ICs.map(({ position }) => position);
    const { index } = findClosestPoint(positions, point);
    return IC[index];
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

export class ICUtil {
  public static filter(roadName: RoadName): ICNode[] {
    return IC.filter(({ roadName: name }) => name === roadName);
  }
}

export class JCUtil {
  public static validate(jc: JCNode): void {
    console.assert(
      jc.fromNode.roadName !== jc.toNode.roadName,
      "fromNode.roadName !== toNode.roadName"
    );
  }

  public static filter(roadName: RoadName): JCNode[] {
    return JC.filter(({ fromNode, toNode }) => {
      return roadName === fromNode.roadName || roadName === toNode.roadName;
    });
  }

  public static realign(
    jc: JCNode,
    roadName: RoadName,
    as: "from" | "to"
  ): JCNode {
    this.validate(jc);
    const { close, far } = LineUtil.alignPoint(jc, roadName);
    return {
      ...jc,
      fromNode: as === "from" ? close : far,
      toNode: as === "from" ? far : close,
    };
  }
}
