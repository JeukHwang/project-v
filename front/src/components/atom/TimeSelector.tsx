interface Props {
  min: Date;
  max: Date;
  value: Date;
  onChange: (v: Date) => void;
}

function subtract(max: Date, min: Date) {
  return (
    ((max as unknown as number) - (min as unknown as number)) /
    (24 * 60 * 60 * 1000)
  );
}

export default function TimeSelector({ min, max, value, onChange }: Props) {
  const step = subtract(max, min);
  return (
    <div
      style={{
        height: "40px",
        padding: "4px 8px",
        margin: "4px 0px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: "hsl(0, 0%, 100%)",
        borderColor: "hsl(0, 0%, 80%)",
        borderRadius: "4px",
        borderStyle: "solid",
        borderWidth: "1px",
      }}
    >
      <p style={{ whiteSpace: "nowrap" }}>{value.toLocaleDateString()}</p>
      <input
        style={{ width: "0", flexGrow: 1 }}
        type="range"
        min="0"
        max={step}
        value={subtract(value, min)}
        onChange={(e) => {
          const number = parseInt(e.target.value, 10);
          const date = new Date(min.getTime() + number * 24 * 60 * 60 * 1000);
          onChange(date);
        }}
      />
    </div>
  );
}
