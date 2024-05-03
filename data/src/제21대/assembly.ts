import PERSON21_JSON from "../../election/processed/person21.json";
import { Assembly } from "../model/assembly";
import { PersonData } from "../model/person";
import { constant21 } from "./constant";
import { person21 } from "./person.build";

function build(): Assembly {
  const data = PERSON21_JSON as unknown as PersonData[];
  data.forEach((p) => {
    p.개인정보.생년월일.날짜 = new Date(p.개인정보.생년월일.날짜);
    p.의원활동.forEach((v) => {
      v.start = new Date(v.start);
      v.end = new Date(v.end);
    });
  });
  return new Assembly({
    대: 21,
    국회의원: person21.load(),
    ...constant21,
  });
}

export const assembly21 = {
  get: () => build(),
};
