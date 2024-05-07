import { LatLngTuple } from "leaflet";

export const ATTR = {
  OSM: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  CARTO: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
  LeeJongho21:
    "&copy; <a href=https://github.com/OhmyNews/2020_21_elec_map>LeeJongho Report in OhMyNews</a>",
  LeeJongho22:
    "&copy; <a href=https://github.com/OhmyNews/2024_22_elec_map>LeeJongho Report in OhMyNews</a>",
} as const;

/** @see https://leaflet-extras.github.io/leaflet-providers/preview/ */
export const TILE_STYLE = {
  CartoDB_DarkMatterNoLabels: {
    url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    attribution: `${ATTR.OSM} ${ATTR.CARTO}`,
  },
  CartoDB_PositronNoLabels: {
    url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
    attribution: `${ATTR.OSM} ${ATTR.CARTO}`,
  },
  CartoDB_Positron: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: `${ATTR.OSM} ${ATTR.CARTO}`,
  },
} as const;

export const SOUTH_KOREA_POSITION: LatLngTuple = [35.95, 128.25];

export function randomColor(i: number) {
  return `hsl(${(50 * i) % 360}, 100%, 50%)`;
}

export const viewTypes = [
  "21대 지역구 당선자 나이",
  "21대 지역구 구분",
  "21대 지역구 당선자 소속 정당",
  "21대 지역구 매니페스토",
  "21대 재보궐",
] as const;
export type ViewType = (typeof viewTypes)[number];
