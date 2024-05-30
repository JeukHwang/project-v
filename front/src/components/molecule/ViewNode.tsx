import { LatLngTuple } from "leaflet";
import { useState } from "react";
import { Marker, Polyline, Tooltip, useMapEvent } from "react-leaflet";
import { randomColor } from "../util/constant";
import { c2s } from "../util/geojson";
import { icon2marker } from "../util/marker";
import { INTESECTIONS_OBJ, ROADS_OBJ } from "../util/path/import";
import { findNormalPathToClosestNode } from "../util/path/node";
import { INTESECTIONS_OBJ_TYPE, ROADS_OBJ_TYPE } from "../util/path/type";
import { findClosestPoint } from "../util/path/util";
import { o2t } from "../util/position";

export default function ViewNode({ view }: { view: string }) {
  const ROADS = view === "ALL" ? ROADS_OBJ : { [view]: ROADS_OBJ[view] };
  const INTESECTIONS =
    view === "ALL"
      ? INTESECTIONS_OBJ
      : INTESECTIONS_OBJ.filter(
          ({ point1, point2 }) =>
            point1.roadName === view || point2.roadName === view
        );

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
      <RoadNode point={point!} roads={ROADS} />
      <IntersectionNode intersections={INTESECTIONS} />
      <ICJCNode />
    </>
  );
}

function CursorNode({ point }: { point: LatLngTuple }) {
  const node = findNormalPathToClosestNode(point, "ALL", true);
  return (
    <Marker position={point}>
      <Tooltip sticky>
        Position : {c2s(point)}
        <br />
        Distance: {Math.floor(node.distance)}m
      </Tooltip>
    </Marker>
  );
}

function RoadNode({
  point,
  roads,
}: {
  point: LatLngTuple;
  roads: ROADS_OBJ_TYPE;
}) {
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
            <Tooltip sticky>
              {k} : {point ? `${index} - ${Math.floor(distance)}m` : ``}
            </Tooltip>
          </Polyline>
        );
      })}
    </>
  );
}

function ICJCNode() {
  return (
    <>
      {/* {JC.map(({ name, point, type }) => (
        <Marker
          key={JSON.stringify(point)}
          position={point}
          //   icon={icon2marker({ name: type === "IC" ? "join_left" : "join" })}
        >
          <Tooltip sticky>
            Name: {name}
            <br />
            Type: {type} <br />
            Position : {c2s(point)}
          </Tooltip>
        </Marker>
      ))} */}
      {INTESECTIONS_OBJ.map(({ point1, point2, midPoint, name }) => (
        <div key={`${name} ${point1.roadName}-${point2.roadName}`}>
          <Marker
            key={JSON.stringify(midPoint.point)}
            position={midPoint.point}
            icon={icon2marker({ name: "join" })}
          >
            <Tooltip sticky>
              Name: {name}
              <br />
              Position : {c2s(midPoint.point)}
              <br />
              {point1.roadName} : {point1.index}
              <br />
              {point2.roadName} : {point2.index}
            </Tooltip>
          </Marker>
          {/* <Polyline
            key={JSON.stringify(point.point)}
            positions={[point1.point, point.point, point2.point]}
            pathOptions={{ color: "black", weight: 5 }}
          >
            <Tooltip sticky>
              Position : {c2s(point.point)}
              <br />
              {point1.roadName} : {point1.index}
              <br />
              {point2.roadName} : {point2.index}
            </Tooltip>
          </Polyline> */}
        </div>
      ))}
    </>
  );
}

function IntersectionNode({
  intersections,
}: {
  intersections: INTESECTIONS_OBJ_TYPE;
}) {
  return (
    <>
      {intersections.map(({ point1, point2, midPoint }) => (
        <Marker
          key={JSON.stringify(midPoint.point)}
          position={midPoint.point}
          icon={icon2marker({ name: "join" })}
        >
          <Tooltip sticky>
            Position : {c2s(midPoint.point)}
            <br />
            {point1.roadName} : {point1.index}
            <br />
            {point2.roadName} : {point2.index}
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}
