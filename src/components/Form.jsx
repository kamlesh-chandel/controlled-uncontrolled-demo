import { useState } from "react";
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

const Form = () => {
  const [value, setValue] = useState(null);

  const loadOptions = async (query, skip) => {
    const res = await fetch(
      `https://dummyjson.com/users/search?q=${query}&limit=10&skip=${skip}`,
    );
    const data = await res.json();

    return data.users.map((user) => ({
      id: user.id,
      label: `${user.firstName} ${user.lastName}`,
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
  }

  const loadDefaultOption = async (id) => {
    const res = await fetch(
      `https://dummyjson.com/users/${id}`,
    );
    const data = await res.json();
    return {
      id: data.id,
      label: `${data.firstName} ${data.lastName}`,
      disabled: false,
    }
  }

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
        //defaultSelectedOptionId={150}
        //loadDefaultOption={loadDefaultOption}
        editOption={editOption}
      />
    </form>
  );
};

export default Form;
