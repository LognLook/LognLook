import React, { useState, useRef, useCallback, useEffect } from "react";
import { DisplayLogItem, CHART_COLORS, LogLevel } from "../../../types/logs";
import LogDetailModal from "./LogDetailModal";
import { fetchRecentLogs, ApiRecentLogEntry } from "../api/recentLogApi";
import { fetchLogDetail, ApiLogDetailEntry } from "../api/detailLogApi";

interface RecentLogsProps {
  isSidebarOpen: boolean;
}

const RecentLogs: React.FC<RecentLogsProps> = ({ 
  isSidebarOpen
}) => {
  const [selectedLogs, setSelectedLogs] = useState<Set<number>>(new Set());
  const [currentPeriod, setCurrentPeriod] = useState(1); // 1: 최근 3일, 2: 그 이전 3일, ...
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<DisplayLogItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLogDetail, setSelectedLogDetail] = useState<ApiLogDetailEntry[] | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [visibleLevels, setVisibleLevels] = useState<Record<LogLevel, boolean>>({
    INFO: true,
    WARN: true,
    ERROR: true
  });
  const [allRecentLogs, setAllRecentLogs] = useState<ApiRecentLogEntry[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasMoreLogs, setHasMoreLogs] = useState(true);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // 기본: 최신순(desc)

  const observer = useRef<IntersectionObserver | null>(null);

  // API에서 특정 기간의 recent logs 가져오기
  const loadRecentLogsForPeriod = async (period: number) => {
    try {
      const data = await fetchRecentLogs({ 
        projectId: 1, 
        userId: 1, 
        count: period // count는 3일 단위 기간을 나타냄
      });
      return data;
    } catch (error) {
      console.error(`Failed to load recent logs for period ${period}:`, error);
      throw error;
    }
  };

  // 초기 로드
  useEffect(() => {
    const loadInitialLogs = async () => {
      try {
        setApiLoading(true);
        setApiError(null);
        const data = await loadRecentLogsForPeriod(1); // 최근 3일
        setAllRecentLogs(data);
        setHasMoreLogs(data.length > 0); // 데이터가 있으면 더 로드할 수 있다고 가정
      } catch (error) {
        console.error('Failed to load initial recent logs:', error);
        setApiError('Failed to load recent logs');
      } finally {
        setApiLoading(false);
      }
    };

    loadInitialLogs();
  }, []);

  // 다음 기간의 로그 로드 (무한 스크롤)
  const loadMoreLogs = async () => {
    if (isLoading || !hasMoreLogs) return;
    
    try {
      setIsLoading(true);
      const nextPeriod = currentPeriod + 1;
      const newData = await loadRecentLogsForPeriod(nextPeriod);
      
      if (newData.length === 0) {
        setHasMoreLogs(false);
      } else {
        setAllRecentLogs(prev => [...prev, ...newData]);
        setCurrentPeriod(nextPeriod);
      }
    } catch (error) {
      console.error('Failed to load more logs:', error);
      setHasMoreLogs(false);
    } finally {
      setIsLoading(false);
    }
  };

  const lastLogElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || apiLoading || !hasMoreLogs) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMoreLogs();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, apiLoading, hasMoreLogs]);

  // ApiRecentLogEntry를 DisplayLogItem으로 변환
  const convertToDisplayLog = (apiLog: ApiRecentLogEntry): DisplayLogItem => {
    return {
      title: apiLog.message, // message를 title로 사용
      timestamp: new Date(apiLog.message_timestamp).toLocaleString(),
      level: apiLog.log_level,
      category: apiLog.keyword,
      comment: apiLog.id, // ID를 숨겨서 저장 (화면에는 표시안됨)
      host: apiLog.host_name // host_name을 host로 사용
    };
  };

  // Parse logs for display and sort by timestamp
  const displayLogs: DisplayLogItem[] = allRecentLogs
    .map(convertToDisplayLog)
    .filter(log => visibleLevels[log.level as LogLevel])
    .sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  const handleLogClick = async (index: number) => {
    const clickedLog = displayLogs[index];
    console.log('Clicked log:', clickedLog);
    setSelectedLog(clickedLog);
    setIsModalOpen(true);
    
    // comment에 저장된 ID로 원본 데이터 찾기
    const logId = clickedLog.comment || "";
    console.log('Log ID from comment:', logId);
    
    // logId가 비어있으면 API 호출하지 않음
    if (!logId) {
      console.warn('No log ID found');
      return;
    }
    
    try {
      setDetailLoading(true);
      console.log('Calling fetchLogDetail with:', { projectId: 1, logIds: [logId] });
      const detailData = await fetchLogDetail({
        projectId: 1,
        logIds: [logId]
      });
      
      console.log('Detail data received:', detailData);
      if (detailData && detailData.length > 0) {
        setSelectedLogDetail(detailData);
        console.log('Detail data set to state');
      } else {
        console.warn('No detail data received or empty array');
        setSelectedLogDetail(null);
      }
    } catch (error) {
      console.error('Failed to fetch log detail:', error);
      setSelectedLogDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
    setSelectedLogDetail(null);
  };

  const handleCheckboxChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const newSelectedLogs = new Set(selectedLogs);
    if (event.target.checked) {
      newSelectedLogs.add(index);
    } else {
      newSelectedLogs.delete(index);
    }
    setSelectedLogs(newSelectedLogs);
  };

  const handleLevelToggle = (level: LogLevel) => {
    setVisibleLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  const handleTroubleShooting = async () => {
    if (selectedLogs.size > 0) {
      const selectedLogItems = Array.from(selectedLogs).map(index => displayLogs[index]);
      setSelectedLog(selectedLogItems[0]); // 첫 번째 로그를 기본 선택
      setIsModalOpen(true);
      
      // 선택된 모든 로그들의 ID 수집
      const selectedLogIds = selectedLogItems
        .map(log => log.comment || "")
        .filter(id => id !== ""); // 빈 ID 제거
      
      console.log('Trouble shooting with selected log IDs:', selectedLogIds);
      
      if (selectedLogIds.length > 0) {
        try {
          setDetailLoading(true);
          console.log('Calling fetchLogDetail for trouble shooting with:', { projectId: 1, logIds: selectedLogIds });
          const detailData = await fetchLogDetail({
            projectId: 1,
            logIds: selectedLogIds
          });
          
          console.log('Trouble shooting detail data received:', detailData);
          if (detailData && detailData.length > 0) {
            setSelectedLogDetail(detailData);
            console.log('Trouble shooting detail data set to state');
          } else {
            console.warn('No detail data received for trouble shooting');
            setSelectedLogDetail(null);
          }
        } catch (error) {
          console.error('Failed to fetch log detail for trouble shooting:', error);
          setSelectedLogDetail(null);
        } finally {
          setDetailLoading(false);
        }
      } else {
        console.warn('No valid log IDs found for trouble shooting');
      }
    }
  };

  // 시간 정렬 토글 함수
  const handleTimeSortToggle = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // 1440px 기준 사이드바 상태에 따른 너비 계산 (vw 단위 사용)
  const getWidthClass = () => {
    if (isSidebarOpen) {
      return 'w-[74.93vw]'; // 1079px / 1440px * 100
    } else {
      return 'w-[87.64vw]'; // 1262px / 1440px * 100
    }
  };

  // 로딩 중일 때
  if (apiLoading) {
    return (
      <div className={`${getWidthClass()} flex flex-col gap-3`}>
        <div className="flex justify-between items-center">
          <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000]">
            Recent Logs
          </h2>
        </div>
        <div className="bg-white p-4 rounded-lg flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
            <span className="text-gray-600">Loading recent logs...</span>
          </div>
        </div>
      </div>
    );
  }

  // 에러가 발생했을 때
  if (apiError) {
    return (
      <div className={`${getWidthClass()} flex flex-col gap-3`}>
        <div className="flex justify-between items-center">
          <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000]">
            Recent Logs
          </h2>
        </div>
        <div className="bg-white p-4 rounded-lg flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ Error</div>
            <div className="text-gray-600">{apiError}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${getWidthClass()} flex flex-col gap-3`}>
      <div className="flex justify-between items-center">
        <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000]">
          Recent Logs
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {Object.entries(visibleLevels).map(([level, isVisible]) => (
              <div key={level} className="flex items-center gap-2">
                <div 
                  style={{ backgroundColor: isVisible ? CHART_COLORS[level as LogLevel] : '#e5e7eb' }}
                  className="w-4 h-4 rounded-[3px] cursor-pointer flex items-center justify-center"
                  onClick={() => handleLevelToggle(level as LogLevel)}
                >
                  {isVisible && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 3.5L3.5 6L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-[#505050] font-medium font-pretendard text-[clamp(11px,0.83vw,12px)]">{level}</span>
              </div>
            ))}
          </div>
          <button 
            className="w-[8.33vw] h-[2.8vh] bg-[#496660] text-white rounded-[4px] text-[clamp(12px,0.83vw,14px)] font-medium hover:bg-[#EFFBF9] transition-colors flex items-center justify-center"
            onClick={handleTroubleShooting}
          >
            Trouble Shooting
          </button>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg">
        <div className="overflow-hidden">
          {/* Header Row */}
          <div className="bg-[#F1F1F5] px-5 h-[5.2vh] flex items-center text-[clamp(11px,0.83vw,12px)] font-[600] font-pretendard text-[#505050] rounded-[10px] leading-[1.2]">
            <div className="flex-1 pl-4 text-left">Logs</div>
            <div className="w-[157px] pl-4 text-center">Host name</div>
            <div className="w-[175px] pl-4 text-center">
              <button 
                onClick={handleTimeSortToggle}
                className="flex items-center justify-center gap-1 hover:text-[#1E435F] transition-colors cursor-pointer w-full"
                title={`Sort by time (${sortOrder === 'desc' ? 'newest first' : 'oldest first'})`}
              >
                <span>Time</span>
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className={`transition-transform duration-200 ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
                >
                  <path 
                    d="M7 14L12 9L17 14" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="w-[97px] pl-4 text-center">Type</div>
            <div className="w-[99px] pl-4 text-center">Feature</div>
            <div className="w-[99px] flex items-center justify-center"></div>
          </div>

          {/* Logs List */}
          <div className="divide-y divide-gray-100">
            {displayLogs.length === 0 ? (
              <div className="text-gray-500 text-center py-4 text-xs">API 연결 완료, 데이터가 없습니다.</div>
            ) : (
              displayLogs.map((log, index) => (
                <div 
                  key={`${log.comment}-${index}`} 
                  ref={index === displayLogs.length - 1 ? lastLogElementRef : null}
                  className="px-5 h-[5.2vh] hover:bg-[#EFFBF9] cursor-pointer flex items-center transition-colors"
                  onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('.checkbox-column')) {
                      handleLogClick(index);
                    }
                  }}
                >
                  <div className="flex-1 pr-4 pl-4 flex flex-col justify-center min-w-0">
                    <div className="text-xs text-gray-900 truncate" title={log.title}>
                      {log.title}
                    </div>
                  </div>
                  <div className="w-[157px] text-xs text-gray-600 truncate pl-4 flex items-center justify-center">{log.host}</div>
                  <div className="w-[175px] text-xs text-gray-600 pl-4 flex items-center justify-center">{log.timestamp}</div>
                  <div className="w-[97px] pl-4 flex items-center justify-center">
                    <span 
                      className="px-1.5 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ 
                        backgroundColor: CHART_COLORS[log.level as keyof typeof CHART_COLORS] 
                      }}
                    >
                      {log.level}
                    </span>
                  </div>
                  <div className="w-[99px] text-xs text-gray-600 truncate pl-4 flex items-center justify-center">{log.category}</div>
                  <div className="w-[99px] flex items-center justify-center checkbox-column">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded-[3px] border-[#E5E5EC] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#1E435F]"
                      checked={selectedLogs.has(index)}
                      onChange={(e) => handleCheckboxChange(index, e)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-gray-300 border-t-blue-600"></div>
                <span className="text-gray-600 ml-2">다음 기간 로그 로딩 중...</span>
              </div>
            )}
            {!hasMoreLogs && allRecentLogs.length > 0 && (
              <div className="text-gray-500 text-center py-4 text-xs">No more logs to load</div>
            )}
          </div>
        </div>
      </div>

      {selectedLog && (
        <LogDetailModal
          logs={selectedLogs.size > 0 
            ? Array.from(selectedLogs).map(index => displayLogs[index])
            : [selectedLog]
          }
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          detailData={selectedLogDetail || undefined}
          isDetailLoading={detailLoading}
        />
      )}
    </div>
  );
};

export default RecentLogs;
