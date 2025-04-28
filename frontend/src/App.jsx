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

// Import public/user components
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
// (Other public components as needed...)

// Import Admin Dashboard components from the admin folder
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";
import AdminDashboard from "./admin/AdminDashboard";

// Import ThemeProvider for dark mode functionality
import { ThemeProvider } from "./context/ThemeContext";

/*
  DashboardWrapper helps extract the JWT token from the URL query string ...
  (for cases where you sign in with Google and redirect with ?token=...)
  Once extracted, it stores the token in localStorage and cleans up the URL.
*/
const DashboardWrapper = ({ fileData, handleFileUploaded }) => {
  const location = useLocation();
  const navigate = useNavigate();
 
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    // Only navigate if token exists and if you're not already on the target page
    if (token && location.pathname !== "/dashboard") {
      localStorage.setItem("authToken", token);
      navigate("/dashboard", { replace: true });
    }
  }, [location.search, navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 font-sans">
      {/* Your Header and user dashboard content */}
      <h1 className="text-3xl font-bold text-gray-800">User Dashboard</h1>
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
          {/* Public Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route
            path="/dashboard"
            element={
              // Wrap with your ProtectedRoute if needed for a user dashboard
              <DashboardWrapper
                fileData={fileData}
                handleFileUploaded={handleFileUploaded}
              />
            }
          />

          {/* Protected Admin Dashboard Route using trailing "/*" for nested routes */}
          <Route
            path="/admin/dashboard/*"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />

          {/* Redirect any unknown routes to the login page */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;