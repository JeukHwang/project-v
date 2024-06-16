import { useState } from "react";
// import ROADS from "../../../../data/highway/processed/etc.road.json";
import { constant21 } from "../../util/import";
import { ROADS_NAME } from "../../util/highway.legacy";
import OptionSelector from "../atom/OptionSelector";
import TimeSelector from "../atom/TimeSelector";
import HighwayMapLegacy from "../molecule/HighwayMapLegacy";

const options = ["ALL", ...ROADS_NAME].map((v) => ({ value: v, label: v }));

export default function HighwayLegacy() {
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
        <HighwayMapLegacy date={date} group={view} />
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
          min={new Date(1950, 1, 1)}
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
