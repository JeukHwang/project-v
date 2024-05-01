import { useState } from "react";
import OptionSelector from "../atom/OptionSelector";
import ElectionMap from "../molecule/ElectionMap";

const options = [
  "21대 지역구 구분",
  "21대 지역구 당선자 소속 정당",
  "21대 지역구 매니페스토",
  "21대 재보궐",
].map((v) => ({ value: v, label: v }));

export default function Election() {
  const [group, setGroup] = useState<string | null>(null);
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
        <ElectionMap />
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
        <OptionSelector options={options} onChange={setGroup} />
      </div>
    </div>
  );
}
