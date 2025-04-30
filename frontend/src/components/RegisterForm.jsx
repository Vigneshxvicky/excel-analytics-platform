import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/register", {
        name,
        email,
        password,
        role,
      });

      if (response.data.success) {
        navigate("/login");
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred during registration"
      );
    }
  };

  // Glassmorphism card styling
  const cardClass = // Reduced padding on small screens
    "bg-white/70 backdrop-blur-lg p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/30 transform transition-all duration-500 hover:scale-105 mx-4 sm:mx-0"; // Add horizontal margin on smallest screens

  const headerClass = "text-2xl font-bold text-center text-gray-800 mb-6";

  const labelClass = "block text-sm font-medium text-gray-700";

  const inputClass =
    "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500";

  const textClass = "text-gray-600";

  return (
    <div
      className={`relative min-h-screen animated-gradient animate__animated animate__fadeIn`}
    >
      {/* Optional overlay for extra contrast */}
      <div className="absolute inset-0 bg-black opacity-20"></div>

      {/* Register form container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className={cardClass}>
          <h2 className={headerClass}>Register</h2>

          {error && <p className="mb-4 text-center text-red-600">{error}</p>}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className={labelClass}>
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                required
              />
            </div>

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
                className={inputClass}
                required
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
                className={inputClass}
                required
              />
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className={labelClass}>
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={inputClass}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Register
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Google Register Button */}
          <div>
            <a
              href="http://localhost:5000/auth/google"
              className="flex items-center justify-center w-full bg-red-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
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

          {/* Link to Login */}
          <div className="mt-4 text-center">
            <p className={textClass}>
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
