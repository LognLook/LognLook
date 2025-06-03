import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import dashboardIcon from '../../../assets/icons/dashboard.png';
import troubleIcon from '../../../assets/icons/trouble.png';
import searchIcon from '../../../assets/icons/search.png';
import settingIcon from '../../../assets/icons/setting.png';
import logoIcon from '../../../assets/icons/logo.png';
import dashboardOn from '../../../assets/icons/dashboard_on.png';
import dashboardOff from '../../../assets/icons/dashboard_off.png';
import troubleOn from '../../../assets/icons/trouble_on.png';
import troubleOff from '../../../assets/icons/trouble_off.png';
import searchOn from '../../../assets/icons/search_on.png';
import searchOff from '../../../assets/icons/search_off.png';
import settingOff from '../../../assets/icons/setting_off.png';

interface DashboardLayoutProps {
  children: (props: { isSidebarOpen: boolean }) => React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboardActive = location.pathname === '/';
  const isTroubleActive = location.pathname.startsWith('/troubles');
  const isSearchActive = location.pathname.startsWith('/search');

  // 검색 실행 함수
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // 엔터 키로 검색
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F0F4F8] overflow-hidden">
      {/* 왼쪽 사이드바 */}
      <aside className={`${isSidebarOpen ? 'w-[279px]' : 'w-[91px]'} transition-all duration-300 border-r border-gray-700 fixed h-screen overflow-y-auto bg-[#0F2230] z-10 flex flex-col items-center`}>
        <div className="w-full h-full flex flex-col items-start justify-start">
          <div className={`${isSidebarOpen ? 'px-4' : 'px-0'} pt-5 w-full`}> 
            <div className={`${isSidebarOpen ? 'px-5' : 'px-0'} py-7 flex flex-col items-center justify-start bg-[#F0F4F8] rounded-[20px] ${!isSidebarOpen ? 'mx-4' : ''}`} style={!isSidebarOpen ? {height: '100%'} : {}}>
              <div className="flex items-center justify-between mb-4 w-full">
                <div className={`flex items-center gap-2 ${!isSidebarOpen ? 'justify-center w-full' : ''}`}> 
                  <img 
                    src={logoIcon} 
                    alt="LognLook" 
                    className="w-8 h-8 cursor-pointer" 
                    onClick={() => { if (!isSidebarOpen) setIsSidebarOpen(true); }}
                  />
                  {isSidebarOpen && (
                    <h1 className={`text-[18px] font-bold text-[#0F2230] font-pretendard`}>LognLook</h1>
                  )}
                </div>
                {/* 화살표 토글 버튼: 펼쳐진 상태에서만 보임 */}
                {isSidebarOpen && (
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 hover:bg-[#E6F7F1] rounded-full transition-colors"
                  >
                    <svg
                      className="w-4 h-4 transform transition-transform rotate-180"
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
                )}
              </div>
              <nav className="w-full">
                <ul className="space-y-2">
                  <li>
                    <button
                      className={`w-full text-left py-1.5 px-1 h-[44px] rounded-[1.25rem] text-[#000000] text-[13px] font-pretendard flex items-center ${!isSidebarOpen && 'justify-center bg-transparent border-none hover:bg-transparent hover:border-none'} ${isDashboardActive && isSidebarOpen ? 'bg-[#E6F7F1] border border-[#6E9990] font-bold text-[#000000]' : ''}`}
                      onClick={() => isSidebarOpen ? navigate('/') : (setIsSidebarOpen(true), setTimeout(() => navigate('/'), 0))}
                      onMouseEnter={e => { if (!isSidebarOpen) { const img = e.currentTarget.querySelector('img'); if (img) img.src = dashboardOn; } }}
                      onMouseLeave={e => { if (!isSidebarOpen) { const img = e.currentTarget.querySelector('img'); if (img) img.src = isDashboardActive ? dashboardOn : dashboardOff; } }}
                    >
                      <img src={isSidebarOpen ? dashboardIcon : (isDashboardActive ? dashboardOn : dashboardOff)} alt="Dashboard" className="w-8 h-8 flex-shrink-0 mx-1" />
                      {isSidebarOpen && (
                        <span className="transition-opacity duration-300 ml-2">Dashboard</span>
                      )}
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left py-1.5 px-1 h-[44px] rounded-[1.25rem] text-[#000000] text-[13px] font-pretendard flex items-center ${!isSidebarOpen && 'justify-center bg-transparent border-none hover:bg-transparent hover:border-none'} ${isTroubleActive && isSidebarOpen ? 'bg-[#E6F7F1] border border-[#6E9990] font-bold text-[#000000]' : ''}`}
                      onClick={() => isSidebarOpen ? navigate('/troubles') : (setIsSidebarOpen(true), setTimeout(() => navigate('/troubles'), 0))}
                      onMouseEnter={e => { if (!isSidebarOpen) { const img = e.currentTarget.querySelector('img'); if (img) img.src = troubleOn; } }}
                      onMouseLeave={e => { if (!isSidebarOpen) { const img = e.currentTarget.querySelector('img'); if (img) img.src = isTroubleActive ? troubleOn : troubleOff; } }}
                    >
                      <img src={isSidebarOpen ? troubleIcon : (isTroubleActive ? troubleOn : troubleOff)} alt="Trouble Shooting" className="w-8 h-8 flex-shrink-0 mx-1" />
                      {isSidebarOpen && (
                        <span className="transition-opacity duration-300 ml-2">Trouble Shooting</span>
                      )}
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left py-1.5 px-1 h-[44px] rounded-[1.25rem] text-[#000000] text-[13px] font-pretendard flex items-center ${!isSidebarOpen && 'justify-center bg-transparent border-none hover:bg-transparent hover:border-none'} ${isSearchActive && isSidebarOpen ? 'bg-[#E6F7F1] border border-[#6E9990] font-bold text-[#000000]' : ''}`}
                      onClick={() => isSidebarOpen ? navigate('/search') : (setIsSidebarOpen(true), setTimeout(() => navigate('/search'), 0))}
                      onMouseEnter={e => { if (!isSidebarOpen) { const img = e.currentTarget.querySelector('img'); if (img) img.src = searchOn; } }}
                      onMouseLeave={e => { if (!isSidebarOpen) { const img = e.currentTarget.querySelector('img'); if (img) img.src = isSearchActive ? searchOn : searchOff; } }}
                    >
                      <img src={isSidebarOpen ? searchIcon : (isSearchActive ? searchOn : searchOff)} alt="Search" className="w-8 h-8 flex-shrink-0 mx-1" />
                      {isSidebarOpen && (
                        <span className="transition-opacity duration-300 ml-2">Search</span>
                      )}
                    </button>
                  </li>
                  <li>
                    <button className={`w-full text-left py-1.5 px-1 h-[44px] rounded-[1.25rem] text-[#000000] text-[13px] font-pretendard flex items-center ${!isSidebarOpen && 'justify-center bg-transparent border-none hover:bg-transparent hover:border-none'}`}
                      onClick={() => !isSidebarOpen ? setIsSidebarOpen(true) : undefined}
                      onMouseEnter={e => { if (!isSidebarOpen) { const img = e.currentTarget.querySelector('img'); if (img) img.src = settingOff; } }}
                      onMouseLeave={e => { if (!isSidebarOpen) { const img = e.currentTarget.querySelector('img'); if (img) img.src = settingOff; } }}
                    >
                      <img src={isSidebarOpen ? settingIcon : settingOff} alt="Project Setting" className="w-8 h-8 flex-shrink-0 mx-1" />
                      {isSidebarOpen && (
                        <span className="transition-opacity duration-300 ml-2">Project Setting</span>
                      )}
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className={`${isSidebarOpen ? 'ml-[279px] w-[calc(100%-279px)]' : 'ml-[91px] w-[calc(100%-91px)]'} transition-all duration-300 flex-1 bg-[#F0F4F8] min-h-screen`}>
        {/* 공통 헤더 */}
        <div className={`flex items-center justify-between w-full ${!isDashboardActive ? 'bg-white shadow-sm' : ''}`}>
          <div className="flex-1 px-10 py-4">
            {isDashboardActive ? (
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search anything"
                onKeyPress={handleKeyPress}
              />
            ) : (
              <h2 className="text-[clamp(20px,1.5vw,24px)] font-semibold font-pretendard text-[#1E435F]">
                {isTroubleActive ? 'Trouble Shooting' : 'Search'}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-3 mr-[82px] lg:mr-[58px]">
            <div className="w-[40px] h-[40px] rounded-full bg-[#496660] flex items-center justify-center text-white font-medium">
              SY
            </div>
            <span className="text-[14px] font-medium text-gray-700">Seyoung</span>
          </div>
        </div>

        {/* 페이지 컨텐츠 */}
        <div className="px-10 pb-10">
          {children({ isSidebarOpen })}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout; 