import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const Register = () => {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // This sends data to https://smart-pantry-zqj4.onrender.com/api/register/
      await api.post('register/', creds);
      alert("Registration Successful! Now you can login.");
      navigate('/login'); 
    } catch (err) {
      console.error(err);
      alert("Registration Failed. This username might be taken.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-md w-80">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>
        <input 
          className="w-full p-2 mb-4 border rounded"
          type="text" placeholder="Username" 
          onChange={e => setCreds({...creds, username: e.target.value})} 
          required
        />
        <input 
          className="w-full p-2 mb-6 border rounded"
          type="password" placeholder="Password" 
          onChange={e => setCreds({...creds, password: e.target.value})} 
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white font-bold p-2 rounded hover:bg-blue-600 transition">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;