import { useEffect, useState } from "react";
import UniversalSelect from "./UniversalSelect";
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

const selectStyle = {
  selectWrapper: { height: "100px" },
  optionsList: { backgroundColor: "black", color: "white" },
  highlight: { backgroundColor: "orange" },
  disabled: { backgroundColor: "rgb(230, 163, 163)" },
  selected: { backgroundColor: "orange" },
};

const Form = () => {
  const [value, setValue] = useState(() => {
  const stored = localStorage.getItem("SELECTED_USER");
    return stored ? JSON.parse(stored) : null;
  });
  const [skip, setSkip] = useState(0);
  const [currentQuery, setCurrentQuery] = useState("");
  const [hasMoreData, setHasMoreData] = useState(true);
  const [selectedOptionsList, setSelectedOptionsList] = useState(() => {
    const stored = localStorage.getItem("SELECTED_USERS");
    return stored ? JSON.parse(stored) : [];
  });

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
  //   const fetchDefault = async () => {
  //     const res = await fetch("https://dummyjson.com/users/50");
  //     const data = await res.json();

  //     const option = {
  //       id: data.id,
  //       label: data.firstName,
  //       disabled: false,
  //     };

  //     setValue(option);
  //     localStorage.setItem("SELECTED_USER", JSON.stringify(option));
  //   };

  //   fetchDefault();
  // }, []);

  const loadOptions = async (query) => {
    const isNewQuery = query !== currentQuery;
    let localSkip = skip;

    if (isNewQuery) {
      localSkip = 0;
      setSkip(0);
      setHasMoreData(true);
      setCurrentQuery(query);
    }

    if (!hasMoreData && !isNewQuery) return [];

    const res = await fetch(
      `https://dummyjson.com/users/search?q=${query}&limit=10&skip=${localSkip}`,
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

  const editOption = (option) => {
    return (
      <span>
        {emojiList[option.id % Object.keys(emojiList).length]}
        {option.label}
      </span>
    );
  };

  const handleOnChange = (option) => {
     setValue(option);
     if (option) {
       localStorage.setItem("SELECTED_USER", JSON.stringify(option));
     } else {
       localStorage.removeItem("SELECTED_USER");
     }
  }

  const handleSelectedOptionsList = (option, pushOption = true) => {
    if(!option) {
      setSelectedOptionsList([]);
      return;
    }
    if(pushOption) {
      setSelectedOptionsList((prev) => [...prev, option]);
    }else{
      const filteredOptons = selectedOptionsList.filter((value) => value.id !== option.id)
      setSelectedOptionsList(filteredOptons);
    }
  }

  useEffect(() => {
    localStorage.setItem("SELECTED_USERS", JSON.stringify(selectedOptionsList));
  },[selectedOptionsList])

  return (
    <form>
      <UniversalSelect
        label="Users"
        loadOptions={loadOptions}
        //options={getStateOptions()}
        value={value}
        onChange={handleOnChange}
        closeOnOutsideClick
        isClearOptionAllow
        isSearchOptionsAllow
        //selectStyle={selectStyle}
        editOption={editOption}
        selectedOptionsList={selectedOptionsList}
        handleSelectedOptionsList={handleSelectedOptionsList}
      />
    </form>
  );
};

export default Form;
