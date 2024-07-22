import { LatLngTuple } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { Polyline, Tooltip, useMapEvent } from "react-leaflet";
import { ROAD } from "../../core/road/import";
import { RoadName } from "../../core/road/type";
import { findClosestPoint } from "../../core/util";
import { randomColor } from "../../util/constant";
import { o2t } from "../../util/position";

export default function ViewNode({
  view,
  showIC,
  showJC,
}: {
  view: string;
  showIC: boolean;
  showJC: boolean;
  showDistrict: boolean;
}) {
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
      {/* <ICJCNode view={view} showIC={showIC} showJC={showJC} /> */}
      {/* {ICJC_CANDIDATE.map(({ name, point }) => (
        <Marker position={point} key={name}>
          <Popup>
            {name} {point}
          </Popup>
        </Marker>
      ))} */}
    </>
  );
}

function CursorNode({ point }: { point: LatLngTuple }) {
  return null;
  //   const node = findNormalPathToClosestNode(point, "ALL", true);
  //   return (
  //     <Marker position={point}>
  //       <Tooltip>
  //         Position : {c2s(point)}
  //         <br />
  //         Distance: {Math.floor(node.distance)}m
  //       </Tooltip>
  //     </Marker>
  //   );
}

function RoadNode({ view, point }: { view: string; point: LatLngTuple }) {
  const roads = useMemo(
    () =>
      view === "ALL"
        ? ROAD.geometry
        : { [view]: ROAD.geometry[view as RoadName] },
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
        setNode(
          findClosestPoint(roads[focusedRoadByTooltip as RoadName], point)
        );
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

// function ICJCNode({
//   view,
//   showIC,
//   showJC,
// }: {
//   view: string;
//   showIC: boolean;
//   showJC: boolean;
// }) {
//   const viewIC = IC.filter(
//     ({ roadName }) => view === "ALL" || view === roadName
//   );
//   const viewJC = JC.filter(
//     ({ point1, point2 }) =>
//       view === "ALL" || view === point1.roadName || view === point2.roadName
//   );
//   return (
//     <>
//       {showIC &&
//         viewIC.map(
//           ({
//             rawPosition: rawPoint,
//             position: point,
//             placeName,
//             roadName,
//             index,
//           }) => (
//             <Marker
//               key={`${placeName}-${roadName}-${rawPoint[0]}-${rawPoint[1]}`}
//               position={point}
//               icon={icon2marker({ name: "exit_to_app" })}
//             >
//               <Popup>
//                 {`Position : ${c2s(point)}`}
//                 <br />
//                 {`Name : ${placeName}`}
//                 <br />
//                 {`Road : ${roadName}(${index})`}
//               </Popup>
//             </Marker>
//           )
//         )}
//       {showJC &&
//         viewJC.map(
//           ({ rawPosition: rawPoint, midPoint, placeName, point1, point2 }) => (
//             <Marker
//               key={`${placeName}-${point1.roadName}-${point2.roadName}-${rawPoint[0]}-${rawPoint[1]}`}
//               position={midPoint.point}
//               icon={icon2marker({ name: "join" })}
//             >
//               <Popup>
//                 {`Position : ${c2s(midPoint.point)}`}
//                 <br />
//                 {`Name : ${placeName}`}
//                 <br />
//                 {`Road : ${point1.roadName}(${point1.index}) - ${point2.roadName}(${point2.index})`}
//               </Popup>
//             </Marker>
//           )
//         )}
//     </>
//   );
// }
