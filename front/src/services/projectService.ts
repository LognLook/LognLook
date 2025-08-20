import { apiClient } from './api';
import { ProjectKeyword, ProjectLogFilter } from '../types/project';

export interface Project {
  id: number;
  name: string;
  description: string;
  api_key: string;
  index: string;  // Elasticsearch 인덱스명
  role?: string;  // 클라이언트에서 추가로 설정
  inviteCode?: string;
  createdAt?: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
}

export interface CreateProjectResponse {
  id: number;
  name: string;
  description: string;
  api_key: string;
  index: string;
  invite_code: string;
  create_by: number;
  create_at: string;
}

export interface JoinProjectRequest {
  inviteCode: string;
}

export interface JoinProjectResponse {
  message: string;
  project_id: number;
  project_name: string;
}

export interface UpdateProjectSettingsRequest {
  name?: string;
  description?: string;
  keywords?: string[];
  logLevels?: string[];
  excludedPaths?: string[];
  includedPaths?: string[];
}

export interface ProjectKeywordResponse {
  keywords: string[];
}

export interface ProjectLogFilterResponse {
  id: number;
  name: string;
  type: 'include' | 'exclude';
  pattern: string;
  is_active: boolean;
  description?: string;
  created_at: string;
}

class ProjectService {
  async getProjects(): Promise<Project[]> {
    const projects = await apiClient.get<Project[]>('/project');
    
    // 각 프로젝트에 역할 정보 추가
    return projects.map(project => ({
      ...project,
      inviteCode: (project as any).invite_code || project.inviteCode,
      role: (project as any).role || 'member'
    }));
  }
  
  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    const response = await apiClient.post<CreateProjectResponse>('/project', projectData);
    
    // 응답을 Project 인터페이스에 맞게 변환
    return {
      id: response.id,
      name: response.name,
      description: response.description,
      api_key: response.api_key,
      index: response.index,
      inviteCode: response.invite_code,
      createdAt: response.create_at
    };
  }
  
  async joinProject(joinData: JoinProjectRequest): Promise<Project> {
    const response = await apiClient.post<JoinProjectResponse>('/project/invite', {
      invite_code: joinData.inviteCode
    });
    
    // 참가 성공 후 프로젝트 정보를 가져와서 반환
    const projects = await this.getProjects();
    const joinedProject = projects.find(p => p.id === response.project_id);
    
    if (!joinedProject) {
      throw new Error('Failed to get joined project information');
    }
    
    return joinedProject;
  }
  
  async deleteProject(projectId: number): Promise<void> {
    return apiClient.delete(`/project/${projectId}`);
  }
  
  async leaveProject(projectId: number): Promise<void> {
    return apiClient.post(`/project/${projectId}/leave`);
  }
  
  async getProjectInviteCode(projectId: number): Promise<{ invite_code: string }> {
    return apiClient.get(`/project/${projectId}/invite-code`);
  }
  
  async updateProjectSettings(projectId: number, settings: UpdateProjectSettingsRequest): Promise<void> {
    return apiClient.put(`/project/${projectId}/settings`, settings);
  }
  
  async getProjectKeywords(projectId: number): Promise<string[]> {
    const response = await apiClient.get<ProjectKeywordResponse>(`/project/${projectId}/keyword`);
    return response.keywords;
  }
  
  async updateProjectKeywords(projectId: number, keywords: string[]): Promise<string[]> {
    const response = await apiClient.patch<ProjectKeywordResponse>(`/project/${projectId}/keywords`, {
      keywords
    });
    return response.keywords;
  }
  
  async getProjectLogFilters(projectId: number): Promise<ProjectLogFilter[]> {
    const response = await apiClient.get<ProjectLogFilterResponse[]>(`/project/${projectId}/filters`);
    return response.map(filter => ({
      id: filter.id,
      name: filter.name,
      type: filter.type,
      pattern: filter.pattern,
      isActive: filter.is_active,
      description: filter.description,
      createdAt: filter.created_at
    }));
  }
  
  async addProjectLogFilter(projectId: number, filter: Omit<ProjectLogFilter, 'id' | 'createdAt'>): Promise<ProjectLogFilter> {
    const response = await apiClient.post<ProjectLogFilterResponse>(`/project/${projectId}/filters`, {
      name: filter.name,
      type: filter.type,
      pattern: filter.pattern,
      is_active: filter.isActive,
      description: filter.description
    });
    return {
      id: response.id,
      name: response.name,
      type: response.type,
      pattern: response.pattern,
      isActive: response.is_active,
      description: response.description,
      createdAt: response.created_at
    };
  }
  
  async updateProjectLogFilter(projectId: number, filterId: number, updates: Partial<ProjectLogFilter>): Promise<ProjectLogFilter> {
    const response = await apiClient.put<ProjectLogFilterResponse>(`/project/${projectId}/filters/${filterId}`, updates);
    return {
      id: response.id,
      name: response.name,
      type: response.type,
      pattern: response.pattern,
      isActive: response.is_active,
      description: response.description,
      createdAt: response.created_at
    };
  }
  
  async deleteProjectLogFilter(projectId: number, filterId: number): Promise<void> {
    return apiClient.delete(`/project/${projectId}/filters/${filterId}`);
  }
  
  async regenerateApiKey(projectId: number): Promise<{ api_key: string }> {
    return apiClient.post(`/project/${projectId}/regenerate-api-key`);
  }
}

export const projectService = new ProjectService();