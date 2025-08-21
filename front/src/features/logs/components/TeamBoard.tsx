import React, { useEffect, useState } from "react";
import { troubleService, TroubleItem } from "../../../services/troubleService";
import { useProjectStore } from "../../../store/projectStore";
import { useNavigate } from "react-router-dom";
import featureIcon from "../../../assets/icons/feature.png";
import timeIcon from "../../../assets/icons/time.png";
import TeamBoardModal from "./TeamBoardModal";

interface TeamBoardProps {
  onTroubleClick?: (trouble: SharedTroubleItem) => void;
}

// API 응답의 아이템 타입 정의
interface SharedTroubleItem {
  id: number;
  report_name: string;
  created_at: string;
  creator_username: string;
  is_shared: boolean;
  logs_count: number;
}

const TeamBoard: React.FC<TeamBoardProps> = ({ onTroubleClick }) => {
  const { selectedProject } = useProjectStore();
  const navigate = useNavigate();
  const [sharedTroubles, setSharedTroubles] = useState<SharedTroubleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTrouble, setSelectedTrouble] = useState<SharedTroubleItem | null>(null);
  const [showTeamBoardModal, setShowTeamBoardModal] = useState(false);

  useEffect(() => {
    const fetchSharedTroubles = async () => {
      if (!selectedProject) return;
      
      console.log('Fetching shared troubles for project:', selectedProject.id);
      setIsLoading(true);
      try {
        const response = await troubleService.getProjectTroubles(
          selectedProject.id,
          1, // page
          10, // size
          undefined, // search
          true, // is_shared = true (공유된 트러블만)
          undefined // created_by
        );
        console.log('Shared troubles response:', response);
        console.log('Individual trouble items:', response.items.map(item => ({
          id: item.id,
          report_name: item.report_name,
          logs_count: item.logs_count,
          is_shared: item.is_shared,
          created_at: item.created_at
        })));
        setSharedTroubles(response.items);
      } catch (error) {
        console.error('Failed to fetch shared troubles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedTroubles();
  }, [selectedProject]);

  const handleTroubleCardClick = (trouble: SharedTroubleItem) => {
    // 디버깅: 클릭된 trouble 객체 확인
    console.log('Clicked trouble object:', trouble);
    console.log('Trouble ID:', trouble.id, 'Type:', typeof trouble.id);
    console.log('Trouble keys:', Object.keys(trouble));
    
    // 트러블 슈팅 모달 열기 (onTroubleClick이 있으면 호출, 없으면 팀보드 모달 열기)
    if (onTroubleClick) {
      onTroubleClick(trouble);
    } else {
      // 팀보드 모달 열기
      console.log('Setting selectedTrouble:', trouble);
      setSelectedTrouble(trouble);
      setShowTeamBoardModal(true);
    }
  };

  const handleTroubleUpdated = (troubleId: number) => {
    // 트러블이 업데이트되었을 때 목록 새로고침
    setSharedTroubles(prev => prev.filter(t => t.id !== troubleId));
  };

  if (!selectedProject) {
    return (
      <div>
        <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000] mb-2">
          Team Board
        </h2>
        <div className="bg-[#F8F9FA] rounded-[12px] p-6 text-center border border-[#E9ECEF]">
          <div className="w-16 h-16 bg-[#E9ECEF] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#6C757D]">
              <path d="M19 21L12 16L5 21V5C5 3.9 5.9 3 7 3H17C18.1 3 19 3.9 19 5V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-[16px] font-medium text-[#000000] mb-2 font-pretendard">프로젝트를 선택해주세요</h3>
          <p className="text-[14px] text-[#6C757D] font-pretendard">팀보드를 보려면 프로젝트를 먼저 선택해야 합니다</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full min-h-[19.4vh] flex flex-col">
        <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000] mb-2">
          Team Board
        </h2>
        <div className="bg-white rounded-lg flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[#F8F9FA] rounded-full flex items-center justify-center mb-4">
            <div className="w-6 h-6 border-2 border-[#6C757D] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[14px] text-[#6C757D] font-pretendard">Loading shared troubles...</p>
        </div>
      </div>
    );
  }

  if (sharedTroubles.length === 0) {
    return (
      <div className="h-full min-h-[19.4vh] flex flex-col">
        <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000] mb-2">
          Team Board
        </h2>
        <div className="flex-1">
          <div 
            className="bg-white/30 border border-gray-200/50 rounded-[8px] backdrop-blur-sm flex items-center justify-center"
            style={{ 
              width: '226px',
              height: '132px'
            }}
          >
            <div className="text-center">
              <p className="text-[14px] text-[#6C757D] font-pretendard font-medium">No shared troubles yet</p>
              <p className="text-[12px] text-[#9CA3AF] font-pretendard mt-1">Share your troubleshooting reports</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[19.4vh] flex flex-col">
      <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000] mb-2">
        Team Board
      </h2>
      
      <div 
        className="overflow-x-scroll w-full flex-1" 
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db transparent'
        }}
      >
        <div className="inline-flex space-x-4 pb-4 h-full items-center" style={{ width: 'max-content' }}>
          {sharedTroubles.map((trouble) => (
            <div
              key={trouble.id}
              className="flex-none border-transparent border rounded-[8px] bg-white hover:bg-[#F1FFFC] hover:border-[#6E9990] px-4 py-3 relative cursor-pointer transition-all duration-200"
              style={{ 
                width: '226px',
                height: '132px'
              }}
              onClick={() => handleTroubleCardClick(trouble)}
            >
              <div>
                {/* Title */}
                <h3 className="text-[clamp(14px,1vw,16px)] font-semibold text-[#000000]">
                  {trouble.report_name}
                </h3>

                                  {/* Logs Count */}
                  <div className="flex items-center gap-2 text-[clamp(12px,0.95vw,14px)] font-regular font-pretendard text-[#000000] pt-2">
                    <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                      <img src={featureIcon} alt="Feature" className="w-4 h-4" />
                    </div>
                    <span>로그 {trouble.logs_count && trouble.logs_count > 0 ? `${trouble.logs_count}개` : '없음'}</span>
                  </div>

                {/* Created at */}
                <div className="flex items-center gap-2 text-[clamp(12px,0.95vw,14px)] font-regular font-pretendard text-[#000000] pt-1">
                  <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                    <img src={timeIcon} alt="Time" className="w-4 h-4" />
                  </div>
                  <span>
                    {new Date(trouble.created_at).toLocaleString()}
                  </span>
                </div>

                {/* Creator - right bottom aligned */}
                <div className="absolute bottom-3 right-3">
                  <div className="w-5 h-5 rounded-full bg-[#496660] flex items-center justify-center text-white font-medium text-[clamp(8px,0.6vw,9px)]">
                    {trouble.creator_username ? 
                      trouble.creator_username.split(' ').map(name => name[0]).join('') :
                      'U'
                    }
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Board Modal */}
      <TeamBoardModal
        isOpen={showTeamBoardModal}
        onClose={() => setShowTeamBoardModal(false)}
        trouble={selectedTrouble}
        onTroubleUpdated={handleTroubleUpdated}
      />
    </div>
  );
};

export default TeamBoard;
