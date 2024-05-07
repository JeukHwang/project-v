export type Constant = {
  임기: {
    /** @description include */
    시작: Date;
    /** @description exclude */
    끝: Date;
  };
  /** @description 정원 기준이며 실제로는 재보궐 선거 미실시로 인해 더 적을 수 있음 */
  의원수: {
    지역구: number;
    비례대표: number;
  };
};
