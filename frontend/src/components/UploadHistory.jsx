// src/components/UploadHistory.jsx
import React, { useEffect, useState } from "react";
import api from "../api"; // Import the configured api instance

const UploadHistory = () => {
  const [fullHistory, setFullHistory] = useState([]); // Store all fetched items
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(5); // Number of items initially visible

  const itemsToShowIncrement = 5; // How many more items to show each time

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


  return (
    <div> {/* Removed max-width and margin, let parent control layout */}
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white"> {/* Adjusted heading size and color */}
        Upload History
      </h2>
      {fullHistory.length > 0 ? (
        <ul className="space-y-3"> {/* Use ul for list */}
          {visibleHistory.map((upload) => (
          <div
            key={upload._id}
            className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-600" // Use consistent card style
          >
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              User:{" "}
              <span className="font-normal text-gray-600 dark:text-gray-300">{upload.user?.name || "Unknown User"}</span> {/* Fixed typo */}
            </p>
            <p className="text-sm text-gray-800 dark:text-gray-200">
              Filename: <span className="font-normal text-gray-600 dark:text-gray-300">{upload.filename}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"> {/* Smaller date */}
              Date:{" "}
              <span className="font-normal">
                {new Date(upload.uploadDate).toLocaleString()}
              </span>
            </p>
          </div>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No upload history found.</p> // Consistent message
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