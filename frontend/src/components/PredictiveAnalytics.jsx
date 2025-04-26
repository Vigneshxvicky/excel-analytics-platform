// src/components/PredictiveAnalytics.jsx
import React, { useState } from 'react';
import axios from 'axios';

function PredictiveAnalytics({ data }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      // Send data to the backend predict endpoint.
      // In a real-world scenario, you might send only aggregated metrics.
      const response = await axios.post('http://localhost:5000/api/predict', { data });
      if (response.data.success) {
        setPrediction(response.data.prediction);
      } else {
        setError('Prediction failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Prediction error.');
    }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ddd' }}>
      <h2>Predictive Analytics</h2>
      <button onClick={handlePredict} style={{ padding: '10px', fontSize: '16px' }}>
        {loading ? 'Predicting...' : 'Run Prediction'}
      </button>
      {prediction && (
        <div style={{ marginTop: '15px' }}>
          <h3>Forecast:</h3>
          <pre>{JSON.stringify(prediction, null, 2)}</pre>
        </div>
      )}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
}

export default PredictiveAnalytics;