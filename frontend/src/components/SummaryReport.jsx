// src/components/SummaryReport.jsx
import React, { useState } from "react";
import api from "../api"; // Import the configured api instance

function SummaryReport({ chartData }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Add error state

  const handleGetSummary = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      // Use the api instance - interceptor attaches the token
      // Ensure the backend expects { data: chartData }
      const response = await api.post("/api/summarize", { data: chartData });
      setSummary(response.data.success ? response.data.summary : "Failed to generate summary.");
    } catch (err) { // Use err to avoid conflict with error state
      console.error(err);
      setError(err.response?.data?.message || "Error generating summary."); // Set error state
      setSummary(""); // Clear summary on error
    }
    setLoading(false);
  };

  return (
    <div className="mt-6 bg-white p-4 md:p-6 rounded shadow-sm"> {/* Add margin-top, adjust padding */}
      <button
        onClick={handleGetSummary}
        disabled={loading}
        className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded"
      >
        {loading ? "Generating summary…" : "Get AI Summary"}
      </button>
      {error && <p className="mt-2 text-red-500">{error}</p>} {/* Display error message */}
      {summary && <p className="mt-4 text-gray-700 dark:text-gray-300"><strong>Summary:</strong> {summary}</p>} {/* Added dark mode text */}
    </div>
  );
}

export default SummaryReport;