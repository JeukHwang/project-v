export interface KRAssemblyJSON extends AssemblyJSON {
  country: "KR";
}
export type Constant = {
  임기: {
    /** @description include */
    시작: Date;
    /** @description exclude */
    끝: Date;
  };
  /** @description 정원 기준이며 실제로는 재보궐 선거 미실시로 인해 더 적을 수 있음 */
  의원수: {
    지역구: number;
    비례대표: number;
  };
};

export type District = {
  /** @description Unique for same 대 */
  시도_선거구명: string;
  시도: string;
  선거구명: string;
  선거구역: string;
};
import { AssemblyJSON } from "../assembly";
import { District } from "./district";

export type Geometry = GeoJSON.FeatureCollection<
  GeoJSON.Polygon | GeoJSON.MultiPolygon,
  District
>;

export type AssemblyActivity = {
  대: number;
  시도_선거구명: District["시도_선거구명"] | null;
};

export type PersonData = {
  개인정보: {
    이름: {
      한글: string;
      한자?: string;
      영어?: string;
    };
    생년월일: {
      날짜: Date;
      양력: boolean;
    };
    성별: "남" | "여";
  };
  정당활동: Variable<string> /** @todo */;
  의원활동: Variable<AssemblyActivity>;
};