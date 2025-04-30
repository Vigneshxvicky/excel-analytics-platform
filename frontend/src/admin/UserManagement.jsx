// src/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client'; // Import socket.io client

const SOCKET_SERVER_URL = 'http://localhost:5000'; // Your backend URL

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Fetch initial user list
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken'); // <-- Use the consistent key "authToken"
        if (!token) {
            throw new Error('No authentication token found.');
        }
        const response = await axios.get(`${SOCKET_SERVER_URL}/api/dashboard/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setUsers(response.data.users);
        } else {
          throw new Error(response.data.message || 'Failed to fetch users');
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message || 'Could not load user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    // 2. Setup Socket.IO connection and listeners
    const socket = io(SOCKET_SERVER_URL);

    socket.on('connect', () => {
      console.log('Socket connected for user management');
    });

    // Listen for new user registrations
    socket.on('newUser', (newUser) => {
      console.log('New user received:', newUser);
      // Add the new user to the beginning of the list
      setUsers((prevUsers) => [newUser, ...prevUsers]);
    });

    // TODO: Add listeners for 'userUpdated' and 'userDeleted' if implemented in backend

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // 3. Cleanup on component unmount
    return () => {
      socket.disconnect();
    };

  }, []); // Empty dependency array ensures this runs only once on mount

  if (loading) return <p className="text-center mt-4">Loading users...</p>;
  if (error) return <p className="text-center mt-4 text-red-500">Error: {error}</p>;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">User Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Source
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user._id || user.email} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.googleId ? 'Google' : 'Local'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default UserManagement;