import React, { useState } from 'react';
import { Users, Calendar, Target, Edit, ChevronDown, ChevronUp, PiggyBank, Trophy, Coins } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { FinancialProject } from '../../types';
import { formatDateGerman } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatUtils';

interface ProjectCardProps {
  project: FinancialProject;
  onEdit: (project: FinancialProject) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit }) => {
  const [showHistory, setShowHistory] = useState(false);
  
  const progress = (project.currentAmount / project.targetAmount) * 100;
  const daysLeft = Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const getStatusColor = () => {
    switch (project.status) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      default: return 'text-white';
    }
  };

  const getStatusText = () => {
    switch (project.status) {
      case 'active': return 'Aktiv';
      case 'paused': return 'Pausiert';
      case 'completed': return 'Abgeschlossen';
      default: return project.status;
    }
  };

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Coins className="w-4 h-4 text-green-400" />;
      case 'withdrawal':
        return <Coins className="w-4 h-4 text-red-400" />;
      case 'milestone':
        return <Trophy className="w-4 h-4 text-yellow-400" />;
      default:
        return <PiggyBank className="w-4 h-4 text-turquoise-400" />;
    }
  };

  const getHistoryDescription = (entry: any) => {
    if (entry.type === 'milestone') {
      return entry.description;
    }
    
    const formattedAmount = formatCurrency(entry.amount);
    const action = entry.type === 'deposit' ? 'hat eingezahlt' : 'hat abgehoben';
    
    return `${entry.contributorName} ${action} ${formattedAmount}`;
  };

  // Sort history by date (newest first)
  const sortedHistory = [...project.history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <GlassCard className="hover:bg-white/10 transition-all duration-200 cursor-pointer relative group" onClick={() => onEdit(project)}>
      {/* Edit Button - Top Right Corner */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(project);
        }}
        className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
        title="Sparziel bearbeiten"
      >
        <Edit className="w-4 h-4 text-white/60 hover:text-white" />
      </button>

      <div className="flex items-start justify-between mb-4 pr-12">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold text-lg">{project.title}</h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full bg-white/10 ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          <p className="text-white/60 text-sm mb-3">{project.description}</p>
          <span className="inline-block bg-turquoise-500/20 text-turquoise-400 px-3 py-1 rounded-full text-xs font-medium">
            {project.category}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-left">
          <p className="text-white font-bold text-lg">{formatCurrency(project.currentAmount)}</p>
          <p className="text-white/60 text-sm">von {formatCurrency(project.targetAmount)}</p>
        </div>
        <div className="text-right">
          <p className="text-turquoise-400 font-bold text-xl">{Math.round(progress)}%</p>
          <p className="text-white/60 text-sm">erreicht</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/60">Fortschritt</span>
          <span className="text-turquoise-400 font-medium">
            {formatCurrency(project.targetAmount - project.currentAmount)} fehlen noch
          </span>
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
            <span className={`${daysLeft > 0 ? 'text-white/60' : 'text-red-400'}`}>
              {daysLeft > 0 ? `${daysLeft} Tage` : 'Überfällig'}
            </span>
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
            {formatCurrency((project.targetAmount - project.currentAmount) / 2 + project.currentAmount)}
          </span>
        </div>
      </div>

      {/* History Section */}
      {project.history && project.history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowHistory(!showHistory);
            }}
            className="flex items-center justify-between w-full text-left hover:bg-white/5 p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-turquoise-400" />
              <span className="text-white/80 font-medium text-sm">
                Verlauf ({project.history.length} Einträge)
              </span>
            </div>
            {showHistory ? (
              <ChevronUp className="w-4 h-4 text-white/60" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/60" />
            )}
          </button>

          {showHistory && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {sortedHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getHistoryIcon(entry.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-medium">
                      {getHistoryDescription(entry)}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-white/50 text-xs">
                        {formatDateGerman(entry.date, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {entry.type !== 'milestone' && (
                        <p className={`text-xs font-medium ${
                          entry.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {entry.type === 'deposit' ? '+' : '-'}{formatCurrency(entry.amount)}
                        </p>
                      )}
                    </div>
                    {entry.description && entry.type !== 'milestone' && (
                      <p className="text-white/40 text-xs mt-1 italic">
                        {entry.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Click hint */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <p className="text-turquoise-400/80 text-xs text-center">
          💡 Klicke hier, um das Sparziel zu bearbeiten
        </p>
      </div>
    </GlassCard>
  );
};