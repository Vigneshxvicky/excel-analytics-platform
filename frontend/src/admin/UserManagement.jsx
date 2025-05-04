// src/admin/UserManagement.jsx
import React, { useState, useEffect } from "react";
import api from "../api"; // Import the configured axios instance
import io from "socket.io-client"; // Import socket.io client
import { toast, ToastContainer } from "react-toastify"; // Optional: For notifications
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

import "react-toastify/dist/ReactToastify.css"; // Optional: Toastify CSS
const SOCKET_SERVER_URL =
  "https://excel-analytics-platform-backend.onrender.com"; // Your backend URL

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Keep loading state
  const [error, setError] = useState(null);
  const [revealedEmails, setRevealedEmails] = useState({}); // State to track revealed emails

  // Helper function to obfuscate email
  const obfuscateEmail = (email) => {
    if (!email || !email.includes("@")) return email; // Return original if invalid
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 3) {
      return `${localPart[0]}***@${domain}`; // Handle very short local parts
    }
    const start = localPart.substring(0, 3); // Show first 3 chars
    const end = localPart.substring(localPart.length - 1); // Show last char
    const masked = "X".repeat(localPart.length - 4); // Mask the middle
    return `${start}${masked}${end}@${domain}`;
  };

  useEffect(() => {
    // 1. Fetch initial user list
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("authToken"); // <-- Use the consistent key "authToken"
        if (!token) throw new Error("No authentication token found.");
        const response = await api.get(`/api/dashboard/users`); // Use the api instance

        if (response.data.success) {
          console.log("Fetched users:", response.data.users); // Debug log
          setUsers(response.data.users);
        } else {
          throw new Error(response.data.message || "Failed to fetch users");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message || "Could not load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    // 2. Setup Socket.IO connection and listeners
    const socket = io(SOCKET_SERVER_URL);

    socket.on("connect", () => {
      console.log("Socket connected for user management");
    });

    // Listen for new user registrations
    socket.on("newUser", (newUser) => {
      console.log("New user received:", newUser);
      // Add the new user to the beginning of the list
      // Ensure the user isn't already in the list (e.g., from initial fetch)
      setUsers((prevUsers) => {
        if (!prevUsers.some((u) => u._id === newUser._id)) {
          return [newUser, ...prevUsers];
        }
        return prevUsers;
      });
      toast.info(`New user registered: ${newUser.name}`); // Optional notification
    });

    // TODO: Add listeners for 'userUpdated' and 'userDeleted' if implemented in backend
    // Listen for user updates (e.g., role change)
    socket.on("userUpdated", (updatedUser) => {
      console.log("User updated received:", updatedUser);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === updatedUser._id ? updatedUser : user
        )
      );
    });
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // 3. Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []); // Empty dependency array ensures this runs only once on mount
  
  // Toggle email visibility
  const toggleEmailVisibility = (userId) => {
    setRevealedEmails((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Handler for changing user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/api/dashboard/users/${userId}/role`, { role: newRole });
      toast.success("User role updated!"); // Optional success notification
      // State update will be handled by the 'userUpdated' socket event
    } catch (err) {
      console.error("Error updating role:", err);
      toast.error(err.response?.data?.message || "Failed to update role."); // Optional error notification
      // Optionally revert the dropdown if the API call fails and no socket update occurs
    }
  };

  // Handler for deleting a user
  const handleDeleteUser = async (userId, userName) => {
    if (
      window.confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`
      )
    ) {
      try {
        await api.delete(`/api/dashboard/users/${userId}`);
        toast.success(`User "${userName}" deleted.`); // Optional success notification
        // State update will be handled by the 'userDeleted' socket event
        setUsers((prev) => prev.filter((user) => user._id !== userId)); // Optimistic UI update
      } catch (err) {
        console.error("Error deleting user:", err);
        toast.error(err.response?.data?.message || "Failed to delete user."); // Optional error notification
      }
    }
  };

  if (loading) return <p className="text-center mt-4">Loading users...</p>;
  if (error)
    return <p className="text-center mt-4 text-red-500">Error: {error}</p>;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        User Management
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Registered
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No users found.
                </td>
              </tr>
            )}
            {users.map(
              (user) =>
                user &&
                user._id && ( // Add checks for user and user._id
                  <tr
                    key={user._id || user.email}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <div className="flex items-center space-x-2">
                        <span>
                          {revealedEmails[user._id]
                            ? user.email
                            : obfuscateEmail(user.email)}
                        </span>
                        <button
                          onClick={() => toggleEmailVisibility(user._id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          aria-label={revealedEmails[user._id] ? "Hide email" : "Show email"}
                        >
                          {revealedEmails[user._id] ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {user.googleId ? "Google" : "Local"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {/* Role Dropdown */}
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value)
                        }
                        className="block w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700 dark:text-gray-200"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
