import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./form.css";

const SELECTED_OPTION = "selected_option";

function UniversalSelect({
  options = [],
  loadOptions,
  value,
  onChange,
  label,
  closeOnOutsideClick = true,
  isClearOptionAllow = true,
  isSearchOptionsAllow = true,
  selectStyle = {},
  editOption,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(() => {
    const stored = localStorage.getItem(SELECTED_OPTION);
    return stored ? JSON.parse(stored) : null;
  });
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const selectedValue = value !== undefined ? value : internalValue;
  const baseOptions = loadOptions ? asyncOptions : options;

  const highlightedRef = useRef(null);

  useEffect(() => {
    if (value?.label) {
      setSearch(value.label);
      return;
    }

    const stored = localStorage.getItem(SELECTED_OPTION);
    if (!stored) return;

    const parsed = JSON.parse(stored);
    setSearch(parsed.label);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOptions(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!closeOnOutsideClick) return;
    document.addEventListener("click", closeOptions);
    return () => {
      document.removeEventListener("click", closeOptions);
    };
  }, [closeOnOutsideClick]);

  useLayoutEffect(() => {
    highlightedRef?.current?.scrollIntoView({ top: 0 });
  }, [focusedIndex]);

  const filteredOptions = useMemo(() => {
    if (loadOptions) return baseOptions;
    return baseOptions.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [baseOptions, search, loadOptions]);

  const updateSelectedValue = (option) => {
    if (value === undefined) {
      setInternalValue(option);
    }
    onChange(option);

    if (option) {
      localStorage.setItem(SELECTED_OPTION, JSON.stringify(option));
    } else {
      localStorage.removeItem(SELECTED_OPTION);
    }
  };

  const fetchOptions = async (reset = false) => {
    if (!loadOptions) return;
    setLoading(true);

    const result = await loadOptions(search);

    setLoading(false);
    if (!result) return;
    setAsyncOptions((prev) => (reset ? result : [...prev, ...result]));
  };

  const closeOptions = () => {
    const storedValue = localStorage.getItem(SELECTED_OPTION);
    if (storedValue) setSearch(JSON.parse(storedValue).label);
    setFocusedIndex(-1);
    setIsOpen(false);
  };

  const handleSelect = (option) => {
    if (option.disabled) return;
    updateSelectedValue(option);
    if (isSearchOptionsAllow) setSearch(option.label);
    closeOptions();
  };

  const handleKeyboardNavigation = (e) => {
    if (!filteredOptions.length) return;

    if (e.key === "ArrowDown") {
      setFocusedIndex((prev) => (prev + 1) % filteredOptions.length);
    } else if (e.key === "ArrowUp") {
      setFocusedIndex((prev) =>
        prev <= 0 ? filteredOptions.length - 1 : prev - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const option = filteredOptions[focusedIndex];
      if (!option || option.disabled) return;
      handleSelect(option);
    } else if (e.key === "Escape") {
      closeOptions();
    }
  };

  const handleInfiniteScroll = (e) => {
    if (loading) return;

    if (
      e.target.scrollTop + e.target.clientHeight >=
      e.target.scrollHeight - 5
    ) {
      fetchOptions();
    }
  };

  const handleToggleOptions = (e) => {
    e.stopPropagation();
    setFocusedIndex(-1);
    setIsOpen((prev) => !prev);
  };

  const handleSearch = (e) => {
    setIsOpen(true);
    setSearch(e.target.value);
    setFocusedIndex(-1);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    updateSelectedValue(null);
    setSearch("");
  };

  const renderOptions = () => {
    return filteredOptions.map((option, index) => {
      const isDisabled = option.disabled;
      const isFocused = index === focusedIndex;
      const isSelected = selectedValue?.id === option.id;
      const inlineStyle = {
        ...(isDisabled && selectStyle?.disabled ? selectStyle.disabled : {}),
        ...(isFocused && selectStyle?.highlight ? selectStyle.highlight : {}),
        ...(selectedValue === option.label && selectStyle?.selected
          ? selectStyle.selected
          : {}),
      };

      return (
        <li
          key={option.id}
          ref={isFocused ? highlightedRef : null}
          style={inlineStyle}
          className={`custom-select-option
          ${isDisabled ? "disabled" : ""}
          ${isSelected ? "selected" : ""}
          ${isFocused ? "highlight" : ""}
        `}
          onClick={(e) => {
            e.stopPropagation();
            handleSelect(option);
          }}
        >
          {editOption ? editOption(option) : option.label}
        </li>
      );
    });
  };

  const applyStyle = (style) => {
    return style ? style : {};
  };

  return (
    <div
      className="custom-select"
      style={applyStyle(selectStyle.selectWrapper)}
    >
      <label className="custom-select-label">{label}</label>

      <button
        type="button"
        className="custom-select-trigger"
        onClick={handleToggleOptions}
        onKeyDown={handleKeyboardNavigation}
      >
        {isSearchOptionsAllow ? (
          <input
            onChange={handleSearch}
            placeholder="Please Select Option"
            value={search}
          />
        ) : (
          <p>{selectedValue?.label || "Please Select Option"}</p>
        )}

        {selectedValue && isClearOptionAllow ? (
          <span onClick={handleClear}>⛌</span>
        ) : (
          <span>{isOpen ? "↑" : "↓"}</span>
        )}
      </button>

      {isOpen && (
        <>
          {filteredOptions.length > 0 && (
            <ul
              className="custom-select-options"
              style={applyStyle(selectStyle.optionsList)}
              onScroll={handleInfiniteScroll}
            >
              {renderOptions()}
              {loading && <li className="search-view">Loading...</li>}
            </ul>
          )}

          {!loading && filteredOptions.length === 0 && (
            <div className="no-custom-select-options">
              <p className="no-custom-select-option">No Option Available</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default UniversalSelect;
