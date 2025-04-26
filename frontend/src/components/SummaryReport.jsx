// src/components/SummaryReport.jsx
import React, { useState } from 'react';
import axios from 'axios';

function SummaryReport({ chartData }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetSummary = async () => {
    setLoading(true);
    try {
      // Send a POST request to your /api/summarize endpoint.
      // In this example, we send the stringified chart data.
      const response = await axios.post('http://localhost:5000/api/summarize', { text: JSON.stringify(chartData) });
      if (response.data.success) {
        setSummary(response.data.summary);
      } else {
        setSummary('Failed to generate summary.');
      }
    } catch (error) {
      console.error(error);
      setSummary('Error generating summary.');
    }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
      <button onClick={handleGetSummary} disabled={loading}>
        {loading ? 'Generating summary…' : 'Get AI Summary'}
      </button>
      {summary && <p style={{ marginTop: '10px' }}><strong>Summary:</strong> {summary}</p>}
    </div>
  );
}

export default SummaryReport;