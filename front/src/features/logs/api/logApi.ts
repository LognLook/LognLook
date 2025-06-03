import { LogLevel } from '../types/logTypes';
import api from '../../../api/axios';
import axios, { AxiosError } from 'axios';

const API_BASE_URL = '/log/mainboard';  // 프록시를 통해 요청이 전달됨

interface FetchLogsParams {
  projectId: number;     
  userId: number;         
  logTime?: string;      
  level?: LogLevel;     
  limit?: number;         
}

// API 응답용 인터페이스 (실제 백엔드 데이터 구조)
interface ApiLogEntry {
  extracted_timestamp?: string;
  message_timestamp: string;
  log_level: LogLevel;
  keyword?: string;
}

// LogGraphResponse 인터페이스 정의
interface LogGraphResponse {
  data: Array<{
    time: string;
    INFO: number;
    WARN: number;
    ERROR: number;
  }>;
  total: {
    info: number;
    warn: number;
    error: number;
  };
}

export const fetchLogs = async (params: FetchLogsParams): Promise<ApiLogEntry[]> => {
  try {
    console.log('Fetching logs with params:', params);
    const { projectId, userId, ...queryParams } = params;
    const response = await api.get(API_BASE_URL, {
      params: {
        project_id: projectId,
        log_time: queryParams.logTime,
      },
      headers: {
        'x-user-id': userId,
      },
    });
    console.log('Logs API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching logs:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
    }
    throw error;
  }
};

export const fetchLogGraphData = async (params: FetchLogsParams): Promise<LogGraphResponse> => {
  try {
    console.log('Fetching log graph data with params:', params);
    const { projectId, userId, ...queryParams } = params;
    const response = await api.get(API_BASE_URL, {
      params: {
        project_id: projectId,
        log_time: queryParams.logTime,
      },
      headers: {
        'x-user-id': userId,
      },
    });
    console.log('Log graph API response:', response.data);
    
    const logs: ApiLogEntry[] = response.data;
    
    // 로그 레벨별 카운트 계산
    const total = {
      info: logs.filter(log => log.log_level === 'INFO').length,
      warn: logs.filter(log => log.log_level === 'WARN').length,
      error: logs.filter(log => log.log_level === 'ERROR').length
    };

    // 시간별 데이터 그룹화
    const timeMap = new Map<string, { INFO: number; WARN: number; ERROR: number }>();
    
    logs.forEach(log => {
      // message_timestamp에서 날짜 부분만 추출 (ISO 형식: 2025-06-03T01:57:21.706000)
      const timestamp = log.message_timestamp;
      const date = queryParams.logTime === 'day' 
        ? timestamp.split('T')[1].split(':')[0] + ':00'  // 시간 단위로 그룹화 (HH:00)
        : timestamp.split('T')[0];         // 일 단위로 그룹화 (YYYY-MM-DD)

      if (!timeMap.has(date)) {
        timeMap.set(date, { INFO: 0, WARN: 0, ERROR: 0 });
      }
      const counts = timeMap.get(date)!;
      
      // 로그 레벨 카운팅
      if (log.log_level === 'ERROR') {
        counts.ERROR++;
      } else if (log.log_level === 'WARN') {
        counts.WARN++;
      } else if (log.log_level === 'INFO') {
        counts.INFO++;
      }
    });

    // Map을 배열로 변환하고 시간순으로 정렬
    const data = Array.from(timeMap.entries())
      .map(([date, counts]) => ({
        time: date,
        ...counts
      }))
      .sort((a, b) => {
        if (queryParams.logTime === 'day') {
          return a.time.localeCompare(b.time);
        }
        return new Date(a.time).getTime() - new Date(b.time).getTime();
      });

    return {
      data,
      total
    };
  } catch (error) {
    console.error('Error fetching log graph data:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
    }
    throw error;
  }
};

export const getLogs = async (): Promise<ApiLogEntry[]> => {
  console.log('getLogs called');
  return fetchLogs({ projectId: 1, userId: 1 });
};

// 통합된 logApi 객체
const logApi = {
  fetchLogs: async (projectId: number, logTime: string = 'day') => {
    try {
      const response = await api.get(API_BASE_URL, {
        params: { project_id: projectId, log_time: logTime },
        headers: {
          'accept': 'application/json',
          'x-user-id': 1
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching logs:', error);
      if (error instanceof AxiosError) {
        console.error('API Error details:', error.response);
      }
      throw error;
    }
  },

  fetchLogGraphData: async (projectId: number, logTime: string = 'day'): Promise<LogGraphResponse> => {
    return fetchLogGraphData({ projectId, userId: 1, logTime });
  }
};

export default logApi;