import { PropsWithChildren } from "react";

interface Props {
  disabled?: boolean;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function Checkbox({
  children,
  disabled,
  checked,
  onChange,
}: PropsWithChildren<Props>) {
  return (
    <label>
      <input
        type="checkbox"
        disabled={disabled}
        checked={checked}
        onChange={({ target: { checked } }) => onChange(checked)}
      />
      {children}
    </label>
  );
}
