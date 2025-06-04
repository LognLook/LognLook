import React, { useState } from "react";
import WelcomeCard from "../components/WelcomeCard";
import TeamBoard from "../components/TeamBoard";
import LogGraph from "../components/LogGraph/LogGraph";
import LogDistribution from "../components/LogDistribution/LogDistribution";
import RecentLogs from "../components/RecentLogs";
import { TimePeriod } from "../types/logTypes";

interface HomePageProps {
  isSidebarOpen: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ isSidebarOpen }) => {
  // TimePeriod 상태 관리
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('day');

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
          projectId={1} 
          timePeriod={selectedTimePeriod}
          onTimePeriodChange={setSelectedTimePeriod}
        />
        <LogDistribution 
          projectId={1}
          timePeriod={selectedTimePeriod}
        />
      </section>

      {/* 로그 리스트 */}
      <section className="mt-7">
        <RecentLogs isSidebarOpen={isSidebarOpen} />
      </section>
    </div>
  );
};

export default HomePage;
