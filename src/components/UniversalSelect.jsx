import {useState} from "react";
import "./form.css";

function UniversalSelect({ options, value, onChange}) {
  const [internalValue, setInternalValue] = useState(options[0]);
  const selectedValue = value !== undefined ? value : internalValue;

  const handleChange = (e) => {
    if (value == undefined) {
      setInternalValue(e.target.value);
    }
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div>
      <h6>UniversalSelect State - {selectedValue}</h6>
      <label>Country</label>
      <select value={selectedValue} onChange={handleChange}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default UniversalSelect;

