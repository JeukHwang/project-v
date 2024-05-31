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
        후보자: Object.fromEntries(
          Object.keys(filtered[0].후보자).map((k) => [
            k,
            filtered.reduce((a, b) => a + b.후보자[k], 0),
          ])
        ),
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

// map투표율toDistrict();

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

// function map20to21() {
//   const d21 = readJson<District[]>(
//     "../data/election/processed/21/district.json"
//   );

//   const members_ = readJson("./인적사항.json").filter(
//     (m) => m["선거구구분"] !== "비례대표"
//   );
//   console.assert(
//     members_.find((m) => m["선거구"] === "비례대표") === undefined
//   );
//   const members = members_.filter((m) => m["대"].includes("제20대"));
//   const district = Object.fromEntries(
//     [...new Set(members.map((m) => m["선거구"]))].map((d) => {
//       const filtered = members.filter((m) => m["선거구"] === d);
//       console.assert(filtered.length === 1, [filtered[0]["선거구"], filtered.map((m) => m["이름"])]);
//       return filtered[0];
//     })
//   );
//   console.log(district);

//   //   const mapF = map2district( district, d21, false);

//   //   const setDistrict20 = new Set(district20);

//   //   manualMap.forEach(([from, to]) => {
//   //     setDistrict20.delete(from);
//   //     setDistrict20.add(to);
//   //   });
//   // .forEach(([from, to]) => {
//   //     mapF[from] = d21.find((d) => d.시도_선거구명 === to)!;
//   //   });

//   //   saveJson("./인적사항20to구역21.json", mapF);
// }

// map20to21();

// const manualMap = [
//   ["강원 홍천군철원군화천군양구군인제군", "강원도 춘천시철원군화천군양구군갑"],
//   ["경북 영양군영덕군봉화군울진군", "경상북도 영주시영양군봉화군울진군"],
//   ["인천 중구동구강화군옹진군", "인천광역시 중구강화군옹진군"],
//   ["경기 군포시갑", "경기도 군포시"],
//   ["경북 영주시문경시예천군", "경상북도 상주시문경시"],
//   ["강원 태백시횡성군영월군평창군정선군", "강원도 홍천군횡성군영월군평창군"],
//   ["경기 부천시원미구갑", "경기도 부천시갑"],
//   ["경기 부천시원미구을", "경기도 부천시을"],
//   ["경기 군포시을", "경기도 군포시"],
//   ["경기 부천시소사구", "경기도 부천시병"],
//   ["경기 부천시오정구", "경기도 부천시정"],
//   ["경북 상주시군위군의성군청송군", "경상북도 군위군의성군청송군영덕군"],
// ];

function printDistrict() {
  const d21 = readJson<District[]>(
    "../data/election/processed/21/district.json"
  );
  for (const d of d21) {
    console.log(d.시도_선거구명);
  }
}

// printDistrict();

function print21vote() {
  const d21 = readJson<District[]>(
    "../data/election/processed/21/district.json"
  );
  const vote = readJson("./지역별 투표율.json");
  for (const d of d21) {
    const vote_data = (vote as any[]).find(
      (v) => v.시도_선거구명 === d.시도_선거구명
    );
    const 투표수 = Object.values(vote_data.후보자);
    투표수.sort((a, b) => b - a);
    const [투표수_1위, 투표수_2위, 투표수_3위] = 투표수;
    console.log(
      [
        d.시도_선거구명,
        vote_data.투표수,
        vote_data.선거인수,
        투표수_1위,
        투표수_2위,
        투표수_3위,
      ].join(",")
    );
  }
}

// print21vote();

