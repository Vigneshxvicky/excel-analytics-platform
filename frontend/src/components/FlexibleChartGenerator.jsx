    // src/components/FlexibleChartGenerator.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
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
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function FlexibleChartGenerator({ data = [] }) {
  const chartRef = useRef(null);
  const [chartType, setChartType] = useState('line');
  const [headers, setHeaders] = useState([]);
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');

  // Auto-detect the headers and axes on file load
  useEffect(() => {
    if (data.length > 0) {
      const keys = Object.keys(data[0]);
      setHeaders(keys);
      const { xAxis: autoX, yAxis: autoY } = autoDetectAxes(keys, data);
      setXAxis(autoX);
      setYAxis(autoY);
    }
  }, [data]);

  // Heuristic function that determines which column is numeric
  // and which should be used as the x-axis.
  const autoDetectAxes = (headers, data) => {
    let numericHeader = null;
    let nonNumericHeader = null;
    headers.forEach((header) => {
      const numericCount = data.filter(
        (row) => {
          const val = row[header];
          return val !== '' && !isNaN(parseFloat(val));
        }
      ).length;
      if (numericCount / data.length >= 0.5) {
        // This header is mostly numeric.
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

  // Safety check if there's no data or headers
  if (!data || data.length === 0) {
    return <p>No data available to display.</p>;
  }
  if (headers.length === 0) {
    return <p>Cannot determine the data structure.</p>;
  }

  // Build the chart's labels using the auto-detected xAxis
  const labels = data.map((row) => row[xAxis]);

  // Build dataset values from the auto-detected yAxis (parsed as numbers)
  const datasetValues = data.map((row) => {
    const value = row[yAxis];
    return typeof value === 'number' ? value : parseFloat(value) || 0;
  });

  const commonDataset = { label: `${yAxis} vs ${xAxis}`, data: datasetValues };

  // Build chart data differently for Pie charts vs. Line/Bar charts.
  let chartData;
  if (chartType === 'pie') {
    const pieColors = labels.map((_, idx) => `hsl(${(idx * 30) % 360}, 70%, 50%)`);
    chartData = {
      labels,
      datasets: [
        {
          ...commonDataset,
          backgroundColor: pieColors,
        },
      ],
    };
  } else {
    chartData = {
      labels,
      datasets: [
        {
          ...commonDataset,
          borderColor: 'rgba(75,192,192,1)',
          backgroundColor: chartType === 'bar' ? 'rgba(75,192,192,0.4)' : 'rgba(75,192,192,0.2)',
          fill: false,
        },
      ],
    };
  }

  const handleDownload = () => {
    const chartInstance = chartRef.current;
    if (chartInstance && chartInstance.toBase64Image) {
      const url = chartInstance.toBase64Image();
      const link = document.createElement('a');
      link.href = url;
      link.download = 'chart.png';
      link.click();
    } else {
      alert('Chart is not ready for download.');
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return <Line ref={chartRef} data={chartData} />;
      case 'bar':
        return <Bar ref={chartRef} data={chartData} />;
      case 'pie':
        return <Pie ref={chartRef} data={chartData} />;
      default:
        return <Line ref={chartRef} data={chartData} />;
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Chart Preview</h3>
      {/* Display chart type selection */}
      <div style={{ marginBottom: '10px' }}>
        <label>
          Chart Type:
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            style={{ marginLeft: '5px' }}
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
          </select>
        </label>
      </div>

      {/* Show the auto-detected axes for reference */}
      <div>
        <p>
          Auto-detected X‑Axis: <strong>{xAxis}</strong>
        </p>
        <p>
          Auto-detected Y‑Axis: <strong>{yAxis}</strong>
        </p>
      </div>

      {/* Render the chart */}
      <div>{renderChart()}</div>

      {/* Download Button */}
      <button onClick={handleDownload} style={{ marginTop: '10px' }}>
        Download Chart as PNG
      </button>
    </div>
  );
}

export default FlexibleChartGenerator;