import React, { useState } from "react";
import axios from "axios";

function FileUpload({ onFileUploaded }) {
  const [uploadStatus, setUploadStatus] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (file) => {
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

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center mb-4">Upload Your File</h2>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="text-gray-600">
          Drag & drop your file here or{" "}
          <label
            htmlFor="fileInput"
            className="text-blue-500 underline cursor-pointer"
          >
            browse
          </label>
        </p>
        <input
          id="fileInput"
          type="file"
          className="hidden"
          onChange={handleFileInputChange}
        />
      </div>
      {uploadStatus && (
        <p className="mt-4 text-center text-sm text-gray-600">{uploadStatus}</p>
      )}
    </div>
  );
}

export default FileUpload;