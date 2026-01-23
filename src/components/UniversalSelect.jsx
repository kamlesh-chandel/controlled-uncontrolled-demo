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
  defaultSelectedOptionId,
  loadDefaultOption,
  editOption,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [skip, setSkip] = useState(0);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const highlightedRef = useRef(null);
  const fetchedRef = useRef(false);

  const selectedValue = value !== undefined ? value : internalValue;
  const baseOptions = loadOptions ? asyncOptions : options;

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

  useEffect(() => {
    const stored = localStorage.getItem(SELECTED_OPTION);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    updateSelectedValue(parsed);
    setSearch(parsed.label || "");
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchOptions = async (reset = false) => {
    if (!loadOptions) return;
    setLoading(true);

    const result = await loadOptions(debouncedSearch, reset ? 0 : skip);

    setAsyncOptions((prev) => (reset ? result : [...prev, ...result]));
    setLoading(false);
  };

  useEffect(() => {
    if (!loadOptions) return;
    setSkip(0);
    fetchOptions(true);
  }, [debouncedSearch]);

  useEffect(() => {
    if (!loadOptions || skip === 0) return;
    fetchOptions();
  }, [skip]);

  useEffect(() => {
    if (!defaultSelectedOptionId || fetchedRef.current) return;

    const findOption = (list) => {
      return list.find((opt) => opt.id === defaultSelectedOptionId);
    };
    const localMatch = findOption(baseOptions);

    if (localMatch) {
      fetchedRef.current = true;
      updateSelectedValue(localMatch);
      setSearch(localMatch.label);
      return;
    }

    if (!loadOptions) return;

    const fetchDefault = async () => {
      const result = await loadDefaultOption(defaultSelectedOptionId);
      if (result) {
        fetchedRef.current = true;
        setAsyncOptions((prev) => {
          return [...prev, result];
        });
        updateSelectedValue(result);
        setSearch(result.label);
      }
    };
    fetchDefault();
  }, [defaultSelectedOptionId, baseOptions, loadOptions]);

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
  }, [closeOnOutsideClick]);

  useLayoutEffect(() => {
    highlightedRef?.current?.scrollIntoView({ top: 0 });
  }, [focusedIndex]);

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
    if (loading || debouncedSearch.length > 0) return;

    if (
      e.target.scrollTop + e.target.clientHeight >=
      e.target.scrollHeight - 5
    ) {
      setSkip((prev) => prev + 10);
    }
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
          <p>{selectedValue?.label || "Please Select Option"}</p>
        )}

        {selectedValue && isClearOptionAllow ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              updateSelectedValue(null);
              setSearch("");
            }}
          >
            ⛌
          </span>
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
              {filteredOptions.map((option, index) => (
                <li
                  key={option.id}
                  ref={index === focusedIndex ? highlightedRef : null}
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
                    ${selectedValue?.id === option.id && "selected"}
                    ${index === focusedIndex && "highlight"}
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option);
                  }}
                >
                  {editOption ? editOption(option) : option.label}
                </li>
              ))}
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
