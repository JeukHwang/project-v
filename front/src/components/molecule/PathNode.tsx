import { LatLngTuple } from "leaflet";
import { PropsWithChildren, useEffect, useState } from "react";
import { Marker, Polyline, Tooltip, useMapEvent } from "react-leaflet";
import { c2s } from "../util/geojson";
import { icon2marker } from "../util/marker";
import { findShortestPathWith1Road } from "../util/path/optimize";
import {
  NormalLineNode,
  NormalPointNode,
  PathNodes,
  RoadLineNode,
  RoadPointNode,
} from "../util/path/type";
import { o2t } from "../util/position";

const clickTypes = ["1", "2"];
type ClickTypes = (typeof clickTypes)[number];

export default function PathNode() {
  const [clickType, setClickType] = useState<ClickTypes | null>(null);
  const [startPoint, setStartPoint] = useState<LatLngTuple | null>(null);
  const [endPoint, setEndPoint] = useState<LatLngTuple | null>(null);
  const [path, setPath] = useState<PathNodes | null>(null);

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
    if (startPoint && endPoint) {
      //   findShortestPathWith1UniqueRoad;
      setPath(findShortestPathWith1Road(startPoint, endPoint));
    } else {
      setPath(null);
    }
  }, [startPoint, endPoint]);

  let pointCounter = 0;
  return (
    <>
      {startPoint && (
        <Point
          node={{ type: "point", point: startPoint, road: false }}
          icon="near_me"
          color={clickType === "1" ? "orange" : "orange"}
        />
      )}
      {endPoint && (
        <Point
          node={{ type: "point", point: endPoint, road: false }}
          icon="target"
          color={clickType === "2" ? "orange" : "red"}
        />
      )}
      {path &&
        path.nodes.map((p, i) => {
          if (i === 0) {
            const node = p as NormalPointNode;
            return (
              <Point
                key={c2s(node.point)}
                node={node}
                icon={"near_me"}
                color={clickType === "1" ? "orange" : "green"}
              >
                <br />
                Total Distance: {Math.floor(path.distance)}m
              </Point>
            );
          } else if (i === path.nodes.length - 1) {
            const node = p as NormalPointNode;
            return (
              <Point
                key={c2s(node.point)}
                node={node}
                icon={"target"}
                color={clickType === "2" ? "orange" : "green"}
              >
                <br />
                Total Distance: {Math.floor(path.distance)}m
              </Point>
            );
          }
          switch (p.type) {
            case "point": {
              pointCounter += 1;
              return (
                <Point
                  key={c2s(p.point)}
                  node={p}
                  icon={`counter_${Math.min(pointCounter, 9)}`}
                  color="green"
                />
              );
            }
            case "path":
              return (
                <Line
                  key={
                    c2s(p.pointFrom) +
                    c2s(p.pointTo) +
                    p.points.length.toString()
                  }
                  node={p}
                  color="green"
                />
              );
          }
        })}
    </>
  );
}

function Point({
  node,
  icon,
  color,
  children,
}: PropsWithChildren<{
  node: NormalPointNode | RoadPointNode;
  icon: string;
  color?: string;
}>) {
  return (
    <Marker position={node.point} icon={icon2marker({ name: icon, color })}>
      <Tooltip>
        Point: {c2s(node.point)}
        {node.road && (
          <>
            <br />
            Road: {node.roadName}
          </>
        )}
        {children}
      </Tooltip>
    </Marker>
  );
}

function Line({
  node,
  color = "black",
  children,
}: PropsWithChildren<{
  node: NormalLineNode | RoadLineNode;
  color?: string;
}>) {
  return (
    <Polyline positions={node.points} pathOptions={{ color }}>
      <Tooltip>
        PointFrom: {c2s(node.pointFrom)}
        <br />
        PointTo: {c2s(node.pointTo)}
        <br />
        Distance: {Math.floor(node.distance)}m
        {node.road && (
          <>
            <br />
            Road: {node.roadName}
          </>
        )}
        {children}
      </Tooltip>
    </Polyline>
  );
}
