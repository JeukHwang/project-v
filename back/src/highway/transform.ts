/** @see http://www.gisdeveloper.co.kr/?p=6018 */
/** @see https://epsg.io/5179 */
/** @see https://github.com/vuski/admdongkor?tab=readme-ov-file#대한민국-행정동-경계-파일입니다 */
import { getTransform } from "ol/proj.js";
import { register } from "ol/proj/proj4.js";
import proj4 from "proj4";
import { Position } from "./model";

proj4.defs(
  "EPSG:5179",
  "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
register(proj4);
const transformer = getTransform("EPSG:5179", "EPSG:4326");

/** @see https://stackoverflow.com/questions/5620696/convert-lat-long-into-geojson-object */
export function convert<T extends Position | GeoJSON.Position>(data: T): T {
  const [lng, lat] = transformer(data);
  return [lng, lat];
}

export function convertA<T extends Position | GeoJSON.Position>(
  data: T[]
): T[] {
  return data.map((d) => convert(d));
}

export function convertAA<T extends Position | GeoJSON.Position>(
  data: T[][]
): T[][] {
  return data.map((d) => convertA(d));
}

export function convertAAA<T extends Position | GeoJSON.Position>(
  data: T[][][]
): T[][][] {
  return data.map((d) => convertAA(d));
}
