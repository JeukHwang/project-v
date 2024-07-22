const MAP_ATTR = {
  OSM: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  CARTO: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
} as const;

/** @see https://leaflet-extras.github.io/leaflet-providers/preview/ */
export const TILE_STYLE = {
  CartoDB_DarkMatterNoLabels: {
    url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    attribution: `${MAP_ATTR.OSM} ${MAP_ATTR.CARTO}`,
  },
  CartoDB_PositronNoLabels: {
    url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
    attribution: `${MAP_ATTR.OSM} ${MAP_ATTR.CARTO}`,
  },
  CartoDB_Positron: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: `${MAP_ATTR.OSM} ${MAP_ATTR.CARTO}`,
  },
} as const;
