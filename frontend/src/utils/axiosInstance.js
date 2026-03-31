import axios from 'axios';
import { io } from 'socket.io-client';

const isProd = import.meta.env.PROD;
const defaultBaseURL = isProd ? 'https://rk-interior-solution.onrender.com/api' : 'http://localhost:5000/api';
const baseURL = import.meta.env.VITE_API_BASE_URL || defaultBaseURL;

// Extract the host origin (e.g. https://rk-interior-solution.onrender.com) for socket connection
let socketURL = 'http://localhost:5000';
try {
    const url = new URL(baseURL);
    // Use origin to ensure we only get the protocol + host (without /api)
    socketURL = url.origin;
} catch (err) {
    console.error('Invalid VITE_API_BASE_URL:', err);
    // Fallback to baseURL if origin extraction fails but it looks like a valid string
    if (typeof baseURL === 'string' && baseURL.startsWith('http')) {
        socketURL = baseURL.split('/api')[0];
    }
}

export const socket = io(socketURL, {
    transports: ['websocket', 'polling'], // Use Websocket explicitly to avoid strict CORS polling
    withCredentials: true
});

const api = axios.create({
    baseURL,
    timeout: 600000,
});

// Interceptor to add JWT token if available
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo')
            ? JSON.parse(localStorage.getItem('userInfo'))
            : null;

        if (userInfo && userInfo.token) {
            config.headers.Authorization = `Bearer ${userInfo.token}`;
        }

        // Attach socket ID so the backend knows where to push progress events
        if (socket.id) {
            config.headers['x-socket-id'] = socket.id;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
