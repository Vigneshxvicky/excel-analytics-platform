// src/components/AdminDashboard.jsx
import React from "react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin header */}
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </header>
      {/* Admin content */}
      <main className="p-8">
        <h2 className="text-2xl font-bold mb-4">Welcome, Admin!</h2>
        <p>This area is reserved for administrative tasks and analytics.</p>
        {/* You can add grids, tables, or analytics charts here */}
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        &copy; {new Date().getFullYear()} Admin Panel. All rights reserved.
      </footer>
    </div>
  );
};

export default AdminDashboard;