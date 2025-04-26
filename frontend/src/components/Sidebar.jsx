// src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-gray-200 h-full p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Dashboard</h2>
      </div>
      <ul className="space-y-4">
        <li>
          <Link to="/" className="hover:text-white transition duration-200">
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/analytics"
            className="hover:text-white transition duration-200"
          >
            Analytics
          </Link>
        </li>
        <li>
          <Link
            to="/reports"
            className="hover:text-white transition duration-200"
          >
            Reports
          </Link>
        </li>
        <li>
          <Link
            to="/settings"
            className="hover:text-white transition duration-200"
          >
            Settings
          </Link>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;