import Select from "react-select";

interface Props {
  options: { value: string; label: string }[];
  onChange: (v: string | null) => void;
}

export default function OptionSelector({ options, onChange }: Props) {
  return (
    <div style={{ color: "black", width: "320px", height: "fit-content" }}>
      <Select
        options={options}
        menuPlacement="auto"
        defaultValue={options[0]}
        onChange={(e) => {
          onChange(e ? e.value : null);
        }}
      />
    </div>
  );
}
