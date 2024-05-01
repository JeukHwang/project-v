import { ATTR } from "./attribution";

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
