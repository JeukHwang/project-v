// import "./App.css";
import { useState } from "react";
import ElectionMap from "./components/ElectionMap";
import HighwaySelector from "./components/HighwaySelector";
import TimeSelector from "./components/TimeSelector";

function Election() {
  const [group, setGroup] = useState<string | null>(null);
  const min = new Date("1968-01-01");
  const max = new Date("2025-01-01");
  const [time, setTime] = useState<Date>(min);
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
        <ElectionMap date={time} group={group} />
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
        <HighwaySelector onChange={setGroup} />
      </div>

      {/* <div
        style={{
          position: "absolute",
          left: "0px",
          bottom: "100px",
          zIndex: 800,
          width: "1000px",
          height: "fit-content",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <TimeSelector min={min} max={max} value={time} onChange={setTime} />
        <p style={{ color: "white" }}>
          {min.toLocaleDateString()} ~ {time.toLocaleDateString()}
        </p>
      </div> */}
    </div>
  );
}

export default Election;
