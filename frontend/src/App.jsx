// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [status, setStatus] = useState('Checking server status...');

  useEffect(() => {
    axios.get('http://localhost:5000/api/health')
      .then((response) => {
        setStatus(response.data.status);
      })
      .catch((error) => {
        setStatus('Error connecting to the server');
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Excel Analytics Dashboard</h1>
      <p>Backend Server Status: {status}</p>
    </div>
  );
}

export default App;