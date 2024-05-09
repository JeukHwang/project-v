import { LatLngTuple } from "leaflet";
import { useState } from "react";
import { Marker, Polyline, Tooltip, useMapEvent } from "react-leaflet";
// import ROADS from "../../../../data/highway/processed/etc.road.json";
import SEOUL from "../../../../back/data/highway/processed/seoul.shp.convert.json";
import LeafletMap from "../atom/LeafletMap";
import OptionSelector from "../atom/OptionSelector";
import TimeSelector from "../atom/TimeSelector";
import { PathFinder } from "../molecule/PathFinder";
import { randomColor } from "../util/constant";
import { c2s } from "../util/geojson";
import { constant21 } from "../util/import";
import {
  findClosestPoint,
  INTESECTIONS,
  ROADS,
  ROADS_NAME,
} from "../util/import.highway";
import { icon2marker } from "../util/marker";

const ROADNAMES_WITH_ALL = ["ALL", ...ROADS_NAME];

const options = ROADNAMES_WITH_ALL.map((v) => ({
  value: v,
  label: v,
}));

function ClosestNode() {
  // Find closest node in ROADS and make it as marker
  const [current, setCurrent] = useState<LatLngTuple>();
  const [closest, setClosest] = useState<ReturnType<typeof findClosestPoint>>();
  useMapEvent("click", (e) => {
    const { lat, lng } = e.latlng;
    setCurrent([lat, lng]);
    const closest = findClosestPoint(Object.values(ROADS).flat(), [lat, lng]);
    setClosest(closest);
  });
  if (!current || !closest) return null;
  return (
    <>
      <Marker position={current} icon={icon2marker({ name: "person" })}>
        <Tooltip>
          Current Position
          <br />
          Position: {c2s(current)}
          <br />
          Distance: {Math.floor(closest.distance)}m
        </Tooltip>
      </Marker>
      <Polyline
        positions={[current, closest.point]}
        pathOptions={{ color: "black" }}
      />
      <Marker position={closest.point} icon={icon2marker({ name: "near_me" })}>
        <Tooltip>
          Closest Node
          <br />
          Position: {c2s(closest.point)}
          <br />
          Distance: {Math.floor(closest.distance)}m
        </Tooltip>
      </Marker>
    </>
  );
}

export default function Highway() {
  const [view, setView] = useState<string>("ALL");
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100vw",
          height: "100vh",
          position: "absolute",
        }}
      >
        <LeafletMap>
          {(
            (view === "ALL"
              ? Object.entries<LatLngTuple[]>(ROADS)
              : [[view, ROADS[view]]]) as [string, LatLngTuple[]][]
          ).map(([k, v], i) => {
            return (
              <Polyline
                key={k}
                positions={v}
                pathOptions={{ color: randomColor(i), weight: 5 }}
              >
                <Tooltip sticky>{k}</Tooltip>
              </Polyline>
            );
          })}
          {INTESECTIONS.map(({ road1, road2, position }) => (
            <Marker
              key={JSON.stringify([road1.name, road2.name, position])}
              position={position}
              icon={icon2marker({ name: "join" })}
            >
              <Tooltip>
                {road1.name} {road1.index}
                <br />
                {road2.name} {road2.index}
              </Tooltip>
            </Marker>
          ))}
          <ClosestNode />
          <PathFinder />
          {(
            SEOUL as GeoJSON.FeatureCollection<GeoJSON.Polygon, object>
          ).features.map((f) => (
            <Polyline
              key={JSON.stringify(f)}
              positions={f.geometry.coordinates as unknown as LatLngTuple[]}
              pathOptions={{ color: "black", weight: 2 }}
            />
          ))}
          {/* <GeoJSON
            data={SEOUL as GeoJSON.FeatureCollection}
            pathOptions={{ fill: true, fillColor: "black" }}
          /> */}
        </LeafletMap>
      </div>
      <div
        style={{
          position: "absolute",
          left: "20px",
          bottom: "20px",
          zIndex: 800,
          width: "fit-content",
          height: "fit-content",
        }}
      >
        <TimeSelector
          min={constant21.임기.시작}
          max={constant21.임기.끝}
          value={date}
          onChange={setDate}
        />

        <OptionSelector
          options={options}
          onChange={(v) => {
            if (v !== null) setView(v);
          }}
        />
      </div>
    </div>
  );
}
