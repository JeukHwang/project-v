import { LatLngTuple } from "leaflet";
import { useEffect, useState } from "react";
import { useMapEvent } from "react-leaflet";
import { ICNode, PlaceName, PathNode as PN } from "../../core/node/type";
import { PointUtil } from "../../core/node/util";
import { addFromToEdge, dijkstra } from "../../core/traversal/edge";
import { o2t } from "../../util/position";

const clickTypes = ["1", "2"];
type ClickTypes = (typeof clickTypes)[number];

export default function PathNode() {
  const [clickType, setClickType] = useState<ClickTypes | null>(null);
  const [startPoint, setStartPoint] = useState<LatLngTuple | null>(null);
  const [endPoint, setEndPoint] = useState<LatLngTuple | null>(null);
  const [path, setPath] = useState<PN[] | null>(null);

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
      const from = PointUtil.closestRoadPoint(startPoint, null);
      const fromNode: ICNode = {
        ...from,
        rawPosition: from.position,
        pointType: "IC",
        placeName: "FROM" as PlaceName,
      };
      const to = PointUtil.closestRoadPoint(endPoint, null);
      const toNode: ICNode = {
        ...to,
        rawPosition: to.position,
        pointType: "IC",
        placeName: "TO" as PlaceName,
      };
      const modifiedEdge = addFromToEdge(fromNode, toNode);
      dijkstra(modifiedEdge, fromNode, toNode);
      setPath(null);
      //   setPath(findShortestPathWithRoad(startPoint, endPoint));
    } else {
      setPath(null);
    }
  }, [startPoint, endPoint]);

  const pointCounter = 0;
  return;
  //   return (
  //     <>
  //       {startPoint && (
  //         <Point
  //           node={{ type: "point", position: startPoint, road: false }}
  //           icon="near_me"
  //           color={clickType === "1" ? "orange" : "orange"}
  //         />
  //       )}
  //       {endPoint && (
  //         <Point
  //           node={{ type: "point", position: endPoint, road: false }}
  //           icon="target"
  //           color={clickType === "2" ? "orange" : "red"}
  //         />
  //       )}
  //       {path &&
  //         path.nodes.map((p, i) => {
  //           if (i === 0) {
  //             const node = p as PointNode;
  //             return (
  //               <Point
  //                 key={c2s(node.position)}
  //                 node={node}
  //                 icon={"near_me"}
  //                 color={clickType === "1" ? "orange" : "green"}
  //               >
  //                 <br />
  //                 Total Distance: {Math.floor(path.distance)}m
  //               </Point>
  //             );
  //           } else if (i === path.nodes.length - 1) {
  //             const node = p as PointNode;
  //             return (
  //               <Point
  //                 key={c2s(node.position)}
  //                 node={node}
  //                 icon={"target"}
  //                 color={clickType === "2" ? "orange" : "green"}
  //               >
  //                 <br />
  //                 Total Distance: {Math.floor(path.distance)}m
  //               </Point>
  //             );
  //           }
  //           switch (p.type) {
  //             case "point": {
  //               pointCounter += 1;
  //               return (
  //                 <Point
  //                   key={c2s(p.point)}
  //                   node={p}
  //                   icon={`counter_${Math.min(pointCounter, 9)}`}
  //                   color="green"
  //                 />
  //               );
  //             }
  //             case "path":
  //               return (
  //                 <Line
  //                   key={
  //                     c2s(p.pointFrom) +
  //                     c2s(p.pointTo) +
  //                     p.points.length.toString()
  //                   }
  //                   node={p}
  //                   color="green"
  //                 />
  //               );
  //           }
  //         })}
  //     </>
  //   );
}

// function Point({
//   node,
//   icon,
//   color,
//   children,
// }: PropsWithChildren<{
//   node: PointNode | RoadPointNode;
//   icon: string;
//   color?: string;
// }>) {
//   return (
//     <Marker position={node.position} icon={icon2marker({ name: icon, color })}>
//       <Tooltip>
//         Point: {c2s(node.position)}
//         {node.road && (
//           <>
//             <br />
//             Road: {node.roadName}
//           </>
//         )}
//         {children}
//       </Tooltip>
//     </Marker>
//   );
// }

// function Line({
//   node,
//   color = "black",
//   children,
// }: PropsWithChildren<{
//   node: LineNode | RoadLineNode;
//   color?: string;
// }>) {
//   return (
//     <Polyline positions={node.positions} pathOptions={{ color }}>
//       <Tooltip>
//         PointFrom: {c2s(node.fromNode.position)}
//         <br />
//         PointTo: {c2s(node.toNode.position)}
//         <br />
//         Distance: {Math.floor(LineUtil.length(node))}m
//         {node. && (
//           <>
//             <br />
//             Road: {node.}
//           </>
//         )}
//         {children}
//       </Tooltip>
//     </Polyline>
//   );
// }
