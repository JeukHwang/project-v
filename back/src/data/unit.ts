import { PlaceName } from "./place";
import {
  PlaceData,
  PlaceType,
  Point,
  PropertyData,
  PropertyFunc,
  RouteData,
  SegmentData,
  SegmentType,
} from "./type";

function func<T>(prop: PropertyData<T>): (date: Date) => T {
  console.assert(prop.length !== 0, "Property is not defined");
  return (date: Date): T => {
    if (date < prop[0].start) {
      return prop[0].value;
    } else if (prop[prop.length - 1].end <= date) {
      return prop[prop.length - 1].value;
    } else {
      return prop.find(({ start, end }) => start <= date && date < end)!.value;
    }
  };
}

class Place {
  private static readonly set: Set<PlaceName> = new Set();
  public static readonly list: Place[];

  public static find(name: PlaceName): Place | null {
    return this.map.get(name) || null;
  }

  public readonly id: string;
  public readonly type: PlaceType;
  private readonly nameFunc: PropertyFunc<PlaceName>;
  public readonly position: Point;

  private constructor(data: PlaceData) {
    this.id = `${data.position.lat},${data.position.lng}`;
    this.type = data.type;
    this.nameFunc = func<PlaceName>(data.name);
    this.position = data.position;

    const names = data.name.map(({ value }) => value);
    names.forEach((name: PlaceName) => {
      console.assert(!Place.set.has(name), `Duplicated name: ${name}`);
      Place.set.add(name);
    });

    data.name
      .map(({ value }) => value)
      .forEach((name: PlaceName) => {
        console.assert(!Place.map.has(name), `Duplicated name: ${name}`);
        Place.map.set(name, this);
      });
  }

  public name(date: Date): PlaceName {
    return this.nameFunc(date);
  }
}

class Segment {
  public static readonly map: Segment[];

  public static find(start: PlaceName, end: PlaceName): Segment | null {
    return Segment.map.get(`${start} -> ${end}`) || null;
  }

  public readonly id: string;
  public readonly type: SegmentType;
  public readonly start: Place;
  public readonly end: Place;
  public readonly geometry: SegmentData["geometry"];
  public readonly data: SegmentData["data"];

  public constructor(data: SegmentData) {
    this.id = `${data.start}`;
    this.type = data.type;
    this.start = Place.find(data.start.name[0].value)!;
    this.end = Place.find(data.end.name[0].value)!;
    this.geometry = data.geometry;
    this.data = data.data;

    const segment = new Segment(data);
    Segment.map.set(segment.id, segment);
  }
}

class Route {
  public static readonly map: Map<string, Route> = new Map();

  public static find(name: RouteData["name"]): Route | null {
    return Route.map.get(name) || null;
  }

  public readonly name: PropertyFunc<string>;
  public readonly numberFunc: PropertyFunc<number>;
  public readonly segments: Segment[][];

  public constructor(data: RouteData) {
    this.id = data.name[0].value;
    this.nameFunc = func<string>(data.name);
    this.numberFunc = func<number>(data.number);
    this.segments = data.segments.map((segments) =>
      segments.map(
        (segment) =>
          Segment.find(segment.start.name[0].value, segment.end.name[0].value)!
      )
    );

    console.assert(!Route.map.has(this.name), `Duplicated name: ${this.name}`);
    Route.map.set(this.name, this);
  }

  public geometry(date: Date): SegmentData["geometry"] {
    return this.segments.map((segments) =>
      segments.map((segment) => segment.geometry)
    );
  }
}

// //   /** @description */
// //   기점: PropertyFunc<Place>;
// //   종점: PropertyFunc<Place>;

// class Place {}
// /** @description 좌표 */
// type Point = {
//   /** @description 위도 */
//   lat: number;
//   /** @description 경도 */
//   lng: number;
// };

// /**
//  * @description 시간에 따라 변화할 수 있는 값
//  * @example 나들목 이름
//  * */
// type Property<T> = {
//   start: Date;
//   end: Date;
//   value: T;
// }[];

// /** @description 시간에 따른 값 반환 */
// type PropertyFunc<T> = (date: Date) => T;

// /** @description 위치 */
// type Place = {
//   /**
//    * @description
//    * - 나들목 : 인터체인지 / Interchange / IC
//    * - 갈림목 : 분기점 / Junction / JC
//    * - 요금소 : 톨게이트 / Tollgate / TG
//    */
//   type: "나들목(IC)" | "갈림목(JC)" | "요금소(TG)" | "휴게소" | "졸음쉼터";
//   name: Property<string>;
//   position: Point;
// };

// /**
//  * @description 구간 : 공사의 기본 단위
//  * 착공 당시 한 번에 공사한 것을 기준으로 하되,
//  * 추가로 생긴 나들목, 갈림목으로 인해 구간이 나뉜 경우 여러 개로 쪼개도록 함
//  * */
// type Segment = {
//   type: "도로" | "터널" | "교량(다리)";
//   start: Place;
//   end: Place;
//   /**
//    * @description [순행, 역행]
//    * 남·북방향 고속도로는 남쪽->북쪽이 순행으로 함
//    * 동·서방향 고속도로는 서쪽->동쪽이 순행으로 함 */
//   geometry: [any, any];
//   data: {
//     /** @description 정보 부족으로 시공일과 동일한 의미로 취급 */
//     /** @todo 정보 부족으로 시공일과 동일한 의미로 취급 */
//     착공일?: Date;
//     /** @description @todo 정보 부족으로 준공일, 개통일과 동일한 의미로 취급 */
//     /** @todo 정보 부족으로 시공일과 동일한 의미로 취급 */
//     완공일: Date;
//     길이?: number;
//   };
// };

// /**
//  * @description 고속도로 : 이름과 번호가 부여된 단위
//  * 일부 segment는 다른 고속도로와 중복될 수 있음
//  */
// type Route = {
//   name: Property<string>;
//   number: Property<number>;
//   segments: Segment[][];
// };

// //   /** @description */
// //   기점: PropertyFunc<Place>;
// //   종점: PropertyFunc<Place>;

// type PlaceType = Place["type"];
// type SegmentType = Segment["type"];

// export type {
//   Place,
//   PlaceType,
//   Point,
//   Property,
//   PropertyFunc,
//   Route,
//   Segment,
//   SegmentType,
// };
