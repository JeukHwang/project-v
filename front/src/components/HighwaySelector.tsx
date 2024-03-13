import Select from "react-select";
import { GROUPS_DATA } from "../../../data/processed";

const options = GROUPS_DATA.filter((group) => group.includes("도로")).map(
  (group) => {
    return { value: group, label: group };
  }
);

interface Props {
  onChange: (v: string | null) => void;
}

export default function HighwaySelector({ onChange }: Props) {
  return (
    <div style={{ color: "black", width: "320px", height: "fit-content" }}>
      <Select
        options={options}
        menuPlacement="auto"
        onChange={(e) => {
          onChange(e ? e.value : null);
        }}
      />
    </div>
  );
}
