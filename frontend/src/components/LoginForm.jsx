// src/components/LoginForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Attempt to login at our custom API endpoint
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      if (response.data.success) {
        // Save the token in localStorage and notify the parent component
        localStorage.setItem('token', response.data.token);
        onLoginSuccess(response.data.token);
      } else {
        setErrorMsg('Login failed. Please check your credentials.');
      }
    } catch (error) {
      setErrorMsg('Login failed. Please try again.');
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h3>Login</h3>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginForm;