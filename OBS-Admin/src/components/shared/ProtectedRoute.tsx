// @ts-nocheck
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("access_ad_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
