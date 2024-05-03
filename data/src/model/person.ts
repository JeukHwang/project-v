export type Variable<T> = {
  /** @description include */
  start: Date;
  /** @description exclude */
  end: Date;
  value: T;
}[];

export type district = { 대: number; 선거구: string | null };

export type PersonData = {
  개인정보: {
    이름: {
      한글: string;
      한자?: string;
      영어?: string;
    };
    생년월일: {
      날짜: Date;
      양력: boolean;
    };
    성별: "남" | "여";
  };
  정당활동: Variable<string> /** @todo */;
  의원활동: Variable<district>;
};

export class Person {
  static info2id(이름: string, 생년월일: Date): string {
    return [이름, 생년월일.toISOString().split("T")[0]].join("|");
  }

  constructor(private readonly data: PersonData) {}

  get id(): string {
    return Person.info2id(
      this.data.개인정보.이름.한글,
      this.data.개인정보.생년월일.날짜
    );
  }

  get 이름(): string {
    return this.data.개인정보.이름.한글;
  }

  get 개인정보(): PersonData["개인정보"] {
    return this.data.개인정보;
  }

  get 정당활동(): PersonData["정당활동"] {
    return this.data.정당활동;
  }

  get 의원활동() {
    return {
      at: this.의원활동at.bind(this),
      data: this.data.의원활동,
    };
  }

  의원활동at<T extends number | Date>(value: T): district | null {
    if (typeof value === "number") {
      const district = this.data.의원활동.find((v) => v.value.대 === value);
      return district === undefined ? null : district.value;
    } else {
      const district = this.data.의원활동.find(
        (v) =>
          v.start.getTime() <= value.getTime() &&
          value.getTime() < v.end.getTime()
      );
      return district === undefined ? null : district.value;
    }
  }

  get JSON(): PersonData {
    return this.data;
  }
}
