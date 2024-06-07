import { useState } from "react";
// import ROADS from "../../../../data/highway/processed/etc.road.json";
import { ROADS_NAME } from "../../util/path/import";
import LeafletMap from "../atom/LeafletMap";
import OptionSelector from "../atom/OptionSelector";
import TimeSelector from "../atom/TimeSelector";
import PathNode from "../molecule/PathNode";
import ViewNode from "../molecule/ViewNode";
// import District from "../molecule/District";

const options = ["ALL", ...ROADS_NAME].map((v) => ({ value: v, label: v }));

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
          <ViewNode view={view} />
          <PathNode />
          {/* <District /> */}
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
          min={new Date(1968, 1, 1)}
          max={new Date()}
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
