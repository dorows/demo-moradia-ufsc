import { useEffect, useId, useRef, useState } from "react";

export default function AnimatedSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
  icon = null,
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return undefined;

    function handlePointer(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKey(event) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (!open) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlight((current) => Math.min(current + 1, options.length - 1));
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlight((current) => Math.max(current - 1, 0));
      }

      if (event.key === "Enter" && highlight >= 0) {
        event.preventDefault();
        onChange(options[highlight]);
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [highlight, onChange, open, options]);

  useEffect(() => {
    if (open) {
      const index = options.indexOf(value);
      setHighlight(index >= 0 ? index : 0);
    }
  }, [open, options, value]);

  return (
    <div
      className={`animated-select ${open ? "is-open" : ""} ${disabled ? "is-disabled" : ""}`}
      ref={rootRef}
    >
      <span className="animated-select__label">{label}</span>
      <button
        type="button"
        className="animated-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        {icon && <span className="animated-select__icon" aria-hidden="true">{icon}</span>}
        <span className="animated-select__value">{value}</span>
        <span className="animated-select__chevron" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <div className="animated-select__panel" role="presentation">
        <ul className="animated-select__list" id={listId} role="listbox" aria-label={label}>
          {options.map((option, index) => (
            <li key={option} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === option}
                className={`animated-select__option ${
                  value === option ? "is-selected" : ""
                } ${highlight === index ? "is-highlighted" : ""}`}
                style={{ "--option-index": index }}
                onMouseEnter={() => setHighlight(index)}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                <span>{option}</span>
                {value === option && (
                  <span className="animated-select__check" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none">
                      <path
                        d="M4.5 10.5L8 14L15.5 6.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
