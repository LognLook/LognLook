import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  timezone?: string;
  language?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
  checkTokenValidity: () => boolean;
  getStoredToken: () => string | null;
  debugTokenState: () => { storeToken: string | null; localStorageToken: string | null; isAuthenticated: boolean };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: (token: string, user: User) => {
        // localStorage와 Zustand store 모두에 토큰 저장
        localStorage.setItem('token', token);
        set({ 
          token, 
          user, 
          isAuthenticated: true,
          isLoading: false 
        });
      },
      
      logout: () => {
        // localStorage와 Zustand store 모두에서 토큰 제거
        localStorage.removeItem('token');
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      checkTokenValidity: () => {
        const state = get();
        const token = state.token;
        const storedToken = localStorage.getItem('token');
        
        // localStorage에 토큰이 있고 store와 다르면 동기화
        if (storedToken && token !== storedToken) {
          set({ 
            token: storedToken, 
            isAuthenticated: true,
            // 사용자 정보가 없으면 기본값 설정
            user: state.user || {
              id: 1,
              username: 'User',
              email: 'user@example.com'
            }
          });
          return true;
        }
        
        // localStorage에 토큰이 없으면 로그아웃
        if (!storedToken) {
          get().logout();
          return false;
        }
        
        // 둘 다 있고 같으면 인증된 상태
        if (token && storedToken) {
          return true;
        }
        
        return false;
      },

      getStoredToken: () => {
        // localStorage에서 토큰을 우선적으로 가져오고, 없으면 store에서 가져옴
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          return storedToken;
        }
        return get().token;
      },

      // 디버깅용: 토큰 상태 확인
      debugTokenState: () => {
        const storeToken = get().token;
        const localStorageToken = localStorage.getItem('token');
        const isAuth = get().isAuthenticated;
        
        return { storeToken, localStorageToken, isAuthenticated: isAuth };
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
      // 페이지 로드 시 localStorage와 동기화
      onRehydrateStorage: () => (state) => {
        if (state) {
          const storedToken = localStorage.getItem('token');
          if (storedToken) {
            state.token = storedToken;
            state.isAuthenticated = true;
            // 사용자 정보가 없으면 기본값 설정
            if (!state.user) {
              state.user = {
                id: 1,
                username: 'User',
                email: 'user@example.com'
              };
            }
          } else if (!storedToken && state.token) {
            // localStorage에 토큰이 없으면 상태 초기화
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);