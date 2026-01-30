import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./form.css";

const STORAGE_KEY = "UNIVERSAL_SELECT_VALUE";

function UniversalSelect({
  options = [],
  loadOptions,
  value,
  onChange,
  label,
  isMultiSelectAllow = false,
  closeOnOutsideClick = true,
  isClearOptionAllow = true,
  isSearchOptionsAllow = false,
  selectStyle = {},
  renderOption,
  renderSelectedOption,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : isMultiSelectAllow ? [] : null;
  });
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const selectedValue = value !== undefined ? value : internalValue;
  
  const highlightedRef = useRef(null);
  const triggerRef = useRef(null);

  const normalizedValue = isMultiSelectAllow
    ? Array.isArray(selectedValue)
      ? selectedValue
      : []
    : selectedValue;

  const baseOptions = loadOptions ? asyncOptions : options;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedValue));
  }, [normalizedValue]);

  useEffect(() => {
    if (!isMultiSelectAllow && normalizedValue?.label) {
      setSearch(normalizedValue.label);
    }
  }, [normalizedValue, isMultiSelectAllow]);

  const fetchOptions = async (reset = false) => {
    if (!loadOptions) return;
    setLoading(true);

    const result = await loadOptions(search);

    setLoading(false);
    if (!result) return;
    setAsyncOptions((prev) => (reset ? result : [...prev, ...result]));
  };

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
    if(!isSearchOptionsAllow) return baseOptions;
    return baseOptions.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [baseOptions, search, loadOptions]);

  const updateSelectedValue = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const isOptionSelected = (option) => {
    if (!isMultiSelectAllow) {
      return normalizedValue?.id === option.id;
    }
    return normalizedValue.some((value) => value.id === option.id);
  };

  const closeOptions = () => {
    if (isMultiSelectAllow) {
      setSearch("");
    } else {
      const storedValue = localStorage.getItem(STORAGE_KEY);
      if (storedValue) {
        const parsed = JSON.parse(storedValue);
        if (parsed) {
          if(parsed.label){

            setSearch(parsed?.label);
          }else{
            setSearch("");
          }
          
        } else {
          setSearch("");
        }
      }else{
        setSearch("");
      }
    }
    setFocusedIndex(-1); 
    setIsOpen(false);
  };

  const toggleOption = (option) => {

    if (!isMultiSelectAllow) {
      updateSelectedValue(option);
      setSearch(option.label);
      closeOptions();
      return;
    }

    const exists = normalizedValue.some((o) => o.id === option.id);

    const newList = exists
      ? normalizedValue.filter((o) => o.id !== option.id)
      : [...normalizedValue, option];

    updateSelectedValue(newList);
    setSearch("");
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  };

  const handleKeyboardNavigation = (e) => {
    if (!baseOptions.length) return;

    if (e.key === "ArrowDown") {
      setFocusedIndex((prev) => (prev + 1) % baseOptions.length);
    } else if (e.key === "ArrowUp") {
      setFocusedIndex((prev) =>
        prev <= 0 ? baseOptions.length - 1 : prev - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const option = baseOptions[focusedIndex];

      if (!option || option.disabled) return;
      toggleOption(option);
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
    setSearch(e.target.value);
    setFocusedIndex(-1);
  };

  const getOptionStyle = (isDisabled, isFocused, isSelected) => {
    return {
      ...(isDisabled && selectStyle?.disabledOption),
      ...(isFocused && selectStyle?.highlightOption),
      ...(isSelected && selectStyle?.selectedOption),
    };
  };

  const getOptionClassName = (isDisabled, isFocused, isSelected) => {
    return [
      "custom-select-option",
      isDisabled && "disabled",
      isSelected && "selected",
      isFocused && "highlight",
    ].join(" ");
  };

  const renderOptions = () => {
    return filteredOptions.map((option, index) => {
      const isDisabled = option.disabled;
      const isFocused = index === focusedIndex;
      const isSelected = isOptionSelected(option);

      const renderOptionContent = () => {
        if (!isMultiSelectAllow) {
          return (
            <span className="option-label">
              {renderOption ? renderOption(option) : option.label}
            </span>
          );
        }
        return (
          <div
            className={`option-label ${isDisabled && "disabled"}`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              disabled={option.disabled}
              readOnly
            />
            {renderOption ? renderOption(option) : option.label}
          </div>
        );
      };

      return (
        <li
          key={option.id}
          ref={isFocused ? highlightedRef : null}
          style={getOptionStyle(isDisabled, isFocused, isSelected)}
          className={getOptionClassName(isDisabled, isFocused, isSelected)}
          onClick={(e) => {
            e.stopPropagation();
            toggleOption(option);
          }}
        >
          {renderOptionContent()}
        </li>
      );
    });
  };

  const handleClearAllValue = (e) => {
    e.stopPropagation();
    updateSelectedValue(isMultiSelectAllow ? [] : null);
    setSearch("");
    setFocusedIndex(-1);
  };

  const renderActionIcon = () => {
    const hasSelection = isMultiSelectAllow
      ? normalizedValue.length > 0
      : normalizedValue &&
        typeof normalizedValue === "object" &&
        "id" in normalizedValue;

    if (loading) {
      return <span>Loading...</span>;
    }

    if (isClearOptionAllow && hasSelection) {
      return <span onClick={handleClearAllValue}>Clear</span>;
    }

    return <span>{isOpen ? "↑" : "↓"}</span>;
  };

  const renderSelectContent = () => {
    const renderSelectedOptionList = () => {
      return normalizedValue.map((option) => (
        <div className="multiple-options" key={option.id}>
          {renderSelectedOption ? renderSelectedOption(option) : option.label}
          <span
            onClick={(e) => {
              e.stopPropagation();
              toggleOption(option);
            }}
          >
            ⤬
          </span>
        </div>
      ));
    };

    const renderSearchInput = () => {
      return (
        <input
          onChange={handleSearch}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          placeholder="Search Here"
          value={search}
        />
      );
    };

    if (isSearchOptionsAllow) {
      if (!isMultiSelectAllow) {
        return renderSearchInput();
      }
      return (
        <div className="multiple-options-container">
          {renderSelectedOptionList()}
          {renderSearchInput()}
        </div>
      );
    }

    if (!isMultiSelectAllow) {
      return (
        <p>
          {normalizedValue
            ? renderOption
              ? renderOption(normalizedValue)
              : normalizedValue.label
            : "Please Select Option"}
        </p>
      );
    }

    if(normalizedValue.length<=0){
      return <p>Please Select Options</p>
    }

    return (
      <div className="multiple-options-container">
        {renderSelectedOptionList()}
      </div>
    );
  };

  return (
    <div
      className="custom-select"
      style={selectStyle.selectWrapper && selectStyle.selectWrapper}
    >
      <label className="custom-select-label">{label}</label>

      <div
        type="button"
        ref={triggerRef}
        className="custom-select-trigger"
        tabIndex={0} //browsers only fire keydown events on focused elements, to make it focus we use this.
        onClick={handleToggleOptions}
        onKeyDown={handleKeyboardNavigation}
      >
        {renderSelectContent()}
        {renderActionIcon()}
      </div>

      {isOpen && (
        <>
          {filteredOptions.length > 0 && (
            <ul
              className="custom-select-options"
              style={selectStyle.optionsList && selectStyle.optionsList}
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
