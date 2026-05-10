import axios from 'axios';

const api = axios.create({
  baseURL: 'https://healthplatform.onrender.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajout d'un intercepteur pour le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Utilisation de "Token" pour la compatibilité avec TokenAuthentication
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;
