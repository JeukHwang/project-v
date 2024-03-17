// export default function TimeSelector() {
//   return (
//     <ReactSlider
//       className="horizontal-slider"
//       thumbClassName="example-thumb"
//       trackClassName="example-track"
//       onBeforeChange={(value, index) =>
//         console.log(`onBeforeChange: ${JSON.stringify({ value, index })}`)
//       }
//       onChange={(value, index) =>
//         console.log(`onChange: ${JSON.stringify({ value, index })}`)
//       }
//       onAfterChange={(value, index) =>
//         console.log(`onAfterChange: ${JSON.stringify({ value, index })}`)
//       }
//       renderThumb={(props, state) => (
//         <div style={{ background: "red" }}>{state.valueNow}</div>
//       )}
//     />
//   );
// }

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
    <input
      type="range"
      min="0"
      max={step}
      value={subtract(value, min)}
      onChange={(e) => {
        const number = parseInt(e.target.value, 10);
        const date = new Date(min.getTime() + number * 24 * 60 * 60 * 1000);
        onChange(date);
      }}
      style={{ width: "100%" }}
    />
  );
}
