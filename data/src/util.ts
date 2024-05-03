import { levenshtein } from "edit-distance";
import * as fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { District } from "./model/district";

XLSX.set_fs(fs);

export function readExcelAsJson<T>(filePath: string): { [key in string]: T } {
  const workbook = XLSX.readFile(path.join(__dirname, filePath));
  return Object.fromEntries<T>(
    workbook.SheetNames.map((name) => [
      name,
      XLSX.utils.sheet_to_json(workbook.Sheets[name]) as T,
    ])
  );
}

export  function readJson<T>(filePath: string) :T{
  const content = fs.readFileSync(path.join(__dirname, filePath), "utf8");
  return JSON.parse(content);
}

export function saveJson(filePath: string, content: any): void {
  fs.writeFileSync(
    path.join(__dirname, filePath),
    JSON.stringify(content, null, 2)
  );
}

const insert = () => 1;
const remove = () => 1;
const update = (a: string, b: string) => (a !== b ? 1 : 0);
function findClosest(
  names: string[],
  name: string
): { value: string; distance: number; overlap: number } {
  const dist: [string, number, number][] = names.map((n) => {
    const lev = levenshtein(n, name, insert, remove, update);
    return [
      n,
      lev.distance,
      (lev.pairs() as [string, string][]).reduce(
        (c, b) => c + (b[0] === b[1] ? 1 : 0),
        0
      ),
    ];
  });
  // Most overlapped with least edit-distance
  dist.sort(([, d1, o1], [, d2, o2]) => o2 - o1 || d1 - d2);
  return { value: dist[0][0], distance: dist[0][1], overlap: dist[0][2] };
}

export function map2district<T extends string>(
  district: District[],
  data: T[],
  strict: boolean = true
): { [key in T]: District } {
  console.assert(district.length === data.length, "length");
  const dist = district.map((d) => d.시도_선거구명);
  const pair: [T, ReturnType<typeof findClosest>][] = data.map((d) => [
    d,
    findClosest(dist, d),
  ]);

  // 1-1 mapping
  console.assert(
    new Set(pair.map((p) => p[1].value)).size === district.length,
    "pair"
  );
  console.assert(
    new Set(pair.map((p) => p[0])).size === district.length,
    "pair"
  );

  if (strict) {
    pair.forEach(([d, { overlap }]) => {
      console.assert(d.length === overlap, "include");
    });
  }
  return Object.fromEntries(
    pair.map(([d, { value }]) => [
      d,
      district.find((d) => d.시도_선거구명 === value),
    ])
  ) as {
    [key in T]: District;
  };
}
