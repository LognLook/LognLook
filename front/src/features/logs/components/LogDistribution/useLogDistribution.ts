import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LogEntry, LogLevel, TimePeriod } from "../../../../types/logs";
import { useQuery } from '@tanstack/react-query';
import { logService } from '../../../../services/logService';
import { apiClient } from '../../../../services/api';

// API response type definitions
interface ApiLogEntry {
  extracted_timestamp?: string;
  message_timestamp: string;
  log_level: LogLevel;
  keyword?: string;
}

interface UseLogDistributionProps {
  propLogs?: LogEntry[];
  timePeriod?: TimePeriod;
  projectId?: number;
}

interface UseLogDistributionResult {
  logs: LogEntry[];
  filteredLogs: LogEntry[];
  chartSize: { width: number; height: number };
  isSidebarOpen: boolean;
  pieData: Array<{
    name: LogLevel;
    value: number;
  }>;
  containerRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  error: Error | null;
}

export const useLogDistribution = ({ 
  propLogs, 
  timePeriod = 'day',
  projectId = 1
}: UseLogDistributionProps): UseLogDistributionResult => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ width: 180, height: 180 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Use logService to get log stats with fallback periods
  const { data: logStats, isLoading, error } = useQuery({
    queryKey: ['distribution-logs', projectId, timePeriod],
    queryFn: async () => {
      try {
        console.log('useLogDistribution - Fetching log stats for projectId:', projectId, 'timePeriod:', timePeriod);
        
        // Get stats for selected period only (no fallback)
        console.log(`useLogDistribution - Getting stats for period: ${timePeriod}`);
        const stats = await logService.getLogStats(projectId, timePeriod);
        
        console.log('useLogDistribution - Final log stats:', stats);
        return stats;
      } catch (error) {
        console.error('useLogDistribution - API call failed:', error);
        return null;
      }
    },
    retry: false,
    staleTime: 0,
    refetchInterval: 60000,
    refetchIntervalInBackground: true
  });

  // Extract logs from logStats or use propLogs
  const apiLogs = logStats?.recentTrends || [];

  // Use prop logs or API logs
  let logs = propLogs || apiLogs || [];
  
  if (logs.length === 0 && apiLogs && Array.isArray(apiLogs) && apiLogs.length > 0) {
    logs = apiLogs;
  }

  // Filter logs by time range
  const filteredLogs = useMemo(() => {
    if (!Array.isArray(logs) || logs.length === 0) {
      return [];
    }

    const now = new Date();
    let startTime: Date;
    
    switch (timePeriod) {
      case 'day':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const filtered = logs.filter((log: LogEntry | ApiLogEntry) => {
      let logTimeString = '';
      if ('message_timestamp' in log && log.message_timestamp) {
        logTimeString = log.message_timestamp;
      } else if ('timestamp' in log && log.timestamp) {
        logTimeString = log.timestamp;
      } else if ('extracted_timestamp' in log && log.extracted_timestamp) {
        logTimeString = log.extracted_timestamp;
      }
      
      if (!logTimeString) {
        return false;
      }
      
      const logTime = new Date(logTimeString);
      return logTime >= startTime && logTime <= now;
    });
    
    return filtered as LogEntry[];
  }, [logs, timePeriod]);

  // Detect sidebar state
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

  // Update chart size
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

  // Calculate data by log level using logStats
  const pieData = useMemo(() => {
    if (!logStats || !logStats.levelDistribution || Object.keys(logStats.levelDistribution).length === 0) {
      console.log('useLogDistribution - No level distribution data available');
      return [];
    }

    console.log('useLogDistribution - Level distribution:', logStats.levelDistribution);

    // Sort by INFO, WARN, ERROR order
    const sortedLevels: LogLevel[] = ['INFO', 'WARN', 'ERROR'];
    const result = sortedLevels
      .filter(level => logStats.levelDistribution[level] > 0)
      .map(level => ({
        name: level,
        value: Number(logStats.levelDistribution[level]),
      }));

    console.log('useLogDistribution - Calculated pieData:', result);
    return result;
  }, [logStats]);

  return {
    logs: apiLogs as LogEntry[] | ApiLogEntry[],
    filteredLogs: apiLogs as LogEntry[] | ApiLogEntry[],
    chartSize,
    isSidebarOpen,
    pieData,
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    isLoading,
    error,
  };
}; 