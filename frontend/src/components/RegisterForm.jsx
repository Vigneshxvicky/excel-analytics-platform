import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import ThreeBackground from './ThreeBackground'; // Import the background
import "animate.css/animate.min.css"; // Import animate.css

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Role state removed

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("https://excel-analytics-platform-backend.onrender.com/api/register", {
        name,
        email,
        password,
        role: 'user', // Default role to 'user'
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

  // --- Styling adapted from LoginForm (User variant) ---
  const cardClass = "backdrop-blur-lg p-6 sm:p-10 rounded-3xl shadow-xl w-full max-w-2xl border bg-white/70 border-white/30 transition-all duration-500 mx-4 sm:mx-0"; // Changed max-w-xl to max-w-2xl

  const headerClass = "text-3xl font-semibold text-center text-gray-800 mb-8"; // Matched size/margin from LoginForm

  const labelClass = "block text-sm font-medium text-gray-700 mb-1"; // Added margin-bottom

  const inputClass = "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"; // Added focus background

  const textClass = "text-gray-600";
  const linkClass = "text-blue-600 hover:text-blue-800";

  return (
    // --- Main Container ---
    <div
      className={`relative min-h-screen flex flex-col items-center justify-center p-4 animate__animated animate__fadeIn overflow-hidden`} // Matched LoginForm structure
    >
      {/* Render the Three.js Background */}
      <ThreeBackground />

      {/* --- Content Container (Holds Heading and Form Card) --- */}
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Grand Brand Text - Using "Register" */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight
                       bg-gradient-to-r from-blue-500 via-teal-400 to-green-400 /* Different gradient for Register */
                       bg-clip-text text-transparent
                       mb-12 text-center animate__animated animate__fadeInDown animate__delay-0.5s" /* Adjusted animation/delay */
                       style={{ textShadow: '2px 2px 5px rgba(0, 0, 0, 0.30)' }}>
          Create Your Account
        </h1>

      {/* Register form container */}
      <div className="relative z-10 flex items-center w-5/6 justify-center min-h-screen">
        <div className={cardClass}>
          <h2 className={headerClass}>Register</h2>

          {error && <p className="mb-4 text-center text-red-600">{error}</p>}

          <form onSubmit={handleRegister} className="space-y-5"> {/* Matched spacing */}
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

            {/* Role Selection Removed */}

            {/* Register Button */}
            <button
              type="submit"
              className="w-full text-white py-2.5 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-gray-100" // Matched Login button style (user)
            >
              Create Account
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300"></div> {/* Matched divider style */}
          </div>

          {/* Google Register Button */}
          <div>
            <a
              href="https://excel-analytics-platform-backend.onrender.com/auth/google"
              className="flex items-center justify-center w-full py-2.5 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500 focus:ring-offset-gray-100 border border-gray-300" // Matched Google button style (user)
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
              Sign up with Google
            </a>
          </div>

          {/* Link to Login */}
          <div className="mt-8 text-center"> {/* Increased margin */}
            <p className={`text-sm ${textClass}`}> {/* Adjusted size */}
              Already have an account?{" "}
              <Link to="/login" className={`${linkClass} hover:underline font-medium`}> {/* Dynamic link color */}
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </div> // Closing tag for the main content container
  );
}

export default RegisterForm;
