import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.scss";
import axios from "axios";
import config from '../../config'
const backend_url = config.backend_url
const AdminLogin = () => {
  const [selectedRole, setSelectedRole] = useState('Employees');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
   e.preventDefault();

   try {
     const response = await axios.post(`${backend_url}/login-admin`, {
       email,
       password
     });

     if (response.status === 200) {
       // Save authentication state in localStorage
       localStorage.setItem('isAuthenticated', 'true');
       navigate('/dashboard');
     }
   } catch (error) {
     console.error("Login error:", error);

     if (error.response) {
       // The server responded with a status other than 200
       setError(error.response.data.message || "Invalid email or password");
     } else {
       // Network error or some other issue
       setError("An error occurred. Please try again.");
     }
   }
 };


  return (
    <div className="container">
      <div className="container_behind">
        <div className="container_front">
          <h3>Login</h3>
          <form onSubmit={handleSubmit} className="login_form">
            {/* <select
              id="from"
              value={selectedRole} 
              onChange={(e) => setSelectedRole(e.target.value)} 
              name="from"
            >
              <option value="Employees">Employees</option>
              <option value="Dealer">Dealer</option>
            </select> */}
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
