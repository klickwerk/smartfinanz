import React, { useState, useEffect } from 'react';
import { Plus, Trophy, TrendingUp } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { GlassCard } from '../common/GlassCard';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { FinancialProject } from '../../types';

export const FinancialProjects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<FinancialProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_participants (
            id,
            user_id,
            contribution
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading projects:', error);
      } else {
        // Transform database data to match our FinancialProject type
        const transformedProjects: FinancialProject[] = data?.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          targetAmount: p.target_amount,
          currentAmount: p.current_amount,
          dueDate: p.due_date,
          participants: p.project_participants?.map((pp: any) => ({
            id: pp.user_id,
            name: 'User', // TODO: Join with profiles to get real names
            avatar: 'U',
            contribution: pp.contribution
          })) || [],
          status: p.status as 'active' | 'completed' | 'paused',
          category: p.category,
          currency: p.currency as 'EUR' | 'USD' | 'CHF'
        })) || [];
        
        setProjects(transformedProjects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
    setLoading(false);
  };

  const totalSaved = projects.reduce((sum, project) => sum + project.currentAmount, 0);
  const totalTarget = projects.reduce((sum, project) => sum + project.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-6 pb-24">
        <div className="flex items-center justify-center py-12">
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-4 border-turquoise-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Lade Projekte...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Finanzprojekte</h1>
          <p className="text-white/60">Gemeinsam Ziele erreichen</p>
        </div>
        <button className="bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white p-3 rounded-xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200 active:scale-95">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {projects.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">Noch keine Projekte</h3>
            <p className="text-white/60 mb-6">Erstelle dein erstes Finanzprojekt und erreiche deine Ziele!</p>
            <button className="bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white px-6 py-3 rounded-xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200">
              Erstes Projekt erstellen
            </button>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Overview Card */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/10 rounded-xl">
                  <Trophy className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Gesamtübersicht</h3>
                  <p className="text-white/60 text-sm">{projects.length} aktive Projekte</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-purple-400 font-bold text-xl">€{totalSaved.toLocaleString('de-AT')}</p>
                <p className="text-white/60 text-sm">von €{totalTarget.toLocaleString('de-AT')}</p>
              </div>
            </div>

            {totalTarget > 0 && (
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Gesamtfortschritt</span>
                  <span className="text-purple-400 font-medium">{Math.round(overallProgress)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-400 h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(overallProgress, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span>Bereit für neue Ziele!</span>
            </div>
          </GlassCard>

          {/* Project Cards */}
          <div className="space-y-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};