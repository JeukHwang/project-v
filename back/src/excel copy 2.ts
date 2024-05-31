import fs from "fs";
import path from "path";
import * as xlsx from "xlsx";
import data from "../fetch.json";
import { District } from "./election/model/district";
import { Person, PersonData } from "./election/model/person";
import { constant21 } from "./election/제21대/constant";
import { map2district, readJson, saveJson } from "./util";
xlsx.set_fs(fs);

const entries: {
  electionCode: string;
  electionCodeName: string;
  electionType: string;
  city: string;
  district: string;
}[] = data;

function checkEnableToBeOpen() {
  const dirPath = path.join(__dirname, "../downloads");
  const fileNames = fs.readdirSync(dirPath);
  // console.log(dirPath, fileNames.length);

  console.time("FINISH");
  for (const fileName of fileNames) {
    const filePath = path.join(__dirname, `../downloads/${fileName}`);
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    console.assert(sheetNames.length === 1);
    const sheet = workbook.Sheets[sheetNames[0]];
    if (sheet["A1"].v !== "중앙선거관리위원회 선거통계시스템") {
      console.log(fileName);
    }
  }
  console.timeEnd("FINISH");
}

function getDataFrom21() {
  const dirPath = path.join(__dirname, "../downloads");
  const fileNames = fs.readdirSync(dirPath);

  console.time("FINISH");
  const array = [];
  for (const fileName of fileNames) {
    const filePath = path.join(__dirname, `../downloads/${fileName}`);
    if (
      !fileName.startsWith(
        "개표현황(읍면동별)[제21대][국회의원선거][국회의원선거]"
      )
    )
      continue;
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    console.assert(sheetNames.length === 1);
    const sheet = workbook.Sheets[sheetNames[0]];
    const json = xlsx.utils.sheet_to_json(sheet);
    array.push(convert21(json));
  }
  saveJson("./투표율.json", array);
  console.timeEnd("FINISH");
}

const beautify = (s: string) => {
  const string = s.replace(/\n/g, "|").replace(/ /g, "").replace(/,/g, "");
  const int = parseInt(string, 10);
  return Number.isNaN(int) ? string : int;
};

function convert21(input: any) {
  const [_, 파일명, _시간, 구분, ...data] = input;
  const array = {
    파일명: 파일명["중앙선거관리위원회 선거통계시스템"],
    선거구: [] as any[],
  };
  for (let i = 0; i < data.length; i++) {
    const element = data[i];
    if (element["중앙선거관리위원회 선거통계시스템"] === undefined) continue;
    const name = element["중앙선거관리위원회 선거통계시스템"].trim();
    if (name == "") continue;
    const candidate = data[i - 1];
    const object = { ...candidate, ...구분, __EMPTY_4: candidate["__EMPTY_4"] };
    const processed = Object.fromEntries(
      Object.keys(object).map((key) => [
        beautify(object[key]),
        beautify(element[key]),
      ])
    );
    array.선거구.push({
      선거구명: processed["선거구명"],
      선거인수: processed["선거인수"],
      투표수: processed["투표수"],
      후보자: Object.fromEntries(
        Object.entries(processed).filter(
          ([k, v]) => k !== "무효|투표수" && k.includes("|")
        )
      ),
      무효투표수: processed["무효|투표수"],
      기권수: processed["기권수"],
    });
  }
  console.log(JSON.stringify(array, null, 2));
  return array;
}

// getDataFrom21();

function checkAllFileSuccess() {
  const json = readJson("./투표율.json");
  console.log(json.length);
  const dirPath = path.join(__dirname, "../downloads");
  const fileNames = fs.readdirSync(dirPath);
  console.log(
    fileNames.filter((f) =>
      f.startsWith("개표현황(읍면동별)[제21대][국회의원선거][국회의원선거]")
    ).length
  );
}

function map투표율toDistrict() {
  const json = readJson("./투표율.json") as any[];
  const normalized_data = json.flatMap((v) =>
    v.선거구.map((d) => {
      const properties = v.파일명
        .match(/\[([^\]]+)\]/g)
        .map((match) => match.slice(1, -1));
      return {
        ...d,
        파일명: v.파일명,
        시도_선거구명: `${properties[properties.length - 2]} ${d.선거구명}`,
      };
    })
  );

  const data = [...new Set(normalized_data.map((d) => d.시도_선거구명))].map(
    (n) => {
      const filtered = normalized_data.filter((d) => d.시도_선거구명 === n);
      return {
        시도_선거구명: n,
        파일명: filtered.map((d) => d.파일명),
        선거인수: filtered.reduce((a, b) => a + b.선거인수, 0),
        투표수: filtered.reduce((a, b) => a + b.투표수, 0),
        무효투표수: filtered.reduce((a, b) => a + b.무효투표수, 0),
        기권수: filtered.reduce((a, b) => a + b.기권수, 0),
        후보자: filtered[0].후보자,
      };
    }
  );
  const district = readJson<District[]>(
    "../data/election/processed/21/district.json"
  );
  map2district(
    district,
    data.map((d) => d.시도_선거구명),
    true
  );
  saveJson("./지역별 투표율.json", data);
}

