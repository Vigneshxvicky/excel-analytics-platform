// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const tokenFromQuery = query.get("token");

  let token = localStorage.getItem("authToken");
  if (!token && tokenFromQuery) {
    localStorage.setItem("authToken", tokenFromQuery);
    token = tokenFromQuery;
  }

  return token ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;