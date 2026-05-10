import axios from 'axios';

const api = axios.create({
  baseURL: 'https://healthplatform.onrender.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log("DEBUG: Intercepteur Axios - Token trouvé:", token ? "OUI" : "NON");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
