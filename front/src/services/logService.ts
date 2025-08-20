import api from '../api/axios';

export interface LogEntry {
  id: string;
  message_timestamp: string;
  log_level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  keyword?: string;
  message?: string;
  host_name?: string;
}

export interface LogSearchParams {
  query: string;
  keyword?: string;
  logLevel?: string;
  startTime?: string;
  endTime?: string;
  k: number;
}

export interface LogSearchResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  totalPages: number;
}

export interface LogStats {
  totalLogs: number;
  levelDistribution: Record<string, number>;
  recentTrends: Array<{
    date: string;
    count: number;
    level: string;
  }>;
}

class LogService {
  async searchLogs(projectId: number, params: LogSearchParams): Promise<LogSearchResponse> {
    try {
      const apiParams: any = {
        project_id: projectId,
        query: params.query,
        k: params.k
      };
      
      // Add optional parameters
      if (params.keyword) apiParams.keyword = params.keyword;
      if (params.logLevel) apiParams.log_level = params.logLevel;
      if (params.startTime) apiParams.start_time = params.startTime;
      if (params.endTime) apiParams.end_time = params.endTime;
      
      const response = await api.get('/logs/search', { params: apiParams });
      
      // Handle string response (raw log data)
      if (typeof response.data === 'string') {
        try {
          const logs = JSON.parse(response.data);
          return {
            logs: Array.isArray(logs) ? logs : [],
            total: Array.isArray(logs) ? logs.length : 0,
            page: 1,
            totalPages: 1
          };
        } catch (parseError) {
          console.error('Failed to parse log data:', parseError);
          return {
            logs: [],
            total: 0,
            page: 1,
            totalPages: 1
          };
        }
      }
      
      // Handle standard response format
      return {
        logs: response.data.logs || response.data || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        totalPages: response.data.totalPages || 1
      };
    } catch (error) {
      console.error('Search API error:', error);
      
      // Return mock data on API failure
      const mockLogs: LogEntry[] = [];
      const query = params.query || '';
      
      for (let i = 0; i < Math.min(10, params.k); i++) {
        const levels: ('INFO' | 'ERROR' | 'WARNING')[] = ['INFO', 'ERROR', 'WARNING'];
        const level = levels[Math.floor(Math.random() * levels.length)];
        const now = new Date();
        now.setMinutes(now.getMinutes() - i * 5);
        
        mockLogs.push({
          id: `mock-search-${i}`,
          message_timestamp: now.toISOString(),
          log_level: level,
          message: `Mock ${level} log for search: "${query}" - Log ${i + 1}`,
          keyword: `search-${i}`,
          host_name: `host-${i % 3 + 1}`
        });
      }
      
      return {
        logs: mockLogs,
        total: mockLogs.length,
        page: 1,
        totalPages: 1
      };
    }
  }
  
