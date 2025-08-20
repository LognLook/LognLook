import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeCard from "../components/WelcomeCard";
import TeamBoard from "../components/TeamBoard";
import LogGraph from "../components/LogGraph/LogGraph";
import LogDistribution from "../components/LogDistribution/LogDistribution";
import RecentLogs from "../components/RecentLogs";
import { TimePeriod } from "../../../types/logs";
import { useProjectStore } from "../../../store/projectStore";
import { TroubleItem } from "../../../services/troubleService";

interface HomePageProps {
  isSidebarOpen: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ isSidebarOpen }) => {
  // TimePeriod 상태 관리
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('day');
  const navigate = useNavigate();
  
  // 선택된 프로젝트 가져오기
  const { selectedProject } = useProjectStore();

  // 트러블 카드 클릭 핸들러
  const handleTroubleClick = (trouble: any) => {
    // 팀보드에서 클릭된 트러블의 경우, 트러블 슈팅 모달을 열기 위해
    // 트러블 슈팅 탭으로 이동하고 해당 트러블을 선택된 상태로 설정
    navigate('/troubles', { 
      state: { 
        selectedTroubleId: trouble.id,
        openTroubleModal: true 
      } 
    });
    
    console.log('Navigating to trouble with ID:', trouble.id);
  };

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
            <TeamBoard onTroubleClick={handleTroubleClick} />
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
