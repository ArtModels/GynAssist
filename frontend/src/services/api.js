import axios from 'axios';
import { auth } from '../firebase';

const BASE = import.meta.env.VITE_API_BASE_URL;
const api = axios.create({
    // Si VITE_API_BASE_URL está vacío → usa /api relativo (Vite proxy lo redirige a :8000)
    // Si tiene valor (producción) → usa la URL absoluta
    baseURL: BASE ? `${BASE}/api` : '/api',
});

// Interceptor para inyectar Token de Firebase
api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
