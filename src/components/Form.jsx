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
  const [value, setValue] = useState(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadOptions = async (query) => {
    if (!hasMore && !query) return [];
    const res = await fetch(
      `https://dummyjson.com/users/search?q=${query}&limit=10&skip=${query ? 0 : skip}`,
    );
    const data = await res.json();
    
    const nextSkip = data.skip + data.limit;
    if (nextSkip >= data.total) {
      setHasMore(false);
    } else {
      setSkip(nextSkip);
    }

    return data.users.map((user) => ({
      id: user.id,
      label: `${user.firstName}`,
      disabled: false,
    }));
  };

  const editOption = (option) => {
    return (
      <span>
        {emojiList[String(option.id % Object.keys(emojiList).length)]}
        {option.label}
      </span>
    );
  };

  const loadDefaultOption = async (id) => {
    const res = await fetch(`https://dummyjson.com/users/${id}`);
    const data = await res.json();
    return {
      id: data.id,
      label: `${data.firstName}`,
      disabled: false,
    };
  };

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

  return (
    <form>
      <UniversalSelect
        label="Users"
        loadOptions={loadOptions}
        options={getStateOptions()}
        value={value}
        onChange={setValue}
        closeOnOutsideClick
        isClearOptionAllow
        isSearchOptionsAllow
        //selectStyle={selectStyle}
        //defaultSelectedOptionId={150}
        //loadDefaultOption={loadDefaultOption}
        editOption={editOption}
      />
    </form>
  );
};

export default Form;
