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


const Form = () => {
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    Object.entries(countryList).forEach(([key, cities]) => {
      if (cities.includes(state)) {
        setCountry(key);
      }
    });
  }, [state]);

  const getCountryOptions = (selectedState) => {
    return Object.keys(countryList).map((country) => {
      return {
        label: country,
        disabled:selectedState && !countryList[country].includes(selectedState),
      };
    });
  };

const getStateOptions = (selectedCountry) => {
  const result = [];
  Object.keys(countryList).forEach((country) => {
    const states = countryList[country];
    for(let i =0;i<states.length;i++){
      result.push({
        label: states[i],
        disabled: selectedCountry && country !== selectedCountry
      })
    }
  })
  return result;
};

  return (
    <form>
      <UniversalSelect
        label="State"
        options={getStateOptions(country)}
        value={state}
        onChange={setState}
      />
      <UniversalSelect
        label="Country"
        options={getCountryOptions(state)}
        value={country}
        onChange={setCountry}
      />
    </form>
  );
};

export default Form;
