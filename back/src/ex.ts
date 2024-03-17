import axios from "axios";
import cheerio from "cheerio";
import ROUTE_INFO_CACHED from "../../data/raw/ROUTE_INFO.json";

export type RouteExId = [string, string];
export type RouteEx = {
  exId: RouteExId;
  노선번호: string;
  노선명: string;
  부분노선: {
    노선명: string;
    구간: string;
  }[];
  구간: {
    구간명: string;
    연장: string;
    개통일: string;
    차로별: string;
  }[];
};

/** @deprecated CACHED */
export async function ROUTE_LIST(): Promise<RouteExId[]> {
  const response = await axios.get(
    "https://www.ex.co.kr/portal/biz/highwayGuide/routeInfoN.do"
  );
  console.assert(response.status === 200, response);
  const $ = cheerio.load(response.data);
  const route: RouteExId[] = [];
  $("#nosunList1")
    .find("option")
    .each((_, e) => {
      route.push([$(e).val(), $(e).text()]);
    });
  $("#nosunList2")
    .find("option")
    .each((_, e) => {
      route.push([$(e).val(), $(e).text()]);
    });
  return route;
}

/** @deprecated CACHED */
export async function ROUTE_INFO(route: RouteExId) {
  const formData = new FormData();
  formData.append("heightResize", "search");
  formData.append("nosunList", route[0]);
  const response = await axios.post(
    "https://www.ex.co.kr/portal/biz/highwayGuide/routeInfoN.do",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  console.assert(response.status === 200, response);
  const $ = cheerio.load(response.data);
  const tables = $("table:not(.tbl_mobile table)").toArray();
  return tables.map((table) => {
    const trs = $(table).find("tr").toArray();
    return trs.map((e) => {
      const tcs = $(e).find("th, td").toArray();
      return tcs.map((e) => $(e).text());
    });
  });
}

export function ROUTE_MAP(): RouteEx[] {
  return ROUTE_INFO_CACHED.map(
    ([key, values]: [RouteExId, string[][][]]): [RouteExId, RouteEx] => {
      let info: {
        노선번호: string;
        노선명: string;
        부분노선: {
          노선명: string;
          구간: string;
        }[];
      };
      const hasPartialRoute = values[0][0][0] !== "노선번호";
      const 노선번호 = hasPartialRoute ? values[0][0][0] : values[0][0][1];
      const 노선명 = hasPartialRoute ? values[0][0][1] : values[0][0][2];
        const 부분노선 = hasPartialRoute
            ? values[0][0].map((v, i) => (i > 1 ? { 노선명: v, 구간: values[0][i][4] } : null))
      const [header2, _, ...sections] = values[1];

      return [
        key,
        {
          exId: key,
          노선번호: info["노선번호"],
          노선명: info["노선명"],
          부분노선: info["부분노선"]
            ? { 노선명: info["부분노선"], 구간: info["구간"] }
            : null,
          구간: sections.map((section) =>
            Object.fromEntries(section.map((v, i) => [header2[i], v]))
          ) as RouteEx["구간"],
        },
      ];
    }
  );
}
