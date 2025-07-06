import { FinancialProject, ProjectHistoryEntry } from '../types';
import { supabase } from '../lib/supabaseClient';
import { FAMILY_MEMBERS } from '../constants/familyMembers';

/**
 * Service class for managing project-related business logic
 * Encapsulates all project operations and state management with Supabase integration
 */
export class ProjectService {
  private projects: FinancialProject[] = [];

  constructor() {
    // No longer initialize with mock data
  }

  // Getters
  getProjects(): FinancialProject[] {
    return [...this.projects];
  }

  // Supabase data fetching
  async fetchProjects(userId: string): Promise<FinancialProject[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_participants(*),
          project_history(*)
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return [];
      }

      // Transform Supabase data to our FinancialProject type
      const projects: FinancialProject[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        targetAmount: row.target_amount,
        currentAmount: row.current_amount || 0,
        dueDate: row.due_date,
        status: row.status || 'active',
        category: row.category,
        currency: row.currency || 'EUR',
        familyId: row.family_id,
        createdBy: row.created_by,
        participants: (row.project_participants || []).map((p: any) => ({
          id: p.user_id,
          name: p.user_id, // This would need to be resolved from user data
          avatar: p.user_id.substring(0, 2).toUpperCase(),
          contribution: p.contribution || 0
        })),
        history: (row.project_history || []).map((h: any) => ({
          id: h.id,
          date: h.date,
          amount: h.amount,
          contributorId: h.contributor_id,
          contributorName: h.contributor_name,
          type: h.type,
          description: h.description
        }))
      }));

      this.projects = projects;
      return projects;
    } catch (error) {
      console.error('Error in fetchProjects:', error);
      return [];
    }
  }

  // Core project operations with Supabase
  async addProject(newProject: Omit<FinancialProject, 'id'>, userId: string): Promise<FinancialProject | null> {
    try {
      const projectData = {
        title: newProject.title?.trim(),
        description: newProject.description?.trim(),
        target_amount: Number(newProject.targetAmount),
        current_amount: Number(newProject.currentAmount || 0),
        due_date: newProject.dueDate || null,
        status: newProject.status || 'active',
        category: newProject.category?.trim(),
        currency: newProject.currency || 'EUR',
        family_id: newProject.familyId || null,
        created_by: userId
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) {
        console.error('Error adding project:', error);
        return null;
      }

      const project: FinancialProject = {
        id: data.id,
        title: data.title,
        description: data.description,
        targetAmount: data.target_amount,
        currentAmount: data.current_amount || 0,
        dueDate: data.due_date,
        status: data.status,
        category: data.category,
        currency: data.currency,
        familyId: data.family_id,
        createdBy: data.created_by,
        participants: newProject.participants || [],
        history: newProject.history || []
      };

      this.projects = [project, ...this.projects];
      return project;
    } catch (error) {
      console.error('Error in addProject:', error);
      return null;
    }
  }

  async updateProject(projectId: string, updatedProject: Omit<FinancialProject, 'id'>, userId: string): Promise<boolean> {
    try {
      const updateData = {
        title: updatedProject.title?.trim(),
        description: updatedProject.description?.trim(),
        target_amount: Number(updatedProject.targetAmount),
        current_amount: Number(updatedProject.currentAmount || 0),
        due_date: updatedProject.dueDate || null,
        status: updatedProject.status,
        category: updatedProject.category?.trim(),
        currency: updatedProject.currency,
        family_id: updatedProject.familyId || null
      };

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId)
        .eq('created_by', userId); // Ensure user can only update their own projects

      if (error) {
        console.error('Error updating project:', error);
        return false;
      }

      // Update local state
      const index = this.projects.findIndex(p => p.id === projectId);
      if (index !== -1) {
        this.projects[index] = { ...updatedProject, id: projectId };
      }

      return true;
    } catch (error) {
      console.error('Error in updateProject:', error);
      return false;
    }
  }

  async deleteProject(projectId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('created_by', userId); // Ensure user can only delete their own projects

      if (error) {
        console.error('Error deleting project:', error);
        return false;
      }

      // Update local state
      this.projects = this.projects.filter(p => p.id !== projectId);
      return true;
    } catch (error) {
      console.error('Error in deleteProject:', error);
      return false;
    }
  }

  // Project-specific operations
  async transferToProject(projectId: string, amount: number, contributorId: string, userId: string): Promise<boolean> {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return false;

    try {
      // Get contributor name
      const contributor = FAMILY_MEMBERS.find(member => member.id === contributorId);
      const contributorName = contributor?.name || 'Unbekannt';
      
      // Create new history entry
      const historyData = {
        project_id: projectId,
        date: new Date().toISOString().split('T')[0],
        amount,
        contributor_id: contributorId,
        contributor_name: contributorName,
        type: 'deposit',
        description: `Übertragung von ${contributorName}`
      };

      const { error: historyError } = await supabase
        .from('project_history')
        .insert([historyData]);

      if (historyError) {
        console.error('Error adding project history:', historyError);
        return false;
      }

      // Update project current amount
      const newCurrentAmount = project.currentAmount + amount;
      let newStatus = project.status;

      // Check if project is completed
      if (newCurrentAmount >= project.targetAmount && project.status === 'active') {
        newStatus = 'completed';
        
        // Add milestone entry
        const milestoneData = {
          project_id: projectId,
          date: new Date().toISOString().split('T')[0],
          amount: 0,
          contributor_id: contributorId,
          contributor_name: contributorName,
          type: 'milestone',
          description: '🎉 Sparziel erreicht! Herzlichen Glückwunsch!'
        };

        await supabase
          .from('project_history')
          .insert([milestoneData]);
      }

      // Update project
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          current_amount: newCurrentAmount,
          status: newStatus
        })
        .eq('id', projectId)
        .eq('created_by', userId);

      if (updateError) {
        console.error('Error updating project:', updateError);
        return false;
      }

      // Update local state
      const updatedProject = {
        ...project,
        currentAmount: newCurrentAmount,
        status: newStatus,
        history: [...project.history, {
          id: `h_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          amount,
          contributorId,
          contributorName,
          type: 'deposit' as const,
          description: `Übertragung von ${contributorName}`
        }]
      };

      if (newStatus === 'completed' && project.status === 'active') {
        updatedProject.history.push({
          id: `m_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          amount: 0,
          contributorId,
          contributorName,
          type: 'milestone' as const,
          description: '🎉 Sparziel erreicht! Herzlichen Glückwunsch!'
        });
      }

      return this.updateProject(projectId, updatedProject, userId);
    } catch (error) {
      console.error('Error in transferToProject:', error);
      return false;
    }
  }

  // Status management
  async changeProjectStatus(projectId: string, newStatus: 'active' | 'paused' | 'completed', userId: string): Promise<boolean> {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return false;

    try {
      // If completing a project, add a milestone entry
      if (newStatus === 'completed' && project.status !== 'completed') {
        const milestoneData = {
          project_id: projectId,
          date: new Date().toISOString().split('T')[0],
          amount: 0,
          contributor_id: 'system',
          contributor_name: 'System',
          type: 'milestone',
          description: '🎉 Sparziel manuell als abgeschlossen markiert'
        };

        await supabase
          .from('project_history')
          .insert([milestoneData]);
      }

      const updatedProject = {
        ...project,
        status: newStatus
      };

      return await this.updateProject(projectId, updatedProject, userId);
    } catch (error) {
      console.error('Error in changeProjectStatus:', error);
      return false;
    }
  }

  // Bulk operations
  setProjects(projects: FinancialProject[]): void {
    this.projects = [...projects];
  }

  // Reset service state
  reset(): void {
    this.projects = [];
  }
}

// Create and export a singleton instance
export const projectService = new ProjectService();