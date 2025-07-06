import React, { useState, useMemo } from 'react';
import { Plus, Trophy, TrendingUp, PiggyBank, Target, Archive, Filter } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { ProjectForm } from './ProjectForm';
import { TransferToProjectModal } from './TransferToProjectModal';
import { GlassCard } from '../common/GlassCard';
import { FinancialProject } from '../../types';
import { formatCurrency } from '../../utils/formatUtils';
import { FamilyMemberSelector } from '../common/FamilyMemberSelector';

// Neue Imports für dynamische Daten
import { useAuth } from '../../context/AuthContext';
import { useFamilyMemberships } from '../../hooks/useFamilyMemberships'; // Dein neuer Hook

interface FinancialProjectsProps {
  projects: FinancialProject[];
  onAddProject: (project: Omit<FinancialProject, 'id'>) => void;
  onEditProject: (projectId: string, project: Omit<FinancialProject, 'id'>) => void;
  onDeleteProject: (projectId: string) => void;
  onTransferToProject: (projectId: string, amount: number, contributorId: string) => void;
  selectedMemberId: string;
  onMemberChange: (memberId: string) => void;
}

type ProjectFilter = 'active' | 'completed' | 'all';

export const FinancialProjects: React.FC<FinancialProjectsProps> = ({
  projects,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onTransferToProject,
  selectedMemberId,
  onMemberChange
}) => {
  const { user } = useAuth(); // Aktueller Benutzer aus dem AuthContext
  const { familyMemberships, families } = useFamilyMemberships(); // Dynamische Familien- und Mitgliedsdaten

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<FinancialProject | undefined>();
  const [filterStatus, setFilterStatus] = useState<ProjectFilter>('active');

  // Erstelle eine Liste der verfügbaren Mitglieder für den Selector
  const availableMembers = useMemo(() => {
    const dynamicMembers = familyMemberships.map(fm => ({
      id: fm.user_id,
      name: fm.profile?.full_name || 'Unbekannt',
      avatar: '👤', // Platzhalter, falls kein Avatar in Profilen
      color: 'from-gray-500 to-gray-400', // Platzhalter Farbe
      role: fm.role,
      userRole: fm.role // Oder eine Mapping-Funktion
    }));

    // Füge 'overall' und 'house' (falls in DB vorhanden) hinzu
    const specialMembers = [];

    // 'Gesamt' Ansicht
    specialMembers.push({
      id: 'overall',
      name: 'Gesamt',
      avatar: '👨‍👩‍👧‍👦',
      color: 'from-turquoise-500 to-turquoise-400',
      role: 'Gesamtansicht',
      userRole: 'admin'
    });

    // 'Haushalt' Ansicht - nur wenn es eine entsprechende Familie in der DB gibt
    const householdFamily = families.find(f => f.name === 'Haushalt');
    if (householdFamily) {
      specialMembers.push({
        id: householdFamily.id, // WICHTIG: Die tatsächliche ID der "Haushalt"-Familie aus der DB
        name: 'Haushalt',
        avatar: '🏠',
        color: 'from-orange-500 to-orange-400',
        role: 'Unser Haushalt',
        userRole: 'admin'
      });
    }

    return [...specialMembers, ...dynamicMembers];
  }, [familyMemberships, families]);

  // Filter projects based on selected family member/family
  const memberFilteredProjects = useMemo(() => {
    if (selectedMemberId === 'overall') {
      return projects;
    }

    // Finde das ausgewählte Mitglied/die ausgewählte Familie in den dynamischen Daten
    const memberOrFamily = availableMembers.find(member => member.id === selectedMemberId);

    if (!memberOrFamily) return projects; // Fallback, sollte nicht passieren

    // Wenn es sich um die "Haushalt"-Familie handelt (anhand ihrer DB-ID)
    if (memberOrFamily.id === families.find(f => f.name === 'Haushalt')?.id) {
      // Annahme: Projekte haben eine familyId Spalte
      return projects.filter(project => project.familyId === memberOrFamily.id);
    }

    // Für individuelle Familienmitglieder (user_id): Projekte filtern, an denen sie teilnehmen
    // Annahme: project.participants enthält Objekte mit user_id
    return projects.filter(project => 
      project.participants.some(participant => 
        participant.user_id === selectedMemberId // Annahme: participant.user_id ist die user_id
      )
    );
  }, [projects, selectedMemberId, availableMembers, families]);

  // Filter projects based on status
  const filteredProjects = memberFilteredProjects.filter(project => {
    if (filterStatus === 'all') return true;
    return project.status === filterStatus;
  });

  const totalSaved = filteredProjects.reduce((sum, project) => sum + project.currentAmount, 0);
  const totalTarget = filteredProjects.reduce((sum, project) => sum + project.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  // Get current selected member (dynamisch)
  const selectedMember = availableMembers.find(member => member.id === selectedMemberId) || availableMembers[0];
  
  // Generate subtitle based on selected member (dynamisch)
  const getSubtitle = () => {
    const householdFamily = families.find(f => f.name === 'Haushalt'); // Finde die Haushalt-Familie dynamisch
    switch (selectedMemberId) {
      case 'overall':
        return 'Alle Familien-Sparziele verwalten';
      case householdFamily?.id: // Prüfe gegen die tatsächliche ID der Haushalt-Familie
        return 'Gemeinsame Haushalts-Sparziele';
      case user?.id: // Wenn der aktuell angemeldete Benutzer ausgewählt ist
        return 'Deine persönlichen Sparziele';
      default:
        // Für andere Familienmitglieder
        const member = availableMembers.find(m => m.id === selectedMemberId);
        if (member && member.name) {
          const possessiveName = member.name.endsWith('s') ? `${member.name}'` : `${member.name}s`;
          return `${possessiveName} Sparziele`;
        }
        return 'Sparziele verwalten';
    }
  };

  const handleAddProject = (newProject: Omit<FinancialProject, 'id'>) => {
    if (editingProject) {
      // Update existing project
      onEditProject(editingProject.id, newProject);
      setEditingProject(undefined);
    } else {
      // Add new project
      onAddProject(newProject);
    }
  };

  const handleEditProject = (project: FinancialProject) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleTransfer = (projectId: string, amount: number) => {
    onTransferToProject(projectId, amount, selectedMemberId); // selectedMemberId ist jetzt die user_id
    setIsTransferModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsProjectModalOpen(false);
    setEditingProject(undefined);
  };

  const getFilterButtonClass = (filter: ProjectFilter) => {
    return `px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
      filterStatus === filter
        ? 'bg-turquoise-500/20 text-turquoise-400'
        : 'bg-white/5 text-white/60 hover:text-white/80 hover:bg-white/10'
    }`;
  };

  const getEmptyStateMessage = () => {
    const householdFamily = families.find(f => f.name === 'Haushalt');
    const memberContext = selectedMemberId === 'overall' ? '' : 
                          selectedMemberId === householdFamily?.id ? ' für den Haushalt' :
                          selectedMemberId === user?.id ? ' für dich' :
                          ` für ${selectedMember.name}`;

    switch (filterStatus) {
      case 'active':
        return {
          title: `Keine aktiven Sparziele${memberContext}`,
          description: selectedMemberId === 'overall' 
            ? 'Erstelle das erste aktive Sparziel und beginn zu sparen!'
            : `Erstelle das erste aktive Sparziel${memberContext} und beginn zu sparen!`,
          buttonText: 'Erstes Sparziel erstellen'
        };
      case 'completed':
        return {
          title: `Keine abgeschlossenen Sparziele${memberContext}`,
          description: 'Hier siehst du alle erreichten Sparziele. Mach weiter so! 🎯',
          buttonText: 'Neues Sparziel erstellen'
        };
      case 'all':
        return {
          title: `Noch keine Sparziele${memberContext}`,
          description: selectedMemberId === 'overall'
            ? 'Erstelle das erste Sparziel und beginn zu sparen!'
            : `Erstelle das erste Sparziel${memberContext} und beginn zu sparen!`,
          buttonText: 'Erstes Sparziel erstellen'
        };
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${selectedMember.color} rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
            {selectedMember.avatar}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">Finanzprojekte</h1>
            <p className="text-white/70 text-lg">
              {getSubtitle()}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsProjectModalOpen(true)}
          className="bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white p-4 rounded-2xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200 active:scale-95 shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Family Member Selector */}
      <FamilyMemberSelector 
        selectedMemberId={selectedMemberId}
        onMemberChange={onMemberChange}
        // Übergabe der dynamischen Mitglieder an den Selector
        members={availableMembers.map(member => ({
          id: member.id,
          name: member.name,
          avatar: member.avatar,
          color: member.color
        }))}
      />

      {/* Achievement Card - Moved to top and made more compact */}
      <GlassCard className="border-yellow-500/20 bg-yellow-500/5 mb-6">
        <div className="flex items-center gap-4 p-2">
          <div className="p-2 bg-yellow-500/10 rounded-2xl">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-base">Erfolg freigeschaltet!</h3>
            <p className="text-white/60 text-xs">Du hast dein erstes Sparziel zu 50% erreicht</p>
          </div>
          <div className="text-yellow-400 text-2xl">🏆</div>
        </div>
      </GlassCard>

      {/* Filter Navigation */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-turquoise-400" />
              <span className="text-white font-medium">Anzeigen:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('active')}
                className={getFilterButtonClass('active')}
              >
                Aktive Ziele ({memberFilteredProjects.filter(p => p.status === 'active').length})
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={getFilterButtonClass('completed')}
              >
                <Archive className="w-4 h-4 inline mr-1" />
                Abgeschlossen ({memberFilteredProjects.filter(p => p.status === 'completed').length})
              </button>
              <button
                onClick={() => setFilterStatus('all')}
                className={getFilterButtonClass('all')}
              >
                Alle ({memberFilteredProjects.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Bar */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">Schnell hinzufügen:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              + Reisen
            </button>
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              + Wohnen
            </button>
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              + Investitionen
            </button>
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              + Notgroschen
            </button>
          </div>
        </div>
      </div>

      {/* Overview Card */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl">
              <Trophy className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-xl">
                {filterStatus === 'active' ? 'Aktive Sparziele' : 
                 filterStatus === 'completed' ? 'Abgeschlossene Sparziele' : 
                 'Alle Sparziele'}
              </h3>
              <p className="text-white/60 text-sm">{filteredProjects.length} Projekte</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-purple-400 font-bold text-2xl">{formatCurrency(totalSaved)}</p>
            <p className="text-white/60 text-sm">von {formatCurrency(totalTarget)}</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Gesamtfortschritt</span>
            <span className="text-purple-400 font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-purple-400 h-3 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-green-400">
          <TrendingUp className="w-4 h-4" />
          <span>+12% diese Woche</span>
        </div>
      </GlassCard>

      {/* Transfer to Project Button - Only show for active projects */}
      {filteredProjects.length > 0 && filterStatus !== 'completed' && (
        <div className="bg-gradient-to-r from-purple-500/10 to-purple-400/10 border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-2xl">
                <PiggyBank className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Überschuss zu Sparziel hinzufügen</h3>
                <p className="text-white/60 text-sm">Hast du Geld übrig? Stecke es in deine Sparziele! 🎯</p>
              </div>
            </div>
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-purple-400 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-purple-500 transition-all duration-200 active:scale-95 font-semibold"
            >
              Geld übertragen
            </button>
          </div>
        </div>
      )}

      {/* Project Cards Grid */}
      {filteredProjects.length === 0 ? (
        <GlassCard className="text-center py-12">
          <div className="p-4 bg-white/5 rounded-2xl w-fit mx-auto mb-4">
            {filterStatus === 'completed' ? (
              <Archive className="w-12 h-12 text-white/40" />
            ) : (
              <Trophy className="w-12 h-12 text-white/40" />
            )}
          </div>
          <h3 className="text-white font-semibold text-xl mb-2">{getEmptyStateMessage().title}</h3>
          <p className="text-white/60 mb-6">{getEmptyStateMessage().description}</p>
          <button 
            onClick={() => setIsProjectModalOpen(true)}
            className="bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white px-6 py-3 rounded-xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200 active:scale-95"
          >
            {getEmptyStateMessage().buttonText}
          </button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onEdit={handleEditProject}
            />
          ))}
        </div>
      )}

      {/* Project Form Modal */}
      {isProjectModalOpen && (
        <ProjectForm
          onClose={handleCloseModal}
          onSubmit={handleAddProject}
          onDelete={onDeleteProject}
          editProject={editingProject}
        />
      )}

      {/* Transfer Modal - Only show active projects */}
      <TransferToProjectModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onTransfer={handleTransfer}
        projects={memberFilteredProjects.filter(p => p.status === 'active')}
        contributorId={selectedMemberId}
      />
    </div>
  );
};
