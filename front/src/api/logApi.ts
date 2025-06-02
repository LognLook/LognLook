import api from './axios';
import { LogGraphResponse } from '../types/logs';
import { AxiosError } from 'axios';

interface LogEntry {
  extracted_timestamp: string;
  log_level: 'ERROR' | 'WARN' | 'INFO';  // LogLevel 타입과 같은 값들
}

const logApi = {
  fetchLogs: async (projectId: number, logTime: string = 'day') => {
    try {
      const response = await api.get(`/log/mainboard`, {
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
    try {
      const response = await api.get(`/log/mainboard`, {
        params: { project_id: projectId, log_time: logTime },
        headers: {
          'accept': 'application/json',
          'x-user-id': 1
        }
      });
      
      const logs: LogEntry[] = response.data;
      
      // 로그 레벨별 카운트 계산 - 새로운 데이터 구조 사용
      const total = {
        error: logs.filter(log => log.log_level === 'ERROR').length,
        warn: logs.filter(log => log.log_level === 'WARN').length,
        info: logs.filter(log => log.log_level === 'INFO').length
      };

      // 시간별 데이터 그룹화
      const timeMap = new Map<string, { error: number; warn: number; info: number }>();
      
      logs.forEach(log => {
        // extracted_timestamp에서 날짜 부분만 추출
        const timestamp = log.extracted_timestamp;
        const date = logTime === 'day' 
          ? timestamp.split(' ')[1].split(':')[0] + ':00'  // 시간 단위로 그룹화 (HH:00)
          : timestamp.split(' ')[0];         // 일 단위로 그룹화 (YYYY-MM-DD)

        if (!timeMap.has(date)) {
          timeMap.set(date, { error: 0, warn: 0, info: 0 });
        }
        const counts = timeMap.get(date)!;
        
        // 로그 레벨 카운팅 - 새로운 데이터 구조 사용
        if (log.log_level === 'ERROR') {
          counts.error++;
        } else if (log.log_level === 'WARN') {
          counts.warn++;
        } else if (log.log_level === 'INFO') {
          counts.info++;
        }
      });

      // Map을 배열로 변환하고 시간순으로 정렬
      const data = Array.from(timeMap.entries())
        .map(([date, counts]) => ({
          time: date,
          ...counts
        }))
        .sort((a, b) => {
          if (logTime === 'day') {
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
      if (error instanceof AxiosError) {
        console.error('API Error details:', error.response);
      }
      throw error;
    }
  }
};

export default logApi; 