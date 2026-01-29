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
  isSearchOptionsAllow = true,
  selectStyle = {},
  renderOption,
  renderSelectedOption,
  handleSelectedOptionsList,
  selectedOptionsList,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(() => {
    const stored = localStorage.getItem("SELECTED_USER");
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

    const stored = localStorage.getItem("SELECTED_USER");
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
    highlightedRef?.current?.scrollIntoView({ top:0 });
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
    }else{
    onChange(option);
    }
    if (option) {
      localStorage.setItem("SELECTED_USER", JSON.stringify(option));
    } else {
      localStorage.removeItem("SELECTED_USER");
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
    const storedValue = localStorage.getItem("SELECTED_USER");
    if (storedValue) setSearch(JSON.parse(storedValue).label);
    else setSearch("");
    setFocusedIndex(-1);
    setIsOpen(false);
  };

  const handleSelect = (option) => {
    
    if (option.disabled) return;
    updateSelectedValue(option);
    if (isSearchOptionsAllow) setSearch(option.label);
    closeOptions();
  };

  const handleMultipleSelect = (e, option) => {
    if (option.disabled) return;

    if (e.target.checked) handleSelectedOptionsList(option);
    else handleSelectedOptionsList(option, false);

    const index = filteredOptions.findIndex((opt) => opt.id == option.id);
    setFocusedIndex(index);
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

  const getOptionStyle = (isDisabled, isFocused, isSelected, selectStyle) => {
    return {
      ...(isDisabled && selectStyle?.disabledOption),
      ...(isFocused && selectStyle?.highlightOption),
      ...(isSelected && selectStyle?.selectedOption),
    };
  };

  const getOptionClassName = ({ isDisabled, isFocused, isSelected }) => {
    return [
      "custom-select-option",
      isDisabled && "disabled",
      isSelected && "selected",
      isFocused && "highlight",
    ].join(" ");
  };

  const handleOptionClick = (option) => (e) => {
    e.stopPropagation();
    if (!selectedOptionsList) {
      handleSelect(option);
    }
  };

  const handleClearAllClick = (e) => {
    e.stopPropagation();
    handleSelectedOptionsList();
    setFocusedIndex(-1);
  };

  const renderOptions = () => {
    return filteredOptions.map((option, index) => {
      const isDisabled = option.disabled;
      const isFocused = index === focusedIndex;
      const isSelected = selectedValue?.id === option.id;

      const inlineStyle = getOptionStyle(
        isDisabled,
        isFocused,
        isSelected,
        selectStyle,
      );

      const className = getOptionClassName({
        isDisabled,
        isFocused,
        isSelected,
      });

      const renderOptionContent = () => {
        if (!selectedOptionsList) {
          return (
            <span className="option-label">
              {renderOption ? renderOption(option) : option.label}
            </span>
          );
        }
        return (
          <label
            htmlFor={option.id}
            className={`option-label ${isDisabled && "disabled"}`}
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
            {renderOption ? renderOption(option) : option.label}
          </label>
        );
      };

      return (
        <li
          key={option.id}
          ref={isFocused ? highlightedRef : null}
          style={inlineStyle}
          className={className}
          onClick={handleOptionClick(option)}
        >
          {renderOptionContent()}
        </li>
      );
    });
  };

  const renderActionIcon = () => {
    if(loading) {
      return <span>Loading...</span>
    }
    const arrow = isOpen ? "↑" : "↓";

    if (!selectedOptionsList) {
      if (selectedValue && isClearOptionAllow) {
        return (
          <span
            onClick={handleClear}
          >
            ⛌
          </span>
        );
      }
      return <span>{arrow}</span>;
    }

    if (selectedOptionsList.length === 0) {
      return <span>{arrow}</span>;
    }

    if (isClearOptionAllow) {
      return <span onClick={handleClearAllClick}>Clear</span>;
    }

    return <span>{arrow}</span>;
  };

  const renderSelectContent = () => {

    const renderSelectedOptionList = () => {
      return selectedOptionsList.map((option) => (
        <div className="multiple-options" key={option.id}>
          {renderSelectedOption ? renderSelectedOption(option) : option.label}
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleSelectedOptionsList(option, false);
            }}
          >
            ⤬
          </span>
        </div>
      ));
    }
  
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
    }

    if (isSearchOptionsAllow) {
      if (!selectedOptionsList || selectedOptionsList.length == 0) {
        return renderSearchInput();
      }
      return (
        <div className="multiple-options-container">
          {renderSelectedOptionList()}
          {renderSearchInput()}
        </div>
      );
    }

    if (!selectedOptionsList || selectedOptionsList.length == 0) {
      return (
        <p>
          {selectedValue
            ? renderOption
              ? renderOption(selectedValue)
              : selectedValue.label
            : "Please Select Option"}
        </p>
      );
    }

    return renderSelectedOptionList();
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
