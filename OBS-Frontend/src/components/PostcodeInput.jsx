import React, { useState, useEffect, useRef } from "react";
import { lookupPostcode, autocompletePostcode } from "../api/postcode";

const PostcodeInput = ({
  value = "",
  onChange,
  onError,
  placeholder = "Enter postcode (e.g., NG1 4BU)",
  required = false,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState("");
  const [locationInfo, setLocationInfo] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value.toUpperCase();
    setInputValue(newValue);
    setIsValid(null);
    setError("");
    setLocationInfo(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (newValue.length >= 2) {
      debounceRef.current = setTimeout(async () => {
        const result = await autocompletePostcode(newValue);
        if (result.success && result.suggestions.length > 0) {
          setSuggestions(result.suggestions);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelectPostcode = async (postcode) => {
    setInputValue(postcode);
    setShowDropdown(false);
    setSuggestions([]);
    setIsLoading(true);

    const result = await lookupPostcode(postcode);
    setIsLoading(false);

    if (result.success && result.data.valid) {
      setIsValid(true);
      setError("");
      setLocationInfo(result.data);
      if (onChange) {
        onChange({
          postcode: result.data.formatted,
          latitude: result.data.latitude,
          longitude: result.data.longitude,
          address: result.data.displayAddress,
          area: result.data.area,
        });
      }
    } else {
      setIsValid(false);
      const errorMsg = result.data?.error || result.error || "Invalid postcode";
      setError(errorMsg);
      if (onError) onError(errorMsg);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
      if (inputValue && inputValue.length >= 5 && isValid === null) {
        handleSelectPostcode(inputValue);
      }
    }, 200);
  };

  const getBorderClass = () => {
    if (isValid === true) return "border-success";
    if (isValid === false) return "border-danger";
    return "";
  };

  return (
    <div style={{ position: "relative" }}>
      <div className="input-group">
        <input
          type="text"
          className={`form-control ${getBorderClass()}`}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder}
          required={required}
          disabled={disabled || isLoading}
          autoComplete="off"
          maxLength={10}
          aria-label="UK Postcode"
          aria-describedby="postcode-feedback"
        />
        {isLoading && (
          <span className="input-group-text">
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
            >
              <span className="visually-hidden">Validating...</span>
            </div>
          </span>
        )}
        {isValid === true && !isLoading && (
          <span className="input-group-text text-success">Valid</span>
        )}
        {isValid === false && !isLoading && (
          <span className="input-group-text text-danger">Invalid</span>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div
          className="dropdown-menu show w-100 shadow-sm"
          style={{ maxHeight: "200px", overflowY: "auto" }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="dropdown-item"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectPostcode(suggestion);
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div id="postcode-feedback" className="text-danger small mt-1">
          {error}
        </div>
      )}
      {locationInfo && isValid && (
        <div className="text-success small mt-1">
          {locationInfo.displayAddress}
        </div>
      )}
    </div>
  );
};

export default PostcodeInput;