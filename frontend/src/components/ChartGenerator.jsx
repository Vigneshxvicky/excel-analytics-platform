import React, { useState, useRef } from 'react';
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

function ChartGenerator({ data = [] }) {
  // Create a ref to access the chart instance (needed for download)
  const chartRef = useRef(null);
  
  // State for selecting chart type; default to Line chart
  const [chartType, setChartType] = useState('line');

  // Ensure data is available before generating chart data
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  if (headers.length === 0) return <p>No data available to display.</p>;

  // For this example, we use the first column as x-axis and the second as y-axis.
  const xAxis = headers[0];
  const yAxis = headers[1];

  // Extract labels and dataset values (ensure numeric values)
  const labels = data.map((row) => row[xAxis]);
  const datasetValues = data.map((row) => {
    const value = row[yAxis];
    return typeof value === 'number' ? value : parseFloat(value) || 0;
  });

  // Setup the base dataset
  const commonDataset = {
    label: `${yAxis} vs ${xAxis}`,
    data: datasetValues,
  };

  let chartData;
  // For Pie charts, set up an array of background colors.
  if (chartType === 'pie') {
    const pieColors = labels.map(
      (_, idx) => `hsl(${(idx * 30) % 360}, 70%, 50%)`
    );
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
    // For Line and Bar charts, use border and background colors.
    chartData = {
      labels,
      datasets: [
        {
          ...commonDataset,
          borderColor: 'rgba(75,192,192,1)',
          backgroundColor:
            chartType === 'bar'
              ? 'rgba(75,192,192,0.4)'
              : 'rgba(75,192,192,0.2)',
          fill: false,
        },
      ],
    };
  }

  // Function to download the current chart as a PNG image
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

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Chart Preview</h3>
      <div>
        <label htmlFor="chartType">Select Chart Type: </label>
        <select
          id="chartType"
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          style={{ marginBottom: '10px' }}
        >
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="pie">Pie Chart</option>
        </select>
      </div>
      <div>
        {chartType === 'line' && (
          <Line ref={chartRef} data={chartData} />
        )}
        {chartType === 'bar' && (
          <Bar ref={chartRef} data={chartData} />
        )}
        {chartType === 'pie' && (
          <Pie ref={chartRef} data={chartData} />
        )}
      </div>
      <button onClick={handleDownload} style={{ marginTop: '10px' }}>
        Download Chart as PNG
      </button>
    </div>
  );
}

export default ChartGenerator;