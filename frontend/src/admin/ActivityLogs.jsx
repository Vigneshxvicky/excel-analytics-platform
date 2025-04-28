// src/admin/ActivityLogs.jsx
import React from "react";

const ActivityLogs = () => {
  const logs = [
    "Admin logged in - 10:00 AM",
    "User John Doe registered - 10:15 AM",
    "Database updated - 11:30 AM",
    "Report generated - 1:00 PM",
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Activity Logs
      </h2>
      <ul className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {logs.map((log, index) => (
          <li key={index} className="border-b p-2">
            {log}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityLogs;