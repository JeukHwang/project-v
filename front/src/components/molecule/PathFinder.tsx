import { LatLngTuple } from "leaflet";
import { useEffect, useState } from "react";
import { Marker, Polyline, Tooltip, useMapEvent } from "react-leaflet";
import { c2s } from "../util/geojson";
import {
  findClosestNode,
  HighwayNode,
  o2t,
  ROADS,
} from "../util/import.highway";
import { icon2marker } from "../util/marker";

const clickTypes = ["1", "2"];
type ClickTypes = (typeof clickTypes)[number];

export function PathFinder() {
  const [startPoint, setStartPoint] = useState<LatLngTuple | null>(null);
  const [endPoint, setEndPoint] = useState<LatLngTuple | null>(null);
  const [path, setPath] = useState<{ [key in string]: HighwayNode }>();
  const [clickType, setClickType] = useState<ClickTypes | null>(null);

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "1":
        case "2":
          setClickType(e.key as ClickTypes);
          break;
        case "Escape":
          setStartPoint(null);
          setEndPoint(null);
          break;
        default:
          setClickType(null);
      }
    });
  });
  useMapEvent("click", (e) => {
    switch (clickType) {
      case "1":
        setStartPoint(o2t(e.latlng));
        break;
      case "2":
        setEndPoint(o2t(e.latlng));
        break;
    }
  });

  useEffect(() => {
    if (!startPoint || !endPoint) return;
    const closestNodeFromStart = findClosestNode(startPoint);
    const closestNodeFromEnd = findClosestNode(endPoint);
    setPath({ counter_2: closestNodeFromStart, counter_3: closestNodeFromEnd });
  }, [startPoint, endPoint]);

  return (
    startPoint &&
    endPoint &&
    path && (
      <>
        <Marker
          position={startPoint}
          icon={icon2marker({
            name: "counter_1",
            color: clickType === "1" ? "red" : "black",
          })}
        >
          <Tooltip>
            Current Position
            <br />
            Position: {c2s(startPoint)}
            <br />
            Distance: {0}m
          </Tooltip>
        </Marker>
        {Object.entries(path).map(([name, { point, roadName, index }]) => (
          <Marker key={name} position={point} icon={icon2marker({ name })}>
            <Tooltip>
              Current Position
              <br />
              Position: {c2s(point)} / {roadName}
              {"["}
              {index}
              {"]"}
              <br />
              Distance: {"?"}m
            </Tooltip>
          </Marker>
        ))}
        <Marker
          position={endPoint}
          icon={icon2marker({
            name: "counter_9",
            color: clickType === "2" ? "red" : "black",
          })}
        >
          <Tooltip>
            Current Position
            <br />
            Position: {c2s(endPoint)}
            <br />
            Distance: {"?"}m
          </Tooltip>
        </Marker>
        <Polyline positions={[startPoint, path.counter_2.point]}></Polyline>
        <Polyline
          positions={getPathBetweenNodes(path.counter_2, path.counter_3)}
        ></Polyline>
        <Polyline positions={[path.counter_3.point, endPoint]}></Polyline>
      </>
    )
  );
}

function getPathBetweenNodes(
  node1: HighwayNode,
  node2: HighwayNode
): LatLngTuple[] {
  console.assert(
    node1.roadName === node2.roadName,
    "getPathBetweenNodes needs same roadName"
  );
  const roadName = node1.roadName;
  const [i, j] = [node1.index, node2.index];
  if (i <= j) {
    return ROADS[roadName].slice(i, j);
  } else {
    return ROADS[roadName].slice(j, i);
  }
}
