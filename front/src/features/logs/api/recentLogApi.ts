import { LogLevel } from '../types/logTypes';
import api from '../../../api/axios';
import axios from 'axios';

// Recent logs API용 파라미터 인터페이스
interface FetchRecentLogsParams {
  projectId: number;
  userId: number;
  count: number;
}

// Recent logs API 응답용 인터페이스
interface ApiRecentLogEntry {
  id: string;
  message_timestamp: string;
  log_level: LogLevel;
  keyword: string;
  message: string;
  host_name: string;
}

export const fetchRecentLogs = async (params: FetchRecentLogsParams): Promise<ApiRecentLogEntry[]> => {
  try {
    console.log('Fetching recent logs with params:', params);
    const { projectId, userId, count } = params;
    const response = await api.get('/log/recent', {
      params: {
        project_id: projectId,
        count: count,
      },
      headers: {
        'x-user-id': userId,
      },
    });
    console.log('Recent logs API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent logs:', error);
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

export const getRecentLogs = async (count: number = 1): Promise<ApiRecentLogEntry[]> => {
  console.log('getRecentLogs called with count:', count);
  return fetchRecentLogs({ projectId: 1, userId: 1, count });
};

// 타입 export
export type { FetchRecentLogsParams, ApiRecentLogEntry }; 