import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-api-gateway-url.execute-api.us-east-2.amazonaws.com/prod';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach admin JWT from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_id_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_id_token');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);
