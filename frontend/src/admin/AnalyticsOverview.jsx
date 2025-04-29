// src/admin/AnalyticsOverview.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const AnalyticsOverview = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Keep it active

useEffect(() => {
  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/dashboard/analytics");
      const { labels, dataset } = response.data;

      const data = {
        labels: labels,
        datasets: [
          {
            label: "User Growth",
            data: dataset,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "#36A2EB",
            borderWidth: 2,
            fill: true,
          },
        ],
      };

      setChartData(data);
      setLoading(false);
    } catch (err) {
      console.error("Server not available. Falling back to dummy data.", err);
      setError("Unable to fetch real analytics data. Showing dummy data.");

      const dummyData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        dataset: [100, 150, 200, 250, 300, 350],
      };

      const data = {
        labels: dummyData.labels,
        datasets: [
          {
            label: "User Growth (Dummy Data)",
            data: dummyData.dataset,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "#36A2EB",
            borderWidth: 2,
            fill: true,
          },
        ],
      };

      setChartData(data);
      setLoading(false);
    }
  };

  fetchAnalyticsData();
}, []);

  if (loading) return <p>Loading analytics data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Analytics Overview
      </h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <Line data={chartData} />
      </div>
    </div>
  );
};

export default AnalyticsOverview;