function manifestoDistrict() {
  const raw = `시도_선거구명
서울 종로구
서울 중구성동구갑
서울 중구성동구을
서울 용산구
서울 광진구갑
서울 광진구을
서울 동대문구갑
서울 동대문구을
서울 중랑구갑
서울 중랑구을
서울 성북구갑
서울 성북구을
서울 강북구갑
서울 강북구을
서울 도봉구갑
서울 도봉구을
서울 노원구갑
서울 노원구을
서울 노원구병
서울 은평구갑
서울 은평구을
서울 서대문구갑
서울 서대문구을
서울 마포구갑
서울 마포구을
서울 양천구갑
서울 양천구을
서울 강서구갑
서울 강서구을
서울 강서구병
서울 구로구갑
서울 구로구을
서울 금천구
서울 영등포구갑
서울 영등포구을
서울 동작구갑
서울 동작구을
서울 관악구갑
서울 관악구을
서울 서초구갑
서울 서초구을
서울 강남구갑
서울 강남구을
서울 강남구병
서울 송파구갑
서울 송파구을
서울 송파구병
서울 강동구갑
서울 강동구을
부산 중구영도구
부산 서구동구
부산 부산진구갑
부산 부산진구을
부산 동래구
부산 남구갑
부산 남구을
부산 북구강서구갑
부산 북구강서구을
부산 해운대구갑
부산 해운대구을
부산 사하구갑
부산 사하구을
부산 금정구
부산 연제구
부산 수영구
부산 사상구
부산 기장군
대구 중구남구
대구 동구갑
대구 동구을
대구 서구
대구 북구갑
대구 북구을
대구 수성구갑
대구 수성구을
대구 달서구갑
대구 달서구을
대구 달서구병
대구 달성군
인천 중구강화군옹진군
인천 동구미추홀구갑
인천 동구미추홀구을
인천 연수구갑
인천 연수구을
인천 남동구갑
인천 남동구을
인천 부평구갑
인천 부평구을
인천 계양구갑
인천 계양구을
인천 서구갑
인천 서구을
광주 동구남구갑
광주 동구남구을
광주 서구갑
광주 서구을
광주 북구갑
광주 북구을
광주 광산구갑
광주 광산구을
대전 동구
대전 중구
대전 서구갑
대전 서구을
대전 유성구갑
대전 유성구을
대전 대덕구
울산 중구
울산 남구갑
울산 남구을
울산 동구
울산 북구
울산 울주군
세종 세종특별자치시갑
세종 세종특별자치시을
경기 수원시갑
경기 수원시을
경기 수원시병
경기 수원시정
경기 수원시무
경기 성남시수정구
경기 성남시중원구
경기 성남시분당구갑
경기 성남시분당구을
경기 의정부시갑
경기 의정부시을
경기 안양시만안구
경기 안양시동안구갑
경기 안양시동안구을
경기 부천시갑
경기 부천시을
경기 부천시병
경기 부천시정
경기 광명시갑
경기 광명시을
경기 평택시갑
경기 평택시을
경기 동두천시연천군
경기 안산시상록구갑
경기 안산시상록구을
경기 안산시단원구갑
경기 안산시단원구을
경기 고양시갑
경기 고양시을
경기 고양시병
경기 고양시정
경기 의왕시과천시
경기 구리시
경기 남양주시갑
경기 남양주시을
경기 남양주시병
경기 오산시
경기 시흥시갑
경기 시흥시을
경기 군포시
경기 하남시
경기 용인시갑
경기 용인시을
경기 용인시병
경기 용인시정
경기 파주시갑
경기 파주시을
경기 이천시
경기 안성시
경기 김포시갑
경기 김포시을
경기 화성시갑
경기 화성시을
경기 화성시병
경기 광주시갑
경기 광주시을
경기 양주시
경기 포천시가평군
경기 여주시양평군
강원 춘천시철원군화천군양구군갑
강원 춘천시철원군화천군양구군을
강원 원주시갑
강원 원주시을
강원 강릉시
강원 동해시태백시삼척시정선군
강원 속초시인제군고성군양양군
강원 홍천군횡성군영월군평창군
충북 청주시상당구
충북 청주시서원구
충북 청주시흥덕구
충북 청주시청원구
충북 충주시
충북 제천시단양군
충북 보은군옥천군영동군괴산군
충북 증평군진천군음성군
충남 천안시갑
충남 천안시을
충남 천안시병
충남 공주시부여군청양군
충남 보령시서천군
충남 아산시갑
충남 아산시을
충남 서산시태안군
충남 논산시계룡시금산군
충남 당진시
충남 홍성군예산군
전북 전주시갑
전북 전주시을
전북 전주시병
전북 군산시
전북 익산시갑
전북 익산시을
전북 정읍시고창군
전북 남원시임실군순창군
전북 김제시부안군
전북 완주군진안군무주군장수군
전남 목포시
전남 여수시갑
전남 여수시을
전남 순천시광양시곡성군구례군갑
전남 순천시광양시곡성군구례군을
전남 나주시화순군
전남 담양군함평군영광군장성군
전남 고흥군보성군장흥군강진군
전남 해남군완도군진도군
전남 영암군무안군신안군
경북 포항시북구
경북 포항시남구울릉군
경북 경주시
경북 김천시
경북 안동시예천군
경북 구미시갑
경북 구미시을
경북 영주시영양군봉화군울진군
경북 영천시청도군
경북 상주시문경시
경북 경산시
경북 군위군의성군청송군영덕군
경북 고령군성주군칠곡군
경남 창원시의창구
경남 창원시성산구
경남 창원시마산합포구
경남 창원시마산회원구
경남 창원시진해구
경남 진주시갑
경남 진주시을
경남 통영시고성군
경남 사천시남해군하동군
경남 김해시갑
경남 김해시을
경남 밀양시의령군함안군창녕군
경남 거제시
경남 양산시갑
경남 양산시을
경남 산청군함양군거창군합천군
제주 제주시갑
제주 제주시을
제주 서귀포시`;
  const [_, ...data] = raw.split("\n");
  console.assert(data.length === 253);
  const district = readJson<District[]>(
    "../data/election/processed/21/district.json"
  );
  const map = map2district(district, data, true);
  console.log(data.map((d) => map[d].시도_선거구명).join("\n"));
}

// manifestoDistrict();

function person21andDistrict() {
  const people = readJson<PersonData[]>(
    "../data/election/processed/21/person.json"
  ).map((p) => new Person(p));
  for (const p of people) {
    const 선거구명 = p.의원활동.at(21)?.시도_선거구명!;
    if (선거구명 === null) continue;
    const age =
      constant21.임기.시작.getFullYear() -
      new Date(p.개인정보.생년월일.날짜).getFullYear();
    console.log(`${p.이름}|${선거구명}|${age}`);
  }
}

person21andDistrict();
