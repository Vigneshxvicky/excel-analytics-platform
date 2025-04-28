// src/components/ProtectedAdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
// Use a named import instead of a default import:
import { jwtDecode } from "jwt-decode";

const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    // If no token exists, redirect to login.
    return <Navigate to="/login" replace />;
  }

  let user;
  try {
    // Decode the token to read the user's role.
    user = jwtDecode(token);
  } catch (error) {
    // If token decoding fails, force a re-login.
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    // If the user isn't an admin, redirect them (or you can display a "Not Authorized" page).
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute; 