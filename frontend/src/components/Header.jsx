// src/components/Header.jsx
import React, { useContext } from "react"; // Import useContext
import { useNavigate } from "react-router-dom";
import { getUserFromToken } from "../utils/auth";
import { Link } from "react-router-dom"; // Import Link for navigation
import { ThemeContext } from "../context/ThemeContext"; // Import ThemeContext

function Header({ onMenuToggle }) { // Accept onMenuToggle prop
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useContext(ThemeContext); // Get theme context
  const user = getUserFromToken(); // Check what this returns in the console
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "?";
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <header className="flex flex-col sm:flex-row items-center justify-between py-3 px-4 sm:px-8 bg-blue-600 text-white shadow-md fixed top-0 left-0 right-0 z-20 h-16"> {/* Added fixed, z-20, h-16 */}
      <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
        {/* Burger Menu Button - visible on all screens for this example */}
        {/* <button onClick={onMenuToggle} className="mr-4 p-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button> */}
        {/* Title */} 
        {/* Controls Section */}
                <div className="mb-4 mt-4">
                    <Link to="/dashboard" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-700 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                        &larr; Back to Dashboard
                    </Link>
                </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center pl-80   sm:text-left">Excel Analytics</h1>
      </div>
      <div className="flex items-center space-x-4 sm:space-x-6">
        {/* Dark Mode Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          // Adjusted styling slightly for header context
          className="bg-blue-500 dark:bg-gray-700 text-white dark:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-blue-400 dark:hover:bg-gray-600 text-sm transition-colors"
        >
          {darkMode ? "☀️" : "🌙"} {/* Simplified icon display */}
        </button>
        {/* User Initial Icon */}
        {user && user.name ? (
          <div className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-500 text-white font-bold text-sm sm:text-lg" title={user.name}>
            {userInitial}
          </div>
        ) : (
          // Placeholder if no user/name
          <div className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-500 text-white font-bold text-sm sm:text-lg">
            ?
          </div>
        )}
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 py-1 px-3 sm:py-2 sm:px-4 rounded text-sm sm:text-base" // Smaller button on mobile
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;