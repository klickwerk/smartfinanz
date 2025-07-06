import React from 'react';
import { Users, Calendar, Target } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { FinancialProject } from '../../types';

interface ProjectCardProps {
  project: FinancialProject;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const progress = (project.currentAmount / project.targetAmount) * 100;
  const daysLeft = Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <GlassCard>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg mb-1">{project.title}</h3>
          <p className="text-white/60 text-sm mb-3">{project.description}</p>
          <span className="inline-block bg-turquoise-500/20 text-turquoise-400 px-3 py-1 rounded-full text-xs font-medium">
            {project.category}
          </span>
        </div>
        <div className="text-right">
          <p className="text-white font-bold text-lg">€{project.currentAmount.toLocaleString('de-AT')}</p>
          <p className="text-white/60 text-sm">von €{project.targetAmount.toLocaleString('de-AT')}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/60">Fortschritt</span>
          <span className="text-turquoise-400 font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-turquoise-500 to-turquoise-400 h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white/60" />
            <span className="text-white/60">{project.participants.length} Teilnehmer</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white/60" />
            <span className="text-white/60">{daysLeft > 0 ? `${daysLeft} Tage` : 'Überfällig'}</span>
          </div>
        </div>
        <div className="flex -space-x-2">
          {project.participants.slice(0, 3).map((participant) => (
            <div
              key={participant.id}
              className="w-8 h-8 bg-gradient-to-br from-turquoise-500 to-turquoise-400 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-zinc-900"
            >
              {participant.avatar}
            </div>
          ))}
          {project.participants.length > 3 && (
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-zinc-900">
              +{project.participants.length - 3}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm">
          <Target className="w-4 h-4 text-purple-400" />
          <span className="text-white/60">Nächster Meilenstein:</span>
          <span className="text-purple-400 font-medium">
            €{((project.targetAmount - project.currentAmount) / 2 + project.currentAmount).toLocaleString('de-AT')}
          </span>
        </div>
      </div>
    </GlassCard>
  );
};