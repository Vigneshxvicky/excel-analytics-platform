// src/admin/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom"; // Import useNavigate

const Sidebar = () => {
  const navLinkClass = ({ isActive }) =>
    isActive ? "text-blue-400 font-semibold" : "hover:text-blue-300 font-medium";
  const navigate = useNavigate(); // Initialize useNavigate

  const [isOpen, setIsOpen] = useState(false);

  // Optional: Close sidebar when a NavLink is clicked on mobile
  const handleNavLinkClick = () => {
    if (window.innerWidth < 768) { // Tailwind's 'md' breakpoint
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsOpen(false); // Close sidebar on logout
    navigate("/login");
  };

  return (
    <>
      {/* Overlay for mobile when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10 bg-black opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      {/* Mobile Menu Button (Hamburger) - Only show on small screens */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 fixed top-4 right-4 z-30 bg-gray-700 hover:bg-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        aria-expanded={isOpen}
        aria-controls="admin-sidebar-content"
      >
        <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
        {isOpen ? (
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      <div
        id="admin-sidebar-content"
        className={`w-64 bg-gray-800 text-white min-h-screen p-6 fixed md:sticky top-0 z-20 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out shadow-lg md:shadow-none`}
      >
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <nav>
          <ul className="space-y-4">
            <li><NavLink to="/admin/dashboard/home" className={navLinkClass} onClick={handleNavLinkClick}>Dashboard Home</NavLink></li>
            <li><NavLink to="/admin/dashboard/users" className={navLinkClass} onClick={handleNavLinkClick}>User Management</NavLink></li>
            <li><NavLink to="/admin/dashboard/analytics" className={navLinkClass} onClick={handleNavLinkClick}>Analytics</NavLink></li>
            {/* Logout Button inside the sidebar */}
            <li className="pt-4 mt-4 border-t border-gray-700"> {/* Add a separator */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-0 py-2 text-red-400 hover:text-red-300 font-medium"
              >
                Logout
              </button>
            </li>
            {/* Add other NavLinks here, applying onClick={handleNavLinkClick} if desired */}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;