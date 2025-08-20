import { troubleService, CreateTroubleRequest, ProjectTroublesResponse } from '../../../services/troubleService';

// Trouble 관련 API 함수들
export interface TroubleListItem {
  id: number;
  report_name: string;
  is_shared: boolean;
  logs_count: number;
  created_at: string;
  creator_username: string;
}

export interface TroubleWithLogs {
  trouble: {
    id: number;
    report_name: string;
    user_query: string;
    content: string;
    is_shared: boolean;
    project_id: number;
    created_at: string;
    created_by: number;
  };
  logs: string[];
}

// LogDetailModal에서 필요한 타입들
export interface CreateTroubleResponse {
  id: number;
  report_name: string;
  user_query: string;
  content: string;
  is_shared: boolean;
  project_id: number;
  created_at: string;
  created_by: number;
  status?: 'processing' | 'completed' | 'failed'; // AI 분석 상태 추가
}

// 프로젝트의 트러블 목록 조회
export const fetchTroubleList = async (projectId: number, _userId: number): Promise<{ items: TroubleListItem[] }> => {
  try {
    const response = await troubleService.getProjectTroubles(projectId);
    console.log('✅ Trouble List API Response:', response);
    
    return {
      items: response.items || []
    };
  } catch (error) {
    console.error('❌ Trouble List API Error:', error);
    
    // 에러 시 빈 배열 반환
    return { items: [] };
  }
};

// 특정 트러블 상세 조회
export const fetchTroubleById = async (troubleId: number, userId: number): Promise<TroubleWithLogs> => {
  try {
    const response = await troubleService.getTrouble(troubleId);
    console.log('✅ Trouble Detail API Response:', response);
    
    return response;
  } catch (error) {
    console.error('❌ Trouble Detail API Error:', error);
    
    // 에러 시 기본 데이터 반환
    return {
      trouble: {
        id: troubleId,
        report_name: "Error - Using Mock Data",
        user_query: "Failed to load trouble details",
        content: "Failed to load trouble details",
        is_shared: false,
        project_id: 1,
        created_at: new Date().toISOString(),
        created_by: 1
      },
      logs: []
    };
  }
};

// 트러블 생성
export const createTrouble = async (request: CreateTroubleRequest): Promise<CreateTroubleResponse> => {
  try {
    const response = await troubleService.createTrouble(request);
    console.log('✅ Trouble API Response:', response);
    
    return response;
  } catch (error) {
    console.error('❌ Trouble API Error:', error);
    
    // 에러 시 임시 응답 반환 (개발 중에만)
    return {
      id: Math.floor(Math.random() * 1000),
      report_name: "Error - Using Mock Data",
      user_query: request.user_query,
      content: `API 연결 실패: ${error instanceof Error ? error.message : 'Unknown error'}. 백엔드 서버가 실행 중인지 확인해주세요.`,
      is_shared: request.is_shared,
      project_id: request.project_id,
      created_at: new Date().toISOString(),
      created_by: 1
    };
  }
};

// 프로젝트 트러블 목록 조회
export const getProjectTroubles = async (
  projectId: number,
  page: number = 1,
  size: number = 10,
  search?: string,
  is_shared?: boolean,
  created_by?: number
): Promise<ProjectTroublesResponse> => {
  try {
    console.log(`🔍 Getting troubles for project ${projectId}, page ${page}`);
    
    const response = await troubleService.getProjectTroubles(
      projectId, 
      page, 
      size, 
      search, 
      is_shared, 
      created_by
    );
    
    console.log('✅ Project troubles received:', response);
    return response;
    
  } catch (error) {
    console.error('❌ Failed to get project troubles:', error);
    
    // 에러 시 빈 목록 반환
    return {
      items: [],
      page: 1,
      pages: 1,
      size: size,
      total: 0
    };
  }
};

// 트러블 삭제
export const deleteTrouble = async (troubleId: number): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`🗑️ Deleting trouble ${troubleId}`);
    
    await troubleService.deleteTrouble(troubleId);
    
    console.log('✅ Trouble deleted successfully');
    return {
      success: true,
      message: 'Trouble deleted successfully'
    };
    
  } catch (error) {
    console.error('❌ Failed to delete trouble:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
