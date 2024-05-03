import { closest } from "fastest-levenshtein";
import { Person } from "./person";

export type AssemblyData = {
  대: number;
  국회의원: Person[];
  임기: {
    시작: Date;
    끝: Date;
  };
  의원수: {
    지역구: number;
    비례대표: number;
  };
};

export class Assembly {
  constructor(private readonly data: AssemblyData) {}

  get 대(): number {
    return this.data.대;
  }

  get 국회의원(): Person[] {
    return this.data.국회의원;
  }

  get 지역구(): string[] {
    const list = this.국회의원
      .map((v) => v.의원활동at(this.data.대)?.선거구)
      .filter((v) => v !== undefined && v !== null);
    return [...new Set(list)];
  }

  findSimilar지역구(name: string): string {
    return closest(name, this.지역구);
  }

  get 임기(): AssemblyData["임기"] {
    return this.data.임기;
  }

  get 의원수(): AssemblyData["의원수"] {
    return this.data.의원수;
  }
}
