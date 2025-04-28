// src/admin/Notifications.jsx
import React, { useState, useEffect } from "react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          message: "New user registered!",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Notifications
      </h2>
      <ul className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {notifications.map((notif) => (
          <li key={notif.id} className="border-b p-2">
            {notif.message}{" "}
            <span className="text-gray-500">{notif.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;