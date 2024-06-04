import { LatLngTuple } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { Marker, Polyline, Tooltip, useMapEvent } from "react-leaflet";
import { randomColor } from "../../util/constant";
import { c2s } from "../../util/geojson";
import { icon2marker } from "../../util/marker";
import { IC, JC, ROADS_OBJ } from "../../util/path/import";
import { findNormalPathToClosestNode } from "../../util/path/node";
import { findClosestPoint } from "../../util/path/util";
import { o2t } from "../../util/position";

export default function ViewNode({ view }: { view: string }) {
  //   const [clicked, setClicked] = useState<boolean>(false);
  const [point, setPoint] = useState<LatLngTuple>();
  //   window.addEventListener("mousedown", () => setClicked(true));
  //   window.addEventListener("mouseup", () => setClicked(false));
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
  const roads = useMemo(
    () => (view === "ALL" ? ROADS_OBJ : { [view]: ROADS_OBJ[view] }),
    [view]
  );

  const [focusedRoadByTooltip, setFocusedRoadByTooltip] = useState<
    string | null
  >(null);
  const [node, setNode] = useState<{
    index: number;
    distance: number;
  } | null>();
  useEffect(() => {
    if (focusedRoadByTooltip === null) {
      // throttle
      const timer = setTimeout(() => {
        setNode(null);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      // throttle
      const timer = setTimeout(() => {
        setNode(findClosestPoint(roads[focusedRoadByTooltip], point));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [point, roads, focusedRoadByTooltip]);

  return Object.entries(roads).map(([k, v], i) => {
    return (
      <Polyline
        key={k}
        positions={v}
        pathOptions={{ color: randomColor(i), weight: 3 }}
        eventHandlers={{
          tooltipopen: () => setFocusedRoadByTooltip(k),
          tooltipclose: () => setFocusedRoadByTooltip(null),
        }}
      >
        <Tooltip sticky>
          {`Road : ${k}`}
          {node && (
            <>
              <br />
              {`Closest Node :${node.index}(${Math.floor(node.distance)}m)`}
            </>
          )}
        </Tooltip>
      </Polyline>
    );
  });
}

function ICJCNode({ view }: { view: string }) {
  const viewIC = IC.filter(
    ({ roadName }) => view === "ALL" || view === roadName
  );
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
