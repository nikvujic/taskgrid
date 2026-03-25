import './ColorPicker.css';

const PRESETS = [
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#dc2626',
  '#d97706',
  '#16a34a',
  '#0891b2',
  '#6b7280',
];

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="cpicker">
      <div className="cpicker-top">
        <div className="cpicker-current" style={{ background: value }} />
        <div className="cpicker-vsep" />
        <div className="cpicker-presets">
          {PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              className={`cpicker-swatch${value === c ? ' selected' : ''}`}
              style={{ background: c }}
              onClick={() => onChange(c)}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>
      <div className="cpicker-hsep" />
      <input
        type="color"
        className="cpicker-custom"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        title="Custom color"
      />
    </div>
  );
}
