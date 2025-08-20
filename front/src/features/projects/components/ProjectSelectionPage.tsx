import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../../hooks/useProjects';
import { useAuth } from '../../../hooks/useAuth';
import { useProjectStore } from '../../../store/projectStore';
import ProjectCreateModal from './ProjectCreateModal';
import ProjectJoinModal from './ProjectJoinModal';
import UserDropdown from '../../auth/components/UserDropdown';
import logoImage from '../../../assets/icons/logo.png';

interface ProjectSelectionPageProps {
  isNewUser?: boolean;
}

const ProjectSelectionPage: React.FC<ProjectSelectionPageProps> = ({ isNewUser = false }) => {
  const navigate = useNavigate();
  const { projects, isLoading, setSelectedProject } = useProjects();
  const { user, logout } = useAuth();
  const { setSelectedProject: setStoreSelectedProject } = useProjectStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleProjectSelect = (project: any) => {
    // projectStore에 프로젝트 설정
    setStoreSelectedProject(project);
    
    // localStorage에도 직접 저장
    localStorage.setItem('selectedProject', JSON.stringify(project));
    
    // 간단하게 홈으로 이동
    navigate('/home', { replace: true });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 새로운 사용자이거나 프로젝트가 없을 때는 사진의 첫 번째 화면처럼 보여줌
  if (isNewUser || projects.length === 0) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        {/* Header with User Dropdown */}
        <div className="absolute top-4 right-4">
          {user && (
            <UserDropdown 
              user={user} 
              onLogout={handleLogout}
              hideProjects={true}
            />
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-[20px] shadow-lg p-8 max-w-md w-full mx-4 border border-gray-100">
          {/* Logo */}
          <div className="text-center mb-6">
            <img 
              src={logoImage} 
              alt="LognLook Logo" 
              className="mx-auto h-12 w-auto mb-4"
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-[#1E435F] mb-8 font-pretendard">
            Create or Join Your Project
          </h1>

          {/* Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-[#496660] text-white py-3 px-4 rounded-[1.25rem] font-medium hover:bg-[#5a7670] transition-colors"
            >
              Create Project
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full border-2 border-[#496660] text-[#496660] py-3 px-4 rounded-[1.25rem] font-medium hover:bg-[#E6F7F1] transition-colors"
            >
              Join the Project
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Login
            </button>
          </div>
        </div>

        {/* Modals */}
        <ProjectCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleProjectSelect}
        />
        <ProjectJoinModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onSuccess={handleProjectSelect}
        />
      </div>
    );
  }

  // 기존 사용자이고 프로젝트가 있을 때는 기존 앱 스타일의 그리드 뷰
  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img src={logoImage} alt="LognLook" className="h-8 w-auto mr-3" />
              <h1 className="text-xl font-semibold text-[#1E435F] font-pretendard">Projects</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <UserDropdown 
                  user={user} 
                  onLogout={handleLogout}
                  hideProjects={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#1E435F] font-pretendard">Select a Project</h2>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-4 py-2 border border-gray-300 rounded-[1.25rem] text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Join Project
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-[#496660] text-white rounded-[1.25rem] text-sm font-medium hover:bg-[#5a7670] transition-colors"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectSelect(project)}
              className="bg-white rounded-[20px] border border-gray-200 p-6 hover:border-[#496660] hover:shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-[#1E435F] truncate font-pretendard">
                  {project.name}
                </h3>
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                  project.role === 'master' 
                    ? 'bg-[#E6F7F1] text-[#496660] border border-[#6E9990]' 
                    : project.role === 'manager'
                    ? 'bg-[#FFF3E0] text-[#F57C00] border border-[#FFB74D]'
                    : project.role === 'moderator'
                    ? 'bg-[#F3E5F5] text-[#7B1FA2] border border-[#BA68C8]'
                    : project.role === 'member_manager'
                    ? 'bg-[#E8F5E8] text-[#2E7D32] border border-[#81C784]'
                    : 'bg-[#F5F5F5] text-[#616161] border border-[#E0E0E0]'
                }`}>
                  {project.role === 'master' ? 'Master' : 
                   project.role === 'manager' ? 'Manager' :
                   project.role === 'moderator' ? 'Moderator' :
                   project.role === 'member_manager' ? 'Member Manager' :
                   'Member'}
                </span>
              </div>
              {project.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="text-xs text-gray-500">
                {project.createdAt ? `Created: ${new Date(project.createdAt).toLocaleDateString()}` : 'No date available'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <ProjectCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleProjectSelect}
      />
      <ProjectJoinModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={handleProjectSelect}
      />
    </div>
  );
};

export default ProjectSelectionPage;