// src/admin/DashboardHome.jsx
import React from "react";

const DashboardHome = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Welcome to the Admin Dashboard
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Total Users
          </h3>
          <p className="text-gray-500 dark:text-gray-400">1,234</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Active Sessions
          </h3>
          <p className="text-gray-500 dark:text-gray-400">321</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Reports Generated
          </h3>
          <p className="text-gray-500 dark:text-gray-400">76</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;