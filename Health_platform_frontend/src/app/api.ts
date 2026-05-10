import axios from 'axios';

const api = axios.create({
  baseURL: 'https://healthplatform.onrender.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajout d'un intercepteur pour le token JWT (Bearer)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Essayer Bearer d'abord, puis Token si nécessaire
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
