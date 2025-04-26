// src/components/ExportCSV.jsx
import React from 'react';

function ExportCSV({ data, filename = 'data.csv' }) {
  // Convert an array of objects to CSV format.
  const convertToCSV = (dataArray) => {
    if (!dataArray.length) return '';

    // Get CSV headers from the keys of the first object
    const headers = Object.keys(dataArray[0]);
    const headerRow = headers.join(',');

    // Construct CSV rows by mapping over data.
    const rows = dataArray.map(row => {
      return headers.map(field => {
        // Wrap fields in quotes if needed.
        const cell = row[field] !== undefined ? row[field] : '';
        return `"${cell}"`;
      }).join(',');
    });

    return [headerRow, ...rows].join('\n');
  };

  // Function to trigger CSV download
  const handleDownload = () => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.click();
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <button onClick={handleDownload}>
        Export Data as CSV
      </button>
    </div>
  );
}

export default ExportCSV;   