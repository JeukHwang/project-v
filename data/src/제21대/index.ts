import PERSON21_JSON from "../../election/processed/person21.json";
import { Assembly } from "../model/assembly";
import { Person, PersonData } from "../model/person";
import { constant } from "./constant";
import { test } from "./person.test";

const data = PERSON21_JSON as unknown as PersonData[];
data.forEach((p) => {
  p.개인정보.생년월일.날짜 = new Date(p.개인정보.생년월일.날짜);
  p.의원활동.forEach((v) => {
    v.start = new Date(v.start);
    v.end = new Date(v.end);
  });
});
await test(data);

export const 제21대 = new Assembly({
  대: 21,
  국회의원: data.map((p) => new Person(p)),
  ...constant,
});
