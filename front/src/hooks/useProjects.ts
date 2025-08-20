import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { projectService, CreateProjectRequest, JoinProjectRequest } from '../services/projectService';

export const useProjects = () => {
  const queryClient = useQueryClient();
  const { 
    selectedProject, 
    projects, 
    isLoading, 
    setSelectedProject, 
    setProjects, 
    addProject, 
    removeProject 
  } = useProjectStore();

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createProjectMutation = useMutation({
    mutationFn: (projectData: CreateProjectRequest) => projectService.createProject(projectData),
    onSuccess: (newProject) => {
      addProject(newProject);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const joinProjectMutation = useMutation({
    mutationFn: (joinData: JoinProjectRequest) => projectService.joinProject(joinData),
    onSuccess: (joinedProject) => {
      addProject(joinedProject);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: number) => projectService.deleteProject(projectId),
    onSuccess: (_, projectId) => {
      removeProject(projectId);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const leaveProjectMutation = useMutation({
    mutationFn: (projectId: number) => projectService.leaveProject(projectId),
    onSuccess: (_, projectId) => {
      removeProject(projectId);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Sync projects from query to store (useEffect 사용)
  useEffect(() => {
    if (projectsQuery.data && projectsQuery.data !== projects) {
      setProjects(projectsQuery.data);
    }
  }, [projectsQuery.data, projects, setProjects]);

  return {
    projects: projectsQuery.data || projects,
    selectedProject,
    isLoading: projectsQuery.isLoading || isLoading,
    error: projectsQuery.error,
    setSelectedProject,
    createProject: createProjectMutation.mutate,
    joinProject: joinProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    leaveProject: leaveProjectMutation.mutate,
    isCreatingProject: createProjectMutation.isPending,
    isJoiningProject: joinProjectMutation.isPending,
    isDeletingProject: deleteProjectMutation.isPending,
    isLeavingProject: leaveProjectMutation.isPending,
    refetch: projectsQuery.refetch,
  };
};