// App.js
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./App.css"; // Create this CSS file for styling.

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [dragging, setDragging] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [darkMode, setDarkMode] = useState(false);

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      previewFile(file);
      parseExcel(file);
    }
  };

  // Handle drag-and-drop of file
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      previewFile(file);
      parseExcel(file);
    }
  };

  // Preview file name if it's a valid Excel file
  const previewFile = (file) => {
    if (
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel"
    ) {
      setFilePreview(file.name);
    } else {
      alert("Please upload a valid Excel file (.xls or .xlsx)");
    }
  };

  // Parse the Excel file using SheetJS
  const parseExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      // Get the first worksheet
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      // Convert the worksheet to JSON (array-of-arrays format)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log("Parsed Excel data:", jsonData);

      if (jsonData.length > 1) {
        // Assuming the first row is headers, and subsequent rows have data:
        // For example, column 0 for labels and column 1 for values.
        const filteredData = jsonData.slice(1).filter((row) =>
          row.length >= 2 &&
          typeof row[1] === "string" &&
          row[1].trim() !== "Select Month" &&
          !row[1].includes("empty")
        );
        
        const labels = filteredData.map((row) => row[1]); // Extract valid months
        
        // Adjust column index to match the correct numerical column in Excel
// Example: If the correct numerical data is at index 2 or found via some other criteria:
const datasetData = filteredData.map((row) =>
  parseFloat(row[2]) || parseFloat(row.find(cell => typeof cell === 'number')) || 0
);
        setChartData({
          labels: labels,
          datasets: [
            {
              label: "My Data",
              data: datasetData,
              backgroundColor: "rgba(75, 192, 192, 0.4)",
            },
          ],
        });
      } else {
        console.warn("Excel data is empty or has insufficient rows.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <div
      className={`app-container ${darkMode ? "dark-mode" : "light-mode"}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Dark Mode Toggle Button */}
      <button onClick={toggleDarkMode} className="dark-mode-toggle">
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>

      {/* Drop area with dragging indicator */}
      <div className={`drop-area ${dragging ? "drag-active" : ""}`}>
        {filePreview ? (
          <div>
            <h3>File Preview: {filePreview}</h3>
            <h4>Chart Representation:</h4>
            <div style={{ width: "90%", height: "400px", margin: "0 auto" }}>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    title: {
                      display: true,
                      text: "Excel Data Chart",
                    },
                  },
                }}
              />
            </div>
          </div>
        ) : (
          <>
            <h2>Drag and Drop Excel Files Here</h2>
            <p>or</p>
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="fileInput"
            />
            <label htmlFor="fileInput" className="btn">
              Browse Files
            </label>
          </>
        )}
      </div>
    </div>
  );
}

export default App;