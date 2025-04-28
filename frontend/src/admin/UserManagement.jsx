// src/admin/UserManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const UserManagement = () => {
  const [users, setUsers] = useState([]);       // To hold user data
  const [loading, setLoading] = useState(true);   // Loading state
  const [error, setError] = useState(null);       // Error state
  const [search, setSearch] = useState("");       // Search term

  // Fetch users from the API when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Change this URL if your backend route is different
// If your backend is on port 5000, change the URL explicitly:
const response = await axios.get("http://localhost:5000/api/dashboard/users");
        setUsers(response.data.users); // Assuming the API returns { users: [...] }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Delete handler to call backend API and update UI
  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  // Filter users based on the search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        User Management
      </h2>
      <input
        type="text"
        placeholder="Search users..."
        className="mt-4 mb-4 p-2 border rounded-lg w-full"
        onChange={(e) => setSearch(e.target.value)}
      />
      <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="p-3">Name</th>
            <th className="p-3">Role</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id} className="border-t dark:border-gray-600">
              <td className="p-3">{user.name}</td>
              <td className="p-3">{user.role}</td>
              <td className="p-3">
                <button
                  onClick={() => handleDelete(user.id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filteredUsers.length === 0 && (
            <tr>
              <td colSpan="3" className="p-3 text-center">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;