import React, { useState } from 'react'; // Fixes 'useState'
import { useNavigate } from 'react-router-dom'; // Fixes 'useNavigate'
import api from '../../api'; // Your api configuration

const Login = () => {
  // 1. Change 'email' to 'username'
  const [creds, setCreds] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 2. Point this to 'token/' to match your working URL
      const res = await api.post('token/', creds);
      
      // 3. SimpleJWT returns tokens at the top level of res.data
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      
      alert("Login Successful!");
      navigate('/scan'); 
    } catch (err) {
      console.error(err);
      alert("Login Failed. Check your credentials.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        
        <input 
          className="w-full p-2 mb-4 border rounded"
          type="text" 
          placeholder="Username" // Matches Django default
          onChange={e => setCreds({...creds, username: e.target.value})} 
          required
        />
        
        <input 
          className="w-full p-2 mb-6 border rounded"
          type="password" 
          placeholder="Password" 
          onChange={e => setCreds({...creds, password: e.target.value})} 
          required
        />
        
        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
