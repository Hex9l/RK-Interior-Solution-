import axios from 'axios';
import { io } from 'socket.io-client';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Extract the host origin (e.g. http://localhost:5000) safely for the socket connection
let socketURL = 'http://localhost:5000';
try {
    const url = new URL(baseURL);
    socketURL = url.origin;
} catch (err) {
    console.error('Invalid VITE_API_BASE_URL:', err);
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