map투표율toDistrict();

function printDistrictAND투표율() {
  const content = readJson<PersonData[]>(
    "../data/election/processed/21/person.json"
  );
  content.forEach((p) => {
    p.개인정보.생년월일.날짜 = new Date(p.개인정보.생년월일.날짜);
    p.의원활동.forEach((v) => {
      v.start = new Date(v.start);
      v.end = new Date(v.end);
    });
  });
  const person21 = content.map((p) => new Person(p));

  const votes = readJson("./지역별 투표율.json");

  const analysis = votes
    .map((v: any) => v.시도_선거구명)
    .map((district) => {
      const person = person21.find(
        (p) => p.의원활동at(21)?.시도_선거구명 === district
      )!;
      const age =
        constant21.임기.시작.getFullYear() -
        person.개인정보.생년월일.날짜.getFullYear();
      const votes_data = votes.find((v: any) => v.시도_선거구명 === district);
      const turnout = votes_data.투표수 / votes_data.선거인수;
      return [age, turnout];
    });
  for (const [age, turnout] of analysis) {
    console.log(age, turnout);
  }
}

// printDistrictAND투표율();

function getAllMember() {
  const filePath = path.join(
    __dirname,
    `../data/election/raw/데이터_역대 국회의원 인적사항.xlsx`
  );
  const workbook = xlsx.readFile(filePath);
  const sheetNames = workbook.SheetNames;
  console.assert(sheetNames.length === 1);
  const sheet = workbook.Sheets[sheetNames[0]];
  const json = xlsx.utils.sheet_to_json(sheet);
  saveJson("./인적사항.json", json);
}

// getAllMember();

function analyze() {
  const d21 = readJson<District[]>(
    "../data/election/processed/21/district.json"
  );

  const members = readJson("./인적사항.json").filter(
    (m) => m["선거구구분"] !== "비례대표"
  );
  console.assert(members.find((m) => m["선거구"] === "비례대표") === undefined);

  const members17 = members.filter((m) => m["대"].includes("제17대"));
  const members18 = members.filter((m) => m["대"].includes("제18대"));
  const members19 = members.filter((m) => m["대"].includes("제19대"));
  const members20 = members.filter((m) => m["대"].includes("제20대"));
  const members21 = members.filter((m) => m["대"].includes("제21대"));
  console.log(
    members17.length,
    members18.length,
    members19.length,
    members20.length,
    members21.length
  );

  const district17 = [...new Set(members17.map((m) => m["선거구"]))];
  const district18 = [...new Set(members18.map((m) => m["선거구"]))];
  const district19 = [...new Set(members19.map((m) => m["선거구"]))];
  const district20 = [...new Set(members20.map((m) => m["선거구"]))];
  const district21 = [...new Set(members21.map((m) => m["선거구"]))];
  console.log(
    district17.length,
    district18.length,
    district19.length,
    district20.length,
    district21.length
  );

  const setDistrict20 = new Set(district20);
  const manualMap = [
    [
      "강원 홍천군철원군화천군양구군인제군",
      "강원도 춘천시철원군화천군양구군갑",
    ],
    ["경북 영양군영덕군봉화군울진군", "경상북도 영주시영양군봉화군울진군"],
    ["인천 중구동구강화군옹진군", "인천광역시 중구강화군옹진군"],
    ["경기 군포시갑", "경기도 군포시"],
    ["경북 영주시문경시예천군", "경상북도 상주시문경시"],
    ["강원 태백시횡성군영월군평창군정선군", "강원도 홍천군횡성군영월군평창군"],
    ["경기 부천시원미구갑", "경기도 부천시갑"],
    ["경기 부천시원미구을", "경기도 부천시을"],
    ["경기 군포시을", "경기도 군포시"],
    ["경기 부천시소사구", "경기도 부천시병"],
    ["경기 부천시오정구", "경기도 부천시정"],
    ["경북 상주시군위군의성군청송군", "경상북도 군위군의성군청송군영덕군"],
  ];
  manualMap.forEach(([from, to]) => {
    setDistrict20.delete(from);
    setDistrict20.add(to);
  });
  // .forEach(([from, to]) => {
  //     mapF[from] = d21.find((d) => d.시도_선거구명 === to)!;
  //   });
  const mapF = map2district(d21, [...setDistrict20], false);

  saveJson("./인적사항21.json", mapF);
}

analyze();
