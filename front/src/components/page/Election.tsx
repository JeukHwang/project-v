import { useState } from "react";

import OptionSelector from "../atom/OptionSelector";
import TimeSelector from "../atom/TimeSelector";
import ElectionMap from "../molecule/ElectionMap";
import { ViewType, viewTypes } from "../util/constant";
import { constant21 } from "../util/import";

const options = (viewTypes as unknown as ViewType[]).map((v) => ({
  value: v,
  label: v,
}));

export default function Election() {
  const [view, setView] = useState<ViewType>(viewTypes[0]);
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
        <ElectionMap view={view} date={date} />
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
            if (v !== null) setView(v as ViewType);
          }}
        />
      </div>
    </div>
  );
}
