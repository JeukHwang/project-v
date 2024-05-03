import {
  IsArray,
  IsBoolean,
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
  validateOrReject,
} from "class-validator";
import { end21, PersonData, start21 } from "./person.process";

class 의원활동Validator {
  @IsDate()
  start!: Date;

  @IsDate()
  end!: Date;

  @IsNumber()
  대!: number;

  @ValidateIf(({ value }) => value.선거구 !== null)
  @IsString()
  선거구!: string | null;
}

class PersonValidator {
  @IsString()
  @IsNotEmpty()
  개인정보_이름_한글!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  개인정보_이름_한자?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  개인정보_이름_영어?: string;

  @IsDate()
  개인정보_생년월일_날짜!: Date;

  @IsBoolean()
  개인정보_생년월일_양력!: boolean;

  @IsIn(["남", "여"])
  개인정보_성별!: "남" | "여";

  @IsArray()
  정당활동?: PersonData["정당활동"]; /** @todo */

  @IsArray()
  @ValidateNested({ each: true })
  의원활동!: 의원활동Validator[];
}

const 의원수 = {
  지역구: 253,
  비례대표: 47,
} as const;

function is의원(person: PersonData, 대: number, date: Date) {
  return person.의원활동.some(
    (v) =>
      v.value.대 === 대 &&
      v.start.getTime() <= date.getTime() &&
      v.end.getTime() > date.getTime()
  );
}

export async function validatePerson21(people: PersonData[]) {
  for (const person of people) {
    try {
      const personValidator = new PersonValidator();
      personValidator.개인정보_이름_한글 = person.개인정보.이름.한글;
      personValidator.개인정보_이름_한자 = person.개인정보.이름.한자;
      personValidator.개인정보_이름_영어 = person.개인정보.이름.영어;
      personValidator.개인정보_생년월일_날짜 = person.개인정보.생년월일.날짜;
      personValidator.개인정보_생년월일_양력 = person.개인정보.생년월일.양력;
      personValidator.개인정보_성별 = person.개인정보.성별;
      personValidator.정당활동 = person.정당활동;
      personValidator.의원활동 = person.의원활동.map((의원활동) => {
        const v = new 의원활동Validator();
        v.start = 의원활동.start;
        v.end = 의원활동.end;
        v.대 = 의원활동.value.대;
        v.선거구 = 의원활동.value.선거구;
        return v;
      });

      await validateOrReject(person);
    } catch (errors) {
      console.error(
        "Caught promise rejection (validation failed). Errors: ",
        errors
      );
    }
  }

  console.log(people.length);
  const ps = people
    .map((p): [PersonData, PersonData["의원활동"][0] | undefined] => [
      p,
      p.의원활동.find((v) => v.value.대 === 21),
    ])
    .filter(([p, v]) => v !== undefined) as [
    PersonData,
    PersonData["의원활동"][0]
  ][];
  console.assert(people.length === ps.length, "전체수");

  console.assert(
    ps.filter(([p]) => is의원(p, 21, start21)).length ===
      의원수.지역구 + 의원수.비례대표,
    "의원수 시작"
  );
  console.assert(
    ps.filter(([p]) => is의원(p, 21, new Date("2024-05-29"))).length ===
      의원수.지역구 + 의원수.비례대표 - 4,
    "의원수 끝"
  );
  console.assert(
    ps.filter(([p]) => is의원(p, 21, end21)).length === 0,
    "의원수 끝2"
  );
  console.assert(
    new Set(ps.map(([, v]) => v.value.선거구)).size === 의원수.지역구 + 1,
    "선거구"
  );
}
