import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LogEntry, LogLevel } from '../../types/logTypes';
import { useQuery } from '@tanstack/react-query';
import { getLogs } from '../../api/logApi';

interface UseLogDistributionProps {
  propLogs?: LogEntry[];
}

interface UseLogDistributionResult {
  logs: LogEntry[];
  chartSize: { width: number; height: number };
  isSidebarOpen: boolean;
  pieData: Array<{
    name: LogLevel;
    value: number;
  }>;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const useLogDistribution = ({ propLogs }: UseLogDistributionProps): UseLogDistributionResult => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ width: 180, height: 180 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // API로부터 로그 데이터 가져오기
  const { data: apiLogs } = useQuery<LogEntry[]>({
    queryKey: ['logs'],
    queryFn: getLogs,
    retry: false,
  });

  // prop으로 전달된 로그나 API 로그 사용
  const logs = propLogs || apiLogs || [];

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

  // 로그 레벨별 데이터 계산
  const pieData = useMemo(() => {
    if (!logs.length) return [];

    const levelCounts = logs.reduce((acc: Record<LogLevel, number>, log: LogEntry) => {
      if (log.level) {
        acc[log.level] = (acc[log.level] || 0) + 1;
      }
      return acc;
    }, {} as Record<LogLevel, number>);

    // INFO, WARN, ERROR 순서로 정렬
    const sortedLevels: LogLevel[] = ['INFO', 'WARN', 'ERROR'];
    return sortedLevels
      .filter(level => levelCounts[level] > 0)
      .map(level => ({
        name: level,
        value: Number(levelCounts[level]),
      }));
  }, [logs]);

  return {
    logs,
    chartSize,
    isSidebarOpen,
    pieData,
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
  };
}; 