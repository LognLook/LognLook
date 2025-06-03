import api from '../../../api/axios';
import axios from 'axios';

// 검색 요청 파라미터 인터페이스
export interface SearchLogParams {
  projectId: number;
  query: string;
  keyword?: string;
  logLevel?: 'error' | 'warning' | 'info' | 'debug' | 'critical' | 'custom';
  startTime?: string;
  endTime?: string;
  k?: number;
  userId: number; // 헤더용
}

// 검색 응답 로그 아이템 인터페이스
export interface SearchLogEntry {
  id: string;
  message_timestamp: string;
  log_level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'CRITICAL' | 'CUSTOM';
  keyword?: string;
  message?: string; // 옵셔널로 변경
  host_name?: string;
  extracted_timestamp?: string;
  // 추가적인 필드들이 있을 수 있음
  [key: string]: unknown;
}

// 검색 응답 인터페이스
export interface SearchLogResponse {
  results: SearchLogEntry[];
  total: number;
  query: string;
  filters: {
    project_id: number;
    keyword?: string;
    log_level?: string;
    start_time?: string;
    end_time?: string;
    k: number;
  };
}

/**
 * 로그 검색 API 호출
 */
export const searchLogs = async (params: SearchLogParams): Promise<SearchLogEntry[]> => {
  try {
    console.log('Searching logs with params:', params);
    
    const { projectId, userId, ...queryParams } = params;
    
    const response = await api.get('/log/search', {
      params: {
        project_id: projectId,
        query: queryParams.query,
        keyword: queryParams.keyword,
        log_level: queryParams.logLevel,
        start_time: queryParams.startTime,
        end_time: queryParams.endTime,
        k: queryParams.k || 10,
      },
      headers: {
        'x-user-id': userId,
      },
    });
    
    console.log('Search logs API response:', response.data);
    
    // API 응답이 배열이면 직접 반환, 객체면 results 필드 반환
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.results) {
      return response.data.results;
    } else {
      console.warn('Unexpected API response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error searching logs:', error);
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

/**
 * 고급 검색 옵션을 포함한 로그 검색
 */
export const searchLogsAdvanced = async (params: SearchLogParams): Promise<SearchLogResponse> => {
  try {
    console.log('Advanced searching logs with params:', params);
    
    const { projectId, userId, ...queryParams } = params;
    
    const response = await api.get('/log/search', {
      params: {
        project_id: projectId,
        query: queryParams.query,
        keyword: queryParams.keyword,
        log_level: queryParams.logLevel,
        start_time: queryParams.startTime,
        end_time: queryParams.endTime,
        k: queryParams.k || 10,
      },
      headers: {
        'x-user-id': userId,
      },
    });
    
    console.log('Advanced search logs API response:', response.data);
    
    // 응답 데이터를 SearchLogResponse 형태로 변환
    if (Array.isArray(response.data)) {
      return {
        results: response.data,
        total: response.data.length,
        query: queryParams.query,
        filters: {
          project_id: projectId,
          keyword: queryParams.keyword,
          log_level: queryParams.logLevel,
          start_time: queryParams.startTime,
          end_time: queryParams.endTime,
          k: queryParams.k || 10,
        }
      };
    } else {
      return response.data;
    }
  } catch (error) {
    console.error('Error in advanced search logs:', error);
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

// 통합된 searchLogApi 객체
const searchLogApi = {
  search: async (
    projectId: number, 
    query: string, 
    options?: {
      keyword?: string;
      logLevel?: 'error' | 'warning' | 'info' | 'debug' | 'critical' | 'custom';
      startTime?: string;
      endTime?: string;
      k?: number;
    }
  ) => {
    return searchLogs({
      projectId,
      query,
      userId: 1, // 기본값, 필요시 매개변수로 변경
      ...options,
    });
  },

  searchAdvanced: async (
    projectId: number, 
    query: string, 
    options?: {
      keyword?: string;
      logLevel?: 'error' | 'warning' | 'info' | 'debug' | 'critical' | 'custom';
      startTime?: string;
      endTime?: string;
      k?: number;
    }
  ) => {
    return searchLogsAdvanced({
      projectId,
      query,
      userId: 1, // 기본값, 필요시 매개변수로 변경
      ...options,
    });
  }
};

export default searchLogApi;

/*
사용 예시:

// 1. 기본 검색
const results = await searchLogs({
  projectId: 1,
  query: "에러",
  k: 10
});

// 2. 키워드로 검색
const results = await searchLogsByKeyword(1, "에러", "로그인");

// 3. 로그 레벨로 검색
const results = await searchLogsByLevel(1, "에러", "error");

// 4. 시간 범위로 검색
const results = await searchLogsByTimeRange(
  1, 
  "에러", 
  "2025-06-03T00:00:00", 
  "2025-06-03T23:59:59"
);

// 5. 모든 파라미터를 사용한 검색
const results = await searchLogs({
  projectId: 1,
  query: "에러",
  keyword: "로그인",
  logLevel: "error",
  startTime: "2025-06-03T00:00:00",
  endTime: "2025-06-03T23:59:59",
  k: 20
});

// 6. 통합 API 객체 사용
const results = await searchLogApi.search({
  projectId: 1,
  query: "에러"
});
*/ 