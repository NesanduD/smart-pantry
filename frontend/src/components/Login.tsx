import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const Login = () => {
  // 1. Changed 'email' to 'username' to match Django's default
  const [creds, setCreds] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 2. Changed endpoint to 'token/' to match your urls.py
      const res = await api.post('token/', creds);
      
      // 3. SimpleJWT returns tokens directly in res.data
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
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login to SmartPantry</h2>
        
        <input 
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          type="text" 
          placeholder="Username" // Changed placeholder
          onChange={e => setCreds({...creds, username: e.target.value})} // Matches state key
          required
        />
        
        <input 
          className="w-full p-2 mb-6 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          type="password" 
          placeholder="Password" 
          onChange={e => setCreds({...creds, password: e.target.value})} 
          required
        />
        
        <button type="submit" className="w-full bg-green-500 text-white font-bold p-2 rounded hover:bg-green-600 transition">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;