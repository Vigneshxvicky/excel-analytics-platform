// src/components/DataTable.jsx
import React, { useState, useMemo } from "react";

function DataTable({ data = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Show 10 rows per page

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(lowerCaseSearchTerm)
      )
    );
  }, [data, searchTerm]);

  // Early return if no data after filtering (or initially)
  if (!data.length) return <p className="text-gray-700 dark:text-gray-300">No data to display.</p>; // Added dark mode text

  const headers = Object.keys(data[0]);
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded shadow-sm"> {/* Added dark mode */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Table</h3>
        <input
          type="text"
          placeholder="Search table..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="overflow-x-auto"> {/* Keep horizontal scroll */}
        <table className="min-w-full border-collapse font-sans">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700"> {/* Adjusted background */}
              {headers.map((header, idx) => (
                <th key={idx} className="py-2 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">{header}</th> // Style header
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700"> {/* Add dividers */}
            {currentItems.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700"> {/* Add hover effect */}
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="py-2 px-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{String(row[header])}</td> // Ensure value is string, add whitespace-nowrap
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
          <span className="text-sm text-gray-700 dark:text-gray-300">Page {currentPage} of {totalPages}</span>
          <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
        </div>
      )}
    </div>
  );
}

export default DataTable;