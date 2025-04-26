// src/components/CustomFileInput.jsx
import React, { useRef } from "react";

function CustomFileInput({ onFileSelected }) {
  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current && inputRef.current.click();
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div>
      {/* A button that triggers the hidden file input */}
      <button
        onClick={handleClick}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
      >
        Choose File
      </button>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

export default CustomFileInput;