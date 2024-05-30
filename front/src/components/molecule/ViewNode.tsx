import { LatLngTuple } from "leaflet";
import { useState } from "react";
import { Marker, Polyline, Tooltip, useMapEvent } from "react-leaflet";
import { randomColor } from "../util/constant";
import { c2s } from "../util/geojson";
import { icon2marker } from "../util/marker";
import { IC, JC, ROADS_OBJ } from "../util/path/import";
import { findNormalPathToClosestNode } from "../util/path/node";
import { findClosestPoint } from "../util/path/util";
import { o2t } from "../util/position";

export default function ViewNode({ view }: { view: string }) {
  const [clicked, setClicked] = useState<boolean>(false);
  const [point, setPoint] = useState<LatLngTuple>();
  window.addEventListener("mousedown", () => setClicked(true));
  window.addEventListener("mouseup", () => setClicked(false));
  useMapEvent("mousemove", (e) => {
    setPoint(o2t(e.latlng));
  });
  return (
    <>
      {/* {clicked && <CursorNode point={point!} />} */}
      <RoadNode view={view} point={point!} />
      <ICJCNode view={view} />
    </>
  );
}

function CursorNode({ point }: { point: LatLngTuple }) {
  const node = findNormalPathToClosestNode(point, "ALL", true);
  return (
    <Marker position={point}>
      <Tooltip>
        Position : {c2s(point)}
        <br />
        Distance: {Math.floor(node.distance)}m
      </Tooltip>
    </Marker>
  );
}

function RoadNode({ view, point }: { view: string; point: LatLngTuple }) {
  const roads = view === "ALL" ? ROADS_OBJ : { [view]: ROADS_OBJ[view] };
  return (
    <>
      {/* @note 다 보여주고,  */}
      {Object.entries(roads).map(([k, v], i) => {
        const { index, distance } = point
          ? findClosestPoint(v, point)
          : { index: undefined, distance: 0 };
        return (
          <Polyline
            key={k}
            positions={v}
            pathOptions={{ color: randomColor(i), weight: 5 }}
          >
            <Tooltip>
              {k} : {point ? `${index} - ${Math.floor(distance)}m` : ``}
            </Tooltip>
          </Polyline>
        );
      })}
    </>
  );
}

function ICJCNode({ view }: { view: string }) {
  const viewIC = IC.filter(({ roadName }) => view === roadName);
  const viewJC = JC.filter(
    ({ point1, point2 }) =>
      view === "ALL" || view === point1.roadName || view === point2.roadName
  );
  return (
    <>
      {viewIC.map(({ rawPoint, point, placeName, roadName, index }) => (
        <Marker
          key={`${placeName}-${roadName}-${rawPoint[0]}-${rawPoint[1]}`}
          position={point}
          icon={icon2marker({ name: "exit_to_app" })}
        >
          <Tooltip>
            {`Position : ${c2s(point)}`}
            <br />
            {`Name : ${placeName}`}
            <br />
            {`Road : ${roadName}(${index})`}
          </Tooltip>
        </Marker>
      ))}
      {viewJC.map(({ rawPoint, midPoint, placeName, point1, point2 }) => (
        <Marker
          key={`${placeName}-${point1.roadName}-${point2.roadName}-${rawPoint[0]}-${rawPoint[1]}`}
          position={midPoint.point}
          icon={icon2marker({ name: "join" })}
        >
          <Tooltip>
            {`Position : ${c2s(midPoint.point)}`}
            <br />
            {`Name : ${placeName}`}
            <br />
            {`Road : ${point1.roadName}(${point1.index}) - ${point2.roadName}(${point2.index})`}
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}
