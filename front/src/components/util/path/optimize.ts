import { LatLngTuple } from "./leaflet";
import {
  findNormalLineFromPoints,
  findNormalPathToClosestNode,
  findRoadPathFromNodes,
} from "./node";
import {
  NormalLineNode,
  NormalPointNode,
  PathNode,
  PathNodes,
  RoadPointNode,
} from "./type";

export function findShortestPathWithoutRoad(
  from: LatLngTuple,
  to: LatLngTuple
): PathNodes<[NormalPointNode, NormalLineNode, NormalPointNode]> {
  const fromPoint: NormalPointNode = {
    type: "point",
    road: false,
    point: from,
  };
  const toPoint: NormalPointNode = { type: "point", road: false, point: to };
  const normal = findNormalLineFromPoints(fromPoint, toPoint);
  return { nodes: [fromPoint, normal, toPoint], distance: normal.distance };
}

export function findShortestPathWithRoad(
  from: LatLngTuple,
  to: LatLngTuple
): PathNodes<
  [
    NormalPointNode,
    NormalLineNode,
    RoadPointNode,
    ...PathNode[],
    RoadPointNode,
    NormalLineNode,
    NormalPointNode
  ]
> {
  const fromPath = findNormalPathToClosestNode(
    from,
    "ALL",
    false
  ); /** @todo RIGHT NOW */
  const toPath = findNormalPathToClosestNode(
    to,
    "ALL",
    true
  ); /** @todo RIGHT NOW */
  const roadPath = findRoadPathFromNodes(
    fromPath.nodes[2],
    toPath.nodes[0]
  ); /** @todo RIGHT NOW */
  roadPath.nodes.shift();
  roadPath.nodes.pop();
  return {
    nodes: [...fromPath.nodes, ...roadPath.nodes, ...toPath.nodes],
    distance: fromPath.distance + roadPath.distance + toPath.distance,
  };
}

// IC, JC 위치 지도에서 수정할 수 있게 만들어두기 => dataset 구축 이후에 pathfinder 만들기
// IC, JC 를 일단 그리기, marker 움직이고 S 눌러서 저장하게 만들기
// -> 저장은 그냥 console.log 결과를 ctrl+V로 저장