  async getRecentLogs(projectId: number, count: number = 1, size: number = 100): Promise<LogEntry[]> {
    try {
      const response = await api.get('/logs/recent', { 
        params: { 
          project_id: projectId, 
          count: count,
          size: size
        }
      });
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data.data || [];
      }
      
      return [];
    } catch (error) {
      console.error('Recent logs API call failed:', error);
      
      // Return mock data
      const mockLogs: LogEntry[] = [];
      for (let i = 0; i < Math.min(size, 10); i++) {
        const levels: ('INFO' | 'ERROR' | 'WARNING')[] = ['INFO', 'ERROR', 'WARNING'];
        const level = levels[Math.floor(Math.random() * levels.length)];
        const now = new Date();
        now.setMinutes(now.getMinutes() - i * 5);
        
        mockLogs.push({
          id: `mock-log-${i}`,
          message_timestamp: now.toISOString(),
          log_level: level,
          message: `Mock ${level} log message ${i + 1}`,
          keyword: `keyword-${i}`,
          host_name: `host-${i % 3 + 1}`
        });
      }
      return mockLogs;
    }
  }
  
  async getLogStats(projectId: number, timeRange: string = '7d'): Promise<LogStats> {
    try {
      console.log('getLogStats - Calling API with params:', { projectId, timeRange });
      
      // 토큰 확인
      const token = localStorage.getItem('token');
      console.log('getLogStats - Token available:', !!token);
      console.log('getLogStats - Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      
      const response = await api.get('/logs/mainboard', { 
        params: { 
          project_id: projectId, 
          log_time: timeRange 
        }
      });
      
      console.log('getLogStats - Raw API response:', response);
      console.log('getLogStats - Response data:', response.data);
      
      const logs = response.data || [];
      console.log('getLogStats - Extracted logs:', logs);
      console.log('getLogStats - Logs length:', logs.length);
      
      // 만약 mainboard API에서 데이터가 없다면, recent logs를 사용해서 통계 생성
      if (logs.length === 0) {
        console.log('getLogStats - No data from mainboard API, trying recent logs...');
        try {
          const recentLogs = await this.getRecentLogs(projectId, 1, 100);
          console.log('getLogStats - Recent logs found:', recentLogs.length);
          
          if (recentLogs.length > 0) {
            // recent logs에서 통계 생성
            const levelDistribution: Record<string, number> = {};
            const timeGroups: Record<string, Record<string, number>> = {};
            
                         recentLogs.forEach((log: any) => {
               const level = log.log_level || 'UNKNOWN';
               levelDistribution[level] = (levelDistribution[level] || 0) + 1;
               
               if (log.message_timestamp) {
                 // 시간별 그룹화 (더 세밀하게)
                 const date = new Date(log.message_timestamp);
                 const timeKey = date.toISOString().slice(0, 13) + ':00:00'; // YYYY-MM-DDTHH:00:00
                 
                 if (!timeGroups[timeKey]) {
                   timeGroups[timeKey] = {};
                 }
                 if (!timeGroups[timeKey][level]) {
                   timeGroups[timeKey][level] = 0;
                 }
                 timeGroups[timeKey][level]++;
               }
             });
            
            const recentTrends: Array<{date: string, count: number, level: string}> = [];
            Object.entries(timeGroups).forEach(([date, levelCounts]) => {
              Object.entries(levelCounts).forEach(([level, count]) => {
                recentTrends.push({ date, count, level });
              });
            });
            
            const result = {
              totalLogs: recentLogs.length,
              levelDistribution,
              recentTrends
            };
            
            console.log('getLogStats - Generated stats from recent logs:', result);
            return result;
          }
        } catch (recentError) {
          console.log('getLogStats - Failed to get recent logs:', recentError);
        }
      }
      
      // 로그 레벨별 분포 계산
      const levelDistribution: Record<string, number> = {};
      logs.forEach((log: any) => {
        const level = log.log_level || 'UNKNOWN';
        levelDistribution[level] = (levelDistribution[level] || 0) + 1;
      });
      
      console.log('getLogStats - Level distribution:', levelDistribution);
      
      // 최근 트렌드 데이터 생성 (시간별 로그 수)
      const recentTrends: Array<{date: string, count: number, level: string}> = [];
      const timeGroups: Record<string, Record<string, number>> = {};
      
      logs.forEach((log: any) => {
        if (log.message_timestamp) {
          const date = new Date(log.message_timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
          const level = log.log_level || 'UNKNOWN';
          
          if (!timeGroups[date]) {
            timeGroups[date] = {};
          }
          if (!timeGroups[date][level]) {
            timeGroups[date][level] = 0;
          }
          timeGroups[date][level]++;
        }
      });
      
      // 시간 그룹을 배열로 변환
      Object.entries(timeGroups).forEach(([date, levelCounts]) => {
        Object.entries(levelCounts).forEach(([level, count]) => {
          recentTrends.push({ date, count, level });
        });
      });
      
      console.log('getLogStats - Recent trends:', recentTrends);
      
      const result = {
        totalLogs: logs.length,
        levelDistribution,
        recentTrends
      };
      
      console.log('getLogStats - Final result:', result);
      return result;
    } catch (error: any) {
      console.error('Log stats API call failed:', error);
      console.error('Log stats API call error details:', {
        message: error?.message || 'Unknown error',
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data
      });
      return {
        totalLogs: 0,
        levelDistribution: {},
        recentTrends: []
      };
    }
  }
  
  async getLogDetail(projectId: number, logId: string | string[]): Promise<any[]> {
    try {
      // projectId가 0이거나 undefined인 경우 에러 처리
      if (!projectId) {
        throw new Error('Missing or invalid projectId in getLogDetail');
      }
      const actualProjectId = projectId;
      
      // Convert logId to array if needed
      const logIds = Array.isArray(logId) ? logId : [logId];
      
      // Server expects log_ids as List[str] query parameters
      const params = new URLSearchParams();
      params.append('project_id', actualProjectId.toString());
      logIds.forEach(id => {
        params.append('log_ids', id);
      });
      
      const response = await api.get('/logs/detail', { 
        params: params
      });
      
      // Return array response or empty array
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Log detail API call failed:', error);
      
      // Return mock data for development
      return [{
        _id: logId,
        _source: {
          message: 'Mock log entry',
          message_timestamp: new Date().toISOString(),
          log_level: 'INFO',
          keyword: 'mock',
          host_name: 'localhost'
        },
        severity: 'INFO'
      }];
    }
  }
  
  async getTroubleReports(projectId: number): Promise<LogEntry[]> {
    try {
      const response = await api.get(`/projects/${projectId}/logs/troubles/`);
      return response.data || [];
    } catch (error) {
      console.error('Trouble reports API call failed:', error);
      return [];
    }
  }
}

export const logService = new LogService();