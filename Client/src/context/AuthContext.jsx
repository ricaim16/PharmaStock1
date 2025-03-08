import { createContext, useContext, useState } from "react";
import { getToken, getUserRole } from "../utils/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const [role, setRole] = useState(getUserRole() || "EMPLOYEE");

  const value = {
    isAuthenticated,
    role,
    setIsAuthenticated,
    setRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
