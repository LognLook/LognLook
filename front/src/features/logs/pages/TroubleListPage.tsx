import React, { useEffect, useState } from 'react';
import { fetchTroubleList, TroubleListItem, fetchTroubleById, TroubleWithLogs } from '../api/troubleApi';
import { fetchLogDetail, ApiLogDetailEntry } from '../api/detailLogApi';
import LogDetailModal from '../components/LogDetailModal';
import { DisplayLogItem } from '../../../types/logs';
import timeIcon from '../../../assets/icons/time.png';

interface TroubleListPageProps {
  projectId: number;
  userId: number;
  isSidebarOpen: boolean;
}

const TroubleShootingPage: React.FC<TroubleListPageProps> = ({ projectId, userId, isSidebarOpen }) => {
  const [troubles, setTroubles] = useState<TroubleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrouble, setSelectedTrouble] = useState<TroubleWithLogs | null>(null);
  const [modalLogs, setModalLogs] = useState<DisplayLogItem[]>([]);
  const [detailData, setDetailData] = useState<ApiLogDetailEntry[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [actualLogCounts, setActualLogCounts] = useState<Record<number, number>>({});

  // 사이드바 상태에 따른 너비 계산
  const getWidthClass = () => {
    return isSidebarOpen ? 'w-[74.93vw]' : 'w-[87.64vw]';
  };

  // 실제 로그 개수 가져오기
  const fetchActualLogCounts = async (troubles: TroubleListItem[]) => {
    const logCounts: Record<number, number> = {};
    
    for (const trouble of troubles) {
      try {
        const troubleDetails = await fetchTroubleById(trouble.id, userId);
        logCounts[trouble.id] = troubleDetails.logs.length;
      } catch (error) {
        console.error(`Failed to fetch logs for trouble ${trouble.id}:`, error);
        // 에러 시 기본값 사용
        logCounts[trouble.id] = trouble.logs_count;
      }
    }
    
    setActualLogCounts(logCounts);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchTroubleList(projectId, userId);
        setTroubles(res.items);
        
        // 실제 로그 개수 가져오기
        await fetchActualLogCounts(res.items);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId, userId]);

  const handleTroubleClick = async (troubleId: number) => {
    try {
      setIsDetailLoading(true);
      
      // 1. Trouble 상세 정보 가져오기
      const troubleDetails = await fetchTroubleById(troubleId, userId);
      setSelectedTrouble(troubleDetails);
      
      // 2. 관련 로그 상세 정보 먼저 가져오기
      let logDetails: ApiLogDetailEntry[] = [];
      if (troubleDetails.logs.length > 0) {
        logDetails = await fetchLogDetail({
          projectId: projectId,
          logIds: troubleDetails.logs
        });
        setDetailData(logDetails);
      }
      
      // 3. 로그 상세 정보를 바탕으로 DisplayLogItem 생성
      const displayLogs: DisplayLogItem[] = troubleDetails.logs.map((logId, index) => {
        // 해당 로그 ID와 일치하는 상세 정보 찾기
        const logDetail = logDetails.find(detail => detail._id === logId);
        
        return {
          id: logId,
          title: logDetail?._source?.message || logDetail?._source?.event?.original || `Log ${index + 1}`,
          timestamp: logDetail?._source?.message_timestamp || logDetail?._source?.['@timestamp'] || new Date().toISOString(),
          level: (logDetail?._source?.log_level as 'INFO' | 'WARN' | 'ERROR') || 'INFO',
          category: logDetail?._source?.keyword || 'system',
          comment: logId // 로그 ID를 comment에 저장
        };
      });
      setModalLogs(displayLogs);
      
      setModalOpen(true);
    } catch (error) {
      console.error('Failed to load trouble details:', error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTrouble(null);
    setModalLogs([]);
    setDetailData([]);
  };

  if (loading) {
    return (
      <div className={`flex flex-col ${getWidthClass()}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-[#1E435F] text-lg font-pretendard">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${getWidthClass()} flex flex-col gap-6 pt-8`}>
      {/* 트러블슈팅 카드 그리드 */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-4">
          {troubles.map(trouble => (
            <div 
              key={trouble.id} 
              className="flex-none border-transparent border rounded-[8px] bg-white hover:bg-[#F1FFFC] hover:border-[#6E9990] px-3 py-3 cursor-pointer transition-all duration-200 relative"
              style={{ 
                minWidth: '220px',
                minHeight: '140px'
              }}
              onClick={() => handleTroubleClick(trouble.id)}
            >
              {/* 상단: 제목과 공유 상태 */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-[clamp(14px,1vw,16px)] font-semibold font-pretendard text-black flex-1 overflow-hidden whitespace-nowrap text-ellipsis" 
                    title={trouble.report_name}>
                  {trouble.report_name}
                </h3>
                <span className={`px-2 py-1 rounded-[4px] text-[clamp(10px,0.8vw,12px)] font-semibold font-pretendard flex-shrink-0 ${
                  trouble.is_shared 
                    ? 'bg-[#B8FFF1] text-black' 
                    : 'bg-gray-100 text-black'
                }`}>
                  {trouble.is_shared ? 'Shared' : 'Private'}
                </span>
              </div>

              {/* 생성 시간 */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-[clamp(12px,0.9vw,13px)] font-normal font-pretendard text-black">
                  <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                    <img src={timeIcon} alt="Time" className="w-4 h-4" />
                  </div>
                  <span>{new Date(trouble.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* 로그 개수 */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-[clamp(12px,0.9vw,13px)] font-normal font-pretendard text-black">
                  <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                      <path 
                        d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" 
                        fill="#1E435F" 
                      />
                      <path 
                        d="M14 2V8H20" 
                        fill="none" 
                        stroke="#B8FFF1" 
                        strokeWidth="1.5"
                      />
                      <path 
                        d="M8 12H16M8 16H16M8 8H10" 
                        stroke="#B8FFF1" 
                        strokeWidth="1.5" 
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <span>Logs: {actualLogCounts[trouble.id] ?? trouble.logs_count}</span>
                </div>
              </div>

              {/* 하단 오른쪽: 작성자 프로필 */}
              <div className="absolute bottom-3 right-3">
                <div className="w-6 h-6 rounded-full bg-[#496660] flex items-center justify-center text-white font-medium text-[clamp(9px,0.65vw,10px)]">
                  SY
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 빈 상태 */}
      {troubles.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-black text-lg font-pretendard mb-2">
            트러블슈팅 리포트가 없습니다
          </div>
          <div className="text-black text-sm font-pretendard">
            로그에서 문제를 발견하면 AI 트러블슈팅을 시작해보세요
          </div>
        </div>
      )}

      {selectedTrouble && (
        <LogDetailModal
          isOpen={modalOpen}
          onClose={closeModal}
          logs={modalLogs}
          detailData={detailData}
          isDetailLoading={isDetailLoading}
          selectedTrouble={selectedTrouble}
        />
      )}
    </div>
  );
};

export default TroubleShootingPage; 