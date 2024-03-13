import "leaflet/dist/leaflet.css";
import { MapContainer, Polyline, TileLayer } from "react-leaflet";
import { WAY_DRAW_MAP } from "../../../data/wrapper";

const position = [35.95, 128.25];
const CartoDB_DarkMatterNoLabels = {
  url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

export default function Map() {
  return (
    <MapContainer
      center={position}
      zoom={7}
      scrollWheelZoom={true}
      style={{ width: "1280px", height: "720px" }}
    >
      <TileLayer
        // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution={CartoDB_DarkMatterNoLabels.attribution}
        url={CartoDB_DarkMatterNoLabels.url}
      />
      {[...WAY_DRAW_MAP.entries()].map(([key, way_draw]) => {
        return (
          <Polyline
            key={key}
            pathOptions={{ color: "blue" }}
            positions={way_draw.nodes}
          />
        );
      })}
    </MapContainer>
  );
}
