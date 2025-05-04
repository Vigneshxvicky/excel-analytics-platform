// src/components/PredictiveAnalytics.jsx
import React, { useState } from "react";
import axios from "axios";

function PredictiveAnalytics({ data }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "https://excel-analytics-platform-backend.onrender.com/api/predict",
        { data }
      );
      setPrediction(
        response.data.success ? response.data.prediction : "Prediction failed."
      );
    } catch (err) {
      console.error(err);
      setError("Prediction error.");
    }
    setLoading(false);
  };

  return (
    <div className="mt-6 bg-white p-4 md:p-6 rounded shadow-sm">
      {" "}
      {/* Adjust padding */}
      <h2 className="text-xl font-semibold mb-4">Predictive Analytics</h2>
      <button
        onClick={handlePredict}
        className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded"
      >
        {loading ? "Predicting..." : "Run Prediction"}
      </button>
      {prediction && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Forecast:</h3>
          <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-gray-800 dark:text-gray-200 overflow-x-auto">
            {" "}
            {/* Dark mode, scroll */}
            {JSON.stringify(prediction, null, 2)}
          </pre>
        </div>
      )}
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
}

export default PredictiveAnalytics;
