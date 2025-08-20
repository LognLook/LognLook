import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { useAuthStore } from '../store/authStore';

class ApiClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: '/api',  // Vite 프록시 사용
      timeout: API_CONFIG.TIMEOUT,
      withCredentials: false,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        // 로그인과 회원가입은 토큰이 필요 없음
        const isAuthEndpoint = config.url === '/auth/login' || config.url === '/auth/register';
        
        if (isAuthEndpoint) {
          return config;
        }
        
        // authStore에서 토큰 가져오기
        const token = useAuthStore.getState().getStoredToken();
        if (!token) {
          // 토큰이 없으면 요청을 차단하고 인증 오류 반환
          console.error('API: 인증 토큰 없음');
          const error = new Error('No authentication token');
          error.name = 'AuthenticationError';
          return Promise.reject(error);
        }
        
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // 401: Unauthorized, 403: Forbidden - 둘 다 인증/권한 문제
          // authStore를 통해 로그아웃 처리만 하고 리다이렉트는 하지 않음
          useAuthStore.getState().logout();
        }
        return Promise.reject(error);
      }
    );
  }
  
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, { params });
    return response.data;
  }
  
  async post<T>(url: string, data?: unknown): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data);
    return response.data;
  }
  
  async put<T>(url: string, data?: unknown): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data);
    return response.data;
  }
  
  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data);
    return response.data;
  }
  
  async delete<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url);
    return response.data;
  }
  
  getInstance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();
export default apiClient;