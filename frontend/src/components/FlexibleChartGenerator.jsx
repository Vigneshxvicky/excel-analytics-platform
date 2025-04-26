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
    const pieColors = labels.map((_, idx) => `hsl(${(idx * 30) % 360}, 70%, 50%)`);
    chartData = { labels, datasets: [{ ...commonDataset, backgroundColor: pieColors }] };
  } else {
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
        return <Line ref={chartRef} data={chartData} />;
      case "bar":
        return <Bar ref={chartRef} data={chartData} />;
      case "pie":
        return <Pie ref={chartRef} data={chartData} />;
      default:
        return <Line ref={chartRef} data={chartData} />;
    }
  };

  return (
    <div className="mt-6 bg-white p-6 rounded shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Chart Preview</h3>
      <div className="mb-4">
        <label className="mr-4">
          Chart Type:
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="ml-2 border border-gray-300 rounded p-1"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
          </select>
        </label>
      </div>
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Auto-detected X‑Axis: <strong>{xAxis}</strong>
        </p>
        <p className="text-sm text-gray-600">
          Auto-detected Y‑Axis: <strong>{yAxis}</strong>
        </p>
      </div>
      <div>{renderChart()}</div>
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