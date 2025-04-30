// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [protectedData, setProtectedData] = useState(null);

  useEffect(() => {
    const fetchProtectedData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error("No token found, redirecting to login...");
        return;
      }
  
      try {
        const response = await axios.get('https://excel-analytics-platform-backend.onrender.com/api/protected', {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        setProtectedData(response.data);
      } catch (error) {
        console.error("Error fetching protected data:", error);
      }
    };
  
    fetchProtectedData();
  }, []);
  {protectedData ? (
    <pre>{JSON.stringify(protectedData, null, 2)}</pre>
  ) : (
    <p>No data available or loading...</p>
  )}
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