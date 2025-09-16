// frontend/src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function ProtectedRoute({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth || !auth.isAuthenticated()) {
    // redirect to login and keep the attempted route in `state.from`
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
