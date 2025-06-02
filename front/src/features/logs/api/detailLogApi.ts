import { LogLevel } from '../types/logTypes';
import api from '../../../api/axios';
import axios from 'axios';

// Log detail API용 파라미터 인터페이스
interface FetchLogDetailParams {
  projectId: number;
  logIds: string[];
}

// Elasticsearch 응답 구조에 맞는 인터페이스
interface ApiLogDetailEntry {
  _index: string;
  _id: string;
  _score: number;
  _source: {
    ecs: {
      version: string;
    };
    log: {
      file: {
        device_id: string;
        fingerprint: string;
        inode: string;
        path: string;
      };
      offset: number;
    };
    tags: string[];
    agent: {
      name: string;
      version: string;
      type: string;
      ephemeral_id: string;
      id: string;
    };
    "@version": string;
    input: {
      type: string;
    };
    message: string;
    event: {
      original: string;
    };
    container: {
      id: string;
    };
    "@timestamp": string;
    host: {
      name: string;
      os: {
        name: string;
        version: string;
        kernel: string;
        type: string;
        platform: string;
        build: string;
        family: string;
      };
      id: string;
      ip: string[];
      hostname: string;
      architecture: string;
      mac: string[];
    };
    comment: string;
    keyword: string;
    message_timestamp: string;
    log_level: LogLevel;
  };
}

export const fetchLogDetail = async (params: FetchLogDetailParams): Promise<ApiLogDetailEntry[]> => {
  try {
    console.log('Fetching log detail with params:', params);
    const { projectId, logIds } = params;
    
    // query parameter 직접 구성
    const queryParams = new URLSearchParams();
    queryParams.append('project_id', projectId.toString());
    
    // 각 logId를 별도의 log_ids parameter로 추가
    logIds.forEach(logId => {
      queryParams.append('log_ids', logId);
    });
    
    const response = await api.get(`/log/detail?${queryParams.toString()}`);
    console.log('Log detail API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching log detail:', error);
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

export const getLogDetail = async (projectId: number, logIds: string[]): Promise<ApiLogDetailEntry[]> => {
  console.log('getLogDetail called with projectId:', projectId, 'logIds:', logIds);
  return fetchLogDetail({ projectId, logIds });
};

// 타입 export
export type { FetchLogDetailParams, ApiLogDetailEntry }; 