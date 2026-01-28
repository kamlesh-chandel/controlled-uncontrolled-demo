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
  handleSelectedOptionsList,
  selectedOptionsList,
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
  const triggerRef = useRef(null);

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
    if (isSearchOptionsAllow)
      setSearch(option.label);
    closeOptions();
  };

  const handleMultipleSelect = (e, option) => {
    if (option.disabled) return;
    
    if (e.target.checked) handleSelectedOptionsList(option);
    else handleSelectedOptionsList(option, false);
    setSearch("");
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
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
      if (!selectedOptionsList) {
        handleSelect(option);
      } else {        
        handleSelectedOptionsList(option);
      } 
 
      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });

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
            if (!selectedOptionsList) handleSelect(option);
          }}
        >
          {!selectedOptionsList ? (
            <span className="option-label">
              {editOption ? editOption(option) : option.label}
            </span>
          ) : (
            <label
              htmlFor={option.id}
              className={`option-label ${isDisabled ? "disabled" : ""}`}
            >
              <input
                type="checkbox"
                id={option.id}
                name="options"
                checked={selectedOptionsList.some(
                  (value) => value.id == option.id,
                )}
                disabled={option.disabled}
                onChange={(e) => handleMultipleSelect(e, option)}
              />
              {editOption ? editOption(option) : option.label}
            </label>
          )}
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
        ref={triggerRef}
        className="custom-select-trigger"
        onClick={handleToggleOptions}
        onKeyDown={handleKeyboardNavigation}
      >
        {isSearchOptionsAllow ? (
          !selectedOptionsList || selectedOptionsList.length == 0 ? (
            <input
              onChange={handleSearch}
              placeholder="Search Here"
              value={search}
            />
          ) : (
            <div className="multiple-options-container">
              {selectedOptionsList.map((option) => (
                <div className="multiple-options" key={option.id}>
                  {editOption ? editOption(option) : option.label}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectedOptionsList(option, false);
                    }}
                  >
                    ⤬
                  </span>
                </div>
              ))}
              <input
                onChange={handleSearch}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(true);
                }}
                placeholder="Search Here"
                value={search}
              />
            </div>
          )
        ) : (
          <p>
            {selectedValue
              ? editOption
                ? editOption(selectedValue)
                : selectedValue.label
              : "Please Select Option"}
          </p>
        )}

        {!selectedOptionsList ? (
          selectedValue && isClearOptionAllow ? (
            <span onClick={handleClear}>⛌</span>
          ) : (
            <span>{isOpen ? "↑" : "↓"}</span>
          )
        ) : selectedOptionsList.length == 0 ? (
          <span>{isOpen ? "↑" : "↓"}</span>
        ) : (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleSelectedOptionsList();
            }}
          >
            Clear
          </span>
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
