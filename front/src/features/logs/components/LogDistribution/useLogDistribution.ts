import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LogEntry, LogLevel, TimePeriod } from '../../types/logTypes';
import { useQuery } from '@tanstack/react-query';
import logApi from '../../api/logApi';

// API 응답 타입 정의
interface ApiLogEntry {
  extracted_timestamp?: string;
  message_timestamp: string;
  log_level: LogLevel;
  keyword?: string;
}

interface UseLogDistributionProps {
  propLogs?: LogEntry[] | ApiLogEntry[];
  timePeriod?: TimePeriod;
  projectId?: number;
}

interface UseLogDistributionResult {
  logs: LogEntry[] | ApiLogEntry[];
  filteredLogs: LogEntry[] | ApiLogEntry[];
  chartSize: { width: number; height: number };
  isSidebarOpen: boolean;
  pieData: Array<{
    name: LogLevel;
    value: number;
  }>;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const useLogDistribution = ({ 
  propLogs, 
  timePeriod = 'day',
  projectId = 1
}: UseLogDistributionProps): UseLogDistributionResult => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ width: 180, height: 180 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // LogGraph와 동일한 API 사용
  const { data: apiLogs } = useQuery<ApiLogEntry[]>({
    queryKey: ['distribution-logs', projectId, timePeriod],
    queryFn: async () => {
      console.log(`useLogDistribution - Fetching logs for project ${projectId}, period ${timePeriod}`);
      const response = await logApi.fetchLogs(projectId, timePeriod);
      console.log(`useLogDistribution - API returned ${response.length} logs`);
      return response as ApiLogEntry[];
    },
    retry: false,
  });

  // prop으로 전달된 로그나 API 로그 사용
  const logs = propLogs || apiLogs || [];

  // 시간 범위에 따라 로그 필터링
  const filteredLogs = useMemo(() => {
    if (!Array.isArray(logs) || logs.length === 0) {
      console.log('useLogDistribution - No logs available');
      return [];
    }

    console.log(`useLogDistribution - Total logs available: ${logs.length}`);
    console.log('useLogDistribution - Sample logs:', logs.slice(0, 2));

    // 임시로 시간 필터링 제거하고 모든 로그 사용
    console.log(`useLogDistribution - Using ALL logs (no time filtering for debugging)`);
    return logs as (LogEntry | ApiLogEntry)[];

    /* 원래 시간 필터링 코드 (임시 비활성화)
    const now = new Date();
    let startTime: Date;
    
    switch (timePeriod) {
      case 'day':
        // 정확히 24시간 전부터 현재까지
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        // 정확히 7일 전부터 현재까지
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        // 정확히 30일 전부터 현재까지
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    console.log(`useLogDistribution - Filtering for ${timePeriod}: ${startTime.toISOString()} to ${now.toISOString()}`);
    console.log(`useLogDistribution - Total logs before filtering: ${logs.length}`);

    // 지정된 시간 범위 내의 로그만 필터링
    const filtered = logs.filter((log: LogEntry | ApiLogEntry) => {
      // LogEntry와 ApiLogEntry 모두 처리
      let logTimeString = '';
      if ('message_timestamp' in log && log.message_timestamp) {
        logTimeString = log.message_timestamp;
      } else if ('timestamp' in log && log.timestamp) {
        logTimeString = log.timestamp;
      } else if ('extracted_timestamp' in log && log.extracted_timestamp) {
        logTimeString = log.extracted_timestamp;
      }
      
      if (!logTimeString) {
        console.log('useLogDistribution - Log without timestamp:', log);
        return false;
      }
      
      const logTime = new Date(logTimeString);
      const isInRange = logTime >= startTime && logTime <= now;
      
      if (!isInRange) {
        console.log(`useLogDistribution - Log outside range: ${logTime.toISOString()}`);
      }
      
      return isInRange;
    });

    console.log(`useLogDistribution - Filtered ${filtered.length} logs out of ${logs.length} total logs for ${timePeriod} period`);
    
    // 필터링된 로그들의 타임스탬프 샘플 출력
    if (filtered.length > 0) {
      console.log('useLogDistribution - Sample filtered logs:', filtered.slice(0, 3).map(log => {
        if ('message_timestamp' in log) return log.message_timestamp;
        if ('timestamp' in log) return log.timestamp;
        if ('extracted_timestamp' in log) return log.extracted_timestamp;
        return 'no timestamp';
      }));
    }
    
    return filtered as (LogEntry | ApiLogEntry)[];
    */
  }, [logs, timePeriod]);

  // 사이드바 상태를 감지
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

  // 차트 크기 업데이트
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const size = Math.min(containerHeight - 32, containerWidth - 32);
        setChartSize({ width: size, height: size });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 로그 레벨별 데이터 계산 (필터링된 로그 사용)
  const pieData = useMemo(() => {
    console.log(`useLogDistribution - Calculating pieData for ${timePeriod}`);
    console.log(`useLogDistribution - filteredLogs length: ${filteredLogs.length}`);
    
    if (!Array.isArray(filteredLogs) || filteredLogs.length === 0) {
      console.log('useLogDistribution - No filtered logs available for pieData');
      return [];
    }

    const levelCounts = filteredLogs.reduce((acc: Record<LogLevel, number>, log: LogEntry | ApiLogEntry) => {
      let level: LogLevel | undefined;
      
      // LogEntry와 ApiLogEntry 모두 처리
      if ('log_level' in log) {
        level = log.log_level;
      } else if ('level' in log) {
        level = log.level;
      }
      
      console.log(`useLogDistribution - Processing log with level: ${level}`);
      
      if (level && ['INFO', 'WARN', 'ERROR'].includes(level)) {
        acc[level] = (acc[level] || 0) + 1;
      }
      return acc;
    }, {} as Record<LogLevel, number>);

    console.log('useLogDistribution - Level counts:', levelCounts);

    // INFO, WARN, ERROR 순서로 정렬
    const sortedLevels: LogLevel[] = ['INFO', 'WARN', 'ERROR'];
    const result = sortedLevels
      .filter(level => levelCounts[level] > 0)
      .map(level => ({
        name: level,
        value: Number(levelCounts[level]),
      }));

    console.log('useLogDistribution - Final pieData:', result);
    return result;
  }, [filteredLogs, timePeriod]);

  return {
    logs: logs as LogEntry[] | ApiLogEntry[],
    filteredLogs: filteredLogs as LogEntry[] | ApiLogEntry[],
    chartSize,
    isSidebarOpen,
    pieData,
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
  };
}; 