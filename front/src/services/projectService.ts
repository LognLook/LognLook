import { apiClient } from './api';

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

export interface ProjectMember {
  id: number;
  name: string;
  role: 'master' | 'member';
}

export interface ChangeUserRoleRequest {
  user_id: number;
  new_role: 'master' | 'member';
}

// Removed unused ProjectLogFilter types and endpoints

class ProjectService {
  async getProjects(): Promise<Project[]> {
    const projects = await apiClient.get<Project[]>('/projects');
    
    // 각 프로젝트에 역할 정보 추가
    return projects.map(project => ({
      ...project,
      inviteCode: (project as CreateProjectResponse).invite_code || project.inviteCode,
      role: (project as CreateProjectResponse & { role?: string }).role || 'member'
    }));
  }
  
  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    const response = await apiClient.post<CreateProjectResponse>('/projects', projectData);
    
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
    const response = await apiClient.post<JoinProjectResponse>('/projects/invite', {
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
    return apiClient.delete(`/projects/${projectId}`);
  }
  
  async leaveProject(projectId: number): Promise<void> {
    return apiClient.post(`/projects/${projectId}/leave`);
  }
  
  async getProjectInviteCode(projectId: number): Promise<{ invite_code: string }> {
    return apiClient.get(`/projects/${projectId}/invite-code`);
  }
  
  async updateProjectSettings(projectId: number, settings: UpdateProjectSettingsRequest): Promise<void> {
    return apiClient.put(`/projects/${projectId}/settings`, settings);
  }
  
  async getProjectKeywords(projectId: number): Promise<string[]> {
    const response = await apiClient.get<ProjectKeywordResponse>(`/projects/${projectId}/keywords`);
    return response.keywords;
  }
  
  async updateProjectKeywords(projectId: number, keywords: string[]): Promise<string[]> {
    const response = await apiClient.patch<ProjectKeywordResponse>(`/projects/${projectId}/keywords`, {
      keywords
    });
    return response.keywords;
  }
  
  async getProjectMembers(projectId: number): Promise<ProjectMember[]> {
    return apiClient.get<ProjectMember[]>(`/projects/${projectId}/members`);
  }
  
  async changeUserRole(projectId: number, request: ChangeUserRoleRequest): Promise<string> {
    return apiClient.patch<string>(`/projects/${projectId}/role`, request);
  }
  
  async regenerateApiKey(projectId: number): Promise<{ api_key: string }> {
    return apiClient.post(`/projects/${projectId}/regenerate-api-key`);
  }
}

export const projectService = new ProjectService();