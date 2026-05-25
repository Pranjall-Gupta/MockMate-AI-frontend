import axios from 'axios';

const api = axios.create({
  // Use the Vercel environment variable, otherwise fallback to localhost for development
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
  withCredentials: true, // CRUCIAL: Sends the Spring session cookie in CORS requests (e.g. from Vercel to Heroku)
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;