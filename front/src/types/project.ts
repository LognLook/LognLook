export interface Project {
  id: number;
  name: string;
  description: string;
  api_key: string;
  role?: 'admin' | 'member' | 'viewer';
  inviteCode?: string;
  createdAt?: string;
  updatedAt?: string;
  keywords?: string[];
}

export interface ProjectMember {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export interface ProjectKeyword {
  id: number;
  keyword: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
}

export default Project;