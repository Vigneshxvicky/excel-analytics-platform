// src/components/UploadHistory.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

function UploadHistory() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("authToken");
        // In src/components/UploadHistory.jsx
const response = await axios.get("http://localhost:5000/api/upload-history", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
        if (response.data.success) {
          setHistory(response.data.history); // Expecting { success: true, history: [...] }
        } else {
          setError("Failed to load upload history.");
        }
      } catch (err) {
        console.error("Error retrieving upload history:", err);
        setError("Error retrieving upload history.");
      }
    };

    fetchHistory();
  }, []);

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Upload History</h3>
      {error && <p className="text-red-500">{error}</p>}
      {(!error && history.length === 0) ? (
        <p>No uploads found.</p>
      ) : (
        <ul>
          {history.map((item) => (
            <li key={item._id}>
              {item.filename} - {new Date(item.uploadDate).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UploadHistory;