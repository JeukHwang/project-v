import DISTRICT22_JSON from "../../../../data/election/processed/21/district.json";
import GEOMETRY22_JSON from "../../../../data/election/processed/21/geometry.json";
import PERSON21_JSON from "../../../../data/election/processed/21/person.json";
import { Constant } from "../../../../data/src/model/constant";
import { District } from "../../../../data/src/model/district";
import { Geometry } from "../../../../data/src/model/geometry";
import { Person, PersonData } from "../../../../data/src/model/person";
import { merge } from "./geojson";

export const constant21: Constant = {
  임기: {
    시작: new Date("2020-05-30"),
    끝: new Date("2024-05-30"),
  },
  의원수: {
    지역구: 253,
    비례대표: 47,
  },
};
export const district21 = DISTRICT22_JSON as District[];

export const geometry21 = GEOMETRY22_JSON as Geometry;
export const mergedGeometry21: {
  [key in District["시도"]]: GeoJSON.MultiPolygon;
} = Object.fromEntries(
  Object.entries(
    Object.groupBy(geometry21.features, (f) => f.properties.시도)
  ).map(([시도, features]) => [시도, merge(features!)])
);

const person21_ = PERSON21_JSON as unknown as PersonData[];
person21_.forEach((p) => {
  p.개인정보.생년월일.날짜 = new Date(p.개인정보.생년월일.날짜);
  p.의원활동.forEach((v) => {
    v.start = new Date(v.start);
    v.end = new Date(v.end);
  });
});
export const person21 = person21_.map((p) => new Person(p));