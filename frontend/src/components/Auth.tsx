import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [creds, setCreds] = useState({ username: '', password: '', email: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // Updated to hit your /api/login/ endpoint specifically
        const res = await api.post('login/', { 
          username: creds.username, 
          password: creds.password 
        });
        
        // Your backend returns tokens nested in a "tokens" object
        localStorage.setItem('access_token', res.data.tokens.access);
        localStorage.setItem('refresh_token', res.data.tokens.refresh);
        
        alert("Welcome back!");
      } else {
        // Matches UserRegistrationSerializer: sends password to both password1 and password2
        await api.post('register/', { 
            username: creds.username, 
            email: creds.email, 
            password1: creds.password, 
            password2: creds.password 
        });
        alert("Account created! Now please log in.");
        setIsLogin(true); 
        return;
      }
      navigate('/scan'); 
    } catch (err: any) {
      console.error(err);
      // Detailed error alert to help you debug during development
      const errorMsg = err.response?.data?.detail || "Authentication failed. Check your details.";
      alert(errorMsg);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96 transition-all border-t-4 border-green-500">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isLogin ? 'SmartPantry Login' : 'Join SmartPantry'}
        </h2>
        
        <div className="space-y-4">
          <input 
            className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400 outline-none"
            type="text" placeholder="Username" 
            onChange={e => setCreds({...creds, username: e.target.value})} 
            required
          />

          {!isLogin && (
            <input 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none"
              type="email" placeholder="Email Address" 
              onChange={e => setCreds({...creds, email: e.target.value})} 
              required
            />
          )}
          
          <input 
            className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400 outline-none"
            type="password" placeholder="Password" 
            onChange={e => setCreds({...creds, password: e.target.value})} 
            required
          />
        </div>
        
        <button type="submit" className={`w-full mt-6 text-white font-bold p-2 rounded transition shadow-lg ${isLogin ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
          {isLogin ? 'Sign In' : 'Create Account'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? "Need an account?" : "Already a member?"}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-blue-500 font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up Free' : 'Back to Login'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Auth;