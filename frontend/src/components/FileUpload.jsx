// src/components/FileUpload.jsx
import React, { useState } from "react";
import axios from "axios";

function FileUpload({ onFileUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      console.log("File dropped:", file);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      console.log("File selected:", file);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      console.error("No file selected.");
      return;
    }
    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const token = localStorage.getItem("authToken"); // Authentication token if needed
      const response = await axios.post(
        "https://excel-analytics-platform-backend.onrender.com/api/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("File upload response:", response.data);
      alert("File uploaded successfully!");

      // Pass the uploaded file data back
      const uploadedData =
        response.data && response.data.data
          ? response.data.data
          : response.data;
      onFileUploaded(uploadedData || []);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Upload failed. Please try again.");
      onFileUploaded([]); // Fallback in case of error
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Drag and Drop Box */}
      <div
        className={`w-full max-w-md h-40 flex items-center justify-center border-2 border-dashed transition duration-300 ease-in-out ${
          isDragging
            ? "border-blue-500 bg-blue-100 text-blue-500"
            : "border-gray-300 text-gray-500"
        } rounded-lg cursor-pointer`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="text-lg font-medium">
          {fileName ? `Selected: ${fileName}` : "Drag & Drop your file here"}
        </p>
      </div>

      {/* Browse File Button */}
      <label className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded cursor-pointer transition">
        Browse File
        <input
          type="file"
          className="hidden"
          accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={handleFileSelect}
        />
      </label>

      {/* Upload File Button */}
      <button
        onClick={uploadFile}
        disabled={uploading || !selectedFile}
        className={`px-6 py-3 font-semibold text-white rounded-lg transition ${
          uploading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {uploading ? "Uploading..." : "Upload File"}
      </button>
    </div>
  );
}

export default FileUpload;
