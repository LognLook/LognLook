import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService, JoinProjectRequest } from '../../../services/projectService';
import { useProjectStore } from '../../../store/projectStore';
import logoImage from '../../../assets/icons/logo.png';

interface ProjectJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (project: any) => void;
}

const ProjectJoinModal: React.FC<ProjectJoinModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [joinedProject, setJoinedProject] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const queryClient = useQueryClient();
  const { addProject } = useProjectStore();

  // 모달이 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setInviteCode('');
      setIsSuccess(false);
      setJoinedProject(null);
      setError('');
    }
  }, [isOpen]);

  const joinProjectMutation = useMutation({
    mutationFn: (joinData: JoinProjectRequest) => projectService.joinProject(joinData),
    onSuccess: (joinedProject) => {
      console.log('✅ ProjectJoinModal: 프로젝트 참가 성공', joinedProject);
      
      // 참가한 프로젝트 정보 저장
      setJoinedProject(joinedProject);
      
      // 성공 상태로 변경
      setIsSuccess(true);
      
      // store에 프로젝트 추가
      addProject(joinedProject);
      
      // 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // 에러 초기화
      setError('');
    },
    onError: (error: any) => {
      console.error('❌ ProjectJoinModal: 프로젝트 참가 실패', error);
      setError(error?.response?.data?.detail || error?.message || 'Failed to join project');
      setIsSuccess(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim()) {
      setError(''); // 에러 초기화
      joinProjectMutation.mutate({
        inviteCode: inviteCode.trim()
      });
    }
  };

  const handleClose = () => {
    if (isSuccess && joinedProject && onSuccess) {
      // 성공한 경우 프로젝트 선택 콜백 실행
      onSuccess(joinedProject);
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
            {isSuccess ? 'Project Joined!' : 'Join Your Project'}
          </h2>
        </div>
        
        {!isSuccess ? (
          // 프로젝트 참가 폼
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-[1.25rem] focus:outline-none focus:ring-2 focus:ring-[#496660] focus:border-[#496660]"
                placeholder="Enter project code"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the invite code shared by the project owner
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-[1.25rem] text-sm">
                {error}
              </div>
            )}
            
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
                disabled={!inviteCode.trim() || joinProjectMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-[#496660] rounded-[1.25rem] hover:bg-[#5a7670] disabled:bg-gray-400 transition-colors"
              >
                {joinProjectMutation.isPending ? 'Joining...' : 'Join Project'}
              </button>
            </div>
          </form>
        ) : (
          // 성공 화면
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E6F7F1] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#496660]">
                <svg className="w-8 h-8 text-[#496660]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600 mb-2">Successfully joined the project!</p>
              <p className="text-lg font-semibold text-[#1E435F] font-pretendard">{joinedProject?.name}</p>
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

export default ProjectJoinModal;