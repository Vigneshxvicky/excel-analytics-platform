// src/components/DataTable.jsx
import React from "react";

function DataTable({ data = [] }) {
  if (!data.length) return <p className="text-gray-700">No data to display.</p>;
  const headers = Object.keys(data[0]);
  return (
    <div className="mt-6 bg-white p-6 rounded shadow-sm overflow-x-auto">
      <h3 className="text-lg font-semibold mb-3">Data Table</h3>
      <table className="min-w-full border-collapse font-sans">
        <thead>
          <tr className="bg-gray-200">
            {headers.map((header, idx) => (
              <th key={idx} className="py-2 px-4 text-left text-gray-700">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t">
              {headers.map((header, colIndex) => (
                <td key={colIndex} className="py-2 px-4 text-gray-600">{row[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;