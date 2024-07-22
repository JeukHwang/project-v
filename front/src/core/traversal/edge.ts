import { IC, JC } from "../node/import";
import { ICNode, JCNode } from "../node/type";
import { PlaceUtil } from "../node/util";
import { ROAD } from "../road/import";
import { Edge } from "./util";

function constructBasicEdge(): Edge {
  const edge = new Edge();
  for (const roadName of ROAD.name) {
    const placeNodes = PlaceUtil.filter(roadName);
    placeNodes.sort((a, b) => a.index - b.index);
    for (let i = 0; i < placeNodes.length - 1; i++) {
      edge.set(placeNodes[i], placeNodes[i + 1]);
    }
  }
  for (const placeName of PlaceUtil.listJC) {
    const jcNodes = PlaceUtil.groupJC(placeName);
    for (let i = 0; i < jcNodes.length - 1; i++) {
      for (let j = i + 1; j < jcNodes.length; j++) {
        edge.set(jcNodes[i], jcNodes[j]);
      }
    }
  }
  return edge;
}
const basicEdge = constructBasicEdge();

export function addFromToEdge(from: ICNode, to: ICNode): Edge {
  const edge = new Edge(basicEdge.JSON);

  const fromPlaces = [...PlaceUtil.filter(from.roadName), from];
  fromPlaces.sort((a, b) => a.index - b.index);
  const fromIndex = fromPlaces.findIndex(({ index }) => index === from.index);
  edge.set(from, fromPlaces[fromIndex - 1]);
  edge.set(from, fromPlaces[fromIndex + 1]);

  const toPlaces = [...PlaceUtil.filter(to.roadName), to];
  toPlaces.sort((a, b) => a.index - b.index);
  const toIndex = toPlaces.findIndex(({ index }) => index === to.index);
  edge.set(to, toPlaces[toIndex - 1]);
  edge.set(to, toPlaces[toIndex + 1]);

  return edge;
}

type DistanceMap = { [key: string]: number };
type BacktrackingMap = { [key: string]: ICNode | JCNode };

export function dijkstra(edge: Edge, from: ICNode, to: ICNode): DistanceMap {
  const distance = Object.fromEntries(
    PlaceUtil.idList.map((id) => [id, Infinity])
  ) as DistanceMap;
  distance[PlaceUtil.id(from)] = 0;
  const prev = {} as BacktrackingMap;
  const will_visit = [...IC, ...JC];

  while (will_visit.length > 0) {
    will_visit.sort(
      (a, b) => distance[PlaceUtil.id(a)] - distance[PlaceUtil.id(b)]
    );
    const closestNode = will_visit.shift()!;
    if (distance[PlaceUtil.id(closestNode)] === Infinity) break;
    for (const neighbor of edge.neighbor(closestNode)) {
      const d =
        distance[PlaceUtil.id(closestNode)] + edge.get(closestNode, neighbor);
      if (d < distance[PlaceUtil.id(neighbor)]) {
        distance[PlaceUtil.id(neighbor)] = d;
        prev[PlaceUtil.id(neighbor)] = closestNode;
      }
    }
  }

  const minDistance = distance[PlaceUtil.id(to)];
  const nodes = [];
  let current: ICNode | JCNode | null = to;
  while (current) {
    nodes.push(current);
    current = prev[current.placeName];
  }
  nodes.reverse();

  console.log(distance);
  console.log("prev", prev);
  console.log(will_visit);
  console.log(minDistance, nodes);
  //   return { nodes: roads, distance: minDistance };
  return distance;
}
