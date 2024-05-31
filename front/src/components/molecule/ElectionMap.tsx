import * as colorgrad from "colorgrad-js/bundler";
import { LeafletMouseEvent } from "leaflet";
import { useState } from "react";
import { Marker, Popup, Tooltip } from "react-leaflet";
import { Person } from "../../../../data/src/model/person";
import LeafletMap from "../atom/LeafletMap";
import { ATTR, randomColor, ViewType } from "../util/constant";
import { centroid, Position } from "../util/geojson";
import { geometry21, mergedGeometry21, person21 } from "../util/import";
import MapGeoJSON from "./MapGeoJSON";
const attr = ATTR.LeeJongho21;

interface Props {
  view: ViewType;
  date: Date;
}

interface SubProps {
  clicked?: LeafletMouseEvent | undefined;
  setClicked: (e: LeafletMouseEvent) => void;
  date: Date;
}

function 지역구_구분({ setClicked }: SubProps) {
  return (
    <>
      {Object.entries(mergedGeometry21).map(([group, data], i) => (
        <MapGeoJSON
          key={group}
          data={data}
          attr={attr}
          pathOptions={{ stroke: false, fillColor: randomColor(i) }}
          interactive={false}
        />
      ))}
      {geometry21.features.map((feature) => (
        <MapGeoJSON
          key={feature.properties.시도_선거구명}
          data={feature}
          attr={attr}
          pathOptions={{
            color: "gray",
            weight: 1,
            fill: true,
            fillColor: "transparent",
          }}
          onClick={(e) => {
            setClicked(e);
          }}
        />
      ))}
      {Object.entries(mergedGeometry21).map(([group, data]) => (
        <MapGeoJSON
          key={group}
          data={data}
          attr={attr}
          pathOptions={{ color: "black", weight: 1, fill: false }}
          interactive={false}
        />
      ))}
      {Object.entries(mergedGeometry21).map(([group, data]) => {
        const exterior = data.coordinates.map((v) => v[0]) as Position[][];
        const [lng, lat] = centroid(exterior);
        return (
          <Marker
            key={group}
            position={{ lat, lng }}
            eventHandlers={{
              mouseover: (event) => event.target.openPopup(),
              mouseout: (event) => event.target.closePopup(),
            }}
          >
            <Popup autoPan autoClose>
              <p>선거구명: {group}</p>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

/** @see https://mazznoer.github.io/colorgrad-js/ */
const age2color = colorgrad.customGradient(
  ["green", "red", "red", "black"],
  [40, 80, 100, 101],
  "oklab",
  "catmull-rom"
);

const per2color = colorgrad.customGradient(
  ["black", "green"],
  [0, 100],
  "oklab",
  "catmull-rom"
);

const district2person = (district: string, date: Date): Person | null => {
  return (
    person21.find((p) => p.의원활동at(date)?.시도_선거구명 === district) || null
  );
};

const district2age = (district: string, date: Date) => {
  const person = district2person(district, date);
  return person
    ? date.getFullYear() - person.개인정보.생년월일.날짜.getFullYear()
    : Infinity;
};

function 당선자_나이({ setClicked, date }: SubProps) {
  return (
    <>
      {geometry21.features.map((feature) => (
        <MapGeoJSON
          key={feature.properties.시도_선거구명}
          data={feature}
          attr={attr}
          pathOptions={{
            color: "gray",
            weight: 1,
            fill: true,
            fillColor: age2color
              .at(district2age(feature.properties.시도_선거구명, date))
              .rgbString(),
            fillOpacity: 0.8,
          }}
          onClick={(e) => {
            setClicked(e);
          }}
        >
          {district2age(feature.properties.시도_선거구명, date) !==
            Infinity && (
            <Tooltip sticky>
              {district2age(feature.properties.시도_선거구명, date)}
            </Tooltip>
          )}
        </MapGeoJSON>
      ))}
    </>
  );
}

import 지역별_투표율_json from "../../../../back/src/지역별 투표율.json";
const 지역별_투표율 = Object.fromEntries(
  지역별_투표율_json.map((v) => [v.시도_선거구명, v])
);

const [min투표율, max투표율] = [
  Math.min(...Object.values(지역별_투표율).map((v) => v.투표수 / v.선거인수)),
  Math.max(...Object.values(지역별_투표율).map((v) => v.투표수 / v.선거인수)),
];

function 투표율({ setClicked }: SubProps) {
  return (
    <>
      {geometry21.features.map((feature) => {
        const district = feature.properties.시도_선거구명;
        const data = 지역별_투표율[district];
        const 투표율 = data.투표수 / data.선거인수;
        const 상대_투표율 =
          ((투표율 - min투표율) / (max투표율 - min투표율)) * 100;
        return (
          <MapGeoJSON
            key={feature.properties.시도_선거구명}
            data={feature}
            attr={attr}
            pathOptions={{
              color: "gray",
              weight: 1,
              fill: true,
              fillColor: per2color.at(상대_투표율 > 70 ? 100 : 0).rgbString(),
              fillOpacity: 0.8,
            }}
            onClick={(e) => {
              setClicked(e);
            }}
          >
            <Tooltip sticky>
              {district} {투표율 * 100}
            </Tooltip>
          </MapGeoJSON>
        );
      })}
    </>
  );
}

function CurrentMarker({ clicked, date }: SubProps) {
  const district = clicked?.sourceTarget.feature.properties.시도_선거구명;
  const person = district2person(district, date) ?? null;
  return (
    <>
      {clicked && (
        <Marker
          position={clicked.latlng}
          eventHandlers={{
            mouseover: (event) => event.target.openPopup(),
            mouseout: (event) => event.target.closePopup(),
          }}
        >
          <Popup>
            <p>{`위치: ${clicked.latlng.lat.toFixed(
              3
            )} ${clicked.latlng.lng.toFixed(3)}`}</p>
            <p>{`선거구명: ${district}`}</p>
            {person && <p>{`국회의원: ${person?.이름}`}</p>}
          </Popup>
        </Marker>
      )}
    </>
  );
}

export default function ElectionMap({ view, date }: Props) {
  const [clicked, setClicked] = useState<LeafletMouseEvent>();
  return (
    <LeafletMap>
      {view === "21대 지역구 구분" && (
        <지역구_구분 setClicked={setClicked} date={date} />
      )}
      {view === "21대 지역구 당선자 나이" && (
        <당선자_나이 setClicked={setClicked} date={date} />
      )}
      {view === "21대 투표율" && <투표율 setClicked={setClicked} date={date} />}
      <CurrentMarker clicked={clicked} setClicked={setClicked} date={date} />
    </LeafletMap>
  );
}

/**
 * @todo
 * 클릭한 지역구 highlight
 * hover는 tooltip
 * click은 popup
 */
