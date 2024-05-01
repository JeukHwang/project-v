/**
 * @see
 * https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1007
 * https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1B040A3
 * https://www.youtube.com/watch?v=CH792aKQtl0
 *
 * @todo
 * geometry 딱 두 개씩만 남기기
 * Point 선정에 대한 일정한 기준 만들기; 현재는 주관적 위치 선정으로 인해 0.01도 정도 오차
 * 휴게소, 졸음쉼터 추가 정보
 */

import { PlaceName } from "./place";

/** @description 좌표 */
type Point = {
  /** @description 위도 */
  lat: number;
  /** @description 경도 */
  lng: number;
};

/**
 * @description 시간에 따라 변화할 수 있는 값
 * @example 나들목 이름
 * */
type PropertyData<T> = {
  start: Date;
  end: Date;
  value: T;
}[];

/** @description 위치 */
type PlaceData = {
  /**
   * @description
   * - 나들목 : 인터체인지 / Interchange / IC
   * - 갈림목 : 분기점 / Junction / JC
   * - 요금소 : 톨게이트 / Tollgate / TG
   */
  type: "나들목(IC)" | "갈림목(JC)" | "요금소(TG)" | "휴게소" | "졸음쉼터";
  name: PropertyData<PlaceName>;
  position: Point;
};

/**
 * @description 구간 : 공사의 기본 단위
 * 착공 당시 한 번에 공사한 것을 기준으로 하되,
 * 추가로 생긴 나들목, 갈림목으로 인해 구간이 나뉜 경우 여러 개로 쪼개도록 함
 * */
type SegmentData = {
  type: "도로" | "터널" | "교량(다리)";
  start: PlaceData;
  end: PlaceData;
  /**
   * @description [순행, 역행]
   * 남·북방향 고속도로는 남쪽->북쪽이 순행으로 함
   * 동·서방향 고속도로는 서쪽->동쪽이 순행으로 함 */
  geometry: [GeoJSON, GeoJSON];
  data: {
    /** @description 정보 부족으로 시공일과 동일한 의미로 취급 */
    /** @todo 정보 부족으로 시공일과 동일한 의미로 취급 */
    착공일?: Date;
    /** @description @todo 정보 부족으로 준공일, 개통일과 동일한 의미로 취급 */
    /** @todo 정보 부족으로 시공일과 동일한 의미로 취급 */
    완공일: Date;
    길이?: number;
  };
};

/**
 * @description 고속도로 : 이름과 번호가 부여된 단위
 * 일부 segment는 다른 고속도로와 중복될 수 있음
 */
type RouteData = {
  name: string;
  number: number;
  start: Date;
  end: Date;
  segments: SegmentData[][];
};

type PropertyFunc<T> = (date: Date) => T;
type PlaceType = PlaceData["type"];
type SegmentType = SegmentData["type"];
type GeoJSON = any;

export type {
  GeoJSON,
  PlaceData,
  PlaceType,
  Point,
  PropertyData,
  PropertyFunc,
  RouteData,
  SegmentData,
  SegmentType,
};
