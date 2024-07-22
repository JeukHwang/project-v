import SOURCE1_JSON from "../../../../back/data/highway/processed/etc.icjs.json";
import { ICJC_CANDIDATE as SOURCE2_JSON } from "../../util/icjs.data";

import { LatLngTuple } from "../lib/leaflet";
import { ROAD } from "../road/import";
import { findClosestPoint } from "../util";
import { ICNode, JCNode, PlaceName } from "./type";
import { PointUtil } from "./util";

const LIMIT_DISTANCE_WITH_RAW_JC = 500;

type Candidate = { name: string; point: LatLngTuple };
type ParsedCandidate = {
  type: "IC" | "JC";
  name: PlaceName;
  point: LatLngTuple;
};

function parseToTypeAndName(name: string): {
  type: "IC" | "JC";
  name: PlaceName;
} {
  if (name.includes("나들목") || name.includes("IC")) {
    const uniqueName = name
      .replaceAll(" ", "")
      .replaceAll("나들목", "")
      .replaceAll("IC", "")
      .trim();
    return {
      type: "IC",
      name: `${uniqueName} IC` as PlaceName,
    };
  } else if (
    name.includes("갈림목") ||
    name.includes("분기점") ||
    name.includes("JC")
  ) {
    const uniqueName = name
      .replaceAll(" ", "")
      .replaceAll("갈림목", "")
      .replaceAll("분기점", "")
      .replaceAll("JCT", "")
      .replaceAll("JC", "")
      .trim();
    return {
      type: "JC",
      name: `${uniqueName} JC` as PlaceName,
    };
  } else {
    throw new Error(`Invalid parsed name: ${name}`);
  }
}

function source1ToCandidate(): Candidate[] {
  const placeNames = new Set(SOURCE1_JSON.map(({ "IC/JC명": name }) => name));
  console.assert(
    [...placeNames].every((name) => name.endsWith("IC") || name.endsWith("JCT"))
  );
  return SOURCE1_JSON.map(({ "IC/JC명": name, Y좌표값: y, X좌표값: x }) => ({
    name,
    point: [parseFloat(y), parseFloat(x)],
  }));
}

function source2ToCandidate(): Candidate[] {
  return SOURCE2_JSON;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function build(): { IC: ICNode[]; JC: JCNode[] } {
  const parsedCandidate: ParsedCandidate[] = [
    ...source1ToCandidate(),
    ...source2ToCandidate(),
  ].map(({ name: rawName, point }) => {
    const { type, name } = parseToTypeAndName(rawName);
    return { type, name: name as PlaceName, point };
  });

  const uniqueParsedCandidate: ParsedCandidate[] = [];
  const names = new Set(parsedCandidate.map(({ name }) => name));
  for (const name of names) {
    const group = parsedCandidate.filter(({ name: n }) => n === name);
    if (group.length > 1) {
      const [x, y] = group.reduce(
        (s, { point }) => [s[0] + point[0], s[1] + point[1]],
        [0, 0]
      );
      uniqueParsedCandidate.push({
        ...group[0],
        point: [x / group.length, y / group.length] as LatLngTuple,
      });
    } else {
      uniqueParsedCandidate.push(group[0]);
    }
  }

  const draftICs = uniqueParsedCandidate.filter(({ type }) => type === "IC");
  const draftJCs = uniqueParsedCandidate.filter(({ type }) => type === "JC");

  const IC: ICNode[] = [];
  for (const { point: rawPoint, name: placeName } of draftICs) {
    const roadPoint = PointUtil.closestRoadPoint(rawPoint, null);
    IC.push({
      type: "point",
      position: roadPoint.position,
      roadName: roadPoint.roadName,
      index: roadPoint.index,
      placeName,
      rawPosition: rawPoint,
      pointType: "IC",
    });
  }

  const JC: JCNode[] = [];
  for (let i = 0; i < ROAD.name.length; i++) {
    const roadName = ROAD.name[i];
    const geometry = ROAD.geometry[roadName];
    for (const { point: rawPoint, name: placeName } of draftJCs) {
      const roadPoint = findClosestPoint(geometry, rawPoint);
      if (roadPoint.distance < LIMIT_DISTANCE_WITH_RAW_JC) {
        JC.push({
          type: "point",
          position: roadPoint.point,
          roadName,
          index: roadPoint.index,
          placeName,
          rawPosition: rawPoint,
          pointType: "JC",
        });
      }
    }
  }
  return { IC, JC };
}
