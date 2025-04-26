// src/components/FileUpload.jsx
import React, { useState } from 'react';
import axios from 'axios';

function FileUpload({ onFileUploaded }) {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setUploadStatus('No file selected');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setUploadStatus('Upload successful!');
        // Create an upload history record
        const newUpload = {
          fileName: file.name,
          recordCount: response.data.data.length, // assuming data is an array of records
          uploadedAt: new Date().toLocaleString(),
        };

        // Save this history in localStorage
        const existingHistory = JSON.parse(localStorage.getItem('uploadHistory')) || [];
        const newHistory = [newUpload, ...existingHistory];
        localStorage.setItem('uploadHistory', JSON.stringify(newHistory));

        // Pass the parsed data to the parent component
        onFileUploaded(response.data.data);
      } else {
        setUploadStatus('Upload failed');
      }
    } catch (error) {
      console.error(error);
      setUploadStatus('Upload error');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', marginBottom: '20px' }}>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload} style={{ marginLeft: '10px' }}>
        Upload File
      </button>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
}

export default FileUpload;