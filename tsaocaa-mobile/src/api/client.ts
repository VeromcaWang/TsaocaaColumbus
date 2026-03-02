import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Replace with your API Gateway URL after sam deploy
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-api-gateway-url.execute-api.us-east-2.amazonaws.com/prod';

const TOKEN_KEY = 'tsaocaa_id_token';
const REFRESH_TOKEN_KEY = 'tsaocaa_refresh_token';

export { TOKEN_KEY, REFRESH_TOKEN_KEY };

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // SecureStore not available (e.g., web) — proceed without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 (token expired)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear stored tokens; the auth store will detect missing token and show login
      await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => {});
    }
    return Promise.reject(error);
  }
);
