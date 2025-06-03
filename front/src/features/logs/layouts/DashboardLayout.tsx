import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
  children: (props: { isSidebarOpen: boolean }) => React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboardActive = location.pathname === '/';
  const isTroubleActive = location.pathname.startsWith('/troubles');

  return (
    <div className="flex min-h-screen bg-[#F0F4F8] overflow-hidden">
      {/* 왼쪽 사이드바 */}
      <aside className={`${isSidebarOpen ? 'w-[279px]' : 'w-[91px]'} transition-all duration-300 border-r border-gray-700 fixed h-screen overflow-y-auto bg-[#0F2230] z-10`}>
        <div className={`px-4 pt-5 ${!isSidebarOpen && 'px-2'}`}>
          <div className={`bg-[#F0F4F8] rounded-[20px] px-5 py-7 ${!isSidebarOpen && 'px-2'}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
              <h1 className={`text-[18px] font-bold text-[#FE5823] font-pretendard transition-opacity duration-300 ${!isSidebarOpen && 'opacity-0 absolute'}`}>LognLook</h1>
            </div>
            <nav>
              <ul className="space-y-2">
                <li>
                  <button
                    className={`w-full text-left py-1.5 px-1 h-[44px] rounded-[1.25rem] text-[#000000] hover:bg-[#F1FFFC] hover:border hover:border-[#6E9990] hover:font-bold text-[13px] font-pretendard flex items-center ${!isSidebarOpen && 'justify-center'} ${isDashboardActive ? 'bg-[#E6F7F1] border border-[#1E435F] font-bold text-[#1E435F]' : ''}`}
                    onClick={() => navigate('/')}
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 mx-1"></div>
                    <span className={`transition-opacity duration-300 ${!isSidebarOpen && 'opacity-0 absolute w-0 overflow-hidden'}`}>Dashboard</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left py-1.5 px-1 h-[44px] rounded-[1.25rem] text-[#000000] hover:bg-[#F1FFFC] hover:border hover:border-[#6E9990] hover:font-bold font-medium text-[13px] font-pretendard flex items-center ${!isSidebarOpen && 'justify-center'} ${isTroubleActive ? 'bg-[#E6F7F1] border border-[#1E435F] font-bold text-[#1E435F]' : ''}`}
                    onClick={() => navigate('/troubles')}
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 mx-1"></div>
                    <span className={`transition-opacity duration-300 ${!isSidebarOpen && 'opacity-0 absolute w-0 overflow-hidden'}`}>Trouble Shooting</span>
                  </button>
                </li>
                <li>
                  <button className={`w-full text-left py-1.5 px-1 h-[44px] rounded-[1.25rem] text-[#000000] hover:bg-[#F1FFFC] hover:border hover:border-[#6E9990] hover:font-bold font-medium text-[13px] font-pretendard flex items-center ${!isSidebarOpen && 'justify-center'}`}>
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 mx-1"></div>
                    <span className={`transition-opacity duration-300 ${!isSidebarOpen && 'opacity-0 absolute w-0 overflow-hidden'}`}>Search</span>
                  </button>
                </li>
                <li>
                  <button className={`w-full text-left py-1.5 px-1 h-[44px] rounded-[1.25rem] text-[#000000] hover:bg-[#F1FFFC] hover:border hover:border-[#6E9990] hover:font-bold font-medium text-[13px] font-pretendard flex items-center ${!isSidebarOpen && 'justify-center'}`}>
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 mx-1"></div>
                    <span className={`transition-opacity duration-300 ${!isSidebarOpen && 'opacity-0 absolute w-0 overflow-hidden'}`}>Project Setting</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </aside>

      {/* 토글 버튼 */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed left-4 top-4 z-20 bg-[#F0F4F8] p-2 rounded-full hover:bg-[#F1FFFC] transition-colors"
      >
        <svg
          className={`w-6 h-6 transform transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
          />
        </svg>
      </button>

      {/* 메인 콘텐츠 */}
      <main className={`${isSidebarOpen ? 'ml-[279px] w-[calc(100%-279px)]' : 'ml-[91px] w-[calc(100%-91px)]'} transition-all duration-300 flex-1 bg-[#F0F4F8] min-h-screen p-10`}>
        {children({ isSidebarOpen })}
      </main>
    </div>
  );
};

export default DashboardLayout; 