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

const selectStyle = {
  selectWrapper: { height: "100px" },
  optionsList: { backgroundColor: "black", color: "white" },
  highlight: { backgroundColor: "orange" },
  disabled: { backgroundColor: "rgb(230, 163, 163)" },
  selected: { backgroundColor: "orange" },
};

const Form = () => {
  const [value, setValue] = useState("");
  //load options from api for async options support
  const loadOptions = async (query) => {
    const res = await fetch(`https://dummyjson.com/users/search?q=${query}&limit=10&skip=${0}`);
    const data = await res.json();
    return data.users.map((user) => ({
      id: user.id,
      label: `${user.firstName}`,
      disabled: false,
    }));
  };

  const getStateOptions = () => {
    const result = [];
    Object.keys(countryList).forEach((country) => {
      const states = countryList[country];
      for (let i = 0; i < states.length; i++) {
        result.push({
          label: states[i],
          disabled: false,
        });
      }
    });
    return result;
  };

  const onClear = (e) => {
    e.stopPropagation();
    setValue("");
  };

  return (
    <form>
      <UniversalSelect
        label="Users"
        loadOptions={(query) => loadOptions(query)}
        options={getStateOptions(value)}
        value={value}
        onChange={setValue}
        closeOnOutsideClick
        isClearOptionAllow
        onClear={onClear}
        isSearchOptionsAllow
        //selectStyle={selectStyle}
      />
    </form>
  );
};

export default Form;
