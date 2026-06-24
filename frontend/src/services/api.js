import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true, // Send refresh cookies
});

let accessToken = null;

// Helper to keep token updated in memory
export const setAccessToken = (token) => {
  accessToken = token;
};

// Request Interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 errors by refreshing token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        console.log('Access token expired. Requesting refresh...');
        const res = await api.post('/api/auth/refresh', {}, { withCredentials: true });
        const newToken = res.data.token;

        // Update local memory token
        setAccessToken(newToken);

        // Notify React context of token change (it listens to this event to update State)
        const event = new CustomEvent('auth-token-refresh', { detail: newToken });
        window.dispatchEvent(event);

        // Re-execute original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token session has expired.', refreshError);
        setAccessToken(null);

        // Broadcast logout event to clear state
        window.dispatchEvent(new Event('auth-logout'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
