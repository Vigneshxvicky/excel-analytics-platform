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

const SOCKET_SERVER_URL = 'https://excel-analytics-platform-backend.onrender.com'; // Backend URL


const AnalyticsOverview = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Keep it active
  const [totalUsers, setTotalUsers] = useState(0); // State for total user count
  const [timeRange, setTimeRange] = useState('30d'); // Add state for time range, default to 30d
  const socketRef = useRef(null); // Use ref for socket instance

  // --- Data Processing Function ---
  // Function to fetch data - now accepts timeRange
  const fetchAnalyticsData = async () => {
    // Keep loading true while fetching new data after initial load? Maybe not needed.
    // setLoading(true);
    setError(null); // Clear previous errors on refetch
    try {
      const token = localStorage.getItem('authToken'); // Get token
      if (!token) throw new Error('No auth token found for analytics');

      // Fetch the full user list
      const response = await axios.get(`${SOCKET_SERVER_URL}/api/dashboard/users`, {
        headers: { Authorization: `Bearer ${token}` } // Add auth header
      });

      // Log the received data structure for debugging
      console.log("User List API Response Data:", response.data);

      // Check if response.data.users exists and is an array
      if (!response.data || !response.data.success || !Array.isArray(response.data.users)) {
        throw new Error('Invalid data structure received from users endpoint');
      }

      const users = response.data.users;
      setTotalUsers(users.length); // Update total user count

      // --- Process user data based on timeRange ---
      let startDate = new Date();
      let labelFormat = (date) => date.toISOString().split('T')[0]; // Default label format YYYY-MM-DD
      let groupByUnit = 'day'; // 'day' or 'hour'

      switch (timeRange) {
        case '1d':
          startDate.setDate(startDate.getDate() - 1);
          labelFormat = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); // HH:MM
          groupByUnit = 'hour'; // Group by hour for 1 day view
          break;
        case '7d':
          startDate.setUTCDate(startDate.getUTCDate() - 7); // Use UTC dates
          break; // Default group by day
        case '30d':
        default: // Default to 30 days
          startDate.setDate(startDate.getDate() - 30); // Default group by day
          break;
      }
      startDate.setUTCHours(0, 0, 0, 0); // Use UTC hours for start of period
      console.log(`[Analytics] Start Date (UTC): ${startDate.toISOString()}, Time Range: ${timeRange}, Group By: ${groupByUnit}`);

      // Filter users within the time range
      const filteredUsers = users.filter(user => user.createdAt && new Date(user.createdAt) >= startDate); // Add check for createdAt existence
      console.log(`[Analytics] Total Users: ${users.length}, Filtered Users (in range): ${filteredUsers.length}`);


      // Group users by day or hour
      const countsByPeriod = filteredUsers.reduce((acc, user) => {
        const createdAt = new Date(user.createdAt);
        // Ensure createdAt is a valid date before processing
        if (isNaN(createdAt.getTime())) return acc;

        let key;
        if (groupByUnit === 'hour') {
          key = new Date(Date.UTC(createdAt.getUTCFullYear(), createdAt.getUTCMonth(), createdAt.getUTCDate(), createdAt.getUTCHours())).toISOString(); // Use UTC components for key
        } else { // 'day'
          key = new Date(Date.UTC(createdAt.getUTCFullYear(), createdAt.getUTCMonth(), createdAt.getUTCDate())).toISOString(); // Use UTC components for key
        }
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      // Log the grouped counts
      console.log("[Analytics] Counts By Period:", countsByPeriod);

      // Generate labels and cumulative dataset for the period
      const labels = [];
      const dataset = []; // This will store the cumulative count for each point in time

      // Start cumulative count at 0 for the selected period
      let cumulativeCount = 0;
      let currentDate = new Date(startDate); // Start date (beginning of the period)
      const loopEndDate = new Date(); // Today's date

      // Adjust loopEndDate based on groupByUnit to ensure we cover the *start* of the last period
      if (groupByUnit === 'hour') {
          loopEndDate.setUTCMinutes(0, 0, 0); // Use UTC
      } else { // day
          loopEndDate.setUTCHours(0, 0, 0, 0); // Use UTC
      }

      // If the first label needs a starting point before the first increment
      // labels.push(labelFormat(new Date(currentDate)));
      // dataset.push(initialCumulativeCount); // Start the dataset with the initial count

      while (currentDate <= loopEndDate) { // Loop up to the start of the last period
        labels.push(labelFormat(new Date(currentDate))); // Format the start of the period

        // Key for looking up counts corresponds to the start of the period
        const key = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(), (groupByUnit === 'hour' ? currentDate.getUTCHours() : 0))).toISOString(); // Use UTC components for lookup key

        const countForPeriod = countsByPeriod[key] || 0;
        cumulativeCount += countForPeriod; // Add users registered *during* this period
        dataset.push(cumulativeCount); // Push the *cumulative* count
        // Increment to the start of the next period
        if (groupByUnit === 'hour') {
            currentDate.setHours(currentDate.getHours() + 1);
        } else { // day
            currentDate.setDate(currentDate.getDate() + 1);
        } // Note: Local setDate/setHours is okay for iteration control, key generation uses UTC
      }

      const data = {
        labels: labels,
        datasets: [
          { // Consider making the label dynamic based on timeRange if needed
            label: `User Growth During Period`, // Changed label
            data: dataset,
            backgroundColor: "rgba(54, 162, 235, 0.2)", // Lighter fill
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

  // Effect for initial fetch and socket connection
  useEffect(() => {
    // Initial fetch
    fetchAnalyticsData();

    // --- Socket.IO Setup (remains the same) ---

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

    // Listen for new user event
    socket.on('newUser', () => { // Changed from 'statsUpdate'
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
  }, []); // Run only on mount and unmount for socket setup

  // Effect to refetch data when timeRange changes
  useEffect(() => {
    // Don't refetch on initial load if the first useEffect already did
    if (!loading) {
        fetchAnalyticsData();
    }
  }, [timeRange, loading]); // Add loading to prevent double fetch on mount

  // Render states
  if (loading) return <p className="text-center mt-4">Loading analytics data...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Analytics Overview
      </h2>
      {/* Time Range Selection Buttons */}
      <div className="mb-4 flex justify-center space-x-2">
        <button
          onClick={() => setTimeRange('1d')}
          className={`px-3 py-1 rounded text-sm ${timeRange === '1d' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'}`}
        >
          1 Day
        </button>
        <button
          onClick={() => setTimeRange('7d')}
          className={`px-3 py-1 rounded text-sm ${timeRange === '7d' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'}`}
        >
          7 Days
        </button>
        <button
          onClick={() => setTimeRange('30d')}
          className={`px-3 py-1 rounded text-sm ${timeRange === '30d' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'}`}
        >
          30 Days
        </button>
      </div>
      {/* Display Total Users */}
      {chartData && chartData.datasets && chartData.datasets[0]?.data?.length > 0 && (
        <div className="mb-4 text-center"> {/* Use totalUsers state */}
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Users: </span> {/* Changed label slightly */}
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400"> {totalUsers}
          </span>
        </div>
      )}
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
  