export type PartyActivity = {
    대: number;
    시도_선거구명: District["시도_선거구명"] | null;
  };
  

export type MemberActivity = {
  대: number;
  시도_선거구명: District["시도_선거구명"] | null;
};

export interface Person {
  개인정보: {
    이름: {
      한글: string;
      한자?: string;
      영어?: string;
    };
    생년월일: {
      날짜: Date;
      종류: "양력" | "음력";
    };
    성별: "남" | "여";
  };
  정당활동: Variable<string> /** @todo */;
  의원활동: Variable<MemberActivity>;
}
