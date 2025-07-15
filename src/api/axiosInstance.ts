import axios from 'axios';


const backendUrl = import.meta.env.VITE_BACKEND_URL;


const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true, // per inviare anche i cookie se necessario
});

api.interceptors.request.use((config:any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
