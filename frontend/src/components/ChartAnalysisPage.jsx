// src/components/ChartAnalysisPage.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Ensure Filler is registered if using fill: true
} from "chart.js";
import Header from "./Header"; // Assuming you want the header here too

// Register necessary components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

function ChartAnalysisPage() {
  const location = useLocation();
  const chartRef = useRef(null);
  // Get data passed via route state, default to empty array
  const data = useMemo(() => location.state?.fileData || [], [location.state]);

  const [chartType, setChartType] = useState("line");
  const [headers, setHeaders] = useState([]);
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [chartData, setChartData] = useState(null);

  // Auto-detect axes logic (same as FlexibleChartGenerator)
  const autoDetectAxes = (headers, data) => {
    let numericHeader = null;
    let nonNumericHeader = null;
    headers.forEach((header) => {
      const numericCount = data.filter((row) => {
        const val = row[header];
        return val !== "" && !isNaN(parseFloat(val));
      }).length;
      if (numericCount / data.length >= 0.5) {
        if (!numericHeader) numericHeader = header;
      } else {
        if (!nonNumericHeader) nonNumericHeader = header;
      }
    });
    return {
      xAxis: nonNumericHeader || headers[0],
      yAxis: numericHeader || (headers.length > 1 ? headers[1] : headers[0]),
    };
  };

  // Effect to initialize axes and headers
  useEffect(() => {
    if (data.length > 0) {
      const keys = Object.keys(data[0]);
      setHeaders(keys);
      if (!xAxis || !yAxis) { // Only auto-detect if not already set
        const { xAxis: autoX, yAxis: autoY } = autoDetectAxes(keys, data);
        setXAxis(autoX);
        setYAxis(autoY);
      }
    } else {
      setHeaders([]);
      setXAxis("");
      setYAxis("");
    }
  }, [data]); // Rerun if data changes

  // Effect to update chart data when axes or data change
  useEffect(() => {
    if (!data || data.length === 0 || !xAxis || !yAxis) {
      setChartData(null);
      return;
    }

    const labels = data.map((row) => row[xAxis]);
    const datasetValues = data.map((row) => parseFloat(row[yAxis]) || 0);
    const commonDataset = { label: `${yAxis} vs ${xAxis}`, data: datasetValues };

    let newChartData;
    if (chartType === "pie") {
      // Aggregate, sort, limit logic for Pie (copied from FlexibleChartGenerator)
      const aggregatedData = data.reduce((acc, row) => {
        const label = row[xAxis] || "Unknown";
        const value = parseFloat(row[yAxis]) || 0;
        acc[label] = (acc[label] || 0) + value;
        return acc;
      }, {});
      const sortedEntries = Object.entries(aggregatedData).sort(([, a], [, b]) => b - a);
      const topN = 10;
      let finalLabels = [];
      let finalValues = [];
      if (sortedEntries.length > topN) {
        const topEntries = sortedEntries.slice(0, topN);
        const otherSum = sortedEntries.slice(topN).reduce((sum, [, value]) => sum + value, 0);
        finalLabels = [...topEntries.map(([label]) => label), "Other"];
        finalValues = [...topEntries.map(([, value]) => value), otherSum];
      } else {
        finalLabels = sortedEntries.map(([label]) => label);
        finalValues = sortedEntries.map(([, value]) => value);
      }
      const pieColors = finalLabels.map((_, idx) => `hsl(${(idx * 360 / finalLabels.length) % 360}, 70%, 60%)`);
      newChartData = { labels: finalLabels, datasets: [{ label: yAxis, data: finalValues, backgroundColor: pieColors }] };
    } else {
      // Line and Bar chart data
      newChartData = {
        labels,
        datasets: [{
          ...commonDataset,
          borderColor: "rgba(75, 192, 192, 1)", // Example color
          backgroundColor: chartType === "bar" ? "rgba(75, 192, 192, 0.6)" : "rgba(75, 192, 192, 0.2)",
          fill: chartType === "line", // Fill only for line chart
          tension: 0.1
        }],
      };
    }
setChartData(newChartData);

  }, [data, xAxis, yAxis, chartType]);

  // Render the correct chart type
  const renderChart = () => {
    if (!chartData) return <p className="text-center text-gray-500 dark:text-gray-400">Select axes to generate chart.</p>;
    const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } };
    switch (chartType) {
      case "line": return <Line ref={chartRef} data={chartData} options={options} />;
      case "bar": return <Bar ref={chartRef} data={chartData} options={options} />;
      case "pie": return <Pie ref={chartRef} data={chartData} options={options} />;
      default: return null;
    }
  };

  if (!location.state?.fileData) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
            <p className="mb-4">No data provided for analysis.</p>
            <Link to="/dashboard" className="text-blue-600 hover:underline">Return to Dashboard</Link>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header /> {/* Include header */}
      <div className="flex-grow flex flex-col p-4 sm:p-6 mt-9 lg:p-8 pt-20 sm:pt-24">
        {/* Controls Section */}
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Chart Type */}
            <label className="block"> <span className="font-medium">Chart Type:</span>
              <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-1 dark:bg-gray-700 dark:text-gray-200">
                <option value="line">Line</option> <option value="bar">Bar</option> <option value="pie">Pie</option>
              </select>
            </label>
            {/* X-Axis */}
            <label className="block"> <span className="font-medium">X-Axis:</span>
              <select value={xAxis} onChange={(e) => setXAxis(e.target.value)} className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-1 dark:bg-gray-700 dark:text-gray-200">
                <option value="">Select...</option> {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </label>
            {/* Y-Axis */}
            <label className="block"> <span className="font-medium">Y-Axis:</span>
              <select value={yAxis} onChange={(e) => setYAxis(e.target.value)} className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-1 dark:bg-gray-700 dark:text-gray-200">
                <option value="">Select...</option> {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </label>
          </div>
        </div>

        {/* Chart Display Area */}
        <div className="flex-grow bg-white dark:bg-gray-800 p-4 rounded-lg  shadow-md">
          {/* Container needs explicit height for chart */}
          <div className="relative h-[65vh]">
            {renderChart()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChartAnalysisPage;