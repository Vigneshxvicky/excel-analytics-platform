// src/admin/DashboardHome.jsx
import React, { useState, useEffect } from "react";
import axios from 'axios';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'https://excel-analytics-platform-backend.onrender.com'; // Your backend URL

const DashboardHome = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    activeConnections: 0, // Renamed from activeSessions for clarity
    uploadCount: 0,       // Renamed from reportsGenerated
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Fetch initial stats
    const fetchInitialStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No auth token found');

        const response = await axios.get(`${SOCKET_SERVER_URL}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setStats(response.data.stats);
        } else {
          throw new Error(response.data.message || 'Failed to fetch stats');
        }
      } catch (err) {
        console.error("Error fetching initial stats:", err);
        setError(err.message || 'Could not load dashboard stats.');
        // Optionally set default/dummy stats here if needed
      } finally {
        setLoading(false);
      }
    };

    fetchInitialStats();

    // 2. Setup Socket.IO connection and listeners
    const socket = io(SOCKET_SERVER_URL);

    socket.on('statsUpdate', (newStats) => {
      console.log('Received stats update:', newStats);
      setStats(newStats);
    });

    // 3. Cleanup
    return () => {
      socket.disconnect();
    };

  }, []); // Run only on mount

  // Display loading or error state
  if (loading) return <p className="text-center mt-4">Loading dashboard data...</p>;
  if (error) return <p className="text-center mt-4 text-red-500">Error: {error}</p>;

  // Render the dashboard with dynamic data
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
          <p className="text-gray-500 dark:text-gray-400 text-2xl font-bold">{stats.userCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Active Connections
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-2xl font-bold">{stats.activeConnections}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Total Uploads
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-2xl font-bold">{stats.uploadCount}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;