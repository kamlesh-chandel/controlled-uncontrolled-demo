import { useState } from "react";
import "./form.css";

function UniversalSelect({
  options = [],
  value,
  onChange,
  label,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState("");

  const selectedValue = value !== undefined ? value : internalValue;

  const handleSelect = (option) => {
    if (option.disabled) return;
    if (value === undefined) {
      setInternalValue(option.label);
    }
    onChange(option.label);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if(value === undefined){
      setInternalValue("");
    }
    onChange("");
  }
  return (
    <div className="custom-select">
      <label className="custom-select-label">{label}</label>
      <button
        type="button"
        className="custom-select-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{selectedValue ? selectedValue : "Please Select Option" }</span>
        {selectedValue ? <span onClick={handleClear}>⛌</span> : <span>{isOpen ? "↑" : "↓"}</span> }
      </button>

      {isOpen && (
        <ul className="custom-select-options" role="listbox">
          {options.map((option) => (
            <li
              key={option.label}
              className={`custom-select-option
                ${option.disabled && "disabled"}
                ${selectedValue === option.label && "selected"}
              `}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UniversalSelect;
