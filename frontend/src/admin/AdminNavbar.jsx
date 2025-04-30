  // src/admin/AdminNavbar.jsx
  import React, { useContext } from "react";
  import { useNavigate } from "react-router-dom"; // Import useNavigate
  import { ThemeContext } from "../context/ThemeContext";

  const AdminNavbar = () => {
    const { darkMode, setDarkMode } = useContext(ThemeContext);
    const navigate = useNavigate(); // Initialize navigate

    // Logout handler
    const handleLogout = () => {
      // Use the same key you used in LoginForm to store the token
      localStorage.removeItem("authToken"); // Or "token" if that's the key
      navigate("/login"); // Redirect to login page
    };

    return (
      <nav className="bg-white dark:bg-gray-900 shadow-md p-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Admin Panel
        </h1>
        {/* Container for right-side buttons */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm transition-colors" // Adjusted styling
          >
            {darkMode ? "🌙 Light" : "☀️ Dark"} {/* Simplified icon display */}
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors" // Logout button styling
          >
            Logout
          </button>
        </div>
      </nav>
    );
  };

  export default AdminNavbar;