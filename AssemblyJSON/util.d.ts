export type Variable<T> = {
  /** @description Include */
  start: Date;
  /** @description Exclude */
  end: Date;
  value: T;
}[];
