// src/admin/AnalyticsOverview.jsx
import React, { useState, useEffect, useRef } from "react"; // Added useRef
import axios from "axios";
import io from 'socket.io-client'; // Import socket.io

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip, // Added for better interaction
  Legend   // Added for better interaction
} from "chart.js";

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const SOCKET_SERVER_URL = 'http://localhost:5000'; // Backend URL


const AnalyticsOverview = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Keep it active
  const socketRef = useRef(null); // Use ref for socket instance


  // Function to fetch data - reusable
  const fetchAnalyticsData = async () => {
    // Keep loading true while fetching new data after initial load? Maybe not needed.
    // setLoading(true);
    setError(null); // Clear previous errors on refetch
    try {
      const token = localStorage.getItem('authToken'); // Get token
      if (!token) throw new Error('No auth token found for analytics');

      const response = await axios.get(`${SOCKET_SERVER_URL}/api/dashboard/analytics`, {
        headers: { Authorization: `Bearer ${token}` } // Add auth header
      });
      // Check if response.data exists and has the expected properties
      if (!response.data || typeof response.data.labels === 'undefined' || typeof response.data.dataset === 'undefined') {
        throw new Error('Invalid data structure received from analytics endpoint');
      }
      const { labels, dataset } = response.data;

      const data = {
        labels: labels,
        datasets: [
          {
            label: "Cumulative User Growth (Current Year)", // Updated label
            data: dataset,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "#36A2EB",
            borderWidth: 2,
            fill: true,
            tension: 0.1 // Slight curve
          },
        ],
      };

      setChartData(data);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError(err.message || "Unable to fetch analytics data.");
      setChartData(null); // Clear chart data on error
    } finally {
       // Only set loading false on initial load
       if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAnalyticsData();

    // Setup Socket.IO connection
    // Disconnect previous socket if it exists (e.g., due to HMR)
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    socketRef.current = io(SOCKET_SERVER_URL);
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected for analytics updates');
    });

    // Listen for updates (e.g., when stats change, indicating new user/upload)
    socket.on('statsUpdate', () => {
      console.log('Received statsUpdate event, refetching analytics data...');
      fetchAnalyticsData(); // Refetch data when stats are updated
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected for analytics');
    });

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Empty dependency array: run only on mount and unmount

  // Render states
  if (loading) return <p className="text-center mt-4">Loading analytics data...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Analytics Overview
      </h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {error && <p className="text-center my-4 text-red-500">Error: {error}</p>}
        {chartData ? (
          <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        ) : (
          !error && <p className="text-center my-4">No analytics data available.</p> // Show only if no error
        )}
      </div>
    </div>
  );
};

export default AnalyticsOverview;
