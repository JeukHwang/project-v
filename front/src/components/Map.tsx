import "leaflet/dist/leaflet.css";
import { MapContainer, Polyline, TileLayer } from "react-leaflet";
import { WAYV_GROUP_MAP } from "../../../data/processed";

const position = [35.95, 128.25];
const CartoDB_DarkMatterNoLabels = {
  url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

interface Props {
  group: string | null;
}
export default function Map({ group }: Props) {
  return (
    <MapContainer
      center={position}
      zoom={7}
      scrollWheelZoom={true}
      style={{ width: "100vw", height: "100vh" }}
    >
      <TileLayer
        // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution={CartoDB_DarkMatterNoLabels.attribution}
        url={CartoDB_DarkMatterNoLabels.url}
      />
      {(group ? [WAYV_GROUP_MAP.get(group)!] : [...WAYV_GROUP_MAP.values()])
        .flat()
        .map((wayV) => {
          return (
            <Polyline
              key={wayV.id}
              pathOptions={{ color: "blue" }}
              positions={wayV.nodes}
            />
          );
        })}
    </MapContainer>
  );
}
