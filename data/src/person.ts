import PERSON21_JSON from "../election/processed/person21.json";
import { PersonData, district } from "./person.process";

export const PERSON21 = (PERSON21_JSON as unknown as PersonData[]).map(
  (p) => new Person(p)
);
console.assert(new Set(PERSON21.map((v) => v.id)).size === PERSON21.length);

export class Person {
  constructor(private readonly person: PersonData) {}

  get id(): string {
    return [
      this.person.개인정보.이름.한글,
      this.person.개인정보.생년월일.날짜.toISOString().split("T")[0],
    ].join("|");
  }

  get 이름(): string {
    return this.person.개인정보.이름.한글;
  }

  static from이름(이름: string, 생년월일: Date): Person | null {
    const id = [이름, 생년월일.toISOString().split("T")[0]].join("|");
    return PERSON21.find((v) => v.id === id) ?? null;
  }

  get 개인정보(): PersonData["개인정보"] {
    return this.person.개인정보;
  }

  get 정당활동(): PersonData["정당활동"] {
    return this.person.정당활동;
  }

  get 의원활동() {
    return {
      at: this.의원활동at.bind(this),
      data: this.person.의원활동,
    };
  }

  의원활동at<T extends number | Date>(value: T): district | null {
    if (typeof value === "number") {
      const district = this.person.의원활동.find((v) => v.value.대 === value);
      return district === undefined ? null : district.value;
    } else {
      const district = this.person.의원활동.find(
        (v) =>
          v.start.getTime() <= value.getTime() &&
          value.getTime() < v.end.getTime()
      );
      return district === undefined ? null : district.value;
    }
  }
}
