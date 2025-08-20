import api from '../api/axios';

export interface TroubleItem {
  id: number;
  report_name: string;
  content: string;
  user_query: string;
  is_shared: boolean;
  project_id: number;
  created_by: number;
  created_at: string;
  logs_count?: number;
  creator_username?: string;
}

export interface TroubleDetail {
  trouble: {
    id: number;
    report_name: string;
    content: string;
    user_query: string;
    is_shared: boolean;
    project_id: number;
    created_by: number;
    created_at: string;
  };
  logs: string[];
}

export interface CreateTroubleRequest {
  is_shared: boolean;
  project_id: number;
  related_logs: string[];
  user_query: string;
}

export interface UpdateTroubleRequest {
  report_name?: string;
  is_shared?: boolean;
  content?: string;
}

export interface ProjectTroublesResponse {
  items: Array<{
    id: number;
    report_name: string;
    created_at: string;
    creator_username: string;
    is_shared: boolean;
    logs_count: number;
  }>;
  page: number;
  pages: number;
  size: number;
  total: number;
}

class TroubleService {
  // 프로젝트의 트러블 목록 조회
  async getProjectTroubles(
    projectId: number, 
    page: number = 1, 
    size: number = 10,
    search?: string,
    is_shared?: boolean,
    created_by?: number
  ): Promise<ProjectTroublesResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      });
      
      if (search) params.append('search', search);
      if (is_shared !== undefined) params.append('is_shared', is_shared.toString());
      if (created_by) params.append('created_by', created_by.toString());
      
      const response = await api.get(`/troubles/list/${projectId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get project troubles:', error);
      throw error;
    }
  }

  // 특정 트러블 상세 조회
  async getTrouble(troubleId: number): Promise<TroubleDetail> {
    try {
      const response = await api.get(`/troubles/${troubleId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get trouble detail:', error);
      throw error;
    }
  }

  // 트러블 생성
  async createTrouble(troubleData: CreateTroubleRequest): Promise<TroubleItem> {
    try {
      const response = await api.post(`/troubles`, troubleData);
      return response.data;
    } catch (error) {
      console.error('Failed to create trouble:', error);
      throw error;
    }
  }

  // 트러블 수정
  async updateTrouble(troubleId: number, troubleData: UpdateTroubleRequest): Promise<TroubleItem> {
    try {
      const response = await api.put(`/troubles/${troubleId}`, troubleData);
      return response.data;
    } catch (error) {
      console.error('Failed to update trouble:', error);
      throw error;
    }
  }

  // 트러블 삭제
  async deleteTrouble(troubleId: number): Promise<string> {
    try {
      const response = await api.delete(`/troubles/${troubleId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete trouble:', error);
      throw error;
    }
  }
}

export const troubleService = new TroubleService();
