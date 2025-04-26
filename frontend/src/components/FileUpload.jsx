// src/components/FileUpload.jsx
import React, { useState } from "react";
import CustomFileInput from "./CustomFileInput";
import axios from "axios";

function FileUpload({ onFileUploaded }) {
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileSelected = async (file) => {
    if (!file) {
      setUploadStatus("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        setUploadStatus("Upload successful!");
        onFileUploaded(response.data.data);
      } else {
        setUploadStatus("Upload failed");
      }
    } catch (error) {
      console.error("Error during file upload:", error);
      setUploadStatus("Upload error");
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center mb-4">Upload Your File</h2>
      <CustomFileInput onFileSelected={handleFileSelected} />
      {uploadStatus && (
        <p className="mt-4 text-center text-sm text-gray-600">{uploadStatus}</p>
      )}
    </div>
  );
}

export default FileUpload;