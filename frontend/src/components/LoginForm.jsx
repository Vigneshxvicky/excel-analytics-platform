// src/components/LoginForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
// Use a named import because jwt-decode doesn't export a default
import { jwtDecode } from "jwt-decode";
import "animate.css/animate.min.css";
import "./AnimatedBackground.css"; // Import our animated background styles

function LoginForm() {
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  // loginType is "user" or "admin"
  const [loginType, setLoginType]     = useState("user");
  const [error, setError]             = useState("");
  const navigate                    = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });

      if (response.data.success) {
        const token = response.data.token;
        localStorage.setItem("authToken", token);
        const decoded = jwtDecode(token);

        if (loginType === "admin") {
          if (decoded.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            setError("Access Denied: Not an admin account.");
          }
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(response.data.message || "Login failed.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred during login."
      );
    }
  };

  // Glassmorphism card styling (different styles for user vs. admin)
  const cardClassUser = // Reduced padding on small screens
    "bg-white/70 backdrop-blur-lg p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/30 transform transition-all duration-500 hover:scale-105 mx-4 sm:mx-0"; // Add horizontal margin on smallest screens
  const cardClassAdmin =
    "bg-gray-800/70 backdrop-blur-lg p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/30 transform transition-all duration-500 hover:scale-105 mx-4 sm:mx-0"; // Add horizontal margin on smallest screens
  const cardClass = loginType === "admin" ? cardClassAdmin : cardClassUser;

  const headerClass = loginType === "admin"
    ? "text-2xl font-bold text-center text-white mb-6"
    : "text-2xl font-bold text-center text-gray-800 mb-6";

  const labelClass = loginType === "admin"
    ? "block text-sm font-medium text-gray-300"
    : "block text-sm font-medium text-gray-700";

  const inputClass = loginType === "admin"
    ? "mt-1 block w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
    : "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500";

  const textClass = loginType === "admin" ? "text-gray-300" : "text-gray-600";

  return (
    <div
      className={`relative min-h-screen animated-gradient animate__animated animate__fadeIn`}
    >
      {/* Optional overlay for extra contrast */}
      <div className="absolute inset-0 bg-black opacity-20"></div>

      {/* Login form container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className={cardClass}>
          <h2 className={headerClass}>
            {loginType === "admin" ? "Admin Login" : "Login"}
          </h2>

          {error && <p className="mb-4 text-center text-red-600">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            {/* Login Type Selection */}
            <div className="flex items-center space-x-4">
              <span className={`text-sm font-medium ${textClass}`}>
                Login as:
              </span>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="loginType"
                  value="user"
                  checked={loginType === "user"}
                  onChange={() => setLoginType("user")}
                />
                <span className="ml-2">User</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="loginType"
                  value="admin"
                  checked={loginType === "admin"}
                  onChange={() => setLoginType("admin")}
                />
                <span className="ml-2">Admin</span>
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Login
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Google Login Button */}
          <div>
            <a
              href="http://localhost:5000/auth/google"
              className="flex items-center justify-center w-full bg-red-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-transform duration-300"
            >
              <svg
                className="w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.5 0 6.4 1.2 8.8 3.2l6.6-6.6C34.8 2.5 29.8 0 24 0 14.6 0 6.4 5.8 2.6 14.2l7.7 6C12.4 13.2 17.7 9.5 24 9.5z"
                />
                <path
                  fill="#34A853"
                  d="M46.5 24c0-1.6-.2-3.2-.5-4.7H24v9h12.7c-.5 2.5-2 4.7-4.2 6.2l6.6 5.1c3.8-3.5 6-8.7 6-14.6z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.3 28.2c-.8-2.5-.8-5.2 0-7.7l-7.7-6c-2.5 5-2.5 10.8 0 15.8l7.7-6z"
                />
                <path
                  fill="#4285F4"
                  d="M24 48c5.8 0 10.8-1.9 14.4-5.2l-6.6-5.1c-2 1.3-4.5 2-7.8 2-6.3 0-11.6-3.7-13.8-9l-7.7 6C6.4 42.2 14.6 48 24 48z"
                />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              Sign in with Google
            </a>
          </div>

          {/* Link to Register */}
          <div className="mt-4 text-center">
            <p className={textClass}>
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;