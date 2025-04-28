// src/admin/AdminNavbar.jsx
import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const AdminNavbar = () => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md p-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Admin Panel
      </h1>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>
    </nav>
  );
};

export default AdminNavbar;