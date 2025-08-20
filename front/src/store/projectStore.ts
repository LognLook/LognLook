import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Project {
  id: number;
  name: string;
  description: string;
  api_key: string;
  role?: string;
  inviteCode?: string;
  createdAt?: string;
}

interface ProjectState {
  selectedProject: Project | null;
  projects: Project[];
  isLoading: boolean;
  setSelectedProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  removeProject: (projectId: number) => void;
  updateProject: (projectId: number, updates: Partial<Project>) => void;
  setLoading: (loading: boolean) => void;
  clearProjects: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      selectedProject: null,
      projects: [],
      isLoading: false,
      
      setSelectedProject: (project: Project | null) => {
        set({ selectedProject: project });
      },
      
      setProjects: (projects: Project[]) => {
        set({ projects });
      },
      
      addProject: (project: Project) => {
        set((state) => ({ 
          projects: [...state.projects, project] 
        }));
      },
      
      removeProject: (projectId: number) => {
        set((state) => ({
          projects: state.projects.filter(p => p.id !== projectId),
          selectedProject: state.selectedProject?.id === projectId 
            ? null 
            : state.selectedProject
        }));
      },
      
      updateProject: (projectId: number, updates: Partial<Project>) => {
        set((state) => ({
          projects: state.projects.map(p => 
            p.id === projectId ? { ...p, ...updates } : p
          ),
          selectedProject: state.selectedProject?.id === projectId
            ? { ...state.selectedProject, ...updates }
            : state.selectedProject
        }));
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      clearProjects: () => {
        set({ 
          projects: [], 
          selectedProject: null 
        });
      },
    }),
    {
      name: 'project-storage',
      partialize: (state) => ({ 
        selectedProject: state.selectedProject,
        projects: state.projects
      }),
    }
  )
);