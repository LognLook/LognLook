import { useAuthStore } from '../store/authStore';
import { authService, LoginRequest, SignUpRequest } from '../services/authService';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, login, logout, setLoading, checkTokenValidity } = useAuthStore();
  const navigate = useNavigate();
  const [hasCheckedTokenOnMount, setHasCheckedTokenOnMount] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    if (!hasCheckedTokenOnMount) {
      checkTokenValidity();
      setHasCheckedTokenOnMount(true);
    }
  }, [hasCheckedTokenOnMount, checkTokenValidity]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const authData = await authService.login(credentials);
      
      // Temporarily store token to fetch user data
      localStorage.setItem('token', authData.access_token);
      
      try {
        const userData = await authService.getCurrentUser();
        return { authData, userData };
      } catch (error) {
        // Use fallback data if user info fetch fails
        console.warn('Failed to fetch user info, using fallback', error);
        return { 
          authData, 
          userData: { id: 1, username: credentials.username } 
        };
      }
    },
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: ({ authData, userData }) => {
      const userWithEmail = {
        ...userData,
        email: (userData as any).email || ''
      };
      login(authData.access_token, userWithEmail);
      
      // 로그인 성공 후 기존 프로젝트 선택 페이지로 이동 (기존 앱 스타일)
      navigate('/projects');
    },
    onError: (error) => {
      console.error('로그인 실패', error);
      localStorage.removeItem('token'); // 실패 시 임시 토큰 제거
      setLoading(false);
    },
    onSettled: () => {
      setLoading(false);
    }
  });

  const signUpMutation = useMutation({
    mutationFn: async (userData: SignUpRequest) => {
      const signUpResult = await authService.signUp(userData);
      
      // 회원가입 후 자동 로그인
      const authData = await authService.login({
        username: userData.username,
        password: userData.password
      });
      
      // 임시로 토큰을 저장하여 사용자 정보를 가져올 수 있게 함
      localStorage.setItem('token', authData.access_token);
      
      try {
        const userInfo = await authService.getCurrentUser();
        return { authData, userData: userInfo };
      } catch (error) {
        // 사용자 정보 가져오기 실패 시, 회원가입 결과 사용
        console.warn('사용자 정보 가져오기 실패, 회원가입 결과 사용', error);
        return { 
          authData, 
          userData: signUpResult 
        };
      }
    },
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: ({ authData, userData }) => {
      const userWithEmail = {
        ...userData,
        email: (userData as any).email || ''
      };
      login(authData.access_token, userWithEmail);
      
      // 회원가입 성공 후 프로젝트 생성/참여 화면으로 이동
      navigate('/projects/new-user');
    },
    onError: (error) => {
      console.error('회원가입 실패', error);
      localStorage.removeItem('token'); // 실패 시 임시 토큰 제거
      setLoading(false);
    },
    onSettled: () => {
      setLoading(false);
    }
  });

  const handleLogout = async () => {
    await authService.logout();
    logout();
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || signUpMutation.isPending,
    error: loginMutation.error || signUpMutation.error,
    login: loginMutation.mutate,
    signUp: signUpMutation.mutate,
    logout: handleLogout,
    isLoginPending: loginMutation.isPending,
    isSignUpPending: signUpMutation.isPending,
    checkTokenValidity,
  };
};