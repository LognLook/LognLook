import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserDropdownProps {
  user: {
    id: number;
    username: string;
    email: string;
  };
  onLogout: () => void;
  hideProjects?: boolean; // 프로젝트 페이지에서는 Projects 버튼을 숨김
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, onLogout, hideProjects = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleProfileSettingsClick = () => {
    setIsOpen(false);
    navigate('/profile-settings');
  };

  const handleProjectsClick = () => {
    setIsOpen(false);
    navigate('/projects');
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();
  };

  // 사용자 이름의 첫 글자들로 아바타 생성
  const getInitials = (name: string | undefined): string => {
    if (!name || typeof name !== 'string') {
      return 'U'; // 기본값
    }
    
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 사용자 아바타 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200"
      >
        <div className="w-[40px] h-[40px] rounded-full bg-[#496660] flex items-center justify-center text-white font-medium text-sm">
          {getInitials(user?.username)}
        </div>
        <span className="text-[14px] font-medium text-gray-700">{user?.username || 'Unknown User'}</span>
        {/* 화살표 아이콘 */}
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* 사용자 정보 헤더 */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-[48px] h-[48px] rounded-full bg-[#496660] flex items-center justify-center text-white font-medium">
                {getInitials(user.username)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.username}</p>
                <p className="text-sm text-gray-500">{user.email || `${user.id}@example.com`}</p>
              </div>
            </div>
          </div>

          {/* 메뉴 아이템들 */}
          <div className="py-1">
            {!hideProjects && (
              <button
                onClick={handleProjectsClick}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Projects</span>
              </button>
            )}

            <button
              onClick={handleProfileSettingsClick}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Profile Settings</span>
            </button>

            <div className="border-t border-gray-100 my-1"></div>

            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
            >
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
