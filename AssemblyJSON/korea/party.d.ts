import { Variable } from "../util";

export interface Party {
  정보: {
    이름: Variable<{ 한글: string; 한자?: string; 영어?: string }>;
    상징색: Variable<string>;
    표어: Variable<string>;
  };
  창당: { 날짜: Date };
  해산: { 날짜: Date; 종류: "해산" | "흡수" | "병합" };
}
