// src/components/UploadHistory.jsx
import React, { useEffect, useState } from "react";
import api from "../api"; // Import the configured api instance
import { FaTrash } from 'react-icons/fa'; // Import trash icon
import axios from "axios";
const UploadHistory = () => {
  const [fullHistory, setFullHistory] = useState([]); // Store all fetched items
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(5); // Number of items initially visible

  const itemsToShowIncrement = 5; // How many more items to show each time

  
  const handleDelete = async (uploadId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete the history for "${fileName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Use the api instance for consistency, it should handle the token
      const response = await api.delete(
        `/api/upload-history/${uploadId}`
      );

      if (response.data.success) {
        // Update the correct state variable
        setFullHistory((prevHistory) => prevHistory.filter((item) => item._id !== uploadId));
        alert("Upload history deleted successfully!");
      } else {
        throw new Error(response.data.message || "Failed to delete upload history");
      }
    } catch (err) {
      console.error("Error deleting upload history:", err);
      alert(err.message || "Could not delete upload history.");
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Use the api instance - interceptor will attach the token
        const response = await api.get("/api/upload-history");
        if (response.data?.history) {
          setFullHistory(response.data.history); // Store the full list
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
  // Function to show more items
  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + itemsToShowIncrement);
  };

  // Get the items currently visible
  const visibleHistory = fullHistory.slice(0, visibleCount);


  if (loading) return <p className="text-gray-500 dark:text-gray-400">Loading history...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  
  const handleDeleteAllHistory = async () => {
    if (!window.confirm("Are you sure you want to delete ALL your upload history? This action cannot be undone.")) {
      return;
    }
    try {
      const response = await api.delete("/api/upload-history/all"); // Use your api instance
      if (response.data.success) {
        alert(response.data.message);
        // You'd also want to refresh the history list in the UI, e.g., by re-fetching or clearing the local state.
        // For example: setFullHistory([]); // If 'fullHistory' is your state for the list
      } else {
        alert("Failed to delete all history: " + response.data.message);
      }
    } catch (error) {
      console.error("Error deleting all upload history:", error);
      alert("An error occurred while deleting all history.");
    }
  };

  return (
    <div> {/* Removed max-width and margin, let parent control layout */}
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white"> {/* Adjusted heading size and color */}
       
      </h2>
      <button onClick={handleDeleteAllHistory } className="mb-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md shadow-sm transition">
        Delete All My History
      </button>
      {fullHistory.length === 0 && !loading ? (
        <p className="text-gray-500 dark:text-gray-400">No upload history found.</p> // Consistent message
      ) : (
        <ul className="space-y-3"> {/* Use ul for list */}
          {visibleHistory.map((upload) => (
            <li // Changed div to li for semantic HTML
              key={upload._id}
              className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 flex justify-between items-center" // Use consistent card style and flex for layout
            >
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  User:{" "}
                  <span className="font-normal text-gray-600 dark:text-gray-300">{upload.user?.name || "Unknown User"}</span>
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  Filename: <span className="font-normal text-gray-600 dark:text-gray-300">{upload.filename}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"> {/* Smaller date */}
                  Date:{" "}
                  <span className="font-normal">
                    {upload.createdAt ? new Date(upload.createdAt).toLocaleString() : "N/A"}
                  </span>
                </p>
              </div>
              <button
                onClick={() => handleDelete(upload._id, upload.filename)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full transition-colors duration-150"
                title="Delete this upload history"
                aria-label="Delete upload history"
              >
                <FaTrash size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {/* Show More Button */}
      {visibleCount < fullHistory.length && (
        <div className="text-center mt-4">
          <button onClick={handleShowMore} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md shadow-sm transition">
            Show More ({fullHistory.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadHistory;