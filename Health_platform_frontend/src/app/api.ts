import axios from 'axios';

const api = axios.create({
  baseURL: 'https://healthplatform.onrender.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const url = config.url || '';
  const isAuthRequest = url.includes('token-login') || url.includes('register');

  console.log(`DEBUG: Request to ${url}, isAuthRequest: ${isAuthRequest}`);

  if (token && !isAuthRequest) {
    config.headers.Authorization = `Token ${token}`;
    console.log("DEBUG: Requête envoyée avec en-tête Authorization:", config.headers.Authorization);
  } else if (!token && !isAuthRequest) {
    console.warn("DEBUG: Aucune requête token trouvée dans localStorage pour une requête protégée");
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
