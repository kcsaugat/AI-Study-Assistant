import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token and custom API keys to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  const geminiKey = localStorage.getItem('user_gemini_api_key');
  const groqKey = localStorage.getItem('user_groq_api_key');
  const openaiKey = localStorage.getItem('user_openai_api_key');
  
  if (geminiKey) config.headers['x-gemini-api-key'] = geminiKey;
  if (groqKey) config.headers['x-groq-api-key'] = groqKey;
  if (openaiKey) config.headers['x-openai-api-key'] = openaiKey;
  
  config.headers['Bypass-Tunnel-Reminder'] = 'true';
  return config;
});

// Refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          useAuthStore.getState().setAccessToken(data.data.accessToken);
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(original);
        } catch {
          useAuthStore.getState().logout();
        }
      }
    }
    return Promise.reject(error);
  }
);
