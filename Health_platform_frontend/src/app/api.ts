import axios from 'axios';

const api = axios.create({
  baseURL: 'https://healthplatform.onrender.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const isAuthRequest = config.url?.includes('token-login') || config.url?.includes('register');

  if (token && !isAuthRequest) {
    config.headers.Authorization = `Token ${token}`;
    console.log("DEBUG: Requête envoyée avec en-tête Authorization:", config.headers.Authorization);
  } else if (!token) {
    console.warn("DEBUG: Aucune requête token trouvée dans localStorage");
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
