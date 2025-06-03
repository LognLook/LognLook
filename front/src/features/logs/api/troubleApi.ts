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
      timeout: 60000, // 트러블슈팅 전용 60초 타임아웃 (AI 처리 시간 고려)
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