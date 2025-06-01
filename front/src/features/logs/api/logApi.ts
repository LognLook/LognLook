import { LogEntry, LogLevel, LogGraphResponse } from '../types/logTypes';
import api from '../../../api/axios';
import axios from 'axios';

const API_BASE_URL = '/log/mainboard';  // 프록시를 통해 요청이 전달됨

interface FetchLogsParams {
  projectId: number;     
  userId: number;         
  logTime?: string;      
  level?: LogLevel;     
  limit?: number;         
}

export const fetchLogs = async (params: FetchLogsParams): Promise<LogEntry[]> => {
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
    const response = await api.get(`${API_BASE_URL}/graph`, {
      params: {
        project_id: projectId,
        log_time: queryParams.logTime,
      },
      headers: {
        'x-user-id': userId,
      },
    });
    console.log('Log graph API response:', response.data);
    return response.data;
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

export const getLogs = async (): Promise<LogEntry[]> => {
  console.log('getLogs called');
  return fetchLogs({ projectId: 1, userId: 1 });
};