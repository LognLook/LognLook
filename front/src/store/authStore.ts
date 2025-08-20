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
        // Store token in both localStorage and Zustand store
        localStorage.setItem('token', token);
        set({ 
          token, 
          user, 
          isAuthenticated: true,
          isLoading: false 
        });
      },
      
      logout: () => {
        // Remove token from both localStorage and Zustand store
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
        
        // Sync token if localStorage has different token than store
        if (storedToken && token !== storedToken) {
          set({ 
            token: storedToken, 
            isAuthenticated: true,
            // Set user info to null if not available
            user: state.user || null
          });
          return true;
        }
        
        // Logout if no token in localStorage
        if (!storedToken) {
          get().logout();
          return false;
        }
        
        // Authenticated if both tokens exist and match
        if (token && storedToken) {
          return true;
        }
        
        return false;
      },

      getStoredToken: () => {
        // Get token from localStorage first, fallback to store
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          return storedToken;
        }
        return get().token;
      },

      // Debug helper: check token state
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
      // Sync with localStorage on page load
      onRehydrateStorage: () => (state) => {
        if (state) {
          const storedToken = localStorage.getItem('token');
          if (storedToken) {
            state.token = storedToken;
            state.isAuthenticated = true;
            // Set user info to null and let API fetch actual user data
          } else if (!storedToken && state.token) {
            // Reset state if no token in localStorage
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);