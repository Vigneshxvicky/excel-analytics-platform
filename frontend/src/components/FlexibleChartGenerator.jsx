// src/components/FlexibleChartGenerator.jsx
import React, { useState, useRef, useEffect } from 'react';
// Import Plotly component
import Plot from 'react-plotly.js';
// Keep Chart.js imports if you still need them for 2D charts
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, // Keep if using Chart.js for 2D
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement, // For Pie charts
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate

// Register Chart.js components (if still using Chart.js for 2D)
ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend
  // Add Filler if you use fill: true for line charts
);

// Helper function to get column names (assuming data is an array of objects)
const getColumnNames = (data) => {
  if (!data || data.length === 0 || typeof data[0] !== 'object' || data[0] === null) {
    return [];
  }
  return Object.keys(data[0]);
};

function FlexibleChartGenerator({ data = [] }) { // Added default value for data
  const navigate = useNavigate(); // Hook for navigation
  const chartRef = useRef(null); // Keep chartRef
  // --- State for Chart Configuration ---
  const [chartType, setChartType] = useState('bar'); // Default chart type
  const [xAxisColumn, setXAxisColumn] = useState('');
  const [yAxisColumn, setYAxisColumn] = useState('');
  const [zAxisColumn, setZAxisColumn] = useState(''); // Add state for Z-axis (for 3D)
  // const [bubbleSizeColumn, setBubbleSizeColumn] = useState(''); // State for bubble size axis - REMOVED
  const [chartConfig, setChartConfig] = useState(null);
  const [plotlyConfig, setPlotlyConfig] = useState(null); // State for Plotly config

  // --- Get Column Names ---
  const columns = getColumnNames(data);

  // Helper function to extract data for a specific column (can be reused)
  const getColumnData = (data, columnName) => {
    if (!data || data.length === 0 || !columnName) return [];
    // Handle potential non-numeric data for Plotly (it often handles strings for categories)
    return data.map(row => row ? row[columnName] : undefined);
  };

  // Auto-detect axes logic (similar to ChartAnalysisPage)
  const autoDetectAxes = (headers, data) => {
    let numericHeaders = [];
    let nonNumericHeaders = [];
    headers.forEach((header) => {
      const numericCount = data.filter((row) => {
        const val = row[header];
        return val !== "" && val !== null && !isNaN(parseFloat(val));
      }).length;
      if (numericCount / data.length >= 0.5) {
        numericHeaders.push(header);
      } else {
        nonNumericHeaders.push(header);
      }
    });
    return {
      xAxis: nonNumericHeaders[0] || headers[0],
      yAxis: numericHeaders[0] || (headers.length > 1 ? headers[1] : headers[0]),
      zAxis: numericHeaders[1] || (headers.length > 2 ? headers[2] : null),
      // bubbleSize: numericHeaders[2] || (headers.length > 3 ? headers[3] : null), // REMOVED
    };
  };

  // --- Effects to Set Default Axes and Generate Chart ---
  useEffect(() => {
    if (columns.length > 0) {
      // Use auto-detect logic for smarter defaults
      const { xAxis: autoX, yAxis: autoY, zAxis: autoZ } = autoDetectAxes(columns, data); // Removed autoBubble
      if (!xAxisColumn || !columns.includes(xAxisColumn)) setXAxisColumn(autoX || '');
      if (!yAxisColumn || !columns.includes(yAxisColumn)) setYAxisColumn(autoY || '');
      if (!zAxisColumn || !columns.includes(zAxisColumn)) setZAxisColumn(autoZ || '');
      // if (!bubbleSizeColumn || !columns.includes(bubbleSizeColumn)) setBubbleSizeColumn(autoBubble || ''); // REMOVED

    } else {
      // Reset if no data/columns
      setXAxisColumn('');
      setYAxisColumn('');
      setZAxisColumn('');
      // setBubbleSizeColumn(''); // REMOVED
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]); // Rerun primarily when data changes

  useEffect(() => {
    // Generate chart config when type or axes change, and data is valid
    // Check for Z axis if any 3D type is selected
    const is3D = ['scatter3d', 'line3d', 'surface'].includes(chartType); // Updated list
    if (data && data.length > 0 && xAxisColumn && yAxisColumn && (!is3D || zAxisColumn)) {
      generateChartConfig();
    } else { // Clear config if data/axes are invalid
      setChartConfig(null);
      setPlotlyConfig(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, chartType, xAxisColumn, yAxisColumn, zAxisColumn]); // Removed bubbleSizeColumn dependency

  // --- Chart Generation Logic ---
  const generateChartConfig = () => {
    setChartConfig(null); // Clear previous configs
    setPlotlyConfig(null);

    const xData = getColumnData(data, xAxisColumn);
    const yData = getColumnData(data, yAxisColumn);
    // Get Z data if it's any 3D type requiring it
    const is3D = ['scatter3d', 'line3d', 'surface'].includes(chartType); // Updated list
    const zData = is3D ? getColumnData(data, zAxisColumn) : [];

    if (!xData.length || !yData.length) {
      console.error("Invalid data for selected axes.");
      // Optionally set an error state to display to the user
      return;
    }

    // --- Plotly 3D Chart Configs ---
    if (is3D) {
        if (!zAxisColumn || !zData.length) {
            console.error("Z-axis column is required for 3D plots.");
            return;
        }

        // Prepare base data (allow non-numeric for Plotly's handling)
        const cleanXData = xData.map(val => val ?? null);
        const cleanYData = yData.map(val => val ?? null);
        const cleanZData = zData.map(val => val ?? null);

        let trace = {
            x: cleanXData,
            y: cleanYData,
            z: cleanZData, // Z data is crucial for surface
            // type will be set below
            name: `${xAxisColumn} vs ${yAxisColumn} vs ${zAxisColumn}` // Optional trace name
        };

        let plotTitle = `3D Plot: ${yAxisColumn} vs ${xAxisColumn} vs ${zAxisColumn}`;

        // Customize based on specific 3D type
        if (chartType === 'scatter3d') {
            trace.mode = 'markers';
            trace.marker = { size: 5, color: 'rgb(23, 190, 207)' };
            trace.type = 'scatter3d';
            plotTitle = `3D Scatter Plot: ${yAxisColumn} vs ${xAxisColumn} vs ${zAxisColumn}`;
        } else if (chartType === 'line3d') {
            trace.mode = 'lines+markers'; // Or just 'lines'
            trace.line = { color: 'rgb(255, 127, 14)', width: 2 };
            trace.marker = { size: 3, color: 'rgb(255, 127, 14)' }; // Smaller markers for line plot
            trace.type = 'scatter3d'; // Still uses scatter3d type
            plotTitle = `3D Line Plot: ${yAxisColumn} vs ${xAxisColumn} vs ${zAxisColumn}`;
        } else if (chartType === 'surface') {
            // Pass Z data directly; Plotly will attempt to handle it.
            // Note: Surface plots work best with numeric Z data.
            // Surface plot specific configuration
            trace.type = 'surface';
            trace.colorscale = 'Viridis'; // Example colorscale
            plotTitle = `3D Surface Plot: ${zAxisColumn} over ${xAxisColumn} and ${yAxisColumn}`;
        }


        const layout = {
            title: plotTitle, // Use dynamic title
            autosize: true,
            margin: { l: 0, r: 0, b: 0, t: 40 }, // Adjust margins
            scene: {
                xaxis: { title: xAxisColumn },
                yaxis: { title: yAxisColumn },
                zaxis: { title: zAxisColumn },
            },
        };
        setPlotlyConfig({ data: [trace], layout });

    // --- Chart.js 2D Configurations (Example) ---
    } else {
      // Assuming you handle Bar, Line, Pie similarly using Chart.js
      const labels = xData; // Use xData as labels for typical charts
      const datasetValues = yData.map(val => parseFloat(val) || 0); // Ensure numeric for Chart.js datasets
      const commonDataset = { label: `${yAxisColumn} vs ${xAxisColumn}`, data: datasetValues };

      let chartJsData; // Renamed from chartData to avoid conflict
      if (chartType === "pie") {
        // Aggregate data for Pie chart
        const aggregatedData = data.reduce((acc, row) => {
          const label = row[xAxisColumn] || "Unknown";
          const value = parseFloat(row[yAxisColumn]) || 0;
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
        chartJsData = {
          labels: finalLabels,
          datasets: [{ label: yAxisColumn, data: finalValues, backgroundColor: pieColors }]
        };
      } else {
        // Keep original logic for Line and Bar charts
        chartJsData = {
          labels,
          datasets: [
            {
              ...commonDataset,
              borderColor: "rgba(13, 71, 161, 1)",
              backgroundColor: chartType === "bar" ? "rgba(13, 71, 161, 0.4)" : "rgba(13, 71, 161, 0.2)",
              fill: chartType === "line", // Fill only for line chart
              tension: 0.1 // Slight curve for line chart
            },
          ],
        };
      }

      // Common options for Chart.js
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart: ${yAxisColumn} vs ${xAxisColumn}` }
        }
      };

      setChartConfig({ type: chartType, data: chartJsData, options });
    }
  };

  // --- Render Logic ---
  const renderChart = () => {
    const is3DType = ['scatter3d', 'line3d', 'surface'].includes(chartType); // Updated list

    if (is3DType && plotlyConfig) {
      return (
        <Plot
          data={plotlyConfig.data}
          layout={plotlyConfig.layout}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }} // Fill container
          config={{ responsive: true }}
        />
      );
    }
    if (is3DType && !plotlyConfig) {
        const message = "Select valid X, Y, and Z axes."; // Generic message
        return <p className="text-center text-gray-500 dark:text-gray-400">{message}</p>;
    }

    if (!is3DType && !chartConfig) {
      return <p className="text-center text-gray-500 dark:text-gray-400">Select axes to generate chart.</p>;
    }

    // Render Chart.js components
    if (!is3DType && chartConfig) {
        switch (chartConfig.type) {
          case "line":
            return <Line ref={chartRef} data={chartConfig.data} options={chartConfig.options} />;
          case "bar":
            return <Bar ref={chartRef} data={chartConfig.data} options={chartConfig.options} />;
          case "pie":
            return <Pie ref={chartRef} data={chartConfig.data} options={chartConfig.options} />;
          default:
            return <p className="text-center text-red-500">Invalid chart type selected.</p>; // Fallback
        }
    }

    // Fallback if something unexpected happens
    return <p className="text-center text-gray-500 dark:text-gray-400">Loading chart...</p>;
  };

  // Early return if no data
  if (!data || data.length === 0) {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Generate Chart</h3>
            <p className="text-gray-700 dark:text-gray-300">No data available to display.</p>
        </div>
    );
  }

  // Determine if Z axis should be shown
  const showZAxis = ['scatter3d', 'line3d', 'surface'].includes(chartType); // Updated list

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow"> {/* Added dark mode bg */}
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Generate Chart</h3>

      {/* Chart Type Selection */}
      <div className="mb-4 flex items-center">
        <label htmlFor="chartType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Chart Type:</label>
        <select
          id="chartType" // Ensure id matches label htmlFor
          value={chartType} // Ensure value is controlled
          onChange={(e) => setChartType(e.target.value)}
          className="mt-1 block w-auto pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
          <option value="pie">Pie Chart</option>
          <option value="scatter3d">3D Scatter Plot</option>
          <option value="line3d">3D Line Plot</option>
          <option value="surface">3D Surface Plot</option> {/* Changed bubble to surface */}
        </select>
      </div>

      {/* Axis Selection - Adjust grid based on chart type */}
      {/* Dynamic grid columns: 2 for 2D, 3 for 3D */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${showZAxis ? 'lg:grid-cols-3' : ''} gap-4 mb-4`}>
        <div>
          <label htmlFor="xAxis" className="block text-sm font-medium text-gray-700 dark:text-gray-300">X-Axis:</label>
          <select
            id="xAxis"
            value={xAxisColumn} // Ensure value is controlled
            onChange={(e) => setXAxisColumn(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select...</option>
            {columns.map(col => (
              <option key={`x-${col}`} value={col}>{col}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="yAxis" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Y-Axis:</label>
          <select
            id="yAxis"
            value={yAxisColumn} // Ensure value is controlled
            onChange={(e) => setYAxisColumn(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select...</option>
            {columns.map(col => (
              <option key={`y-${col}`} value={col}>{col}</option>
            ))}
          </select>
        </div>
        {/* Z-Axis (Conditional) */}
        {showZAxis && (
          <div>
            <label htmlFor="zAxis" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Z-Axis:</label>
            <select
              id="zAxis"
              value={zAxisColumn} // Ensure value is controlled
              onChange={(e) => setZAxisColumn(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Select...</option>
              {columns.map(col => (
                <option key={`z-${col}`} value={col}>{col}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Chart Display Area */}
      <div className="mt-4 h-96 relative"> {/* Ensure container has height, relative for potential absolute positioning inside */}
        {renderChart()}
      </div>
      {/* Button to go to full chart page is in App.jsx */}

    </div>
  );
}

export default FlexibleChartGenerator;
