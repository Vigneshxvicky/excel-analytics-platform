// src/components/ChartAnalysisPage.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
// Import Plotly component
import Plot from 'react-plotly.js';
// Keep Chart.js imports for 2D charts
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
  Filler,
} from "chart.js";
import Header from "./Header"; // Assuming you want the header here too

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// Helper function to get column names (assuming data is an array of objects)
const getColumnNames = (data) => {
    if (!data || data.length === 0 || typeof data[0] !== 'object' || data[0] === null) {
      return [];
    }
    return Object.keys(data[0]);
};

function ChartAnalysisPage() {
  const location = useLocation();
  const chartRef = useRef(null); // Still useful for Chart.js charts if needed
  // Get data passed via route state, default to empty array
  const data = useMemo(() => location.state?.fileData || [], [location.state]);

  const [chartType, setChartType] = useState("line"); // Default to line
  const [headers, setHeaders] = useState([]);
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [zAxis, setZAxis] = useState(""); // State for Z-axis (3D)
  const [chartData, setChartData] = useState(null); // For Chart.js
  const [plotlyConfig, setPlotlyConfig] = useState(null); // For Plotly.js

  // Helper function to extract data for a specific column
  const getColumnData = (data, columnName) => {
    if (!data || data.length === 0 || !columnName) return [];
    // Handle potential non-numeric data for Plotly (it often handles strings for categories)
    return data.map(row => row ? row[columnName] : undefined);
  };

  // Auto-detect axes logic - prioritize numeric for Y/Z
  const autoDetectAxes = (headers, data) => {
    let numericHeaders = [];
    let nonNumericHeaders = [];
    headers.forEach((header) => {
      const numericCount = data.filter((row) => {
        const val = row[header];
        return val !== "" && val !== null && !isNaN(parseFloat(val));
      }).length;
      // Consider a column numeric if >50% of its values are numeric
      if (numericCount / data.length >= 0.5) {
        numericHeaders.push(header);
      } else {
        nonNumericHeaders.push(header);
      }
    });
    return {
      xAxis: nonNumericHeaders[0] || headers[0], // Default X to first non-numeric or first overall
      yAxis: numericHeaders[0] || (headers.length > 1 ? headers[1] : headers[0]), // Default Y to first numeric or second overall
      zAxis: numericHeaders[1] || (headers.length > 2 ? headers[2] : null), // Default Z to second numeric or third overall (if exists)
    };
  };

  // Effect to initialize axes and headers
  useEffect(() => {
    if (data.length > 0) {
      const keys = getColumnNames(data);
      setHeaders(keys);
      const is3D = ['scatter3d', 'line3d', 'surface'].includes(chartType);
      // Only auto-detect if axes are not already set or if data structure changes significantly
      if (!xAxis || !yAxis || !keys.includes(xAxis) || !keys.includes(yAxis) || (is3D && (!zAxis || !keys.includes(zAxis)))) {
        const { xAxis: autoX, yAxis: autoY, zAxis: autoZ } = autoDetectAxes(keys, data);
        setXAxis(autoX || '');
        setYAxis(autoY || '');
        setZAxis(autoZ || ''); // Set default Z axis
      }
    } else {
      setHeaders([]);
      setXAxis("");
      setYAxis("");
      setZAxis("");
      setChartData(null);
      setPlotlyConfig(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]); // Rerun primarily when data changes

  // Effect to update chart config when axes, type, or data change
  useEffect(() => {
    // Clear previous configs
    setChartData(null);
    setPlotlyConfig(null);

    const is3D = ['scatter3d', 'line3d', 'surface'].includes(chartType);

    if (!data || data.length === 0 || !xAxis || !yAxis || (is3D && !zAxis)) {
      return; // Exit if essential data/axes are missing for the selected type
    }

    console.log(`[Chart Update] Type: ${chartType}, X: ${xAxis}, Y: ${yAxis}, Z: ${zAxis}`);

    const xData = getColumnData(data, xAxis);
    const yData = getColumnData(data, yAxis);
    const zData = is3D ? getColumnData(data, zAxis) : [];

    // --- Plotly 3D Chart Configs ---
    if (is3D) {
        if (!zData.length) {
            console.error("Could not extract data for Z-axis.");
            return;
        }

        // Prepare base data (allow non-numeric for Plotly's handling)
        const cleanXData = xData.map(val => val ?? null);
        const cleanYData = yData.map(val => val ?? null);
        const cleanZData = zData.map(val => val ?? null);

        let trace = {
            x: cleanXData,
            y: cleanYData,
            z: cleanZData,
            name: `${xAxis} vs ${yAxis} vs ${zAxis}` // Optional trace name
        };

        let plotTitle = `3D Plot: ${yAxis} vs ${xAxis} vs ${zAxis}`;

        // Customize based on specific 3D type
        if (chartType === 'scatter3d') {
            trace.mode = 'markers';
            trace.marker = { size: 5, color: 'rgb(23, 190, 207)' };
            trace.type = 'scatter3d';
            plotTitle = `3D Scatter Plot: ${yAxis} vs ${xAxis} vs ${zAxis}`;
        } else if (chartType === 'line3d') {
            trace.mode = 'lines+markers';
            trace.line = { color: 'rgb(255, 127, 14)', width: 2 };
            trace.marker = { size: 3, color: 'rgb(255, 127, 14)' };
            trace.type = 'scatter3d'; // Still uses scatter3d type
            plotTitle = `3D Line Plot: ${yAxis} vs ${xAxis} vs ${zAxis}`;
        } else if (chartType === 'surface') {
            // Pass Z data directly; Plotly will attempt to handle it.
            // Note: Surface plots work best with numeric Z data.
            trace.type = 'surface';
            trace.colorscale = 'Viridis';
            plotTitle = `3D Surface Plot: ${zAxis} over ${xAxis} and ${yAxis}`;
        }

        const layout = {
            title: plotTitle,
            autosize: true,
            margin: { l: 0, r: 0, b: 0, t: 40 },
            scene: {
                xaxis: { title: xAxis },
                yaxis: { title: yAxis },
                zaxis: { title: zAxis },
            },
        };
        console.log("[Plotly Config] Setting config:", { data: [trace], layout });
        setPlotlyConfig({ data: [trace], layout });

    // --- Chart.js 2D Configurations ---
    } else {
      const labels = xData; // Use xData as labels for typical charts
      const datasetValues = yData.map(val => parseFloat(val) || 0); // Ensure numeric for Chart.js datasets
      const commonDataset = { label: `${yAxis} vs ${xAxis}`, data: datasetValues };

      let newChartData;
      if (chartType === "pie") {
        // Aggregate, sort, limit logic for Pie
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
    }

  }, [data, xAxis, yAxis, zAxis, chartType]); // Include zAxis in dependencies

  // Render the correct chart type
  const renderChart = () => {
    const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } };
    const is3DType = ['scatter3d', 'line3d', 'surface'].includes(chartType);

    if (is3DType) {
        if (!plotlyConfig) {
             const message = "Select valid X, Y, and Z axes to generate 3D chart."; // Generic message
             return <p className="text-center text-gray-500 dark:text-gray-400">{message}</p>;
        }
        return (
            <Plot
                data={plotlyConfig.data}
                layout={plotlyConfig.layout}
                useResizeHandler={true}
                style={{ width: '100%', height: '100%' }} // Fill container
                config={{ responsive: true }}
            />
        );
    } else { // Handle 2D charts
        if (!chartData) {
            return <p className="text-center text-gray-500 dark:text-gray-400">Select X and Y axes to generate chart.</p>;
        }
        switch (chartType) {
          case "line": return <Line ref={chartRef} data={chartData} options={options} />;
          case "bar": return <Bar ref={chartRef} data={chartData} options={options} />;
          case "pie": return <Pie ref={chartRef} data={chartData} options={options} />;
          default: return null;
        }
    }
  };

  // Handle case where no data is passed
  if (!location.state?.fileData || data.length === 0) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
            <Header /> {/* Still show header */}
            <div className="pt-20 text-center"> {/* Add padding top */}
                <p className="mb-4">No data provided or data is empty.</p>
                <Link to="/dashboard" className="text-blue-600 hover:underline">Return to Dashboard</Link>
            </div>
        </div>
    );
  }

  const showZAxis = ['scatter3d', 'line3d', 'surface'].includes(chartType);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 mt-20 dark:text-gray-100">
      <Header /> {/* Include header */}
      <div className="flex-grow flex flex-col p-4 sm:p-6 lg:p-8 pt-20 sm:pt-24"> {/* Adjusted top padding */}

        {/* Control Panel */}
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          {/* Use grid layout, adjust columns based on chart type */}
          {/* Adjusted grid columns for better responsiveness */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${showZAxis ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 items-end`}>
            {/* Chart Type */}
            <label className="block"> <span className="font-medium text-sm">Chart Type:</span>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm dark:bg-gray-700 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="line">Line</option>
                <option value="bar">Bar</option>
                <option value="pie">Pie</option>
                <option value="scatter3d">3D Scatter</option>
                <option value="line3d">3D Line</option>
                <option value="surface">3D Surface</option>
              </select>
            </label>
            {/* X-Axis */}
            <label className="block"> <span className="font-medium text-sm">X-Axis:</span>
              <select
                value={xAxis}
                onChange={(e) => setXAxis(e.target.value)}
                className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm dark:bg-gray-700 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select...</option>
                {headers.map(h => <option key={`x-${h}`} value={h}>{h}</option>)}
              </select>
            </label>
            {/* Y-Axis */}
            <label className="block"> <span className="font-medium text-sm">Y-Axis:</span>
              <select
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value)}
                className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm dark:bg-gray-700 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select...</option>
                {headers.map(h => <option key={`y-${h}`} value={h}>{h}</option>)}
              </select>
            </label>
            {/* Z-Axis (Conditional) */}
            {showZAxis && (
              <label className="block"> <span className="font-medium text-sm">Z-Axis:</span>
                <select
                  value={zAxis}
                  onChange={(e) => setZAxis(e.target.value)}
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm dark:bg-gray-700 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select...</option>
                  {headers.map(h => <option key={`z-${h}`} value={h}>{h}</option>)}
                </select>
              </label>
            )}
          </div>
        </div>

        {/* Chart Display Area */}
        <div className="flex-grow bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          {/* Container needs explicit height for chart */}
          <div className="relative h-[65vh] w-full"> {/* Ensure full width */}
            {renderChart()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChartAnalysisPage;
