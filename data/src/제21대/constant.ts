export const constant = {
  임기: {
    /** @description include */
    시작: new Date("2020-05-30"),
    /** @description exclude */
    끝: new Date("2024-05-30"),
  },
  /** @description 정원 기준이며 실제로는 재보궐 선거 미실시로 인해 더 적을 수 있음 */
  의원수: {
    지역구: 253,
    비례대표: 47,
  },
} as const;
