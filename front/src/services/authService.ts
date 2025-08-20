import { apiClient } from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email?: string;
  role?: string;
  timezone?: string;
  language?: string;
}

export interface CheckUsernameResponse {
  available: boolean;
  message?: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  }
  
  async signUp(userData: SignUpRequest): Promise<UserResponse> {
    return apiClient.post<UserResponse>('/auth/register', userData);
  }
  
  async getCurrentUser(): Promise<UserResponse> {
    return apiClient.get<UserResponse>('/auth/me');
  }
  
  async checkUsername(username: string): Promise<CheckUsernameResponse> {
    // 서버에 해당 엔드포인트가 없으므로 임시로 available: true 반환
    return Promise.resolve({ available: true });
  }
  
  async logout(): Promise<void> {
    localStorage.removeItem('token');
  }
}

export const authService = new AuthService();