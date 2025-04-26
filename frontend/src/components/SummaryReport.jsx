// src/components/SummaryReport.jsx
import React, { useState } from "react";
import axios from "axios";

function SummaryReport({ chartData }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGetSummary = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/summarize", { text: JSON.stringify(chartData) });
      setSummary(response.data.success ? response.data.summary : "Failed to generate summary.");
    } catch (error) {
      console.error(error);
      setSummary("Error generating summary.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <button
        onClick={handleGetSummary}
        disabled={loading}
        className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded"
      >
        {loading ? "Generating summary…" : "Get AI Summary"}
      </button>
      {summary && <p className="mt-4 text-gray-700"><strong>Summary:</strong> {summary}</p>}
    </div>
  );
}

export default SummaryReport;