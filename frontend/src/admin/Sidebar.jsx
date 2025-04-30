// src/admin/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const navLinkClass = ({ isActive }) =>
    isActive ? "text-blue-400 font-semibold" : "hover:text-blue-300 font-medium";

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <nav>
      <ul className="space-y-4">
  <li>
    <NavLink to="/admin/dashboard/home" className={navLinkClass}>Dashboard Home</NavLink>
  </li>
  <li>
    <NavLink to="/admin/dashboard/users" className={navLinkClass}>User Management</NavLink>
  </li>
  <li>
    <NavLink to="/admin/dashboard/analytics" className={navLinkClass}>Analytics</NavLink>
  </li>
  {/* <li>
    <NavLink to="/admin/dashboard/reports" className={navLinkClass}>Reports</NavLink>
  </li> */}
  {/* <li>
    <NavLink to="/admin/dashboard/notifications" className={navLinkClass}>Notifications</NavLink>
  </li>
  <li>
    <NavLink to="/admin/dashboard/logs" className={navLinkClass}>Activity Logs</NavLink>
  </li> */}
</ul>
      </nav>
    </div>
  );
};

export default Sidebar;