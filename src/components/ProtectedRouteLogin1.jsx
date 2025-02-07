// src/components/ProtectedRouteLogin1.jsx
import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRouteLogin1({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/login1" />;
}

export default ProtectedRouteLogin1;