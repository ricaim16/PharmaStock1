import { createContext, useContext, useState, useEffect } from "react";
import { getToken, getUserRole, logout as logoutUtil } from "../utils/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const [role, setRole] = useState(getUserRole() || "EMPLOYEE");

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!getToken());
      setRole(getUserRole() || "EMPLOYEE");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (token, userRole) => {
    setIsAuthenticated(true);
    setRole(userRole);
  };

  const logout = () => {
    logoutUtil();
    setIsAuthenticated(false);
    setRole("EMPLOYEE");
  };

  const value = {
    isAuthenticated,
    role,
    login,
    logout,
    setIsAuthenticated,
    setRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
