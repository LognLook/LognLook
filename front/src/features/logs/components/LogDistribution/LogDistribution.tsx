import React from 'react';
import { LogLevel, CHART_COLORS, TimePeriod } from '../../types/logTypes';
import { useLogDistribution } from './useLogDistribution';
import { LogPieChart } from './LogPieChart';

interface ApiLogEntry {
  extracted_timestamp: string;
  message_timestamp: string;
  log_level: LogLevel;
}

interface LogDistributionProps {
  logs?: ApiLogEntry[];
  timePeriod?: TimePeriod;
  projectId?: number;
}

const LogDistribution: React.FC<LogDistributionProps> = ({ 
  logs: propLogs, 
  timePeriod = 'day',
  projectId = 1
}) => {
  const {
    chartSize,
    isSidebarOpen,
    pieData,
    containerRef,
  } = useLogDistribution({ 
    propLogs,
    timePeriod,
    projectId
  });

  console.log('LogDistribution - Received props:', { logs: propLogs?.length, timePeriod, projectId });
  console.log('LogDistribution - Hook returned pieData:', pieData);

  // 사이드바 상태에 따라 너비 계산
  const getDistributionWidthClass = () => {
    if (isSidebarOpen) {
      // 사이드바 열린 경우 - 316px (1440px 화면 기준)
      return 'w-[21.94vw]';  // (316/1440) * 100 = 21.94vw
    } else {
      // 사이드바 닫힌 경우 - 316px (1440px 화면 기준)
      return 'w-[21.94vw]';  // (316/1440) * 100 = 21.94vw
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000]">
        Log Distribution
      </h2>
      <div className={`bg-white pt-6 pb-8 rounded-lg ${getDistributionWidthClass()} h-[32vh]`}>
        <div ref={containerRef} className="h-full flex flex-col items-center">
          {pieData.length > 0 ? (
            <>
              <LogPieChart data={pieData} size={chartSize} />
              <div className="flex gap-6 mt-5">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: CHART_COLORS[item.name] }}
                    />
                    <span className="text-sm font-pretendard text-[#505050]">
                      {item.name.toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-sm">No data available for selected period</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogDistribution; 