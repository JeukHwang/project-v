import fs from "fs";
import path from "path";
import * as xlsx from "xlsx";
import data from "../fetch.json";
import { saveJson } from "./util";
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
  // console.log(dirPath, fileNames.length);

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
    console.log(json);
    break;
    // break;
  }
  saveJson("./투표율.json", array);
  console.timeEnd("FINISH");
}

const toInt = (num: string) => {
  //   console.log(num);
  const int = parseInt(num.replace(/,/g, ""), 10);
  return int;
};

function convert21(input: any) {
  const candidateNumber = Object.keys(input[4]).length;
  //   console.log(
  //     input[1]["중앙선거관리위원회 선거통계시스템"],
  //     input[5]["중앙선거관리위원회 선거통계시스템"].trim(),
  //     input[4],
  //     input[5]
  //   );
  return {
    파일명: input[1]["중앙선거관리위원회 선거통계시스템"],
    선거구명: input[5]["중앙선거관리위원회 선거통계시스템"].trim(),
    선거인수: toInt(input[5].__EMPTY_2),
    투표수: toInt(input[5].__EMPTY_3),
    후보자별_득표수: Object.fromEntries(
      Array.from({ length: candidateNumber }).map((_, i) => {
        console.log(
          "key",
          input[4][`__EMPTY_${i + 4}`],
          "value",
          input[5][`__EMPTY_${i + 4}`]
        );
        return [
          input[4][`__EMPTY_${i + 4}`],
          toInt(input[5][`__EMPTY_${i + 4}`]),
        ];
      })
    ),
    무효득표수: toInt(input[5][`__EMPTY_${candidateNumber + 4}`]),
    기권수: toInt(input[5][`__EMPTY_${candidateNumber + 5}`]),
  };
}

getDataFrom21();

// { '중앙선거관리위원회 선거통계시스템': '개표현황(읍면동별)' },
// { '중앙선거관리위원회 선거통계시스템': '[제21대][국회의원선거][국회의원선거][강원도][강릉시]' },
// { '중앙선거관리위원회 선거통계시스템': '2024-05-28 00:42:34' },
// {
//   '중앙선거관리위원회 선거통계시스템': '선거구명',
//   __EMPTY: '읍면동명',
//   __EMPTY_1: '구분',
//   __EMPTY_2: '선거인수',
//   __EMPTY_3: '투표수',
//   __EMPTY_4: '후보자별 득표수',
//   __EMPTY_11: '무효\n투표수',
//   __EMPTY_12: '기권수'
// },
