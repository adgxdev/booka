"use client";

import React from "react";

interface ToggleRadioProps {
  value?: boolean;
  onToggle?: (newValue: boolean) => void;
  disabled?: boolean;
}

const RadioBtn: React.FC<ToggleRadioProps> = ({
  value,
  onToggle,
  disabled = false,
}) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
          value ? "bg-blue" : "bg-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={() => !disabled && onToggle && onToggle(!value)}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            value ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </div>
    </label>
  );
};

export default RadioBtn;