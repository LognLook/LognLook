import api from './axios';
import { LogGraphResponse } from '../types/logs';
import { AxiosError } from 'axios';

interface LogEntry {
  '@timestamp': string;
  message: string;
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
      
      // 로그 레벨별 카운트 계산
      const total = {
        error: logs.filter(log => log.message.includes('] ERROR ')).length,
        warn: logs.filter(log => log.message.includes('] WARN ')).length,
        info: logs.filter(log => log.message.includes('] INFO ')).length
      };

      // 시간별 데이터 그룹화
      const timeMap = new Map<string, { error: number; warn: number; info: number }>();
      
      logs.forEach(log => {
        // 타임스탬프에서 날짜 부분만 추출 (마이크로초 제거)
        const timestamp = log['@timestamp'].split('.')[0];
        const date = logTime === 'day' 
          ? timestamp.split(':')[0] + ':00'  // 시간 단위로 그룹화 (HH:00)
          : timestamp.split(' ')[0];         // 일 단위로 그룹화 (YYYY-MM-DD)

        if (!timeMap.has(date)) {
          timeMap.set(date, { error: 0, warn: 0, info: 0 });
        }
        const counts = timeMap.get(date)!;
        
        // 로그 레벨 카운팅 수정 - 서버의 로그 형식에 맞게 수정
        if (log.message.includes('] ERROR ')) {
          counts.error++;
        } else if (log.message.includes('] WARN ')) {
          counts.warn++;
        } else if (log.message.includes('] INFO ')) {
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