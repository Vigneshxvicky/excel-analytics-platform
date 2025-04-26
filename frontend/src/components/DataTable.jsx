// src/components/DataTable.jsx
import React from 'react';

function DataTable({ data = [] }) {
  if (!data.length) {
    return <p>No data to display.</p>;
  }

  // Extract the headers from the keys of the first data object.
  const headers = Object.keys(data[0]);

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Data Table</h3>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'Arial, sans-serif',
        }}
        border="1"
      >
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                style={{
                  backgroundColor: '#f2f2f2',
                  padding: '8px',
                  textAlign: 'left',
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header, colIndex) => (
                <td
                  key={colIndex}
                  style={{
                    padding: '8px',
                  }}
                >
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;