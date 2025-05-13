import React, { useState, useRef, useCallback } from "react";
import { DisplayLogItem } from "../../../@types/logs";
import { LogEntry, CHART_COLORS } from "../types/logTypes";
import { DUMMY_LOGS } from "../data/dummyLogs";

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
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleLogClick = (index: number) => {
    // TODO: Implement log detail view navigation
    console.log('Navigate to log detail:', displayLogs[index]);
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

  // 1440px 기준 사이드바 상태에 따른 너비 계산 (vw 단위 사용)
  const getWidthClass = () => {
    if (isSidebarOpen) {
      return 'w-[74.93vw]'; // 1079px / 1440px * 100
    } else {
      return 'w-[87.64vw]'; // 1262px / 1440px * 100
    }
  };

  // 사이드바 상태에 따른 Logs 칼럼 너비 계산
  const getLogsColumnWidth = () => {
    if (isSidebarOpen) {
      return 'w-[calc(74.93vw-48px-32px-56px-24px-32px-40px)]'; // 전체 너비 - (패딩 + 각 칼럼 너비)
    } else {
      return 'w-[calc(87.64vw-48px-32px-56px-24px-32px-40px)]'; // 전체 너비 - (패딩 + 각 칼럼 너비)
    }
  };

  return (
    <div className={`${getWidthClass()} flex flex-col gap-3`}>
      <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000]">
        Recent Logs
      </h2>
      
      <div className="bg-white p-4 rounded-lg">
        <div className="overflow-hidden">
          {/* Header Row */}
          <div className="bg-[#F1F1F5] px-5 h-[4.69vh] flex items-center text-sm font-medium text-gray-600 rounded-lg">
            <div className={`${getLogsColumnWidth()} pl-4 text-left`}>Logs</div>
            <div className="w-32 pl-4 text-center">Host</div>
            <div className="w-56 pl-4 text-center">Time</div>
            <div className="w-24 pl-4 text-center">Type</div>
            <div className="w-32 pl-4 text-center">Category</div>
            <div className="w-10"></div> {/* Checkbox column */}
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
                  className="px-5 h-[4.69vh] hover:bg-gray-50 cursor-pointer flex items-center"
                  onClick={() => handleLogClick(index)}
                >
                  <div className={`${getLogsColumnWidth()} pr-4 pl-4 flex flex-col justify-center`}>
                    <div className="text-xs text-gray-900 truncate max-w-[calc(100%-8px)]">{log.title}</div>
                    {log.comment && (
                      <div className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[calc(100%-8px)]">{log.comment}</div>
                    )}
                  </div>
                  <div className="w-32 text-xs text-gray-600 truncate pl-4 flex items-center justify-center">{log.host}</div>
                  <div className="w-56 text-xs text-gray-600 pl-4 flex items-center justify-center">{log.timestamp}</div>
                  <div className="w-24 pl-4 flex items-center justify-center">
                    <span 
                      className="px-1.5 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ 
                        backgroundColor: CHART_COLORS[log.level as keyof typeof CHART_COLORS] 
                      }}
                    >
                      {log.level}
                    </span>
                  </div>
                  <div className="w-32 text-xs text-gray-600 truncate pl-4 flex items-center justify-center">{log.category}</div>
                  <div className="w-10 flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
    </div>
  );
};

export default RecentLogs;
