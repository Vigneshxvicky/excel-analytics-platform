// src/components/RegisterForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

function RegisterForm({ onRegisterSuccess }) {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]       = useState('user');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/register', { name, email, password, role });
      if (response.data.success) {
        alert("Registration successful! Now you can log in.");
        onRegisterSuccess();  // Notify parent if needed
      } else {
        setErrorMsg("Registration failed.");
      }
    } catch (error) {
      setErrorMsg("Registration failed. Please try again.");
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h3>Register</h3>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '10px' }}>
          <label>Name:</label><br />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ width: '250px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '250px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label><br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '250px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Role:</label><br />
          <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '250px' }}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterForm;