// import { geocode } from "./api";
import path from "path";
// import { csvToJson } from "./csv";

const csvPath = path.resolve(
  __dirname,
  "../../data/raw/고속도로 건설공사(2023년6월).csv"
);
// console.log(await geocode("서울특별시 강남구 역삼동 736-1"));

// console.log(await csvToJson(csvPath));
// await ex();

// console.log(JSON.stringify(await Promise.all((await ROUTE_LIST()).map(async(r) => [r, await ROUTE_INFO(r)]))));
// console.log(await ROUTE_INFO(["001", "경부선"]));

import data from "../../data/raw/ROUTE_INFO.json";
import { RouteExId } from "./ex";
import { parse } from "./connect";

// const d = data as [RouteExId, string[][][]][];
// console.log(
//   d.map(([key, values]) => {
//     return [key[0], ...values.map((v) => v[0][0])];
//   })
// );

parse();