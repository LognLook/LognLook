import React, { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import WelcomeCard from "../components/WelcomeCard";
import TeamBoard from "../components/TeamBoard";
import LogGraph from "../components/LogGraph/LogGraph";
import LogDistribution from "../components/LogDistribution/LogDistribution";
import RecentLogs from "../components/RecentLogs";
import SearchBar from "../components/SearchBar";
import { DUMMY_LOGS } from "../data/dummyLogs";

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardLayout>
      {({ isSidebarOpen }) => (
        <div className="flex flex-col">
          {/* 서치바 */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search anything"
          />

          {/* Welcome과 팀보드 영역 */}
          <div className="flex gap-8 items-stretch w-full mt-8">
            <WelcomeCard className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="w-full">
                <TeamBoard />
              </div>
            </div>
          </div>

          {/* 로그 그래프와 파이 차트 */}
          <section className="flex gap-8 mt-1">
            <LogGraph logs={DUMMY_LOGS} />
            <LogDistribution logs={DUMMY_LOGS} />
          </section>

          {/* 로그 리스트 */}
          <section className="mt-5">
            <RecentLogs isSidebarOpen={isSidebarOpen} />
          </section>
          
        </div>
      )}
    </DashboardLayout>
  );
};

export default HomePage;
