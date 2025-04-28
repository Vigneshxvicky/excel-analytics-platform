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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Attempt to fetch from your server (this will likely fail since you don't have an endpoint)
        const response = await axios.get("http://localhost:5000/api/dashboard/analytics");
        // Assuming the response data is structured like:
        // { labels: ["Jan", "Feb", ...], dataset: [/* corresponding values */] }
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

        // Fallback dummy data since no server endpoint is available
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