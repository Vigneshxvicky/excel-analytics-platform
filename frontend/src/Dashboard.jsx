// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [protectedData, setProtectedData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/protected', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setProtectedData(response.data);
      })
      .catch(error => {
        console.error('Error fetching protected data:', error);
      });
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {protectedData ? (
        <pre>{JSON.stringify(protectedData, null, 2)}</pre>
      ) : (
        <p>Loading protected data...</p>
      )}
    </div>
  );
}

export default Dashboard;