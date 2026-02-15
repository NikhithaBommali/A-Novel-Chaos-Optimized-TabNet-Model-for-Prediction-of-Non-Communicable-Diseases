import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to include token in requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add confirm interceptor for 401 handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userName');
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export const auth = {
    signup: (data: any) => api.post('/auth/signup', data),
    login: (formData: FormData, role: string) => api.post(`/auth/login?role=${role}`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
};

export const predict = {
    tabular: (data: any, diseaseType?: string) => api.post('/predict/tabular', { ...data, disease_type: diseaseType || 'Heart Disease' }),
    uploadCsv: (formData: FormData) => api.post('/predict/upload_csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getUniqueDiseases: () => api.get<string[]>('/predict/datasets/unique-diseases'),
};

export const chat = {
    start: (disease: string) => api.post('/chat/start', null, { params: { disease_context: disease } }),
    message: (sessionId: number, content: string) => api.post(`/chat/${sessionId}/message`, null, { params: { content } }),
    getHistory: (sessionId: number) => api.get(`/chat/${sessionId}/history`),
};

export const dashboard = {
    getAdminStats: () => api.get('/predict/dashboard/admin-stats'),
    getUserStats: () => api.get('/predict/dashboard/user-stats'),
    getHistory: () => api.get('/predict/predict/history'), // Note: router prefix is /predict, check nesting
};

export default api;
