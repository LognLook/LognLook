import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { useAuthStore } from '../store/authStore';

class ApiClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: '/api',
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
        // Login and register endpoints don't need tokens
        const isAuthEndpoint = config.url === '/auth/login' || config.url === '/auth/register';
        
        if (isAuthEndpoint) {
          return config;
        }
        
        // Get token from authStore
        const token = useAuthStore.getState().getStoredToken();
        if (!token) {
          // Block request and return authentication error if no token
          console.error('API: No authentication token');
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
          // 401: Unauthorized, 403: Forbidden - both are authentication/authorization issues
          // Only handle logout through authStore, no redirect
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