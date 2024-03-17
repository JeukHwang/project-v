import fs from "fs";
import path from "path";
import WAYV_GROUP_MAP_CACHED from "../../data/processed/WAYV_GROUP_MAP.json";
type Position = [number, number]; // Latitude, Longitude
type Segment = { id: number; nodes: Position[]; group: string };
type Road = Position[];
const WAYV_GROUP_MAP = new Map(WAYV_GROUP_MAP_CACHED as [string, Segment[]][]);

function optimize(data: Segment[]): Road[] {
  const endpointMap = new Map<string, Segment[]>();
  // segment first node as key, segment last node as value
  data.forEach((segment) => {
    const first = pid(segment.nodes[0]);
    const last = pid(segment.nodes[segment.nodes.length - 1]);
    if (endpointMap.get(first) === undefined) endpointMap.set(first, []);
    if (endpointMap.get(last) === undefined) endpointMap.set(last, []);
    endpointMap.get(first)!.push(segment);
    endpointMap.get(last)!.push(segment);
  });

  console.log("1");

  const unusedIds = new Set(data.map((segment) => segment.id));
  const segmentSeqs: Segment[][] = [];
  let i = 0;
  while (unusedIds.size > 0) {
    console.log(unusedIds.size, i++);
    const unusedSegments = data.filter((segment) => unusedIds.has(segment.id));
    const segmentSeq = findSegmentSequence(endpointMap, unusedSegments);
    segmentSeq.forEach((segment) => unusedIds.delete(segment.id));
    segmentSeqs.push(segmentSeq);
  }

  console.log("2");

  const roads: Road[] = segmentSeqs
    .map((segmentSequence) =>
      segmentSequence.flatMap((segment) => segment.nodes)
    )
    .map(alignRoad);

  // merge if start and end are close
  const mergedRoads: Road[] = [];
  for (const road of roads) {
    let found = false;
    for (const road2 of mergedRoads) {
      if (isEnoughClose(road[0], road2[road2.length - 1])) {
        mergedRoads.splice(mergedRoads.indexOf(road2), 1);
        mergedRoads.push(road2.concat(road));
        found = true;
        break;
      } else if (isEnoughClose(road[road.length - 1], road2[0])) {
        mergedRoads.splice(mergedRoads.indexOf(road2), 1);
        mergedRoads.push(road.concat(road2));
        found = true;
        break;
      }
    }
    if (!found) {
      mergedRoads.push(road);
    }
  }

  //   console.assert(data.length === segmentSeqs.flat().length);
  //   console.log(data.length);
  //   console.log(segmentSeqs.length, segmentSeqs.map((s) => s.length).toString());
  //   console.assert(roads.flat().length === mergedRoads.flat().length);
  //   console.log(roads.length, roads.map((r) => r.length).toString());
  //   console.log(mergedRoads.length, mergedRoads.map((r) => r.length).toString());
  return mergedRoads;
}

function pid(position: Position): string {
  return position.toString();
}

function other(
  endpointMap: Map<string, Segment[]>,
  segment: Segment,
  node: Position
): [Segment, Position] | null {
  const otherNode =
    pid(segment.nodes[0]) === pid(node)
      ? segment.nodes[segment.nodes.length - 1]
      : segment.nodes[0];
  const segments = endpointMap.get(pid(otherNode));
  if (segments === undefined) return null;
  const filteredSegments = segments.filter(
    (segment_) => segment_.id !== segment.id
  );
  return filteredSegments.length === 1
    ? [filteredSegments[0], otherNode]
    : null;
}

function findSegmentSequence(
  endpointMap: Map<string, Segment[]>,
  data: Segment[]
): Segment[] {
  const segmentSequence: Segment[] = [data[0]];
  let query: [Segment, Position] | null = [data[0], data[0].nodes[0]];
  while (true) {
    query = other(endpointMap, ...query);
    if (query === null) break;
    segmentSequence.push(query[0]);
  }
  query = [data[0], data[0].nodes[data[0].nodes.length - 1]];
  while (true) {
    query = other(endpointMap, ...query);
    if (query === null) break;
    segmentSequence.unshift(query[0]);
  }
  return segmentSequence;
}

