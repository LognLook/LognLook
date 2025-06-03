import { LogLevel } from '../types/logTypes';
import api from '../../../api/axios';
import axios, { AxiosError } from 'axios';

const SEARCH_API_URL = '/log/search';   // 검색 API URL

// 로그 검색 파라미터 인터페이스
export interface SearchLogsParams {
  projectId: number;
  query: string;
  keyword?: string;
  logLevel?: string;
  startTime?: string;
  endTime?: string;
  k?: number;
}

// 검색 결과 로그 엔트리 인터페이스 (검색 API 응답 구조)
export interface SearchLogEntry {
  id: string;
  message_timestamp: string;
  log_level: LogLevel;
  keyword?: string;
  message?: string;
  host_name?: string;
}

// 로그 검색 API 함수
export const searchLogs = async (params: SearchLogsParams): Promise<SearchLogEntry[]> => {
  try {
    console.log('Searching logs with params:', params);
    const { projectId, ...queryParams } = params;
    
    const response = await api.get(SEARCH_API_URL, {
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
        'accept': 'application/json',
        'x-user-id': 1, // 현재는 하드코딩, 추후 context에서 가져오기
      },
    });
    
    console.log('Search logs API response:', response.data);
    return response.data;
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

// 편의를 위한 래퍼 함수들
export const searchLogsByQuery = async (
  projectId: number, 
  query: string, 
  options?: Partial<SearchLogsParams>
): Promise<SearchLogEntry[]> => {
  return searchLogs({
    projectId,
    query,
    ...options,
  });
};

export const searchLogsByKeyword = async (
  projectId: number,
  query: string,
  keyword: string,
  options?: Partial<SearchLogsParams>
): Promise<SearchLogEntry[]> => {
  return searchLogs({
    projectId,
    query,
    keyword,
    ...options,
  });
};

export const searchLogsByLevel = async (
  projectId: number,
  query: string,
  logLevel: string,
  options?: Partial<SearchLogsParams>
): Promise<SearchLogEntry[]> => {
  return searchLogs({
    projectId,
    query,
    logLevel,
    ...options,
  });
};

export const searchLogsByTimeRange = async (
  projectId: number,
  query: string,
  startTime: string,
  endTime: string,
  options?: Partial<SearchLogsParams>
): Promise<SearchLogEntry[]> => {
  return searchLogs({
    projectId,
    query,
    startTime,
    endTime,
    ...options,
  });
};

// 통합된 searchLogApi 객체
const searchLogApi = {
  search: searchLogs,
  searchByQuery: searchLogsByQuery,
  searchByKeyword: searchLogsByKeyword,
  searchByLevel: searchLogsByLevel,
  searchByTimeRange: searchLogsByTimeRange,
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