// src/components/Header.jsx
import React from "react";
import { Link } from "react-router-dom";


function Header() {
  return (
    <header className="flex items-center justify-between py-4 px-8 bg-gradient-to-r from-blue-800 to-purple-700 text-white shadow">
      <h1 className="text-3xl font-bold">Excel Analytics Dashboard</h1>
      <nav className="flex items-center space-x-6">
        <Link to="/" className="text-lg transition hover:text-gray-300">
          Home
        </Link>
        <Link to="/analysis" className="text-lg transition hover:text-gray-300">
          Analytics
        </Link>
        <Link to="/settings" className="text-lg transition hover:text-gray-300">
          Settings
        </Link>
        {/* Add the Logout Button here */}

      </nav>
    </header>
  );
}

export default Header;