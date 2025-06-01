import React, { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import WelcomeCard from "../components/WelcomeCard";
import TeamBoard from "../components/TeamBoard";
import LogGraph from "../components/LogGraph/LogGraph";
import LogDistribution from "../components/LogDistribution/LogDistribution";
import RecentLogs from "../components/RecentLogs";
import SearchBar from "../components/SearchBar";
import { useQuery } from "@tanstack/react-query";
import { getLogs } from "../api/logApi";
import { LogLevel } from "../types/logTypes";

interface ApiLogEntry {
  extracted_timestamp: string;
  log_level: LogLevel;
}

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // API로부터 로그 데이터 가져오기
  const { data: logs } = useQuery<ApiLogEntry[]>({
    queryKey: ['logs'],
    queryFn: async () => {
      const response = await getLogs();
      return response as unknown as ApiLogEntry[];
    },
    retry: false,
  });

  return (
    <DashboardLayout>
      {({ isSidebarOpen }) => (
        <div className={`flex flex-col ${isSidebarOpen ? 'w-[79.03vw]' : 'w-[87.64vw]'}`}>
          {/* 서치바와 프로필 */}
          <div className="flex items-center justify-between w-full">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search anything"
              />
            </div>
            <div className="flex items-center gap-3 mr-[82px] lg:mr-[58px]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#496660] flex items-center justify-center text-white font-medium">
                JS
              </div>
              <span className="text-[14px] font-medium text-gray-700">John Smith</span>
            </div>
          </div>

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
            <LogGraph projectId={1} />
            <LogDistribution logs={logs} />
          </section>

          {/* 로그 리스트 */}
          <section className="mt-7">
            <RecentLogs isSidebarOpen={isSidebarOpen} />
          </section>
        </div>
      )}
    </DashboardLayout>
  );
};

export default HomePage;