function alignRoad(p: Road): Road {
  // make it go to right or go to upward
  // reverse or not by first node and last node
  const [x1, y1] = p[0];
  const [x2, y2] = p[p.length - 1];
  const isHorizontal = Math.abs(x1 - x2) > Math.abs(y1 - y2);
  const isReversed = isHorizontal ? x1 > x2 : y1 > y2;
  return isReversed ? p.reverse() : p;
}

function isEnoughClose(p1: Position, p2: Position) {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  return Math.abs(x1 - x2) < 0.01 && Math.abs(y1 - y2) < 0.001;
}

export function connect() {
  const data = [];
  for (const [group, segments] of WAYV_GROUP_MAP) {
    const roads = optimize(segments);
    // console.log(
    //   "ENDED",
    //   group,
    //   roads.length,
    //   roads.map((r) => r.length).toString()
    // );
    data.push([group, roads]);
  }
  fs.writeFileSync(
    path.resolve(__dirname, `../../data/processed/ROADS.json`),
    JSON.stringify(data, null, 2)
  );
}

export function parse() {
  const data_ = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, `../../data/processed/ROADS.json`),
      "utf-8"
    )
  );
  const data = new Map<string, Road[]>(data_ as [string, Road[]][]);

  const data2 = Object.entries(DATE).map(
    ([group, { geo, time }]): [string, ParsedRoad] => {
      const roads = data.get(group)!;

      const parsedRoads = {
        nodes: roads,
        points: geo,
        edges: roads.map((road) => {
          const index = Array.from({ length: geo.length }).map((_, i) =>
            findClosestIndex(road, geo[i][1])
          );
          return Array.from({ length: geo.length - 1 }, (_, i) => {
            return { start: index[i], end: index[i + 1], time: time[i] };
          });
        }),
      };
      return [group, parsedRoads];
    }
  );
  fs.writeFileSync(
    path.resolve(__dirname, `../../data/processed/ROADS_PARSED.json`),
    JSON.stringify(data2, null, 2)
  );
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function distanceInKmBetweenEarthCoordinates(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const earthRadiusKm = 6371;

  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function findClosestIndex(positions: Position[], point: Position): number {
  let min = Infinity;
  let result = 0;
  for (let i = 0; i < positions.length; i++) {
    const p = positions[i];
    const d = distanceInKmBetweenEarthCoordinates(
      p[0],
      p[1],
      point[0],
      point[1]
    );
    if (d < min) {
      min = d;
      result = i;
    }
  }
  return result;
}

// https://nominatim.openstreetmap.org/ui/search.html
const NEVER = "9999.12.31";
const DATE: {
  [key in string]: { geo: [string, [number, number]][]; time: string[] };
} = {
  경부고속도로: {
    geo: [
      ["구서 나들목", [35.2537808, 129.1000232]],
      ["동대구 갈림목", [35.8890363, 128.6890159]],
      ["대전 나들목", [36.3639013, 127.4508224]],
      ["천안 나들목", [36.8287127, 127.1704014]],
      ["오산 나들목", [37.145952, 127.0834195]],
      ["수원 나들목", [37.2668015, 127.1036946]],
      ["신양재 나들목", [37.4584531, 127.0446863]],
    ],
    time: [
      "1969.12.19",
      "1970.07.07",
      "1969.12.10",
      "1969.09.29",
      "1968.12.30",
      "1968.12.21",
    ],
  },
  남해고속도로: {
    geo: [
      ["서영암 나들목", [34.751652, 126.5311254]],
      ["해룡 나들목", [34.9116896, 127.5447489]],

      ["서순천 나들목", [35.0032217, 127.4825792]],
      ["산인 갈림목", [35.2713669, 128.4720363]],
      ["창원 갈림목", [35.2748312, 128.6489768]],
      ["부산 종점 | 덕천 나들목 근처", [35.2130296, 129.0302883]],
    ],
    time: ["2012.04.27", NEVER, "1973.11.14", "2001.11.15", "1973.11.14"],
  },
  남해고속도로제1지선: {
    geo: [
      ["산인 갈림목", [35.2713669, 128.4720363]],
      ["창원 갈림목", [35.2748312, 128.6489768]],
    ],
    time: ["1973.11.14"],
  },
  남해고속도로제2지선: {
    geo: [
      ["냉정 갈림목", [35.218139, 128.7958572]],
      ["사상 나들목", [35.1524353, 128.9718018]],
    ],
    time: ["1973.11.14"],
  },
  남해고속도로제3지선: {
    geo: [
      ["진례 갈림목", [35.2265751, 128.7739692]],
      ["신항 교차로", [35.0942042, 128.7652902]],
    ],
    time: ["2017.01.13"],
  },
  무안광주고속도로: {
    geo: [
      ["무안 나들목", [35.0032766, 126.3930388]],
      ["나주 나들목", [35.103295, 126.6987916]],
      ["운수 나들목", [35.1589768, 126.7777112]],
    ],
    time: ["2007.11.8", "2008.5.28"],
  },
  광주대구고속도로: {
    geo: [
      ["고서 갈림목", [35.226324, 126.9596601]],
      ["옥포 갈림목", [35.7951001, 128.464228]],
    ],
    time: ["1984.06.27"],
  },
  함양울산고속도로: {
    geo: [
      ["밀양 나들목", [35.5166748, 128.7961598]],
      ["울주 나들목", [35.5016124, 129.2544672]],
    ],
    time: ["2013.12.20"],
  },
  서해안고속도로: {
    geo: [
      ["죽림 갈림목", [34.8473668, 126.4692948]],
      ["무안 나들목", [35.0071616, 126.49211]],
      ["군산 나들목", [36.0096084, 126.7992361]],
      ["서천 나들목", [36.0987963, 126.6895433]],
      ["당진 갈림목", [36.8930447, 126.7074317]],
      ["안중리", [36.9878446, 126.9331294]],
      ["안산 갈림목", [37.3452797, 126.8566022]],
      ["일직 갈림목", [37.4243352, 126.89493]],
      // (사이트) 일직~시흥 -> (실제) 일직~서울로 고쳐야함
      ["금천 나들목", [37.4625842, 126.8886648]],
    ],
    time: [
      "1998. 8.25",
      "2001.12.21",
      "1998.10.30",
      "2001.11.10",
      "2000.11.10",
      "1994.07.06",
      "1995.12.28",
      "1998.11.25",
    ],
  },
  울산고속도로: {
    geo: [
      ["언양 갈림목", [35.5655435, 129.1323911]],
      ["울산 종점 | 울산 갈림목 근처", [35.5529013, 129.25879634296308]],
    ],
    time: ["1969.12.29"],
  },
  새만금포항고속도로: {
    geo: [
      // 익산 갈림목~완주 갈림목 ??
      ["완주 갈림목", [35.8871121, 127.1666629]],
      ["장수 나들목", [35.7169956, 127.5927535]],
      ["장수 갈림목", [35.7287299, 127.6049292]],

      // not render??
      ["대구 시점 | 팔공산 나들목 근처", [35.9073353, 128.6409554]],
      ["포항 나들목", [36.0433732, 129.310872]],
    ],
    time: ["2007.12.13", "2001.11.29", NEVER, "2004.12.07"],
  },
  호남고속도로: {
    geo: [
      ["서순천 나들목", [35.0032217, 127.4825792]],
      ["전주 나들목", [35.8763394, 127.0546047]],
      ["논산 갈림목", [36.0758994, 127.1019351]],
    ],
    time: ["1973.11.14", "1970.12.30"],
  },
  순천완주고속도로: {
    geo: [
      // 서천~동순천 -> 동순천~서천
      ["동순천 나들목", [34.9490109, 127.5525161]],
      ["순천 갈림목", [34.9909061, 127.5390815]],
      ["서남원 나들목", [35.363504, 127.335418]],
      ["완주 갈림목", [35.8871121, 127.1666629]],
    ],
    time: ["2011.4.29", "2011.1.31", "2010.12.28"],
  },
  서산영덕고속도로: {
    geo: [
      // (사이트) 순서가 이상함
      ["당진 갈림목", [36.8487762, 126.6208692]],
      ["유성 갈림목", [36.3903078, 127.3375874]],
      ["청주 갈림목", [36.5641077, 127.4344201]],
      ["상주 갈림목", [36.3750553, 128.2687584]],
      ["영덕 나들목", [36.3827314, 129.3677787]],
    ],
    time: ["2009.05.28", NEVER, "2007.11.28", "2016.12.26"],
  },
  당진청주고속도로: {
    geo: [
      // (사이트) 순서가 이상함
      ["아산 나들목", [36.8215332, 126.9760948]],
      ["천안 갈림목", [36.7760058, 127.1769774]],
    ],
    time: ["2023.09.20"],
  },
  통영대전고속도로: {
    geo: [
      ["통영 나들목", [34.8669038, 128.4394626]],
      ["진주 갈림목", [35.137672, 128.0995051]],
      ["서진주 나들목", [35.1838406, 128.040585]],
      ["함양 나들목", [35.5336213, 127.7478511]],
      ["무주 나들목", [35.9805742, 127.6431862]],
      ["산내 갈림목", [36.2873285, 127.4567422]],
      ["비룡 갈림목", [36.3414308, 127.4821931]],
    ],
    time: [
      "2005.12.12",
      "1996.12.20",
      "1998.10.22",
      "2001.11.29",
      "2000.12.22",
      "1999.09.06",
    ],
  },
  중부고속도로: {
    geo: [
      ["남이 갈림목", [36.6046, 127.4201262]],
      ["하남 갈림목", [37.5317595, 127.2012704]],
    ],
    time: ["1987.12.03"],
  },
  제2중부고속도로: {
    geo: [
      ["마장 갈림목", [37.2626806, 127.4089246]],
      ["산곡 갈림목", [37.4773901, 127.2458885]],
    ],
    time: ["2001.11.29"],
  },
  평택제천고속도로: {
    geo: [
      ["서평택 갈림목", [37.0530455, 126.8938215]],
      ["안성 갈림목", [37.0349953, 127.1346205]],
      ["남안성 나들목", [36.9747771, 127.2466656]],
      ["대소 갈림목", [36.9410484, 127.4684432]],
      ["충주 갈림목", [37.0336107, 127.7318901]],
      ["동충주 나들목", [37.0638649, 127.9250717]],
      ["제천 갈림목", [37.0791282, 128.1738242]],
    ],
    time: [
      "2002.12.12",
      "2007.08.31",
      "2008.11.11",
      "2013.08.12",
      "2014.10.31",
      "2015.06.30",
    ],
  },
  중부내륙고속도로: {
    geo: [
      ["내서 갈림목", [35.2618051, 128.5113656]],
      ["현풍 갈림목", [35.6744414, 128.4354011487431]],
      ["김천 갈림목", [36.1666688, 128.2656158]],
      ["북상주 나들목", [36.5327121, 128.1671284]],
      ["충주 갈림목", [37.0456736, 127.7341146]],
      ["여주 갈림목", [37.2249352, 127.5928139]],
      ["양평 나들목", [37.5236072, 127.4438712]],
    ],
    time: [
      "1977.12.17",
      "2007.11.29",
      "2001.09.07",
      "2004.12.15",
      "2002.12.20",
      "2010.09.15",
      "2012.12.28",
    ],
  },
  영동고속도로: {
    geo: [
      ["서창 갈림목", [37.4379018, 126.7394762]],
      ["안산 갈림목", [37.3432025, 126.865427]],
      ["신갈 갈림목", [37.2899789, 127.1041909]],
      ["새말 나들목", [37.4471892, 128.0630335]],
      ["강릉 갈림목", [37.7717212, 128.8209271]],
    ],
    time: ["1994.07.06", "1991.11.29", "1971.12.01", "1975.10.14"],
  },
  중앙고속도로: {
    geo: [
      ["강서낙동강교", [35.1931908, 128.9822494]],
      ["대동 갈림목", [35.2872377, 128.9840163]],

      ["금호 갈림목", [35.8928324, 128.5290456]],
      ["안동 갈림목", [36.4312727, 128.6214355]], // (사이트) 서안동 -> (실제) 안동
      ["풍기 나들목", [36.8508014, 128.5329783]],
      ["제천 갈림목", [37.0837345, 128.1698288]],
      ["만종 갈림목", [37.369571, 127.8987105]],
      ["홍천 나들목", [37.6761235, 127.8618758]],
      ["춘천 나들목", [37.8413394, 127.7693246]],
    ],
    time: [
      "1996.06.28",
      "1995.08.29",
      "1999.09.16",
      "2001.12.19",
      "1995.08.29",
      "2001.08.17",
      "1995.08.29",
    ],
  },
};

type ParsedRoad = {
  nodes: Road[];
  points: [string, Position][];
  edges: { start: number; end: number; time: string }[][];
};
