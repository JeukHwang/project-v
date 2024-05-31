/** @see https://leafletjs.com/examples/geojson/ */
/** @see https://react-leaflet.js.org/docs/api-components/ */
/** @see https://velog.io/@magpies1221/React-Leaflet-2 */
/** @see https://leafletjs.com/reference.html#path */

import "leaflet/dist/leaflet.css";
import { PropsWithChildren } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { SOUTH_KOREA_POSITION, TILE_STYLE } from "../../util/constant";

const style = TILE_STYLE.CartoDB_PositronNoLabels;
export default function LeafletMap({ children }: PropsWithChildren) {
  return (
    <MapContainer
      center={SOUTH_KOREA_POSITION}
      zoom={7}
      scrollWheelZoom={true}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer attribution={style.attribution} url={style.url} />
      {children}
    </MapContainer>
  );
}
