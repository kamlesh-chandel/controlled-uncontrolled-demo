import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./form.css";

function UniversalSelect({
  options,
  value,
  onChange,
  label,
  closeOnOutsideClick = true,
  isClearOptionAllow = true,
  onClear,
  isSearchOptionsAllow = true,
  selectStyle = {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectedValue = value !== undefined ? value : internalValue;
  const [search, setSearch] = useState(selectedValue);
  const highlightedRef = useRef(null);

  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search]);

  const closeOptions = () => {
    setFocusedIndex(-1);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!closeOnOutsideClick) return;
    document.addEventListener("click", closeOptions);
    return () => {
      document.removeEventListener("click", closeOptions);
    };
  }, [closeOnOutsideClick, closeOptions]);

  useLayoutEffect(() => {
    highlightedRef?.current?.scrollIntoView({ top: 0 });
  }, [focusedIndex]);

  useEffect(() => {
    if (isSearchOptionsAllow) setSearch(selectedValue || "");
  }, [selectedValue, isOpen]);

  const updateSelectedValue = (valueProp) => {
    if (value === undefined) {
      setInternalValue(valueProp);
    }
    onChange(valueProp);
  };

  const handleSelect = (option) => {
    if (option.disabled) return;
    updateSelectedValue(option.label);
    if (isSearchOptionsAllow) setSearch(option.label);
  };

  const onClickOption = (e, option) => {
    e.stopPropagation();
    handleSelect(option);
    closeOptions();
  };

  const handleClear = (e) => {
    e.stopPropagation();
    updateSelectedValue("");
  };

  const handleKeyboardNavigation = (e) => {
    if (e.key === "ArrowDown") {
      setFocusedIndex((prev) => (prev + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      if (focusedIndex <= 1) {
        setFocusedIndex(options.length - 1);
      } else if (focusedIndex > 0) setFocusedIndex((prev) => prev - 1);
    } else if (e.key === "Enter") {
      if (focusedIndex === -1 || options[focusedIndex].disabled) return;
      updateSelectedValue(options[focusedIndex].label);
      setSearch(options[focusedIndex].label);
      closeOptions();
    } else if (e.key === "Escape") {
      closeOptions();
    }
  };

  const applyStyle = (style) => {
    return style ? style : {};
  }

  return (
    <div
      className="custom-select"
      style={applyStyle(selectStyle.selectWrapper)}
    >
      <label className="custom-select-label">{label}</label>
      <button
        type="button"
        className="custom-select-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setFocusedIndex(-1);
          setIsOpen((prev) => !prev);
        }}
        onKeyDown={(e) => {
          handleKeyboardNavigation(e);
        }}
      >
        {isSearchOptionsAllow ? (
          <input
            onChange={(e) => {
              setIsOpen(true);
              setSearch(e.target.value);
            }}
            placeholder="Please Select Option"
            value={search}
          />
        ) : (
          <p>{selectedValue || "Please Select Option"}</p>
        )}

        {selectedValue ? (
          <>
            {isClearOptionAllow ? (
              <span onClick={onClear ? onClear : handleClear}>⛌</span>
            ) : (
              <span>{isOpen ? "↑" : "↓"}</span>
            )}
          </>
        ) : (
          <>
            <span>{isOpen ? "↑" : "↓"}</span>
          </>
        )}
      </button>

      {isOpen &&
        (filteredOptions.length > 0 ? (
          <ul
            className="custom-select-options"
            style={applyStyle(selectStyle.optionsList)}
          >
            {filteredOptions.map((option, index) => (
              <li
                ref={index === focusedIndex ? highlightedRef : null}
                key={option.label}
                style={{
                  ...(option.disabled && selectStyle?.disabled
                    ? selectStyle.disabled
                    : {}),
                  ...(index === focusedIndex && selectStyle?.highlight
                    ? selectStyle.highlight
                    : {}),
                  ...(selectedValue === option.label && selectStyle?.selected
                    ? selectStyle.selected
                    : {}),
                }}
                className={`custom-select-option
                ${option.disabled && "disabled"}
                ${selectedValue === option.label && "selected"}
                ${index === focusedIndex && "highlight"}
              `}
                onClick={(e) => onClickOption(e, option)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-custom-select-options">
            <p className="no-custom-select-option">No Option Available</p>
          </div>
        ))}
    </div>
  );
}

export default UniversalSelect;
