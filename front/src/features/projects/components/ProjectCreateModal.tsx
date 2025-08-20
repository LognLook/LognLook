import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService, CreateProjectRequest } from '../../../services/projectService';
import { useProjectStore } from '../../../store/projectStore';
import logoImage from '../../../assets/icons/logo.png';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (project: any) => void;
}

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdProject, setCreatedProject] = useState<any>(null);
  const queryClient = useQueryClient();
  const { addProject } = useProjectStore();

  // 모달이 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setInviteCode('');
      setIsSuccess(false);
      setCreatedProject(null);
    }
  }, [isOpen]);

  const createProjectMutation = useMutation({
    mutationFn: (projectData: CreateProjectRequest) => projectService.createProject(projectData),
    onSuccess: (newProject) => {
      console.log('✅ ProjectCreateModal: 프로젝트 생성 성공', newProject);
      
      // 생성된 프로젝트 정보 저장
      setCreatedProject(newProject);
      
      // 실제 초대 코드 설정
      setInviteCode(newProject.inviteCode || '');
      
      // 성공 상태로 변경
      setIsSuccess(true);
      
      // store에 프로젝트 추가
      addProject(newProject);
      
      // 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      console.error('❌ ProjectCreateModal: 프로젝트 생성 실패', error);
      setIsSuccess(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createProjectMutation.mutate({
        name: name.trim(),
        description: description.trim() || 'No description'
      });
    }
  };

  const handleClose = () => {
    if (isSuccess && createdProject && onSuccess) {
      // 성공한 경우 프로젝트 선택 콜백 실행
      onSuccess(createdProject);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[20px] shadow-xl p-8 w-full max-w-md mx-4 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-6">
          <img 
            src={logoImage} 
            alt="LognLook Logo" 
            className="mx-auto h-12 w-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-[#1E435F] font-pretendard">
            {isSuccess ? 'Project Created!' : 'Create Your Project'}
          </h2>
        </div>
        
        {!isSuccess ? (
          // 프로젝트 생성 폼
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-[1.25rem] focus:outline-none focus:ring-2 focus:ring-[#496660] focus:border-[#496660]"
                placeholder="Lognlook"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-[1.25rem] focus:outline-none focus:ring-2 focus:ring-[#496660] focus:border-[#496660]"
                placeholder="Enter project description"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-[1.25rem] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || createProjectMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-[#496660] rounded-[1.25rem] hover:bg-[#5a7670] disabled:bg-gray-400 transition-colors"
              >
                {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        ) : (
          // 성공 화면 - 초대 코드 표시
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E6F7F1] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#496660]">
                <svg className="w-8 h-8 text-[#496660]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600 mb-6">Your project has been created successfully!</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invite Team Code
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inviteCode}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-[1.25rem] bg-gray-50 text-gray-700 font-mono text-center"
                />
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(inviteCode)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-[1.25rem] transition-colors"
                  title="Copy to clipboard"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                Share this code with your team members
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-white bg-[#496660] rounded-[1.25rem] hover:bg-[#5a7670] transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCreateModal;