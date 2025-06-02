import React, { useRef, useEffect, useState } from 'react';
import { LogLevel, CHART_COLORS } from '../../types/logTypes';
import { useQuery } from '@tanstack/react-query';
import { getLogs } from '../../api/logApi';
import { LogPieChart } from './LogPieChart';

interface PieChartData {
  name: LogLevel;
  value: number;
}

interface ApiLogEntry {
  extracted_timestamp: string;
  log_level: LogLevel;
}

interface LogDistributionProps {
  logs?: ApiLogEntry[];
}

const LogDistribution: React.FC<LogDistributionProps> = ({ logs: propLogs }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ width: 180, height: 180 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // API로부터 로그 데이터 가져오기
  const { data: apiLogs = [] } = useQuery<ApiLogEntry[]>({
    queryKey: ['logs'],
    queryFn: async () => {
      const response = await getLogs();
      return response as unknown as ApiLogEntry[];
    },
    retry: false,
  });

  // prop으로 전달된 로그나 API 로그 사용
  const logs = propLogs || apiLogs;
  console.log('LogDistribution - Received logs:', JSON.stringify(logs, null, 2));

  // 로그 레벨별 데이터 계산
  const pieData: PieChartData[] = React.useMemo(() => {
    if (!logs || logs.length === 0) {
      console.log('LogDistribution - No logs available');
      return [];
    }

    // 각 레벨별 합계 계산
    const levelCounts = logs.reduce((acc: Record<LogLevel, number>, log: ApiLogEntry) => {
      // 새로운 데이터 구조에서 log_level 직접 사용
      if (log.log_level && ['INFO', 'WARN', 'ERROR'].includes(log.log_level)) {
        acc[log.log_level] = (acc[log.log_level] || 0) + 1;
      }
      return acc;
    }, {} as Record<LogLevel, number>);

    console.log('LogDistribution - Level counts:', levelCounts);

    // INFO, WARN, ERROR 순서로 정렬
    const sortedLevels: LogLevel[] = ['INFO', 'WARN', 'ERROR'];
    const result = sortedLevels
      .filter(level => levelCounts[level] > 0)
      .map(level => ({
        name: level,
        value: levelCounts[level],
      }));

    console.log('LogDistribution - Pie data:', result);
    return result;
  }, [logs]);

  // 사이드바 상태를 감지
  useEffect(() => {
    const checkSidebarState = () => {
      const sidebarElement = document.querySelector('aside');
      const isSidebarVisible = sidebarElement?.classList.contains('w-[279px]') || false;
      setIsSidebarOpen(isSidebarVisible);
    };

    // MutationObserver를 사용하여 사이드바 클래스 변경 감지
    const observer = new MutationObserver(checkSidebarState);
    const sidebar = document.querySelector('aside');
    
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }

    // 초기 상태 확인
    checkSidebarState();

    // 클린업 함수
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        // 카드의 높이에서 패딩과 범례 영역을 제외한 크기로 설정
        const size = Math.min(containerHeight - 32, containerWidth - 32); // 여유 공간을 줄임
        setChartSize({ width: size, height: size });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

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
        </div>
      </div>
    </div>
  );
};

export default LogDistribution; 