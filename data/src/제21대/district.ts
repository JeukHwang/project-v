import { District } from "../model/district";
import { readExcelAsJson, readJson, saveJson } from "../util";
import { constant21 } from "./constant";

function build(): District[] {
  const data = readExcelAsJson<
    { 구분: string; 선거구명: string; 선거구역: string }[]
  >("../election/processed/제21대_국회의원지역선거구_구역표.xlsx")["Sheet1"];
  data.forEach((d) => {
    console.assert(
      typeof d.구분 === "string" &&
        d.구분.length > 0 &&
        d.구분.trim() === d.구분
    );
    console.assert(
      typeof d.선거구명 === "string" &&
        d.선거구명.length > 0 &&
        d.선거구명.trim() === d.선거구명
    );
    console.assert(
      typeof d.선거구역 === "string" &&
        d.선거구역.length > 0 &&
        d.선거구역.trim() === d.선거구역
    );
  });

  const district: District[] = data.map((d) => {
    const 시도 = d.구분.split("(")[0];
    const 선거구명 = d.선거구명.replace(/선거구$/, "");
    return {
      시도_선거구명: `${시도} ${선거구명}`,
      시도,
      선거구명,
      선거구역: d.선거구역,
    };
  });
  district.sort((a, b) => (a.시도_선거구명 < b.시도_선거구명 ? -1 : 1));
  console.assert(district.length === constant21.의원수.지역구, "기본");
  console.assert(new Set(district.map((d) => d.시도)).size === 17, "시도");
  console.assert(
    new Set(district.map((d) => d.시도_선거구명)).size ===
      constant21.의원수.지역구,
    "시도_선거구명"
  );

  return district;
}

const path = "../election/processed/21/district.json";
export const district21 = {
  build: () => saveJson(path, build()),
  load: () => readJson<District[]>(path),
};
