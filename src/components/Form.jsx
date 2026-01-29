import { useEffect, useState } from "react";
import UniversalSelect from "./UniversalSelect";
import "./colors.css";
import "./form.css";

const countryList = {
  India: ["Rajasthan", "Madhya Pradesh", "Kerala", "Maharashtra", "Punjab"],
  America: ["New York", "California", "Texas", "Florida", "Illinois"],
  Canada: ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba"],
  Australia: [
    "New South Wales",
    "Victoria",
    "Queensland",
    "Western Australia",
    "Tasmania",
  ],
  Germany: ["Bavaria", "Berlin", "Hesse", "Saxony", "North Rhine-Westphalia"],
  Japan: ["Tokyo", "Osaka", "Kyoto", "Hokkaido", "Okinawa"],
};

const emojiList = {
  0: "🥰",
  1: "😀",
  2: "🔥",
  3: "⚡",
  4: "💎",
  5: "🚀",
  6: "🎯",
  7: "🌟",
  8: "👑",
  9: "🧠",
  10: "🎉",
  11: "💻",
  12: "📌",
  13: "📈",
  14: "🛠️",
  15: "🔍",
  16: "🎵",
  17: "🌈",
  18: "🕶️",
  19: "💡",
  20: "🏆",
};

//customize select component style
const selectStyle = {
  selectWrapper: { color: "var(--black)" },
  optionsList: { backgroundColor: "var(--black)", color: "var(--white)" },
  highlightOption: { backgroundColor: "var(--orange)" },
  disabledOption: { backgroundColor: "var(--light-red)" },
  selectedOption: { backgroundColor: "var(--orange)" },

};

const STORAGE_KEY = "UNIVERSAL_USERS_VALUE";

const Form = () => {

  const isMultiSelectAllow = true;

  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    return isMultiSelectAllow ? [] : null;
  });
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }, [value]);

  const [skip, setSkip] = useState(0);
  const [currentQuery, setCurrentQuery] = useState("");
  const [hasMoreData, setHasMoreData] = useState(true);

  const getStateOptions = () => {
    const result = [];
    let id = 0;

    Object.keys(countryList).forEach((country) => {
      countryList[country].forEach((state) => {
        result.push({
          id: id++,
          label: state,
          disabled: false,
        });
      });
    });

    return result;
  };

  // useEffect(() => {
  //   const defaultIds = isMultiSelectAllow ? [50, 12] : [1];

  //   const fetchDefaults = async () => {
  //     const results = await Promise.all(
  //       defaultIds.map(async (id) => {
  //         const res = await fetch(`https://dummyjson.com/users/${id}`);
  //         const data = await res.json();
  //         return {
  //           id: data.id,
  //           label: data.firstName,
  //           disabled: false,
  //         };
  //       }),
  //     );

  //     setValue(isMultiSelectAllow ? results : results[0]);
  //   };
  
  //   fetchDefaults();
  // }, [isMultiSelectAllow]);

  const loadOptions = async (query) => {
    const encodedQuery = encodeURIComponent(query);
    
    const isNewQuery = encodedQuery !== currentQuery;
    let localSkip = skip;

    if (isNewQuery) {
      localSkip = 0;
      setSkip(0);
      setHasMoreData(true);
      setCurrentQuery(query);
    }

    if (!hasMoreData && !isNewQuery) return [];

    const res = await fetch(
      `https://dummyjson.com/users/search?q=${encodedQuery}&limit=10&skip=${localSkip}`,
    );

    const data = await res.json();

    const nextSkip = data.skip + data.limit;
    if (nextSkip >= data.total) {
      setHasMoreData(false);
    } else {
      setSkip(nextSkip);
    }

    return data.users.map((user) => ({
      id: user.id,
      label: user.firstName,
      disabled: false,
    }));
  };

  //render option
  const renderOption = (option) => {
    return `${emojiList[option.id % Object.keys(emojiList).length]} ${option.label}`;
  };

  //render selected option
  const renderSelectedOption = (option) => {
    return `${option.label} ${emojiList[option.id % Object.keys(emojiList).length]}`;
  };

  // //handle selected option
  // const handleOnChange = (option) => {
  //   setValue(option);
  //   if (option) {
  //     localStorage.setItem("SELECTED_USER", JSON.stringify(option));
  //   } else {
  //     localStorage.removeItem("SELECTED_USER");
  //   }
  // };

  //handle multiple selected options
  // const handleSelectedOptionsList = (option, pushOption = true) => {
    
  //   if (!option) {
  //     setSelectedOptionsList([]);
  //     return;
  //   }
  //   if (pushOption) {
  //     setSelectedOptionsList((prev) => [...prev, option]);
  //   } else {
  //     const filteredOptons = selectedOptionsList.filter(
  //       (value) => value.id !== option.id,
  //     );
  //     setSelectedOptionsList(filteredOptons);
  //   }
  // };

  return (
    <form>
      <UniversalSelect
        options={getStateOptions()}
        label="Users"
        value={value}
        onChange={setValue}
        loadOptions={loadOptions}
        renderOption={renderOption}
        renderSelectedOption={renderSelectedOption}
        isMultiSelectAllow={isMultiSelectAllow}
      />
    </form>
  );
};

export default Form;