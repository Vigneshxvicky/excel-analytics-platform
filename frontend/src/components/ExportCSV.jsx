// src/components/ExportCSV.jsx
import React from "react";

function ExportCSV({ data, filename = "data.csv" }) {
  const convertToCSV = (dataArray) => {
    if (!dataArray.length) return "";
    const headers = Object.keys(dataArray[0]);
    const headerRow = headers.join(",");
    const rows = dataArray.map(row =>
      headers.map(field => `"${row[field] !== undefined ? row[field] : ""}"`).join(",")
    );
    return [headerRow, ...rows].join("\n");
  };

  const handleDownload = () => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    link.click();
  };

  return (
    <div className="mt-6 bg-white p-6 rounded shadow-sm">
      <button
        onClick={handleDownload}
        className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded"
      >
        Export Data as CSV
      </button>
    </div>
  );
}

export default ExportCSV;