// src/components/FileUpload.jsx
import React from 'react';
import axios from 'axios';

function FileUpload({ onFileUploaded }) {
  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        // Send parsed data back to the parent component
        onFileUploaded(response.data.data);
      }
    } catch (error) {
      console.error("File upload failed: ", error);
    }
  };

  return (
    <div>
      <input type="file" accept=".xls,.xlsx" onChange={handleChange} />
    </div>
  );
}

export default FileUpload;