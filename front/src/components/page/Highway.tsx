import { useState } from "react";
// import ROADS from "../../../../data/highway/processed/etc.road.json";
import LeafletMap from "../atom/LeafletMap";
import OptionSelector from "../atom/OptionSelector";
import TimeSelector from "../atom/TimeSelector";
import PathNode from "../molecule/PathNode";
import ViewNode from "../molecule/ViewNode";
import { constant21 } from "../util/import";
import { ROADS_NAME } from "../util/import.highway";

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
          min={constant21.임기.시작}
          max={constant21.임기.끝}
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
