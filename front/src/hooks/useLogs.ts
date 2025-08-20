import { useQuery } from '@tanstack/react-query';
import { logService, LogSearchParams } from '../services/logService';

export const useLogs = (projectId: number) => {
  const useLogSearch = (params: LogSearchParams) => {
    return useQuery({
      queryKey: ['logs', 'search', projectId, params],
      queryFn: () => logService.searchLogs(projectId, params),
      enabled: !!projectId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  const useRecentLogs = (limit: number = 50) => {
    return useQuery({
      queryKey: ['logs', 'recent', projectId, limit],
      queryFn: () => logService.getRecentLogs(projectId, limit),
      enabled: !!projectId,
      refetchInterval: 30 * 1000, // Refetch every 30 seconds
      staleTime: 1 * 60 * 1000, // 1 minute
    });
  };

  const useLogStats = (timeRange: string = '7d') => {
    return useQuery({
      queryKey: ['logs', 'stats', projectId, timeRange],
      queryFn: () => logService.getLogStats(projectId, timeRange),
      enabled: !!projectId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const useLogDetail = (logId: string) => {
    return useQuery({
      queryKey: ['logs', 'detail', projectId, logId],
      queryFn: () => logService.getLogDetail(projectId, logId),
      enabled: !!projectId && !!logId,
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  const useTroubleReports = () => {
    return useQuery({
      queryKey: ['logs', 'troubles', projectId],
      queryFn: () => logService.getTroubleReports(projectId),
      enabled: !!projectId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  return {
    useLogSearch,
    useRecentLogs,
    useLogStats,
    useLogDetail,
    useTroubleReports,
  };
};