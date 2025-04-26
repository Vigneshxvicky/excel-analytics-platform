// src/App.js
import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import FlexibleChartGenerator from './components/FlexibleChartGenerator';
import SummaryReport from './components/SummaryReport';
import UploadHistory from './components/UploadHistory';
import DataTable from './components/DataTable';
import ExportCSV from './components/ExportCSV';
import PivotTableDashboard from './components/PivotTableDashboard';
import PredictiveAnalytics from './components/PredictiveAnalytics';

function App() {
  const [fileData, setFileData] = useState([]);

  const handleFileUploaded = (data) => {
    setFileData(data);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Excel Analytics Dashboard</h1>
      <FileUpload onFileUploaded={handleFileUploaded} />
      <UploadHistory />
      
      {fileData.length > 0 && (
        <>
          <FlexibleChartGenerator data={fileData} />
          <SummaryReport chartData={fileData} />
          <DataTable data={fileData} />
          <ExportCSV data={fileData} filename="uploaded-data.csv" />
          <PivotTableDashboard data={fileData} />
          <PredictiveAnalytics data={fileData} />
        </>
      )}
    </div>
  );
}

export default App;