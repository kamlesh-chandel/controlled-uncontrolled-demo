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

const Form = () => {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("India");

  const handleCityChange = (e) => {
    setCity(e.target.value);
    Object.entries(countryList).forEach(([key, cities]) => {
      if (cities.includes(e.target.value)) {
        setCountry(key);
      }
    });
  };

  return (
    <form>
      <h6>Form State (Country): {country}</h6>
      <div>
        <label htmlFor="city">City</label>
        <input value={city} id="city" onChange={handleCityChange} />
      </div>
      <UniversalSelect
        options={Object.keys(countryList)}
        onChange={setCountry}
        value={country}
      />
    </form>
  );
};

export default Form;
