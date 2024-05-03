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
import { Person, PersonData } from "../model/person";
import { constant21 } from "./constant";

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

export async function test(peopleData: PersonData[]): Promise<void> {
  await peopleData.map((personData) => {
    const personValidator = new PersonValidator();
    personValidator.개인정보_이름_한글 = personData.개인정보.이름.한글;
    personValidator.개인정보_이름_한자 = personData.개인정보.이름.한자;
    personValidator.개인정보_이름_영어 = personData.개인정보.이름.영어;
    personValidator.개인정보_생년월일_날짜 = personData.개인정보.생년월일.날짜;
    personValidator.개인정보_생년월일_양력 = personData.개인정보.생년월일.양력;
    personValidator.개인정보_성별 = personData.개인정보.성별;
    personValidator.정당활동 = personData.정당활동;
    personValidator.의원활동 = personData.의원활동.map((의원활동) => {
      const v = new 의원활동Validator();
      v.start = 의원활동.start;
      v.end = 의원활동.end;
      v.대 = 의원활동.value.대;
      v.선거구 = 의원활동.value.선거구;
      return v;
    });
    return validateOrReject(personData);
  });

  const people = peopleData.map((p) => new Person(p));
  const people21 = people.filter((p) => p.의원활동at(21) !== null);
  console.assert(people.length === people21.length, "전체수");
  console.assert(
    people21.filter((p) => p.의원활동at(constant21.임기.시작) !== null)
      .length ===
      constant21.의원수.지역구 + constant21.의원수.비례대표,
    "의원수 시작"
  );
  console.assert(
    people21.filter((p) => p.의원활동at(new Date("2024-05-29")) !== null)
      .length ===
      constant21.의원수.지역구 + constant21.의원수.비례대표 - 4,
    "의원수 마무리"
  );
  console.assert(
    people21.filter((p) => p.의원활동at(constant21.임기.끝) !== null).length ===
      0,
    "의원수 끝"
  );
  console.assert(
    new Set(
      people21.map((p) => p.의원활동at(21)!.선거구).filter((v) => v !== null)
    ).size === constant21.의원수.지역구,
    "선거구"
  );
}
