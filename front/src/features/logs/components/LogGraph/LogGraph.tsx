import React, { useState, useEffect } from 'react';
import { LogLevel, TimePeriod } from "../../../../types/logs";
import { TimePeriodSelector } from './TimePeriodSelector';
import { LogLevelFilter } from './LogLevelFilter';
import { LogChart } from './LogChart';
import { logService } from '../../../../services/logService';
import EmptyState from '../EmptyState';

interface LogGraphProps {
  projectId: number;
  timePeriod?: TimePeriod;
  onToggleLevel?: (level: LogLevel) => void;
  onTimePeriodChange?: (period: TimePeriod) => void;
}

interface LogGraphData {
  time: string;
  INFO: number;
  WARN: number;
  ERROR: number;
}

const LogGraph: React.FC<LogGraphProps> = ({ 
  projectId,
  timePeriod: initialTimePeriod = 'day',
  onTimePeriodChange
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(initialTimePeriod);
  const [visibleLevels, setVisibleLevels] = useState<Record<LogLevel, boolean>>({
    INFO: true,
    WARN: true,
    ERROR: true,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [graphData, setGraphData] = useState<LogGraphData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // timePeriod prop이 변경되면 내부 상태도 업데이트
  useEffect(() => {
    setSelectedPeriod(initialTimePeriod);
  }, [initialTimePeriod]);

  // 현재 시간 기준 범위 계산 함수
  const getTimeRangeText = (period: TimePeriod): string => {
    const now = new Date();
    let startTime: Date;
    
    switch (period) {
      case 'day':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return `Last 24 Hours (${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - ${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})})`;
      case 'week':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return `Last 7 Days (${startTime.toLocaleDateString()} - ${now.toLocaleDateString()})`;
      case 'month':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return `Last 30 Days (${startTime.toLocaleDateString()} - ${now.toLocaleDateString()})`;
      default:
        return 'Log Graph';
    }
  };

  // Fetch graph data
  useEffect(() => {
    const loadGraphData = async () => {
      try {
        setIsLoading(true);
        console.log(`LogGraph - Loading graph data for projectId: ${projectId}, period: ${selectedPeriod}`);
        
        // logService를 사용하여 데이터 가져오기
        const stats = await logService.getLogStats(projectId, selectedPeriod);
        console.log(`LogGraph - Log stats received:`, {
          totalLogs: stats.totalLogs,
          levelDistribution: stats.levelDistribution,
          recentTrendsCount: stats.recentTrends.length
        });
        
        // API 응답 데이터를 그래프 형식으로 변환
        if (stats.totalLogs > 0) {
          // 로그 데이터를 시간별로 그룹화하여 그래프 데이터 생성
          const timeGroups = new Map<string, { INFO: number; WARN: number; ERROR: number }>();
          
          // recentTrends를 사용하여 그래프 데이터 생성
          stats.recentTrends.forEach((trend) => {
            const date = new Date(trend.date);
            const timeKey = date.toLocaleDateString() + ' ' + date.getHours() + ':00';
            
            if (!timeGroups.has(timeKey)) {
              timeGroups.set(timeKey, { INFO: 0, WARN: 0, ERROR: 0 });
            }
            
            const timeGroup = timeGroups.get(timeKey)!;
            const level = trend.level.toUpperCase() as LogLevel;
            
            if (level in timeGroup) {
              timeGroup[level] += trend.count;
            }
          });
          
          // 시간순으로 정렬하여 그래프 데이터 생성
          const sortedData = Array.from(timeGroups.entries())
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([time, counts]) => ({
              time,
              ...counts
            }));
          
          console.log(`LogGraph - Processed graph data:`, {
            timeGroupsCount: timeGroups.size,
            sortedDataCount: sortedData.length,
            sampleData: sortedData.slice(0, 3)
          });
          
          setGraphData(sortedData);
        } else {
          console.log('LogGraph - No log data available');
          setGraphData([]);
        }
        
        setError(null);
      } catch (error) {
        console.error('LogGraph - Failed to load graph data:', error);
        setError('Failed to load graph data');
        setGraphData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGraphData();
  }, [projectId, selectedPeriod]);

  // Add effect to monitor graphData changes
  useEffect(() => {
    console.log('Current graphData:', graphData);
  }, [graphData]);

  // Monitor sidebar state
  useEffect(() => {
    const checkSidebarState = () => {
      const sidebarElement = document.querySelector('aside');
      const isSidebarVisible = sidebarElement?.classList.contains('w-[279px]') || false;
      setIsSidebarOpen(isSidebarVisible);
    };

    const observer = new MutationObserver(checkSidebarState);
    const sidebar = document.querySelector('aside');
    
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }

    checkSidebarState();
    return () => observer.disconnect();
  }, []);

  // Toggle visibility for a specific log level
  const toggleLevelVisibility = (level: LogLevel) => {
    setVisibleLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  // Calculate width based on sidebar state
  const getGraphWidthClass = () => {
    return isSidebarOpen ? 'w-[50.97vw]' : 'w-[63.61vw]';
  };

  // TimePeriod 변경 핸들러
  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    if (onTimePeriodChange) {
      onTimePeriodChange(period);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000]">
          Log Graph
        </h2>
        <div className={`bg-white p-4 rounded-lg ${getGraphWidthClass()} h-[32vh] flex items-center justify-center`}>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000]">
          Log Graph
        </h2>
        <div className={`bg-white p-4 rounded-lg ${getGraphWidthClass()} h-[32vh] flex items-center justify-center`}>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  // If no logs are provided, display a message
  if (graphData.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000]">
          Log Graph
        </h2>
        <div className={`bg-white p-4 rounded-lg ${getGraphWidthClass()} h-[32vh] flex items-center justify-center`}>
          <p className="text-gray-500">No more logs to load. API connection is normal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000]">
          Log Graph
        </h2>
        <span className="text-[clamp(11px,0.76vw,13px)] text-gray-600 font-medium">
          {getTimeRangeText(selectedPeriod)}
        </span>
      </div>
      <div className={`bg-white pt-4 pl-4 pr-4 pb-0 rounded-lg ${getGraphWidthClass()} h-[32vh]`}>
        <div className="flex justify-between items-center mb-4">
          <TimePeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
          />

          <div className="flex items-center">
            <div className="flex items-center">
              {(Object.keys(visibleLevels) as LogLevel[]).map(level => (
                <div key={level} className="px-1.5">
                  <LogLevelFilter
                    level={level}
                    isVisible={visibleLevels[level]}
                    onToggle={toggleLevelVisibility}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex pt-3 pb-2">
          {graphData.length > 0 ? (
            <LogChart
              data={graphData}
              visibleLevels={visibleLevels}
              selectedPeriod={selectedPeriod}
            />
          ) : (
            <EmptyState
              title="No Log Data"
              description="No log data available for the selected time period. Check if your project is properly configured."
              icon={
                <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              className="h-[200px]"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LogGraph;