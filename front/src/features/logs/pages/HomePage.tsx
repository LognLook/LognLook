import React, { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import WelcomeCard from "../components/WelcomeCard";
import TeamBoard from "../components/TeamBoard";
import LogGraph from "../components/LogGraph";
import LogDistribution from "../components/LogDistribution";
import RecentLogs from "../components/RecentLogs";
import SearchBar from "../components/SearchBar";
import { LogType, VisibleLogs } from "../../../@types/logs";

const HomePage: React.FC = () => {
  const [visibleLogs, setVisibleLogs] = useState<VisibleLogs>({
    all: true,
    error: false,
    warn: false,
    info: false,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const toggleVisibility = (type: LogType) => {
    if (type === "all") {
      setVisibleLogs({
        all: true,
        error: false,
        warn: false,
        info: false,
      });
    } else {
      setVisibleLogs({
        all: false,
        error: type === "error",
        warn: type === "warn",
        info: type === "info",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-[2.22vw] space-y-[1.95vh]">
        {/* 서치바 */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search anything"
        />

        {/* Welcome과 팀보드 영역 */}
        <div className="flex gap-8 items-end">
          <WelcomeCard />
          <TeamBoard />
        </div>

        {/* 로그 그래프와 파이 차트 */}
        <section className="flex gap-8">
          <LogGraph
            visibleLogs={visibleLogs}
            onToggleVisibility={toggleVisibility}
          />
          <LogDistribution />
        </section>

        {/* 로그 리스트 */}
        <RecentLogs />
      </div>
    </DashboardLayout>
  );
};

export default HomePage;
