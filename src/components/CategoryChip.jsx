// components/CategoryChip.jsx
import React from "react";

const CategoryChip = ({ category, isSelected, onClick }) => {
  return (
    <button
      onClick={() => onClick(category)}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
        isSelected
          ? "bg-blue-500 text-white border-blue-500"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
      }`}
    >
      {category}
    </button>
  );
};

export default CategoryChip;