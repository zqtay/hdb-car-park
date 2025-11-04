import { type FC } from 'react';
import './styles.css';

interface TogglePillProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const TogglePill: FC<TogglePillProps> = ({ checked, onChange, label }) => {
  return (
    <div
      className="toggle-pill"
      onClick={() => onChange(!checked)}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label && <span className="toggle-label">{label}</span>}
    </div>
  );
};
