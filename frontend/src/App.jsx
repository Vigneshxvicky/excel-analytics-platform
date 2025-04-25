// src/App.js
import React, { useState } from 'react';
import FileUpload from './components/FileUpload';

function App() {
  const [fileData, setFileData] = useState(null);

  const handleFileUpload = (data) => {
    // Save the parsed data from the uploaded file
    setFileData(data);
    console.log('Parsed Excel Data:', data);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Excel Analytics Dashboard</h1>
      <FileUpload onFileUploaded={handleFileUpload} />
      {fileData && (
        <div>
          <h2>Parsed Data:</h2>
          <pre>{JSON.stringify(fileData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;