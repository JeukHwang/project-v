/** @see https://leafletjs.com/examples/geojson/ */
/** @see https://react-leaflet.js.org/docs/api-components/ */
/** @see https://velog.io/@magpies1221/React-Leaflet-2 */
/** @see https://leafletjs.com/reference.html#path */
/** @see https://leaflet-extras.github.io/leaflet-providers/preview/ */

import { LeafletEvent, LeafletEventHandlerFn } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { GeoJSON, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import * as topojsonClient from "topojson-client";
import * as topojsonServer from "topojson-server";

// import election from "../../../data/2024_22_Elec.json";

import election from "../../../data/2020_21_Elec.json";
election.features.forEach((feature) => {
  const { SGG_Code, SGG_1, SGG_2, SGG_3 } = feature.properties;
  feature.properties = {
    SGG_Code: SGG_Code.toString(),
    SIDO_SGG: SGG_3,
    SIDO: SGG_1,
    SGG: SGG_3.replace(SGG_1 + " ", ""),
  };
});
// 21 "SGG_Code":2110601,"SGG_1":"서울","SGG_2":"서울특별시 동대문구갑","SGG_3":"서울 동대문갑"
// 22 "SGG_Code":"2413002","SIDO_SGG":"경기 군포","SIDO":"경기","SGG":"군포"
import * as fs from "fs";
import * as XLSX from "xlsx";
XLSX.set_fs(fs);

const position = [35.95, 128.25];
const CartoDB_DarkMatterNoLabels = {
  url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
  //   url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
};
// var Jawg_Light = L.tileLayer('https://tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
// 	attribution: '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// 	minZoom: 0,
// 	maxZoom: 22,
// 	accessToken: '<your accessToken>'
// });

// var CartoDB_PositronNoLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
// 	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
// 	subdomains: 'abcd',
// 	maxZoom: 20
// });
// var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
// 	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
// 	subdomains: 'abcd',
// 	maxZoom: 20
// });
type LatLng = {
  lat: number;
  lng: number;
};

interface Props {
  date: Date;
  group: string | null;
}

type Position = [lat: number, lng: number];

// https://gist.github.com/seyuf/ab9c980776e4c2cb350a2d1e70976517?permalink_comment_id=4804822

function area(ring: Position[]): number {
  let s = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    s += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return 0.5 * s;
}

function centroid(ring: Position[]): [Position, number] {
  if (ring.length === 1) {
    return ring[0];
  } else if (ring.length === 2) {
    return [(ring[0][0] + ring[1][0]) / 2, (ring[0][1] + ring[1][1]) / 2];
  }
  const c = [0, 0];
  for (let i = 0; i < ring.length - 1; i++) {
    c[0] +=
      (ring[i][0] + ring[i + 1][0]) *
      (ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]);
    c[1] +=
      (ring[i][1] + ring[i + 1][1]) *
      (ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]);
  }
  const a = area(ring);
  return [[c[0] / (a * 6), c[1] / (a * 6)], a];
}

function centroidMulti(coordinates: Position[][]): Position {
  return coordinates.map(centroid).reduce(
    (
      [p1, a1]: [Position, number],
      [p2, a2]: [Position, number]
    ): [Position, number] => {
      return [
        [
          (p1[0] * a1 + p2[0] * a2) / (a1 + a2),
          (p1[1] * a1 + p2[1] * a2) / (a1 + a2),
        ],
        a1 + a2,
      ];
    },
    [[0, 0], 0]
  )[0];
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
      {merged.map((data, i) => {
        const [lng, lat] = centroidMulti(
          data[0].coordinates.map((v) => v[0]) as Position[][]
        );
        return (
          <Marker
            key={data[1]}
            position={{
              lat,
              lng,
            }}
          >
            <Popup>
              <div>
                <p>선거구명: {data[1]}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
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
