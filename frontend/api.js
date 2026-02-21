import axios from 'axios';

const api = axios.create({
  baseURL: 'https://smart-pantry-zqj4.onrender.com/api/', 
});

// Automatically add the token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// We export the 'api' instance as the default export
export default api;