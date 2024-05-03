import { PersonData } from "../model/person";
import { readExcelAsJson } from "../util";
import { constant } from "./constant";

type Member = {
  이름: string;
  한자명: string;
  영문명칭: string;
  "음/양력": "음" | "양";
  생년월일: string;
  성별: "남" | "여";
  정당명: string /** @todo */;
  선거구: string;
  재선: string /** @todo */;
  당선: string /** @todo */;
};

type PreviousMember = Member & {
  대: string;
  선거구구분: string;
  경력대수: string;
  "의원이름(한글)": string;
  "의원이름(한자)": string;
  활동기간: string;
  의원이력: string;
};

type CurrentMember = Member & {
  "선거구 지도": string;
  "대표 위원회": string /** @todo */;
  "소속 위원회 목록": string /** @todo */;
  전화번호: string;
  "사무실 호실": string;
  이메일: string;
  홈페이지: string;
  보좌관: string;
  비서관: string;
  비서: string;
};

export function build(): PersonData[] {
  const excel = readExcelAsJson<Member[]>("../election/processed/SGG.xlsx");
  const peopleData: PersonData[] = [];

  for (const member of excel["21대_전직"] as PreviousMember[]) {
    console.assert(member["이름"] === member["의원이름(한글)"]);
    console.assert(member["한자명"] === member["의원이름(한자)"]);
    console.assert(["양", "음"].includes(member["음/양력"]));
    console.assert(["남", "여"].includes(member["성별"]));
    console.assert(
      (member["선거구구분"] === "비례대표") ===
        (member["선거구"] === "비례대표")
    );
    console.assert(
      21 === parseInt(member["대"].replace("제", "").replace("대", ""), 10)
    );
    const [durationStart, durationEnd] = member["활동기간"]
      .replace(/\./g, "-")
      .split("~")
      .map((s) => s.trim());
    const end = new Date(durationEnd);
    end.setDate(end.getDate() + 1);

    peopleData.push({
      개인정보: {
        이름: {
          한글: member["이름"],
          한자: member["한자명"] || undefined,
          영어: member["영문명칭"] || undefined,
        },
        생년월일: {
          날짜: new Date(member["생년월일"]),
          양력: member["음/양력"] === "양",
        },
        성별: member["성별"],
      },
      정당활동: [],
      의원활동: [
        {
          start: new Date(durationStart),
          end: end,
          value: {
            대: 21,
            선거구: member["선거구"] === "비례대표" ? null : member["선거구"],
          },
        },
      ],
    });
  }

  function getEnd(name: string) {
    return peopleData
      .find(
        (p) =>
          p.개인정보.이름.한글 === name &&
          p.의원활동.some((v) => v.value.대 == 21 && v.value.선거구 === null)
      )!
      .의원활동.find((v) => v.value.대 === 21)!.end;
  }

  for (const member of excel["21대_현직"] as CurrentMember[]) {
    let startDate = constant.임기.시작;
    if (member["선거구"] === "비례대표") {
      switch (member["이름"]) {
        case "김의겸":
          startDate = getEnd("김진애");
          break;
        case "노용호":
          startDate = getEnd("이영");
          break;
        case "최영희":
          startDate = getEnd("조태용");
          break;
        case "허숙정":
          startDate = getEnd("최강욱");
          break;
        case "우신구":
          startDate = getEnd("신원식");
          break;
        case "김은희":
          startDate = getEnd("허은아");
          break;
        case "양경규":
          startDate = getEnd("이은주");
          break;
        case "이자스민":
          startDate = getEnd("류호정");
          break;
        case "김근태":
          startDate = getEnd("권은희");
          break;
      }
    } else {
      const exist = peopleData.find((p) =>
        p.의원활동.some(
          (d) =>
            d.value.대 === 21 &&
            member["선거구"] !== "비례대표" &&
            d.value.선거구 === member["선거구"]
        )
      );
      if (exist !== undefined) {
        startDate = exist.의원활동[0].end;
      }
    }
    peopleData.push({
      개인정보: {
        이름: {
          한글: member["이름"],
          한자: member["한자명"] || undefined,
          영어: member["영문명칭"] || undefined,
        },
        생년월일: {
          날짜: new Date(member["생년월일"]),
          양력: member["음/양력"] === "양",
        },
        성별: member["성별"],
      },
      정당활동: [],
      의원활동: [
        {
          start: startDate,
          end: constant.임기.끝,
          value: {
            대: 21,
            선거구: member["선거구"] === "비례대표" ? null : member["선거구"],
          },
        },
      ],
    });
  }

  return peopleData;
}
