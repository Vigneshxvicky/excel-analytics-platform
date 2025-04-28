// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

// Import User Components
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import FileUpload from "./components/FileUpload";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import FlexibleChartGenerator from "./components/FlexibleChartGenerator";
import SummaryReport from "./components/SummaryReport";
import UploadHistory from "./components/UploadHistory";
import DataTable from "./components/DataTable";
import ExportCSV from "./components/ExportCSV";
// import PivotTableDashboard from "./components/PivotTableDashboard";

// Import Admin Dashboard Components
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";
import AdminDashboard from "./admin/AdminDashboard";

// Import ThemeProvider to wrap the entire app and provide dark mode
import { ThemeProvider } from "./context/ThemeContext";

/*
  DashboardWrapper helps extract the JWT token from the URL query string
  (for cases where you sign in with Google and redirect with ?token=...)
  Once extracted, it stores the token in localStorage and cleans up the URL.
*/
const DashboardWrapper = ({ fileData, handleFileUploaded }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a token in the URL query string (e.g., after Google login)
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      // Save the token in localStorage for use throughout the app.
      localStorage.setItem("authToken", token);
      // Clean up the URL by removing the token query string.
      navigate("/dashboard", { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 font-sans">
      <Header />
      <main className="max-w-7xl mx-auto p-6">
        {/* File Upload and History Section */}
        <section className="mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg transform transition duration-300 hover:scale-105">
            <FileUpload onFileUploaded={handleFileUploaded} />
            <div className="mt-6">
              <UploadHistory />
            </div>
          </div>
        </section>

        {/* Analytics Section – Only Display if Data Exists */}
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
              {/* Optionally include more components */}
              {/* <div className="bg-white p-6 rounded-xl shadow-lg transform transition duration-300 hover:scale-105">
                <PivotTableDashboard data={fileData} />
              </div> */}
            </div>
          </section>
        )}
      </main>
      <footer className="bg-gray-800 text-center text-white py-4">
        <p>
          &copy; {new Date().getFullYear()} Excel Analytics Dashboard. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
};

function App() {
  const [fileData, setFileData] = useState([]);

  const handleFileUploaded = (data) => {
    setFileData(data);
  };

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes: Login & Register (No Header) */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Protected User Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardWrapper
                  fileData={fileData}
                  handleFileUploaded={handleFileUploaded}
                />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Dashboard Route */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />

          {/* Redirect any unknown route to /login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;