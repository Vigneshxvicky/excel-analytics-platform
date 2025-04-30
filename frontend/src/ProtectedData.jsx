// src/ProtectedData.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ProtectedData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('https://excel-analytics-platform-backend.onrender.com/api/protected', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setData(response.data);
        console.log('Protected data:', response.data);
      })
      .catch(err => {
        setError(err);
        console.error('Error fetching protected data:', err);
      });
  }, []);

  return (
    <div>
      <h2>Protected Data</h2>
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Loading protected data...</p>
      )}
    </div>
  );
}

export default ProtectedData;