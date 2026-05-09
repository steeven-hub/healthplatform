import axios from 'axios';

const api = axios.create({
  baseURL: 'https://healthplatform.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajout d'un intercepteur pour le token si nécessaire plus tard
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;
