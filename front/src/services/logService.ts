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
      
      // 선택적 파라미터들 추가
      if (params.keyword) apiParams.keyword = params.keyword;
      if (params.logLevel) apiParams.log_level = params.logLevel;
      if (params.startTime) apiParams.start_time = params.startTime;
      if (params.endTime) apiParams.end_time = params.endTime;
      
      const response = await api.get('/log/search', { params: apiParams });
      
      // API 응답이 string인 경우 (로그 데이터 자체)
      if (typeof response.data === 'string') {
        // 로그 데이터를 파싱하여 LogEntry[]로 변환
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
      
      // 기존 응답 형식 지원
      return {
        logs: response.data.logs || response.data || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        totalPages: response.data.totalPages || 1
      };
    } catch (error) {
      console.error('Search API error:', error);
      
      // API 실패 시 Mock 데이터 반환
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
      const response = await api.get('/log/recent', { 
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
      
      // Mock 데이터 반환
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
      const response = await api.get('/log/mainboard', { 
        params: { 
          project_id: projectId, 
          log_time: timeRange 
        }
      });
      
      const logs = response.data || [];
      
      // 로그 레벨별 분포 계산
      const levelDistribution: Record<string, number> = {};
      logs.forEach((log: any) => {
        const level = log.log_level || 'UNKNOWN';
        levelDistribution[level] = (levelDistribution[level] || 0) + 1;
      });
      
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
      
      return {
        totalLogs: logs.length,
        levelDistribution,
        recentTrends
      };
    } catch (error) {
      console.error('Log stats API call failed:', error);
      return {
        totalLogs: 0,
        levelDistribution: {},
        recentTrends: []
      };
    }
  }
  
  async getLogDetail(projectId: number, logId: string): Promise<any[]> {
    try {
      // projectId가 0이거나 undefined인 경우 기본값 사용
      const actualProjectId = projectId || 9; // 백엔드에서 테스트한 프로젝트 ID
      
      // 서버에서 log_ids를 List[str] 형태의 쿼리 파라미터로 받으므로
      // log_ids[] 형태로 보내야 함
      const params = new URLSearchParams();
      params.append('project_id', actualProjectId.toString());
      params.append('log_ids', logId);
      
      const response = await api.get('/log/detail', { 
        params: params
      });
      
      // API 응답이 배열인 경우 그대로 반환, 아니면 빈 배열 반환
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Log detail API returned non-array response:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Log detail API call failed:', error);
      
      // Mock 데이터 반환 (개발 중에만)
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