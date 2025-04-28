// src/admin/ReportsExport.jsx
import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ReportsExport = () => {
  // Dummy data for demonstration. Replace this with your actual report data.
  const [reportData] = useState([
    { id: 1, name: "John Doe", role: "Admin" },
    { id: 2, name: "Jane Smith", role: "User" },
    { id: 3, name: "Alice Johnson", role: "User" },
  ]);

  // Function to export CSV
  const exportCSV = () => {
    // Create header row
    const header = ["ID", "Name", "Role"];
    // Map the report data to rows
    const rows = reportData.map(item => [item.id, item.name, item.role]);

    // Convert the header and rows to CSV string format
    const csvContent =
      "data:text/csv;charset=utf-8," +
      header.join(",") +
      "\n" +
      rows.map(e => e.join(",")).join("\n");

    // Create a link element, set its href to the CSV content, and trigger a download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to export PDF
  const exportPDF = () => {
    // Create a new PDF document
    const doc = new jsPDF();
    doc.text("Report Data", 14, 16);
    // Define table headers and rows
    const tableColumn = ["ID", "Name", "Role"];
    const tableRows = reportData.map(item => [
      item.id.toString(),
      item.name,
      item.role,
    ]);

    // Use autoTable to create a table in the PDF document
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    // Save the PDF document
    doc.save("report.pdf");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Reports & Exports
      </h2>
      <div className="space-x-4">
        <button
          onClick={exportCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Download CSV
        </button>
        <button
          onClick={exportPDF}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default ReportsExport;