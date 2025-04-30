// src/admin/AdminDashboard.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import AdminNavbar from "./AdminNavbar";
import DashboardHome from "./DashboardHome";
import UserManagement from "./UserManagement"; // Ensure this import is correct
import AnalyticsOverview from "./AnalyticsOverview";
// import ReportsExport from "./ReportsExport";
// import Notifications from "./Notifications";
// import ActivityLogs from "./ActivityLogs";

const AdminDashboard = () => {
  const location = useLocation();
  // If the pathname already ends with "/home", do not redirect again.
  const shouldRedirect = !location.pathname.endsWith("/home");

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 transition-all">
      <Sidebar />
      <div className="flex flex-col flex-grow">
        <AdminNavbar />
        <div className="p-6 flex-grow">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="home" element={<DashboardHome />} /> {/* Simplified route */}
            <Route path="users" element={<UserManagement />} />
            <Route path="analytics" element={<AnalyticsOverview />} />
            {/* <Route path="reports" element={<ReportsExport />} /> */}
            {/* <Route path="notifications" element={<Notifications />} /> */}
            {/* <Route path="logs" element={<ActivityLogs />} /> */}
            {shouldRedirect && (
              <Route path="*" element={<Navigate to="home" replace />} />
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;