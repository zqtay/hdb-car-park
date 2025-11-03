import { type FC } from 'react';
import './styles.css';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const ToggleSwitch: FC<ToggleSwitchProps> = ({ checked, onChange, label }) => {
  return (
    <div className="toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-slider" onClick={() => onChange(!checked)}></span>
      {label && <span className="toggle-label">{label}</span>}
    </div>
  );
};
