/** @see https://leafletjs.com/examples/geojson/ */
/** @see https://react-leaflet.js.org/docs/api-components/ */
/** @see https://velog.io/@magpies1221/React-Leaflet-2 */
/** @see https://leafletjs.com/reference.html#path */

import { LeafletEvent, LeafletEventHandlerFn } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { GeoJSON, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import * as topojsonClient from "topojson-client";
import * as topojsonServer from "topojson-server";

import election from "../../../data/2024_22_Elec.json";

const position = [35.95, 128.25];
const CartoDB_DarkMatterNoLabels = {
  url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

type LatLng = {
  lat: number;
  lng: number;
};

interface Props {
  date: Date;
  group: string | null;
}
export default function ElectionMap({ date, group }: Props) {
  const [clicked, setClicked] = useState<LeafletEvent | null>(null);

  const SIDO = new Set(
    election.features.map((feature: any) => feature.properties.SIDO)
  );
  const merged: [GeoJSON.MultiPolygon, string][] = [...SIDO].map((sido) => {
    const features = election.features.filter(
      (feature: any) => feature.properties.SIDO === sido
    );
    const topology = topojsonServer.topology({
      geojson: { type: "FeatureCollection", features },
    });
    return [
      topojsonClient.merge(topology, topology.objects.geojson.geometries),
      sido,
    ];
  });

  //   const topology = topojsonServer.topology({ election });
  //   const merged = topojsonClient.merge(
  //     topology,
  //     topology.objects.election.geometries
  //   );

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
      {election.features.map((feature: any, i: number) => (
        <GeoJSON
          key={feature.properties.SGG_Code}
          attribution={
            "<a href=https://github.com/OhmyNews/2024_22_elec_map>LeeJongho Report in OhMyNews</a>"
          }
          eventHandlers={{
            click: ((e) => {
              setClicked(e);
            }) as LeafletEventHandlerFn,
          }}
          data={feature}
          pathOptions={{
            color: "gray",
            weight: 1,
            stroke: true,
            fillColor: "transparent",
            fill: true,
          }}
        />
      ))}
      {merged.map((data, i) => (
        <GeoJSON
          key={data[1]}
          attribution={
            "<a href=https://github.com/OhmyNews/2024_22_elec_map>LeeJongho Report in OhMyNews</a>"
          }
          data={data[0]}
          pathOptions={{
            weight: 1,
            color: "white",
            stroke: true,
            fillColor: index2color(i),
            fill: true,
          }}
          interactive={false}
        />
      ))}
      {clicked && (
        <Marker position={clicked.latlng}>
          <Popup>
            <div>
              <p>위도: {clicked.latlng.lat}</p>
              <p>경도: {clicked.latlng.lng}</p>
              <p>
                선거구명: {clicked.sourceTarget.feature.properties.SIDO_SGG}
              </p>
              <p>{JSON.stringify(clicked.sourceTarget.feature.properties)}</p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
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
