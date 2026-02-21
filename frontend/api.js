import axios from 'axios';

const api = axios.create({
  baseURL: 'https://smart-pantry-zqj4.onrender.com/api/', // This points to your Django server
});

// Automatically add the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;