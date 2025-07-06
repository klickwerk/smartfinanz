import { useState, useEffect } from 'react';
import { FinancialProject } from '../types';
import { projectService } from '../services/ProjectService';
import { useAuth } from '../context/AuthContext';

export const useProjects = () => {
  const { user } = useAuth();
  
  // Local state to trigger re-renders when service state changes
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Force component re-render when service state changes
  const triggerUpdate = () => setUpdateTrigger(prev => prev + 1);

  // Fetch projects when user changes
  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!user?.id) {
        // Clear projects if no user
        projectService.setProjects([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        await projectService.fetchProjects(user.id);
        triggerUpdate();
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProjects();
  }, [user?.id]);

  // Get current state from service
  const projects = projectService.getProjects();

  const handleAddProject = async (newProject: Omit<FinancialProject, 'id'>) => {
    if (!user?.id) return;
    
    const result = await projectService.addProject(newProject, user.id);
    if (result) {
      triggerUpdate();
    }
  };

  const handleEditProject = async (projectId: string, updatedProject: Omit<FinancialProject, 'id'>) => {
    if (!user?.id) return;
    
    const success = await projectService.updateProject(projectId, updatedProject, user.id);
    if (success) {
      triggerUpdate();
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!user?.id) return;
    
    const success = await projectService.deleteProject(projectId, user.id);
    if (success) {
      triggerUpdate();
    }
  };

  const handleTransferToProject = async (projectId: string, amount: number, contributorId: string) => {
    if (!user?.id) return;
    
    const success = await projectService.transferToProject(projectId, amount, contributorId, user.id);
    if (success) {
      triggerUpdate();
    }
  };

  const handleChangeProjectStatus = async (projectId: string, newStatus: 'active' | 'paused' | 'completed') => {
    if (!user?.id) return;
    
    const success = await projectService.changeProjectStatus(projectId, newStatus, user.id);
    if (success) {
      triggerUpdate();
    }
  };

  return {
    projects,
    isLoading,
    handleAddProject,
    handleEditProject,
    handleDeleteProject,
    handleTransferToProject,
    handleChangeProjectStatus
  };
};