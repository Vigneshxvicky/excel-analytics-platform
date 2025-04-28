// src/admin/ProtectedAdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");

  // For demonstration purposes, this checks if the decoded token has a role of "admin".
  // In production, use a proper token verification method.
  const isAdmin = token
    ? JSON.parse(atob(token.split('.')[1])).role === "admin"
    : false;

  return isAdmin ? children : <Navigate to="/login" />;
};

export default ProtectedAdminRoute;