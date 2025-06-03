import api from '../../../api/axios';
import axios from 'axios';

// Trouble 생성 요청 타입
export interface CreateTroubleRequest {
  is_shared: boolean;
  project_id: number;
  related_logs: string[];
  user_query: string;
}

// Trouble 생성 응답 타입 (예시)
export interface CreateTroubleResponse {
  content: string;
  created_at: string;
  created_by: number;
  id: number;
  is_shared: boolean;
  project_id: number;
  report_name: string;
  user_query: string;
}

export interface TroubleListItem {
  id: number;
  report_name: string;
  created_at: string;
  is_shared: boolean;
  creator_email: string;
  logs_count: number;
}

export interface TroubleListResponse {
  items: TroubleListItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Trouble 상세 조회 응답 타입
export interface TroubleWithLogs {
  trouble: CreateTroubleResponse;
  logs: string[];
}

/**
 * Trouble을 생성합니다.
 * @param userId 사용자 ID (헤더)
 * @param data Trouble 생성 요청 데이터
 */
export const createTrouble = async (
  userId: number,
  data: CreateTroubleRequest
): Promise<CreateTroubleResponse> => {
  try {
    const response = await api.post('/trouble', data, {
      headers: {
        'x-user-id': userId,
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 1500000, 
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error details:', error.response);
    }
    throw error;
  }
};

export const fetchTroubleList = async (
  projectId: number,
  userId: number,
  page = 1,
  size = 10
): Promise<TroubleListResponse> => {
  const response = await api.get(`/project/${projectId}/troubles`, {
    params: { page, size },
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

/**
 * Trouble 상세 정보를 조회합니다.
 * @param troubleId trouble ID
 * @param userId 사용자 ID (헤더)
 */
export const fetchTroubleById = async (
  troubleId: number,
  userId: number
): Promise<TroubleWithLogs> => {
  try {
    const response = await api.get(`/trouble/${troubleId}`, {
      headers: {
        'x-user-id': userId,
        'accept': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error details:', error.response);
    }
    throw error;
  }
}; 