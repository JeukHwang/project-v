import { PlaceNode } from "../node/type";
import { Subtype } from "../util";

type EdgeId = Subtype<string>;

export class Edge {
  private data: Map<
    EdgeId,
    { first: PlaceNode; second: PlaceNode; distance: number }
  > = new Map();

  private normalize(
    placeNode1: PlaceNode,
    placeNode2: PlaceNode
  ): { first: PlaceNode; second: PlaceNode; id: EdgeId } {
    console.assert(
      placeNode1.placeName !== placeNode2.placeName,
      "PlaceName must be different"
    );
    return placeNode1.placeName < placeNode2.placeName
      ? {
          first: placeNode1,
          second: placeNode2,
          id: `${placeNode1.placeName}/${placeNode2.placeName}` as EdgeId,
        }
      : {
          first: placeNode2,
          second: placeNode1,
          id: `${placeNode2.placeName}/${placeNode1.placeName}` as EdgeId,
        };
  }

  public get(fromNode: PlaceNode, toNode: PlaceNode): number {
    const { id } = this.normalize(fromNode, toNode);
    return this.data.get(id)?.distance ?? Infinity;
  }

  public set(fromNode: PlaceNode, toNode: PlaceNode, distance: number): void {
    const { first, second, id } = this.normalize(fromNode, toNode);
    this.data.set(id, { first, second, distance });
  }

  public update(
    fromNode: PlaceNode,
    toNode: PlaceNode,
    distance: number
  ): void {
    const { id } = this.normalize(fromNode, toNode);
    const data = this.data.get(id);
    if (data && data.distance <= distance) return;
    this.data.set(id, { first: fromNode, second: toNode, distance });
  }
}
