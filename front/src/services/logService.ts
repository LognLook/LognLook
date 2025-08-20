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
  
  // Helper function to generate time grid with proper intervals
  private generateTimeGrid(startTime: Date, endTime: Date, timeRange: string): string[] {
    const timeGrid: string[] = [];
    let current = new Date(startTime);
    
    while (current <= endTime) {
      let timeKey: string;
      
      switch (timeRange) {
        case 'day':
        case '1d':
          // Day view: 5-minute intervals
          timeKey = current.toISOString();
          current = new Date(current.getTime() + 5 * 60 * 1000); // Add 5 minutes
          break;
        case 'week':
        case '7d':
          // Week view: daily intervals (at noon for consistency)
          timeKey = current.toISOString().slice(0, 10) + 'T12:00:00.000Z';
          current = new Date(current.getTime() + 24 * 60 * 60 * 1000); // Add 1 day
          break;
        case 'month':
        case '30d':
          // Month view: daily intervals (at noon)
          timeKey = current.toISOString().slice(0, 10) + 'T12:00:00.000Z';
          current = new Date(current.getTime() + 24 * 60 * 60 * 1000); // Add 1 day
          break;
        default:
          timeKey = current.toISOString().slice(0, 13) + ':00:00.000Z';
          current = new Date(current.getTime() + 60 * 60 * 1000);
      }
      
      timeGrid.push(timeKey);
    }
    
    return timeGrid;
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
      
      // Always generate time grid and stats, even if no data
      console.log('getLogStats - Processing logs for selected period only');
      
      // Filter logs by time period first
      const now = new Date();
      let startTime: Date;
      
      switch (timeRange) {
        case 'day':
        case '1d':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
        case '30d':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      
      const filteredLogs = logs.filter((log: any) => {
        if (log.message_timestamp) {
          const logTime = new Date(log.message_timestamp);
          return logTime >= startTime && logTime <= now;
        }
        return false;
      });
      
      // Calculate log level distribution
      const levelDistribution: Record<string, number> = {};
      filteredLogs.forEach((log: any) => {
        const level = log.log_level || 'UNKNOWN';
        levelDistribution[level] = (levelDistribution[level] || 0) + 1;
      });
      
      // Generate complete time grid
      const timeGrid = this.generateTimeGrid(startTime, now, timeRange);
      
      // Initialize time groups with all time slots set to 0
      const timeGroups: Record<string, Record<string, number>> = {};
      timeGrid.forEach(timeKey => {
        timeGroups[timeKey] = { INFO: 0, WARN: 0, ERROR: 0, DEBUG: 0, CRITICAL: 0 };
      });
      
      // Fill in actual log data
      filteredLogs.forEach((log: any) => {
        if (log.message_timestamp) {
          const date = new Date(log.message_timestamp);
          let timeKey: string;
          
          // Group time based on selected period (same logic as grid generation)
          switch (timeRange) {
            case 'day':
            case '1d':
              // Day view: round to nearest 5-minute interval
              const minutes = Math.floor(date.getMinutes() / 5) * 5;
              const roundedDate = new Date(date);
              roundedDate.setMinutes(minutes, 0, 0);
              timeKey = roundedDate.toISOString();
              break;
            case 'week':
            case '7d':
              // Week view: group by day
              timeKey = date.toISOString().slice(0, 10) + 'T12:00:00.000Z';
              break;
            case 'month':
            case '30d':
              // Month view: group by day
              timeKey = date.toISOString().slice(0, 10) + 'T12:00:00.000Z';
              break;
            default:
              timeKey = date.toISOString().slice(0, 13) + ':00:00.000Z';
          }
          
          const level = log.log_level || 'UNKNOWN';
          
          // Only increment if this time slot exists in our grid
          if (timeGroups[timeKey] && level in timeGroups[timeKey]) {
            timeGroups[timeKey][level]++;
          }
        }
      });
      
      // Convert time groups to trends array
      const recentTrends: Array<{date: string, count: number, level: string}> = [];
      Object.entries(timeGroups).forEach(([timeKey, levelCounts]) => {
        Object.entries(levelCounts).forEach(([level, count]) => {
          // Include all entries, even those with count 0
          recentTrends.push({ date: timeKey, count, level });
        });
      });
      
      // Sort by time
      recentTrends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      console.log('getLogStats - Recent trends:', recentTrends);
      
      const result = {
        totalLogs: filteredLogs.length,
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