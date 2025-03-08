import { Navigate } from "react-router-dom";
import { getToken } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const token = getToken();
  return token ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
