// src/components/Header.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { getUserFromToken } from "../utils/auth";

function Header() {
  const navigate = useNavigate();
  const user = getUserFromToken(); // Check what this returns in the console

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between py-4 px-8 bg-blue-600 text-white">
      <h1 className="text-3xl font-bold">Excel Analytics Dashboard</h1>
      <div className="flex items-center space-x-6">
        {user && user.name ? (
          <div className="flex items-center space-x-2">
            <span className="font-medium">Hello, {user.name}</span>
          </div>
        ) : (
          <span className="font-medium">Hello, Guest</span>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;