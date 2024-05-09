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

export function convert(point: Position): Position {
  const [x, y] = transformer(point);
  return [y, x];
}


