import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#0F2230] overflow-hidden">
      {/* 왼쪽 사이드바 */}
      <aside className="w-[279px] border-r border-gray-700 fixed h-screen overflow-y-auto bg-[#0F2230] z-10">
        <div className="px-4 pt-5">
          <div className="bg-[#F0F4F8] rounded-[20px] px-5 py-7">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
              <h1 className="text-[18px] font-bold text-[#FE5823] font-pretendard">LognLook</h1>
            </div>
            <nav>
              <ul className="space-y-2">
                <li>
                  <button className="w-full text-left py-1.5 px-1 h-[44px] rounded-[1.25rem] text-[#000000] hover:bg-[#DBEEFC] hover:font-bold bg-[#DBEEFC] font-bold text-[13px] font-pretendard flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 mx-1"></div>
                    Dashboard
                  </button>
                </li>
                <li>
                  <button className="w-full text-left py-1.5 px-1 h-[44px] rounded-[1.25rem] text-[#000000] hover:bg-[#DBEEFC] hover:font-bold font-medium text-[13px] font-pretendard flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 mx-1"></div>
                    Trouble Shooting
                  </button>
                </li>
                <li>
                  <button className="w-full text-left py-1.5 px-1 h-[44px] rounded-[1.25rem] text-[#000000] hover:bg-[#DBEEFC] hover:font-bold font-medium text-[13px] font-pretendard flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 mx-1"></div>
                    Search
                  </button>
                </li>
                <li>
                  <button className="w-full text-left py-1.5 px-1 h-[44px] rounded-[1.25rem] text-[#000000] hover:bg-[#DBEEFC] hover:font-bold font-medium text-[13px] font-pretendard flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 mx-1"></div>
                    Project Setting
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="ml-[279px] flex-1 bg-[#F0F4F8] min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout; 