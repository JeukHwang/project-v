import L, { LatLngTuple } from "leaflet";
import { ROADS, ROADS_NAME } from "../import.highway";
import {
  NormalLineNode,
  NormalPointNode,
  PathNodes,
  RoadLineNode,
  RoadPointNode,
} from "./type";
import { findPathBetweenRoadNodes, findPathToClosestNode } from "./util";

export function findShortestPathWith0Road(
  from: LatLngTuple,
  to: LatLngTuple
): PathNodes {
  const nodes: [NormalPointNode, NormalPointNode] = [
    { type: "point", road: false, point: from },
    { type: "point", road: false, point: to },
  ];
  return {
    nodes,
    distance: L.latLng(from).distanceTo(L.latLng(to)),
  };
}

export function findShortestPathWith1UniqueRoad(
  from: LatLngTuple,
  to: LatLngTuple
): PathNodes {
  let nodes = null as unknown as [
    NormalPointNode,
    NormalLineNode,
    RoadPointNode,
    RoadLineNode,
    RoadPointNode,
    NormalLineNode,
    NormalPointNode
  ];
  let shortestDistance = Infinity;

  for (let i = 0; i < ROADS_NAME.length; i++) {
    const roadName = ROADS_NAME[i];
    const road = ROADS[roadName];
    const [, fromRoadPath, fromRoadPoint] = findPathToClosestNode(
      from,
      roadName,
      true
    );
    const [, toRoadPath, toRoadPoint] = findPathToClosestNode(
      to,
      roadName,
      false
    );
    const [startIndex, endIndex] = [
      Math.min(fromRoadPoint.index, toRoadPoint.index),
      Math.max(fromRoadPoint.index, toRoadPoint.index),
    ];
    const line: RoadLineNode = {
      type: "path",
      road: true,
      roadName,
      indexStart: startIndex,
      indexEnd: endIndex,
      distance: (endIndex - startIndex) * 100,
      pointFrom: from,
      pointTo: to,
      points: road.slice(startIndex, endIndex + 1),
    };
    const distance =
      fromRoadPath.distance + line.distance + toRoadPath.distance;
    if (distance < shortestDistance) {
      nodes = [
        { type: "point", road: false, point: from },
        fromRoadPath,
        fromRoadPoint,
        line,
        toRoadPoint,
        toRoadPath,
        { type: "point", road: false, point: to },
      ];
      shortestDistance = distance;
    }
  }
  return {
    nodes,
    distance: shortestDistance,
  };
}

// IC, JC 위치 지도에서 수정할 수 있게 만들어두기 => dataset 구축 이후에 pathfinder 만들기
// IC, JC 를 일단 그리기, marker 움직이고 S 눌러서 저장하게 만들기
// -> 저장은 그냥 console.log 결과를 ctrl+V로 저장

export function findShortestPathWith1MultiRoad(
  from: LatLngTuple,
  to: LatLngTuple
): PathNodes {
  const [fromPoint, fromRoadPath, fromRoadPoint] = findPathToClosestNode(
    from,
    "ALL",
    true
  );
  const [toPoint, toRoadPath, toRoadPoint] = findPathToClosestNode(
    to,
    "ALL",
    false
  );
  const { nodes, distance } = findPathBetweenRoadNodes(
    fromRoadPoint,
    toRoadPoint
  );
  return {
    nodes: [fromPoint, fromRoadPath, ...nodes, toRoadPath, toPoint],
    distance: fromRoadPath.distance + distance + toRoadPath.distance,
  };
}
