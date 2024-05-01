import { LeafletMouseEvent } from "leaflet";
import { useState } from "react";
import { Marker, Popup } from "react-leaflet";
import LeafletMap from "../atom/LeafletMap";
import { centroid, merge, Position } from "../util/geojson";
import { GeoMapProperties, IMPORT_DATA } from "../util/import";
import MapGeoJSON from "./MapGeoJSON";

function randomColor(i: number) {
  return `hsl(${(50 * i) % 360}, 100%, 50%)`;
}

const electionMap = IMPORT_DATA.MAP21;
export default function ElectionMap() {
  const [clicked, setClicked] = useState<LeafletMouseEvent>();
  const mergedFeatures: [GeoMapProperties, GeoJSON.MultiPolygon][] =
    Object.values(
      Object.groupBy(electionMap.data.features, (f) => f.properties.SIDO)
    ).map((v) => [v![0].properties, merge(v!)]);
  return (
    <LeafletMap>
      {mergedFeatures.map(([prop, feature], i) => (
        <MapGeoJSON
          key={prop.SGG_Code}
          data={feature}
          attr={electionMap.attribution}
          pathOptions={{ stroke: false, fillColor: randomColor(i) }}
          interactive={false}
        />
      ))}
      {electionMap.data.features.map((feature) => (
        <MapGeoJSON
          key={feature.properties.SGG_Code}
          data={feature}
          attr={electionMap.attribution}
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
      {mergedFeatures.map(([prop, feature]) => (
        <MapGeoJSON
          key={prop.SGG_Code}
          data={feature}
          attr={electionMap.attribution}
          pathOptions={{ color: "black", weight: 1, fill: false }}
          interactive={false}
        />
      ))}
      {mergedFeatures.map(([prop, feature]) => {
        // const exterior = feature.coordinates.map((v) => v[0]);
        // const [lat, lng] = centroid(exterior as Position[][]);
        const [lng, lat] = centroid(
          feature.coordinates.map((v) => v[0]) as Position[][]
        );
        return (
          <Marker
            key={prop.SGG_Code}
            position={{ lat, lng }}
            eventHandlers={{
              mouseover: (event) => event.target.openPopup(),
              mouseout: (event) => event.target.closePopup(),
            }}
          >
            <Popup autoPan autoClose>
              <p>선거구명: {prop.SIDO}</p>
            </Popup>
          </Marker>
        );
      })}
      {clicked && (
        <Marker
          position={clicked.latlng}
          eventHandlers={{
            mouseover: (event) => event.target.openPopup(),
            mouseout: (event) => event.target.closePopup(),
          }}
        >
          <Popup>
            <p>위도: {clicked.latlng.lat}</p>
            <p>경도: {clicked.latlng.lng}</p>
            <p>선거구명: {clicked.sourceTarget.feature.properties.SIDO_SGG}</p>
            <p>{JSON.stringify(clicked.sourceTarget.feature.properties)}</p>
          </Popup>
        </Marker>
      )}
    </LeafletMap>
  );
}
