import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import { ROADS, ROADS_PARSED } from "../../util/highway.legacy";

const position = [35.95, 128.25];
const CartoDB_DarkMatterNoLabels = {
  url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

interface Props {
  date: Date;
  group: string;
}
export default function HighwayMapLegacy({ date, group }: Props) {
  return (
    <MapContainer
      center={position}
      zoom={7}
      scrollWheelZoom={true}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution={CartoDB_DarkMatterNoLabels.attribution}
        url={CartoDB_DarkMatterNoLabels.url}
      />
      {[...ROADS.values()].map((value) => (
        <Polyline pathOptions={{ color: "gray" }} positions={value} />
      ))}
      {group === "ALL" ? (
        [...ROADS_PARSED.keys()].map((group) => (
          <Road group={group} date={date} />
        ))
      ) : (
        <>
          <Road group={group} date={date} marker />
        </>
      )}
    </MapContainer>
  );
}

function Road({
  group,
  date,
  marker = false,
}: {
  group: string;
  date: Date;
  marker?: boolean;
}) {
  const parsedRoads = ROADS_PARSED.get(group);
  if (!parsedRoads) return null;
  return (
    <>
      {parsedRoads.edges.map((roadEdges, i) => {
        return roadEdges.map(({ start, end, time }, j) =>
          new Date(time) > date ? null : (
            <div key={`${i} ${j} ${start} ${end}`}>
              <Polyline
                pathOptions={{ color: date2color(time) }}
                positions={parsedRoads.nodes[i].slice(start, end)}
              />
            </div>
          )
        );
      })}
      {marker &&
        parsedRoads.points.map(
          ([name, position]: [string, [number, number]]) => {
            return (
              <div key={name}>
                <Marker position={position}>
                  <Popup>
                    <span>{name}</span>
                  </Popup>
                </Marker>
              </div>
            );
          }
        )}
    </>
  );
}

function index2color(i: number) {
  return ["red", "orange", "yellow", "green", "blue", "purple"][i % 6];
}

function date2color(time: string) {
  const date = new Date(time);
  if (date < new Date("1970-01-01")) return "red";
  if (date < new Date("1980-01-01")) return "orange";
  if (date < new Date("1990-01-01")) return "yellow";
  if (date < new Date("2000-01-01")) return "green";
  if (date < new Date("2010-01-01")) return "blue";
  if (date < new Date("2020-01-01")) return "navy";
  if (date < new Date("2030-01-01")) return "purple";
  return "cyan";
}
