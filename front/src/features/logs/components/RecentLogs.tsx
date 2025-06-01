import React, { useState, useRef, useCallback } from "react";
import { DisplayLogItem, LogEntry, CHART_COLORS, LogLevel } from "../../../types/logs";
import { DUMMY_LOGS } from "../data/dummyLogs";
import LogDetailModal from "./LogDetailModal";

interface RecentLogsProps {
  logs?: LogEntry[];
  isSidebarOpen: boolean;
}

const RecentLogs: React.FC<RecentLogsProps> = ({ 
  logs = DUMMY_LOGS, 
  isSidebarOpen
}) => {
  const [selectedLogs, setSelectedLogs] = useState<Set<number>>(new Set());
  const [displayCount, setDisplayCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<DisplayLogItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleLevels, setVisibleLevels] = useState<Record<LogLevel, boolean>>({
    INFO: true,
    WARN: true,
    ERROR: true
  });

  const observer = useRef<IntersectionObserver | null>(null);
  const lastLogElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && displayCount < logs.length) {
        setIsLoading(true);
        setTimeout(() => {
          setDisplayCount(prevCount => prevCount + 10);
          setIsLoading(false);
        }, 500);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, displayCount, logs.length]);

  // Parse logs for display and sort by timestamp (newest first)
  const displayLogs: DisplayLogItem[] = logs
    .slice(0, displayCount)
    .map(log => ({
      title: log.message,
      timestamp: new Date(log['@timestamp']).toLocaleString(),
      level: log.level || 'INFO',
      category: log.category || '기타',
      comment: log.comment,
      host: log.host.name
    }))
    .filter(log => visibleLevels[log.level as LogLevel])
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleLogClick = (index: number) => {
    setSelectedLog(displayLogs[index]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
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

  // 1440px 기준 사이드바 상태에 따른 너비 계산 (vw 단위 사용)
  const getWidthClass = () => {
    if (isSidebarOpen) {
      return 'w-[74.93vw]'; // 1079px / 1440px * 100
    } else {
      return 'w-[87.64vw]'; // 1262px / 1440px * 100
    }
  };

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
            onClick={() => console.log('Troubleshooting clicked')}
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
            <div className="w-[175px] pl-4 text-center">Time</div>
            <div className="w-[97px] pl-4 text-center">Type</div>
            <div className="w-[99px] pl-4 text-center">Feature</div>
            <div className="w-[99px] flex items-center justify-center">Checkbox</div>
          </div>

          {/* Logs List */}
          <div className="divide-y divide-gray-100">
            {displayLogs.length === 0 ? (
              <div className="text-gray-500 text-center py-4 text-xs">No recent logs available</div>
            ) : (
              displayLogs.map((log, index) => (
                <div 
                  key={index} 
                  ref={index === displayLogs.length - 1 ? lastLogElementRef : null}
                  className="px-5 h-[5.2vh] hover:bg-[#EFFBF9] cursor-pointer flex items-center transition-colors"
                  onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('.checkbox-column')) {
                      handleLogClick(index);
                    }
                  }}
                >
                  <div className="flex-1 pr-4 pl-4 flex flex-col justify-center">
                    <div className="text-xs text-gray-900 truncate max-w-[calc(100%-8px)]">{log.title}</div>
                    {log.comment && (
                      <div className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[calc(100%-8px)]">{log.comment}</div>
                    )}
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
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedLog && (
        <LogDetailModal
          log={selectedLog}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default RecentLogs;
