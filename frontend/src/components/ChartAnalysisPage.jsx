// src/components/ChartAnalysisPage.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import Plot from 'react-plotly.js'; // Import Plotly
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
  const plotlyRef = useRef(null); // Ref for Plotly component if needed
  // Get data passed via route state, default to empty array
  const data = useMemo(() => location.state?.fileData || [], [location.state]);

  const [chartType, setChartType] = useState("line");
  const [headers, setHeaders] = useState([]);
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [chartData, setChartData] = useState(null);
  const [chartTitle, setChartTitle] = useState(""); // State for custom chart title

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
        setChartTitle(`${autoY} vs ${autoX}`); // Set initial title based on auto-detected axes
      }
    } else {
      setHeaders([]);
      setXAxis("");
      setYAxis("");
    }
  }, [data, xAxis, yAxis]); // Rerun if data, xAxis, or yAxis changes

  // Effect to update chart data when axes or data change
  useEffect(() => {
    if (!data || data.length === 0 || !xAxis || !yAxis) {
      setChartData(null);
      return;
    }

    // Update default title if axes change and title hasn't been manually set or matches old default
    if (!chartTitle || chartTitle === `${yAxis} vs ${xAxis}` || chartTitle.includes("vs")) { // Basic check if it looks like a default title
        setChartTitle(`${yAxis} vs ${xAxis}`);
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
      // Line, Bar, and data structure for 3D Bar chart data
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

    // Options for Chart.js (2D charts)
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { // Add title plugin configuration
                display: !!chartTitle, // Show title only if it's not empty
                text: chartTitle,
                font: { size: 16 },
                color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#1F2937' // Adjust color for dark/light mode
            }
        }
    };

    // Config for Plotly (3D charts)
    if (chartType === 'bar3d') {
        const trace = {
            x: chartData.labels, // Use labels from chartData
            y: Array(chartData.labels.length).fill(1), // Assign a constant y for a single row of bars
            z: chartData.datasets[0].data, // Use values from chartData
            type: 'bar3d',
            marker: { color: 'rgba(75, 192, 192, 0.8)' } // Example color
        };
        // Basic layout - customize scene axes titles etc. as needed
        const layout = {
            title: chartTitle,
            margin: { l: 0, r: 0, b: 0, t: chartTitle ? 40 : 0 }, // Adjust top margin for title
            scene: {
                xaxis: { title: xAxis },
                yaxis: { title: '' }, // Y is constant here, so no title needed
                zaxis: { title: yAxis }
            },
            paper_bgcolor: document.documentElement.classList.contains('dark') ? '#1F2937' : '#FFFFFF', // Match background
            plot_bgcolor: document.documentElement.classList.contains('dark') ? '#1F2937' : '#FFFFFF',
            font: {
                color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#1F2937' // Match font color
            }
        };
        // Use useResizeDetector or similar if perfect responsiveness is needed, Plotly's default is good but not always perfect
        return <Plot ref={plotlyRef} data={[trace]} layout={layout} style={{ width: '100%', height: '100%' }} config={{responsive: true}} />;
    }

    switch (chartType) {
      case "line": return <Line ref={chartRef} data={chartData} options={options} />;
      case "bar": return <Bar ref={chartRef} data={chartData} options={options} />;
      case "pie": return <Pie ref={chartRef} data={chartData} options={options} />;
      default: return null;
    }
  };

  // Function to handle chart download
  const handleDownload = async () => {
    let url;
    const filenameBase = chartTitle ? chartTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'chart';
    const filename = `${filenameBase}.png`;

    if (chartType === 'bar3d' && plotlyRef.current) {
        // Use Plotly's download method
        const plotlyInstance = plotlyRef.current.el; // Get the underlying DOM element
        // Ensure Plotly global is available (it should be if react-plotly.js is loaded)
        if (plotlyInstance && window.Plotly) {
            url = await window.Plotly.toImage(plotlyInstance, { format: 'png', width: plotlyInstance.offsetWidth, height: plotlyInstance.offsetHeight });
        }
    } else if (chartRef.current) {
        // Use Chart.js method
        url = chartRef.current.toBase64Image('image/png', 1);
    }

    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link); // Required for Firefox
      link.click();
      document.body.removeChild(link); // Clean up
    } else {
      alert("Chart is not ready for download or download failed.");
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

        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"> {/* Adjusted grid for title */}
            {/* Chart Type */}
            <label className="block"> <span className="font-medium">Chart Type:</span>
              <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-1 dark:bg-gray-700 dark:text-gray-200">
                <option value="line">Line</option> <option value="bar">Bar</option> <option value="pie">Pie</option> <option value="bar3d">3D Bar</option> {/* Added 3D Bar */}
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
            {/* Chart Title Input */}
            <label className="block sm:col-span-2 lg:col-span-1"> {/* Allow title to span more on smaller screens */}
              <span className="font-medium">Chart Title:</span>
              <input
                type="text"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                placeholder="Enter chart title"
                className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-1 dark:bg-gray-700 dark:text-gray-200"
              />
            </label>
          </div>
        </div>

        {/* Chart Display Area */}
        <div className="flex-grow bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col">
          {/* Container needs explicit height for chart */}
          <div className="relative flex-grow h-[60vh]"> {/* Adjusted height slightly */}
            {renderChart()}
          </div>
          {/* Download Button */}
          <div className="mt-4 text-right"> {/* Position button */}
            <button
              onClick={handleDownload}
              disabled={!chartData} // Disable if no chart data
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded shadow-md transition duration-200"
            >
              Download Chart (PNG)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChartAnalysisPage;
