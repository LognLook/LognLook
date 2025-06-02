import React from 'react';
import { LogEntry } from '../../types/logTypes';
import { useLogDistribution } from './useLogDistribution';
import { LogPieChart } from './LogPieChart';
import { PieChartLegend } from './PieChartLegend';

interface LogDistributionProps {
  logs?: LogEntry[];
}

const LogDistribution: React.FC<LogDistributionProps> = ({ logs: propLogs }) => {
  const {
    chartSize,
    isSidebarOpen,
    pieData,
    containerRef,
  } = useLogDistribution({ propLogs });

  // 사이드바 상태에 따라 너비 계산
  const getDistributionWidthClass = () => {
    if (isSidebarOpen) {
      return 'w-[21.94vw]';  // (316/1440) * 100 = 21.94vw
    } else {
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
          <LogPieChart data={pieData} size={chartSize} />
          <PieChartLegend data={pieData} />
        </div>
      </div>
    </div>
  );
};

export default LogDistribution; 