import { distanceTo } from "../lib/leaflet";
import { ICNode, JCNode } from "../node/type";
import { PlaceId, PlaceUtil } from "../node/util";

type EdgeData<T> = { first: T; second: T; distance: number };
export class Edge<T extends ICNode | JCNode = ICNode | JCNode> {
  private data: Map<PlaceId, EdgeData<T>>;

  public constructor(data?: [PlaceId, EdgeData<T>][]) {
    this.data = new Map(data);
  }

  private normalize(
    placeNode1: T,
    placeNode2: T
  ): { first: T; second: T; id: PlaceId } {
    // console.assert(
    //   placeNode1.placeName !== placeNode2.placeName,
    //   "PlaceName must be different"
    // );
    return placeNode1.placeName < placeNode2.placeName
      ? {
          first: placeNode1,
          second: placeNode2,
          id: PlaceUtil.id(placeNode1),
        }
      : {
          first: placeNode2,
          second: placeNode1,
          id: PlaceUtil.id(placeNode2),
        };
  }

  public neighbor(node: T): T[] {
    const list: T[] = [];
    for (const { first, second } of this.data.values()) {
      if (PlaceUtil.isEqual(first, node)) list.push(second);
      else if (PlaceUtil.isEqual(second, node)) list.push(first);
    }
    return list;
  }

  public get(fromNode: T, toNode: T): number {
    const { id } = this.normalize(fromNode, toNode);
    return this.data.get(id)?.distance ?? Infinity;
  }

  public set(fromNode: T, toNode: T, distance?: number): void {
    const { first, second, id } = this.normalize(fromNode, toNode);
    this.data.set(id, {
      first,
      second,
      distance: distance ?? distanceTo(fromNode.position, toNode.position),
    });
  }

  public get JSON(): [PlaceId, EdgeData<T>][] {
    return [...this.data.entries()];
  }
}
