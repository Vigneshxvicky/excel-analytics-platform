// ChartComponent.js
import React from "react";
import PropTypes from "prop-types";

const ChartComponent = ({ data }) => {
  // Process data safely
  const processChartData = (data) => {
    if (!data || !Array.isArray(data.datasets)) {
      console.warn("Expected a datasets array, got:", data);
      return { labels: [], datasets: [] };
    }
    const processedDatasets = data.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: "rgba(75,192,192,0.4)",
    }));
    return {
      labels: data.labels || [],
      datasets: processedDatasets,
    };
  };

  const chartData = processChartData(data);

  return (
    <div>
      {/* Render your chart using chartData */}
      <h3>My Chart</h3>
      <pre>{JSON.stringify(chartData, null, 2)}</pre>
    </div>
  );
};

ChartComponent.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.array,
    datasets: PropTypes.arrayOf(PropTypes.object),
  }),
};

export default ChartComponent;