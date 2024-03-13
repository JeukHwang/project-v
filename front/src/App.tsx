// import "./App.css";
import { useState } from "react";
import HighwaySelector from "./components/HighwaySelector";
import Map from "./components/Map";

function App() {
  const [group, setGroup] = useState<string | null>(null);
  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          zIndex: -1,
        }}
      >
        <Map group={group} />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
        }}
      >
        <HighwaySelector onChange={setGroup} />
      </div>
    </>
  );
}

export default App;
