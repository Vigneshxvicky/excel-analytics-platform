// src/components/UploadHistory.jsx
import React, { useEffect, useState } from "react";

function UploadHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem("uploadHistory");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  return (
    <div className="mt-6 bg-white p-6 rounded shadow-sm">
      <h2 className="text-xl font-semibold mb-3">Upload History</h2>
      {history.length > 0 ? (
        <ul className="list-disc pl-5">
          {history.map((upload, idx) => (
            <li key={idx} className="mb-1">
              <span className="font-bold">{upload.fileName}</span> – {upload.recordCount} records –{" "}
              <span className="text-gray-600">{upload.uploadedAt}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700">No uploads yet.</p>
      )}
    </div>
  );
}

export default UploadHistory;