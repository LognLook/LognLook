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
          // Day view: 1-hour intervals for better readability
          timeKey = current.toISOString();
          current = new Date(current.getTime() + 60 * 60 * 1000); // Add 1 hour
          break;
        case 'week':
          // Week view: use actual times, not fixed noon
          timeKey = current.toISOString();
          current = new Date(current.getTime() + 24 * 60 * 60 * 1000); // Add 1 day
          break;
        case 'month':
          // Month view: use actual times, not fixed noon
          timeKey = current.toISOString();
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

  async getLogStats(projectId: number, timeRange: string = 'day'): Promise<LogStats> {
    try {
      const response = await api.get('/logs/mainboard', { 
        params: { 
          project_id: projectId, 
          log_time: timeRange 
        }
      });
      
      const logs = response.data || [];
      const filteredLogs = logs;
      
      // Calculate log level distribution
      const levelDistribution: Record<string, number> = {};
      filteredLogs.forEach((log: any) => {
        const level = log.log_level || 'UNKNOWN';
        levelDistribution[level] = (levelDistribution[level] || 0) + 1;
      });
      
      // Generate time grid based on user's local timezone
      let startTime: Date;
      let endTime: Date;
      
      // Use user's current local time as end time
      endTime = new Date(); // This is user's local time
      
      // Calculate start time based on selected period (user's local time)
      switch (timeRange) {
        case 'day':
          startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
          break;
        case 'week':
          startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
          break;
        case 'month':
          startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
          break;
        default:
          startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // Default to 24 hours
      }
      
      const timeGrid = this.generateTimeGrid(startTime, endTime, timeRange);
      
      // Initialize time groups with all time slots set to 0
      const timeGroups: Record<string, Record<string, number>> = {};
      timeGrid.forEach(timeKey => {
        timeGroups[timeKey] = { INFO: 0, WARN: 0, ERROR: 0, DEBUG: 0, CRITICAL: 0 };
      });
      
      // Fill in actual log data
      filteredLogs.forEach((log: any) => {
        if (log.message_timestamp) {
          // Parse log timestamp (server sends UTC time without Z suffix)
          const logTimestamp = log.message_timestamp.endsWith('Z') ? 
            log.message_timestamp : log.message_timestamp + 'Z';
          const logDate = new Date(logTimestamp);
          
          if (isNaN(logDate.getTime())) {
            return;
          }
          
          // Check if log is within our time range (user's local time)
          if (logDate < startTime || logDate > endTime) {
            return;
          }
          
          // Find the closest time slot in our grid
          let closestTimeKey: string | null = null;
          let minTimeDiff = Infinity;
          
          for (const timeKey of timeGrid) {
            const gridDate = new Date(timeKey);
            const timeDiff = Math.abs(gridDate.getTime() - logDate.getTime());
            
            if (timeDiff < minTimeDiff) {
              minTimeDiff = timeDiff;
              closestTimeKey = timeKey;
            }
          }
          
          if (closestTimeKey && timeGroups[closestTimeKey]) {
            let level = (log.log_level || 'INFO').toUpperCase(); // Default to INFO instead of UNKNOWN
            
            // Map inconsistent level names
            if (level === 'WARNING') {
              level = 'WARN';
            }
            
            // Ensure the level exists in our timeGroups structure
            if (!(level in timeGroups[closestTimeKey])) {
              // Add missing level with 0 count
              timeGroups[closestTimeKey][level] = 0;
            }
            
            timeGroups[closestTimeKey][level]++;
          }
        }
      });
      
      // Convert time groups to trends array
      const recentTrends: Array<{date: string, count: number, level: string}> = [];
      Object.entries(timeGroups).forEach(([timeKey, levelCounts]) => {
        Object.entries(levelCounts).forEach(([level, count]) => {
          // Only include entries with count > 0 to avoid empty data
          if (count > 0) {
            recentTrends.push({ date: timeKey, count, level });
          }
        });
      });
      
      // Sort by time
      recentTrends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const result = {
        totalLogs: filteredLogs.length,
        levelDistribution,
        recentTrends
      };
      return result;
    } catch (error: any) {
      console.error('Log stats API call failed:', error);
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