import { useState } from "react";
// import ROADS from "../../../../data/highway/processed/etc.road.json";
import { ROADS_NAME } from "../../util/path/import";
import Checkbox from "../atom/CheckBox";
import LeafletMap from "../atom/LeafletMap";
import OptionSelector from "../atom/OptionSelector";
import TimeSelector from "../atom/TimeSelector";
import PathNode from "../molecule/PathNode";
import ViewNode from "../molecule/ViewNode";
import District from "../molecule/District";

const options = ["ALL", ...ROADS_NAME].map((v) => ({ value: v, label: v }));

export default function Highway() {
  const [view, setView] = useState<string>("ALL");
  const [date, setDate] = useState<Date>(new Date());

  const [showIC, setShowIC] = useState<boolean>(false);
  const [showJC, setShowJC] = useState<boolean>(true);
  const [showDistrict, setShowDistrict] = useState<boolean>(false);

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
          <ViewNode view={view} showIC={showIC} showJC={showJC} showDistrict={showDistrict}  />
          <PathNode />
          <District showDistrict={showDistrict} />
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
        <Checkbox checked={showIC} onChange={(v) => setShowIC(v)}>
          Show IC
        </Checkbox>
        <Checkbox checked={showJC} onChange={(v) => setShowJC(v)}>
          Show JC
        </Checkbox>
        {/* <Checkbox checked={showDistrict} onChange={(v) => setShowDistrict(v)}>
          Show District
        </Checkbox> */}
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
