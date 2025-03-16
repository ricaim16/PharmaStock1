import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../utils/auth";

// Sun icon (SVG)
const SunIcon = () => (
  <svg
    className="w-6 h-6 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

// Moon icon (SVG)
const MoonIcon = () => (
  <svg
    className="w-6 h-6 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const navigate = useNavigate();
  const { login } = useAuth();

  // Create refs for each input field to control focus
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const roleRef = useRef(null);
  const submitButtonRef = useRef(null);

  // Effect to toggle dark/light mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("handleLogin triggered by:", e.type);
    console.log("Attempting login with:", { username, password, role });

    setError("");

    if (!username || !password || !role) {
      setError("Please fill all fields!");
      return;
    }

    try {
      const { token, user } = await loginUser(username, password, role);
      login(token, user.role);
      console.log("Login successful. Response:", { token, user });
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error details:", {
        message: err.message || err,
        response: err.response?.data || "No response data",
        status: err.response?.status,
      });

      if (err.response?.status === 401 || err === "Invalid credentials") {
        setError("Invalid credentials.");
      } else if (err.response?.status === 404) {
        setError("Login service unavailable. Please try again later.");
      } else if (err.response?.status === 400) {
        setError("Invalid request. Please check your inputs.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  // Handle Enter keypress to move focus to the next field
  const handleKeyDown = (e, nextFieldRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextFieldRef && nextFieldRef.current) {
        nextFieldRef.current.focus();
      }
    }
  };

  // Handle Enter keypress on the last field (role) to submit the form
  const handleRoleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (submitButtonRef.current) {
        submitButtonRef.current.click();
      }
    }
  };

  // Function to clear the error message
  const clearError = () => {
    setError("");
  };

  // Function to toggle dark/light mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-gray-800 dark:bg-gradient-to-br dark:from-gray-100 dark:to-gray-300 relative"
      style={{
        background: isDarkMode
          ? "linear-gradient(to bottom right, #1e3a8a, #4b5563)"
          : "linear-gradient(to bottom right, #e5e7eb, #d1d5db)",
      }}
    >
      {/* LOGO on top-left */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <h1 className="text-2xl font-bold text-white dark:text-gray-800">
          LOGO
        </h1>
      </div>

      {/* Dark mode toggle on top-right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center space-x-2">
        <SunIcon />
        <button
          onClick={toggleDarkMode}
          className="w-12 h-6 bg-gray-600 dark:bg-gray-400 rounded-full p-1 flex items-center"
          aria-label="Toggle dark mode"
        >
          <div
            className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${
              isDarkMode ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
        <MoonIcon />
      </div>

      <div
        className="bg-transparent p-6 rounded-xl w-full max-w-md border border-gray-300 dark:border-gray-500 shadow-lg"
        style={{ marginTop: "20px" }}
      >
        {/* Error message container */}
        {error && (
          <div className="w-full bg-red-500 text-white rounded-t-lg p-2 flex justify-between items-center shadow-md mb-2">
            <span className="ml-4">{error}</span>
            <button
              onClick={clearError}
              className="text-white font-bold text-lg focus:outline-none mr-4"
              aria-label="Close error message"
            >
              ×
            </button>
          </div>
        )}
        <h2 className="text-2xl font-bold text-center mb-6 text-white dark:text-gray-800">
          Log in
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-600">
              UserName
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, passwordRef)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Enter username"
              autoComplete="username"
              ref={usernameRef}
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-600">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, roleRef)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Enter password"
              autoComplete="current-password"
              ref={passwordRef}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-600">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onKeyDown={handleRoleKeyDown}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-800"
              ref={roleRef}
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-white dark:bg-gray-800 text-teal-700 dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-300 font-semibold"
            ref={submitButtonRef}
          >
            Login to your account
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
