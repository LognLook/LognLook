import axios from 'axios';

const api = axios.create({
  baseURL: '/api',  // Vite 프록시 사용
  timeout: 30000, // 5초 -> 30초로 증가 (AI 처리 시간 고려)
  withCredentials: false,  // CORS 임시 해결을 위해 credentials 비활성화
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // /logs/search API는 토큰 없이 보내기
    if (config.url === '/logs/search') {
      return config;
    }
    
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - 로그아웃만 처리하고 리다이렉트는 하지 않음
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;