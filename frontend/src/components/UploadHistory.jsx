// src/components/UploadHistory.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const UploadHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get("http://localhost:5000/api/upload-history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data?.history) {
          setHistory(response.data.history);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setError("Failed to load upload history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <p className="text-center mt-4">Loading upload history...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-4">{error}</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Upload History</h2>
      {history.length > 0 ? (
        history.map((upload) => (
          <div
            key={upload._id}
            className="border p-4 mb-2 rounded-lg shadow-sm bg-white"
          >
            <p className="text-lg font-semibold">
              User:{" "}
              <span className="font-normal">{upload.user?.name || upload.user}</span>
            </p>
            <p className="text-base">
              Filename: <span className="font-normal">{upload.filename}</span>
            </p>
            <p className="text-sm text-gray-600">
              Date:{" "}
              <span className="font-normal">
                {new Date(upload.uploadDate).toLocaleString()}
              </span>
            </p>
          </div>
        ))
      ) : (
        <p>No uploads found.</p>
      )}
    </div>
  );
};

export default UploadHistory;