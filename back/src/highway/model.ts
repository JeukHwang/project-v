export type Position = [x: number, y: number];

export type Node = {
  노선번호: string;
  노선명: string;
  이정: number;
  좌표: Position;
  좌표GRS80: Position;
};

export type Intersection = {
    road1: {
        name: string;
        index: number;
        position: Position;
    };
    road2: {
        name: string;
        index: number;
        position: Position;
    };
    position: Position;
    distance: number;
}