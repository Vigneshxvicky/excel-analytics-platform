// src/App.js
import React, { useState } from "react";
import Header from "./components/Header";
import FileUpload from "./components/FileUpload";
import FlexibleChartGenerator from "./components/FlexibleChartGenerator";
import SummaryReport from "./components/SummaryReport";
import UploadHistory from "./components/UploadHistory";
import DataTable from "./components/DataTable";
import ExportCSV from "./components/ExportCSV";
import PivotTableDashboard from "./components/PivotTableDashboard";
import PredictiveAnalytics from "./components/PredictiveAnalytics";

function App() {
  const [fileData, setFileData] = useState([]);

  const handleFileUploaded = (data) => {
    setFileData(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 font-sans">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Top Section – File Upload and History */}
        <section className="mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg transform transition duration-300 hover:scale-105">
            <FileUpload onFileUploaded={handleFileUploaded} />
            <div className="mt-6">
              <UploadHistory />
            </div>
          </div>
        </section>

        {/* Analytics Section – Only Display When Data Exists */}
        {fileData.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Data Analysis
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg transform transition duration-300 hover:scale-105">
                <FlexibleChartGenerator data={fileData} />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg transform transition duration-300 hover:scale-105">
                <SummaryReport chartData={fileData} />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg transform transition duration-300 hover:scale-105">
                <DataTable data={fileData} />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg transform transition duration-300 hover:scale-105">
                <ExportCSV data={fileData} filename="uploaded-data.csv" />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg transform transition duration-300 hover:scale-105">
                <PivotTableDashboard data={fileData} />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg transform transition duration-300 hover:scale-105">
                <PredictiveAnalytics data={fileData} />
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-center text-white py-4">
        <p>&copy; {new Date().getFullYear()} Excel Analytics Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;     