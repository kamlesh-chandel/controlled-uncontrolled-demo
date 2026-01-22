import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./form.css";

function UniversalSelect({
  options = [],
  loadOptions,
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
  const [focusedIndex, setFocusedIndex] = useState(-1); //when navigate, this index will + or -

  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const highlightedRef = useRef(null);

  const baseOptions = loadOptions ? asyncOptions : options;
  const selectedValue = value !== undefined ? value : internalValue; //for controlled and uncontrolled component
  const [search, setSearch] = useState(selectedValue);

  //filter default options
  const filteredOptions = useMemo(() => {
    if (loadOptions) return baseOptions;

    return baseOptions.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [baseOptions, search, loadOptions]);

  //filter async options by calling api
  const loadFilteredData = async () => {
    setLoading(true);
    const result = await loadOptions(search);
    setAsyncOptions(result);
    setLoading(false);
  };
  useEffect(() => {
    if (!loadOptions) return;
    loadFilteredData();
  }, [search, loadOptions]);

  //close options list
  const closeOptions = () => {
    setFocusedIndex(-1);
    setIsOpen(false);
  };

  //close on click outside select
  useEffect(() => {
    if (!closeOnOutsideClick) return;
    document.addEventListener("click", closeOptions);
    return () => {
      document.removeEventListener("click", closeOptions);
    };
  }, [closeOnOutsideClick]);

  //navigation highlighter
  useLayoutEffect(() => {
    highlightedRef?.current?.scrollIntoView({
      top: 0,
    });
  }, [focusedIndex]);

  //sync search and selectedvalue
  useEffect(() => {
    if (isSearchOptionsAllow) {
      setSearch(selectedValue || "");
    }
  }, [selectedValue, isSearchOptionsAllow, isOpen]);

  //update selected option state
  const updateSelectedValue = (val) => {
    if (value === undefined) {
      setInternalValue(val);
    }
    onChange(val);
  };

  //handle option click
  const handleSelect = (option) => {
    if (option.disabled) return;
    updateSelectedValue(option.id);
    if (isSearchOptionsAllow) setSearch(option.label);
    closeOptions();
  };

  //handle cross button click
  const handleClear = (e) => {
    e.stopPropagation();
    updateSelectedValue("");
  };

  //handle navigation
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

  //custom styling function
  const applyStyle = (style) => style || {};

  const handleScroll = (e) => {
    console.log(e.target.scrollHeight);
    console.log(150 + e.target.scrollTop);
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
        onClick={(e) => {
          e.stopPropagation();
          setFocusedIndex(-1);
          setIsOpen((prev) => !prev);
        }}
        onKeyDown={handleKeyboardNavigation}
      >
        {isSearchOptionsAllow ? (
          <input
            onChange={(e) => {
              setIsOpen(true);
              setSearch(e.target.value);
              setFocusedIndex(-1);
            }}
            placeholder="Please Select Option"
            value={search}
          />
        ) : (
          <p>{selectedValue || "Please Select Option"}</p>
        )}

        {selectedValue ? (
          isClearOptionAllow ? (
            <span onClick={onClear || handleClear}>⛌</span>
          ) : (
            <span>{isOpen ? "↑" : "↓"}</span>
          )
        ) : (
          <span>{isOpen ? "↑" : "↓"}</span>
        )}
      </button>

      {isOpen && (
        <>
          {loading && ( //Loading view
            <div className="no-custom-select-options">
              <p className="no-custom-select-option">Searching...</p>
            </div>
          )}

          {!loading &&
            filteredOptions.length > 0 && ( //Option list view
              <ul
                className="custom-select-options"
                //onScroll={handleScroll}
                onScrollEnd={handleScroll}
                style={applyStyle(selectStyle.optionsList)}
              >
                {filteredOptions.map((option, index) => (
                  <li
                    ref={index === focusedIndex ? highlightedRef : null}
                    key={option.id}
                    style={{
                      ...(option.disabled && selectStyle?.disabled
                        ? selectStyle.disabled
                        : {}),
                      ...(index === focusedIndex && selectStyle?.highlight
                        ? selectStyle.highlight
                        : {}),
                      ...(selectedValue === option.label &&
                      selectStyle?.selected
                        ? selectStyle.selected
                        : {}),
                    }}
                    className={`custom-select-option
                    ${option.disabled && "disabled"}
                    ${typeof selectedValue == "string" && selectedValue === option.label && "selected"}
                    ${typeof selectedValue == "number" && selectedValue == option.id && "selected"}
                    ${index === focusedIndex && "highlight"}

                  `}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option);
                    }}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            )}

          {!loading &&
            filteredOptions.length === 0 && ( //No Option available view
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
