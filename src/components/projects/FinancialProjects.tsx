import React from 'react';
import { Plus, Trophy, TrendingUp } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { GlassCard } from '../common/GlassCard';
import { mockProjects } from '../../data/mockData';

export const FinancialProjects: React.FC = () => {
  const totalSaved = mockProjects.reduce((sum, project) => sum + project.currentAmount, 0);
  const totalTarget = mockProjects.reduce((sum, project) => sum + project.targetAmount, 0);
  const overallProgress = (totalSaved / totalTarget) * 100;

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

      {/* Overview Card */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-xl">
              <Trophy className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Gesamtübersicht</h3>
              <p className="text-white/60 text-sm">{mockProjects.length} aktive Projekte</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-purple-400 font-bold text-xl">€{totalSaved.toLocaleString('de-AT')}</p>
            <p className="text-white/60 text-sm">von €{totalTarget.toLocaleString('de-AT')}</p>
          </div>
        </div>

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

        <div className="flex items-center gap-2 text-sm text-green-400">
          <TrendingUp className="w-4 h-4" />
          <span>+12% diese Woche</span>
        </div>
      </GlassCard>

      {/* Project Cards */}
      <div className="space-y-4">
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Achievement Card */}
      <GlassCard className="border-yellow-500/20 bg-yellow-500/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-500/10 rounded-xl">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold">Erfolg freigeschaltet!</h3>
            <p className="text-white/60 text-sm">Du hast dein erstes Sparziel zu 50% erreicht</p>
          </div>
          <div className="text-yellow-400 text-2xl">🏆</div>
        </div>
      </GlassCard>
    </div>
  );
};