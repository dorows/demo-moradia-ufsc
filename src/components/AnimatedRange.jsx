export default function AnimatedRange({
  label,
  value,
  min,
  max,
  step,
  formatValue,
  onChange,
  disabled = false,
}) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className={`animated-range ${disabled ? "is-disabled" : ""}`}>
      <div className="animated-range__header">
        <span className="animated-range__label">{label}</span>
        <span className="animated-range__value">{formatValue(value)}</span>
      </div>
      <div className="animated-range__track-wrap">
        <div className="animated-range__track">
          <div className="animated-range__fill" style={{ width: `${percent}%` }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          style={{ "--range-percent": `${percent}%` }}
        />
      </div>
    </div>
  );
}
