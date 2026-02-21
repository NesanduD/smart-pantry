import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const Login = () => {
  const [creds, setCreds] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    try {
      // Send credentials to your Django backend
      const res = await api.post('login/', creds);
      
      // Save the tokens so 'api.js' can use them
      localStorage.setItem('access_token', res.data.tokens.access);
      localStorage.setItem('refresh_token', res.data.tokens.refresh);
      
      alert("Login Successful!");
      navigate('/scan'); // Send the user to the scanner page
    } catch (err) {
      console.error(err);
      alert("Login Failed. Check your username and password.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-80">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login to SmartPantry</h2>
        
        <input 
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          type="text" 
          placeholder="email" 
          onChange={e => setCreds({...creds, email: e.target.value})} 
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