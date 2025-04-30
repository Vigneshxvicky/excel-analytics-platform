// src/components/FlexibleChartGenerator.jsx
import React, { useState, useRef, useEffect } from "react";
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
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

function FlexibleChartGenerator({ data = [] }) {
  const chartRef = useRef(null);
  const [chartType, setChartType] = useState("line");
  const [headers, setHeaders] = useState([]);
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");

  useEffect(() => {
    if (data.length > 0) {
      const keys = Object.keys(data[0]);
      setHeaders(keys);
      const { xAxis: autoX, yAxis: autoY } = autoDetectAxes(keys, data);
      setXAxis(autoX);
      setYAxis(autoY);
    }
  }, [data]);

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

  if (!data || data.length === 0) {
    return <p className="text-gray-700">No data available to display.</p>;
  }
  if (headers.length === 0) {
    return <p className="text-gray-700">Cannot determine the data structure.</p>;
  }

  const labels = data.map((row) => row[xAxis]);
  const datasetValues = data.map((row) => {
    const value = row[yAxis];
    return typeof value === "number" ? value : parseFloat(value) || 0;
  });
  const commonDataset = { label: `${yAxis} vs ${xAxis}`, data: datasetValues };

  let chartData;
  if (chartType === "pie") {
    // Aggregate data for Pie chart
    const aggregatedData = data.reduce((acc, row) => {
      const label = row[xAxis] || "Unknown";
      const value = parseFloat(row[yAxis]) || 0;
      acc[label] = (acc[label] || 0) + value;
      return acc;
    }, {});

    // Sort and limit categories
    const sortedEntries = Object.entries(aggregatedData).sort(([, a], [, b]) => b - a);
    const topN = 10; // Show top 10 categories
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

    const pieColors = finalLabels.map((_, idx) => `hsl(${(idx * 360 / finalLabels.length) % 360}, 70%, 60%)`); // Distribute colors better
    chartData = {
      labels: finalLabels,
      datasets: [{ label: yAxis, data: finalValues, backgroundColor: pieColors }]
    };
  } else {
    // Keep original logic for Line and Bar charts
    chartData = {
      labels,
      datasets: [
        {
          ...commonDataset,
          borderColor: "rgba(13, 71, 161, 1)",
          backgroundColor: chartType === "bar" ? "rgba(13, 71, 161, 0.4)" : "rgba(13, 71, 161, 0.2)",
          fill: false,
        },
      ],
    };
  }

  const handleDownload = () => {
    const chartInstance = chartRef.current;
    if (chartInstance && chartInstance.toBase64Image) {
      const url = chartInstance.toBase64Image();
      const link = document.createElement("a");
      link.href = url;
      link.download = "chart.png";
      link.click();
    } else {
      alert("Chart is not ready for download.");
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return <Line ref={chartRef} data={chartData} options={{ maintainAspectRatio: false }} />; // Added maintainAspectRatio
      case "bar":
        return <Bar ref={chartRef} data={chartData} options={{ maintainAspectRatio: false }} />; // Added maintainAspectRatio
      case "pie":
        return <Pie ref={chartRef} data={chartData} options={{ maintainAspectRatio: false }} />; // Added maintainAspectRatio
      default:
        return <Line ref={chartRef} data={chartData} />;
    }
  };

  return (
    <div className="mt-6 bg-white p-6 rounded shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Chart Preview</h3> {/* Added dark mode text */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center"> {/* Use grid for better alignment */}
        {/* Chart Type Selection */}
        <label className="block">
          Chart Type:{" "}
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-1 dark:bg-gray-700 dark:text-gray-200" // Style select
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
          </select>
        </label>
        {/* X-Axis Selection */}
        <label className="block">
          X-Axis (Labels):{" "}
          <select
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
            className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-1 dark:bg-gray-700 dark:text-gray-200" // Style select
          >
            {headers.map(header => <option key={header} value={header}>{header}</option>)}
          </select>
        </label>
        {/* Y-Axis Selection */}
        <label className="block">
          Y-Axis (Values):{" "}
          <select
            value={yAxis}
            onChange={(e) => setYAxis(e.target.value)}
            className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-1 dark:bg-gray-700 dark:text-gray-200" // Style select
          >
            {headers.map(header => <option key={header} value={header}>{header}</option>)}
          </select>
        </label>
        {/* Moved axis info here */}
        <div className="text-sm text-gray-600">
         <p>
          Auto-detected X‑Axis: <strong>{xAxis}</strong>
         </p>
         <p>
          Auto-detected Y‑Axis: <strong>{yAxis}</strong>
         </p>
        </div>
      </div>
      <div className="relative h-64 md:h-96">{renderChart()}</div> {/* Set height for chart container */}
      <button
        onClick={handleDownload}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
      >
        Download Chart as PNG
      </button>
    </div>
  );
}

export default FlexibleChartGenerator;