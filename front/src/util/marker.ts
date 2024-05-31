/** @see https://www.geoapify.com/create-custom-map-marker-icon */
/** @see https://jsfiddle.net/a08oek3w/2/ */
/** @see https://github.com/marella/material-symbols/tree/main/material-symbols */

import L from "leaflet";
import "material-symbols";
import "./marker.css";

type Variations = "outlined" | "rounded" | "sharp";

interface Props {
  name: string;
  variation?: Variations;
  color?: string;
  bgColor?: string;
  fgColor?: string;
}

/** @see https://marella.me/material-symbols/demo/#outlined */
export function icon2marker({
  name,
  variation = "outlined",
  color: iconColor = "black",
  bgColor = iconColor,
  fgColor = "white",
}: Props) {
  const html = `
    <div style='background-color:${bgColor}'>
        <div style='background-color:${fgColor}'></div>
    </div>
    <span class='material-symbols-${variation}' style='color:${iconColor}'>${name}</span>`;
  const icon = L.divIcon({
    className: "leaflet-icon-marker",
    html,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
  });
  return icon;
}
