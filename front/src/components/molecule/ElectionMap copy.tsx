import { LeafletEvent, LeafletEventHandlerFn } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { GeoJSON, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import * as topojsonClient from "topojson-client";
import * as topojsonServer from "topojson-server";

// import election from "../../../data/2024_22_Elec.json";

import election from "../../../../data/2020_21_Elec.json";
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
