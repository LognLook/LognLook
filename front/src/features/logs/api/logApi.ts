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
    
    // 현재 시간 기준으로 필터링할 시간 범위 계산
    const now = new Date();
    let startTime: Date;
    let getTimeKey: (date: Date) => string;
    
    switch (queryParams.logTime) {
      case 'day':
        // 정확히 24시간 전부터 현재까지
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        getTimeKey = (date: Date) => `${date.getHours().toString().padStart(2, '0')}:00`;
        break;
      case 'week':
        // 정확히 7일 전부터 현재까지
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        getTimeKey = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        break;
      case 'month':
        // 정확히 30일 전부터 현재까지
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        getTimeKey = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        getTimeKey = (date: Date) => `${date.getHours().toString().padStart(2, '0')}:00`;
    }

    console.log(`Filtering logs from ${startTime.toISOString()} to ${now.toISOString()}`);

    // 지정된 시간 범위 내의 로그만 필터링
    const filteredLogs = logs.filter(log => {
      const logTime = new Date(log.message_timestamp);
      return logTime >= startTime && logTime <= now;
    });

    console.log(`Filtered ${filteredLogs.length} logs out of ${logs.length} total logs`);

    // 로그 레벨별 총합 계산
    const total = {
      info: filteredLogs.filter(log => log.log_level === 'INFO').length,
      warn: filteredLogs.filter(log => log.log_level === 'WARN').length,
      error: filteredLogs.filter(log => log.log_level === 'ERROR').length
    };

    // 시간별 데이터 그룹화
    const timeMap = new Map<string, { INFO: number; WARN: number; ERROR: number; actualTime: Date }>();
    
    // 빈 시간 슬롯들을 미리 생성 (연속적인 시간 표시를 위해)
    if (queryParams.logTime === 'day') {
      // 현재 시각의 다음 시간부터 24시간 전까지 시간 슬롯 생성
      
      // 24시간을 1시간 단위로 분할 (현재 시간 포함)
      for (let i = 0; i < 24; i++) {
        // 현재 시간부터 거꾸로 가면서 시간 슬롯 생성
        const hoursBack = 23 - i; // 23시간 전부터 현재까지
        const slotTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);
        // 분, 초, 밀리초를 0으로 설정하여 정시로 맞춤
        slotTime.setMinutes(0, 0, 0);
        
        const timeKey = getTimeKey(slotTime);
        timeMap.set(timeKey, { INFO: 0, WARN: 0, ERROR: 0, actualTime: slotTime });
      }
    } else if (queryParams.logTime === 'week') {
      // 7일을 1일 단위로 분할
      for (let i = 0; i < 7; i++) {
        const slotTime = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000);
        const timeKey = getTimeKey(slotTime);
        if (!timeMap.has(timeKey)) {
          timeMap.set(timeKey, { INFO: 0, WARN: 0, ERROR: 0, actualTime: slotTime });
        }
      }
    } else if (queryParams.logTime === 'month') {
      // 30일을 1일 단위로 분할
      for (let i = 0; i < 30; i++) {
        const slotTime = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000);
        const timeKey = getTimeKey(slotTime);
        if (!timeMap.has(timeKey)) {
          timeMap.set(timeKey, { INFO: 0, WARN: 0, ERROR: 0, actualTime: slotTime });
        }
      }
    }
    
    // 실제 로그 데이터를 시간 슬롯에 배정
    filteredLogs.forEach(log => {
      const logTime = new Date(log.message_timestamp);
      const timeKey = getTimeKey(logTime);
      
      if (!timeMap.has(timeKey)) {
        timeMap.set(timeKey, { INFO: 0, WARN: 0, ERROR: 0, actualTime: logTime });
      }
      
      const counts = timeMap.get(timeKey)!;
      
      // 로그 레벨 카운팅
      if (log.log_level === 'ERROR') {
        counts.ERROR++;
      } else if (log.log_level === 'WARN') {
        counts.WARN++;
      } else if (log.log_level === 'INFO') {
        counts.INFO++;
      }
    });

    // Map을 배열로 변환하고 실제 시간순으로 정렬
    const data = Array.from(timeMap.entries())
      .map(([time, counts]) => ({
        time,
        INFO: counts.INFO,
        WARN: counts.WARN,
        ERROR: counts.ERROR,
        actualTime: counts.actualTime
      }))
      .sort((a, b) => {
        if (queryParams.logTime === 'day') {
          // 실제 시간순으로 정렬 (24시간 연속성 고려)
          return a.actualTime.getTime() - b.actualTime.getTime();
        } else {
          // 날짜 순서로 정렬
          try {
            const dateA = new Date(a.time + ', ' + now.getFullYear());
            const dateB = new Date(b.time + ', ' + now.getFullYear());
            return dateA.getTime() - dateB.getTime();
          } catch {
            return a.time.localeCompare(b.time);
          }
        }
      })
      .map(({ time, INFO, WARN, ERROR }) => ({ time, INFO, WARN, ERROR })); // actualTime 제거

    console.log('Processed graph data:', { 
      period: queryParams.logTime, 
      dataPoints: data.length, 
      timeRange: `${startTime.toLocaleString()} - ${now.toLocaleString()}`,
      total 
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