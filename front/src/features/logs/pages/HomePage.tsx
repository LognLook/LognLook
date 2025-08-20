import React, { useState } from "react";
import WelcomeCard from "../components/WelcomeCard";
import TeamBoard from "../components/TeamBoard";
import LogGraph from "../components/LogGraph/LogGraph";
import LogDistribution from "../components/LogDistribution/LogDistribution";
import RecentLogs from "../components/RecentLogs";
import { TimePeriod } from "../../../types/logs";
import { useProjectStore } from "../../../store/projectStore";

interface HomePageProps {
  isSidebarOpen: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ isSidebarOpen }) => {
  // TimePeriod 상태 관리
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('day');
  
  // 선택된 프로젝트 가져오기
  const { selectedProject } = useProjectStore();

  // 프로젝트가 선택되지 않은 경우 대기 상태 표시
  if (!selectedProject) {
    return (
      <div className={`flex flex-col ${isSidebarOpen ? 'w-[79.03vw]' : 'w-[87.64vw]'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500 text-lg">프로젝트를 선택해주세요</p>
            <p className="text-gray-400 text-sm mt-2">좌측 메뉴에서 프로젝트를 선택하면 로그 데이터를 볼 수 있습니다</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${isSidebarOpen ? 'w-[79.03vw]' : 'w-[87.64vw]'}`}>
      {/* Welcome과 팀보드 영역 */}
      <div className="flex gap-8 items-stretch w-full pt-3">
        <WelcomeCard className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="w-full">
            <TeamBoard />
          </div>
        </div>
      </div>

      {/* 로그 그래프와 파이 차트 */}
      <section className="flex gap-8 mt-3">
        <LogGraph 
          projectId={selectedProject.id} 
          timePeriod={selectedTimePeriod}
          onTimePeriodChange={setSelectedTimePeriod}
        />
        <LogDistribution 
          projectId={selectedProject.id}
          timePeriod={selectedTimePeriod}
        />
      </section>

      {/* 로그 리스트 */}
      <section className="mt-7">
        <RecentLogs 
          isSidebarOpen={isSidebarOpen}
          projectId={selectedProject.id}
        />
      </section>
    </div>
  );
};

export default HomePage;
