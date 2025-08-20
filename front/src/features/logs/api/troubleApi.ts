import { troubleService, CreateTroubleRequest, ProjectTroublesResponse } from '../../../services/troubleService';

// Trouble-related API functions
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

// Types needed for LogDetailModal
export interface CreateTroubleResponse {
  id: number;
  report_name: string;
  user_query: string;
  content: string;
  is_shared: boolean;
  project_id: number;
  created_at: string;
  created_by: number;
  status?: 'processing' | 'completed' | 'failed';
}

// Fetch project trouble list
export const fetchTroubleList = async (projectId: number, _userId: number): Promise<{ items: TroubleListItem[] }> => {
  try {
    const response = await troubleService.getProjectTroubles(projectId);
    
    return {
      items: response.items || []
    };
  } catch (error) {
    console.error('Trouble List API Error:', error);
    
    // Return empty array on error
    return { items: [] };
  }
};

// Fetch specific trouble details
export const fetchTroubleById = async (troubleId: number, _userId: number): Promise<TroubleWithLogs> => {
  try {
    const response = await troubleService.getTrouble(troubleId);
    
    return response;
  } catch (error) {
    console.error('Trouble Detail API Error:', error);
    
    // Return default data on error
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

// Create trouble
export const createTrouble = async (request: CreateTroubleRequest): Promise<CreateTroubleResponse> => {
  try {
    const response = await troubleService.createTrouble(request);
    
    return response;
  } catch (error) {
    console.error('Trouble API Error:', error);
    
    // Return mock response on error (development only)
    return {
      id: Math.floor(Math.random() * 1000),
      report_name: "Error - Using Mock Data",
      user_query: request.user_query,
      content: `API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check if the backend server is running.`,
      is_shared: request.is_shared,
      project_id: request.project_id,
      created_at: new Date().toISOString(),
      created_by: 1
    };
  }
};

// Get project troubles list
export const getProjectTroubles = async (
  projectId: number,
  page: number = 1,
  size: number = 10,
  search?: string,
  is_shared?: boolean,
  created_by?: number
): Promise<ProjectTroublesResponse> => {
  try {
    const response = await troubleService.getProjectTroubles(
      projectId, 
      page, 
      size, 
      search, 
      is_shared, 
      created_by
    );
    return response;
    
  } catch (error) {
    console.error('Failed to get project troubles:', error);
    
    // Return empty list on error
    return {
      items: [],
      page: 1,
      pages: 1,
      size: size,
      total: 0
    };
  }
};

// Delete trouble
export const deleteTrouble = async (troubleId: number): Promise<{ success: boolean; message: string }> => {
  try {
    await troubleService.deleteTrouble(troubleId);
    return {
      success: true,
      message: 'Trouble deleted successfully'
    };
    
  } catch (error) {
    console.error('Failed to delete trouble:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
