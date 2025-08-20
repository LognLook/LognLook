import React, { useState, useEffect } from 'react';
import { LogLevel, CHART_COLORS, TimePeriod } from "../../../../types/logs";
import { useLogDistribution } from './useLogDistribution';
import { LogPieChart } from './LogPieChart';

interface ApiLogEntry {
  extracted_timestamp: string;
  message_timestamp: string;
  log_level: LogLevel;
}

interface LogDistributionProps {
  logs?: ApiLogEntry[]; // optional - API에서 자동으로 가져옴
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
    isLoading,
    error,
  } = useLogDistribution({ 
    propLogs,
    timePeriod,
    projectId
  });

  // 강화된 디버깅
  console.log('LogDistribution - Enhanced Debug:', { 
    logs: propLogs?.length, 
    timePeriod, 
    projectId,
    pieDataLength: pieData?.length || 0,
    pieData: pieData,
    pieDataType: typeof pieData,
    pieDataIsArray: Array.isArray(pieData)
  });

  // 강제 리렌더링을 위한 상태 추가
  const [forceRender, setForceRender] = useState(0);
  
  // pieData가 변경될 때마다 강제 리렌더링
  useEffect(() => {
    if (pieData && Array.isArray(pieData) && pieData.length > 0) {
      console.log('LogDistribution - pieData changed, forcing re-render:', pieData);
      setForceRender(prev => prev + 1);
    }
  }, [pieData]);

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
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-500 text-sm">Loading...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-500 text-sm">Error loading data</p>
            </div>
          ) : (pieData && Array.isArray(pieData) && pieData.length > 0) ? (
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
              <p className="text-gray-500 text-sm">
                No data available for selected period
                <br />
                {process.env.NODE_ENV === 'development' && (
                  <span className="text-xs text-gray-400">
                    Debug: pieData={JSON.stringify(pieData)}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogDistribution; 