import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProject?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireProject = false 
}) => {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const location = useLocation();

  // 인증 로딩 중
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 인증되지 않은 경우에만 로그인 페이지로
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 프로젝트가 필요하지 않은 경우 (예: /projects, /profile, /settings)
  if (!requireProject) {
    return <>{children}</>;
  }

  // 프로젝트가 필요한 경우 (예: /home, /troubles, /search)
  return <ProjectRequiredRoute>{children}</ProjectRequiredRoute>;
};

// 프로젝트가 필요한 라우트를 위한 별도 컴포넌트
const ProjectRequiredRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedProject } = useProjectStore();
  const [hasSyncedProject, setHasSyncedProject] = useState(false);
  
  // localStorage에서도 프로젝트 확인
  const localStorageProject = localStorage.getItem('selectedProject');
  const hasLocalProject = localStorageProject ? JSON.parse(localStorageProject) : null;

  // localStorage에 프로젝트가 있지만 store에는 없는 경우 동기화 (한 번만 실행)
  useEffect(() => {
    if (hasLocalProject && !selectedProject && !hasSyncedProject) {
      // store에 프로젝트 설정
      useProjectStore.getState().setSelectedProject(hasLocalProject);
      setHasSyncedProject(true);
    }
  }, [hasLocalProject, selectedProject, hasSyncedProject]);

  // 프로젝트가 선택되어 있으면 접근 허용
  if (selectedProject || hasLocalProject) {
    return <>{children}</>;
  }

  // 프로젝트가 선택되지 않은 경우에도 접근 허용 (리다이렉트 완전 차단)
  return <>{children}</>;
};

export default ProtectedRoute;