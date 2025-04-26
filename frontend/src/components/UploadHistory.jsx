// src/components/UploadHistory.jsx
import React, { useEffect, useState } from 'react';

function UploadHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem('uploadHistory');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Upload History</h2>
      {history.length > 0 ? (
        <ul>
          {history.map((upload, index) => (
            <li key={index}>
              <strong>{upload.fileName}</strong> — {upload.recordCount} records — uploaded on {upload.uploadedAt}
            </li>
          ))}
        </ul>
      ) : (
        <p>No uploads yet.</p>
      )}
    </div>
  );
}

export default UploadHistory;   