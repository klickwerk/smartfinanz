import React, { useState } from 'react';
import { X, Shield, Users, Crown, Eye, Edit, Trash2, Plus, ChevronDown, AlertTriangle } from 'lucide-react';
import { ROLE_DISPLAY_INFO } from '../../constants/permissions';
import { usePermissions } from '../../context/PermissionsContext';
import { UserRole } from '../../types';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentUser, isAdmin, familyMembersData, updateMemberRole } = usePermissions();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [showInviteNotification, setShowInviteNotification] = useState(false);
  
  // Role change confirmation states
  const [showRoleChangeConfirmation, setShowRoleChangeConfirmation] = useState(false);
  const [memberToConfirmRoleChange, setMemberToConfirmRoleChange] = useState<string | null>(null);
  const [newRoleToConfirm, setNewRoleToConfirm] = useState<UserRole | null>(null);

  if (!isOpen) return null;

  // Filter out system entries (overall, house)
  const familyMembers = familyMembersData.filter(member => 
    member.id !== 'overall' && member.id !== 'house'
  );

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4" />;
      case 'member':
        return <Users className="w-4 h-4" />;
      case 'viewer':
        return <Eye className="w-4 h-4" />;
    }
  };

  const getPermissionsList = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return [
          'Alle Transaktionen erstellen, bearbeiten und löschen',
          'Alle Budgets verwalten',
          'Alle Sparziele verwalten',
          'Familienmitglieder verwalten',
          'App-Einstellungen ändern'
        ];
      case 'member':
        return [
          'Eigene Transaktionen erstellen und bearbeiten',
          'Alle Familienfinanzen einsehen',
          'Zu Sparzielen beitragen',
          'Eigene Budgets verwalten',
          'Persönliche Einstellungen ändern'
        ];
      case 'viewer':
        return [
          'Alle Familienfinanzen einsehen',
          'Berichte und Übersichten anzeigen',
          'Keine Änderungen möglich'
        ];
    }
  };

  const handleRoleChange = (memberId: string, newRole: UserRole) => {
    // Instead of directly updating, show confirmation dialog
    setMemberToConfirmRoleChange(memberId);
    setNewRoleToConfirm(newRole);
    setShowRoleChangeConfirmation(true);
  };

  const confirmRoleChange = () => {
    if (memberToConfirmRoleChange && newRoleToConfirm) {
      updateMemberRole(memberToConfirmRoleChange, newRoleToConfirm);
      setEditingRole(null);
    }
    // Reset confirmation state
    setShowRoleChangeConfirmation(false);
    setMemberToConfirmRoleChange(null);
    setNewRoleToConfirm(null);
  };

  const cancelRoleChange = () => {
    // Reset confirmation state without making changes
    setShowRoleChangeConfirmation(false);
    setMemberToConfirmRoleChange(null);
    setNewRoleToConfirm(null);
  };

  const handleInviteMember = () => {
    setShowInviteNotification(true);
    setTimeout(() => {
      setShowInviteNotification(false);
    }, 3000);
  };

  // Get member and role info for confirmation dialog
  const memberToConfirm = memberToConfirmRoleChange ? familyMembersData.find(m => m.id === memberToConfirmRoleChange) : null;
  const newRoleInfo = newRoleToConfirm ? ROLE_DISPLAY_INFO[newRoleToConfirm] : null;
  const currentRoleInfo = memberToConfirm ? ROLE_DISPLAY_INFO[memberToConfirm.userRole] : null;

  const MemberCard: React.FC<{ member: typeof familyMembers[0] }> = ({ member }) => {
    const roleInfo = ROLE_DISPLAY_INFO[member.userRole];
    const isEditingThisMember = editingRole === member.id;
    const canEditThisMember = isAdmin && member.id !== currentUser.id;
    
    return (
      <div 
        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
          selectedMember === member.id
            ? 'bg-turquoise-500/20 border-turquoise-500/30'
            : 'bg-white/5 border-white/10 hover:bg-white/10'
        }`}
        onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${member.color} rounded-xl flex items-center justify-center text-white text-sm font-bold`}>
              {member.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold">{member.name}</p>
                {member.id === currentUser.id && (
                  <span className="bg-turquoise-500/20 text-turquoise-400 px-2 py-0.5 rounded-full text-xs font-medium">
                    Du
                  </span>
                )}
              </div>
              <p className="text-white/60 text-sm">{member.role}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${roleInfo.badge}`}>
              {getRoleIcon(member.userRole)}
              <span className="text-xs font-medium">{roleInfo.name}</span>
            </div>
          </div>
        </div>
        
        {selectedMember === member.id && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="mb-3">
              <h4 className="text-white font-medium text-sm mb-2">Berechtigungen:</h4>
              <ul className="space-y-1">
                {getPermissionsList(member.userRole).map((permission, index) => (
                  <li key={index} className="text-white/70 text-xs flex items-start gap-2">
                    <span className="text-turquoise-400 mt-1">•</span>
                    <span>{permission}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {canEditThisMember && (
              <div className="space-y-3">
                {/* Role Change Section */}
                <div>
                  {!isEditingThisMember ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingRole(member.id);
                      }}
                      className="flex items-center gap-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                      Rolle ändern
                    </button>
                  ) : (
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white text-xs font-medium mb-2">Neue Rolle auswählen:</p>
                      <div className="space-y-2">
                        {Object.entries(ROLE_DISPLAY_INFO).map(([role, info]) => (
                          <button
                            key={role}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRoleChange(member.id, role as UserRole);
                            }}
                            className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${
                              member.userRole === role
                                ? 'bg-turquoise-500/20 text-turquoise-400'
                                : 'bg-white/5 hover:bg-white/10 text-white/80'
                            }`}
                          >
                            {getRoleIcon(role as UserRole)}
                            <span>{info.name}</span>
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingRole(null);
                          }}
                          className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs py-1.5 rounded-lg transition-colors"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Remove Member Button (only for non-admins) */}
                {member.userRole !== 'admin' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('Mitglied entfernen ist noch nicht implementiert.');
                    }}
                    className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Entfernen
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-turquoise-500/10 rounded-xl">
              <Shield className="w-6 h-6 text-turquoise-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Berechtigungen verwalten</h2>
              <p className="text-white/60 text-sm">Rollen und Zugriffsrechte für Familienmitglieder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        {/* Invite Notification */}
        {showInviteNotification && (
          <div className="mx-6 mt-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <Plus className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-blue-400 font-medium text-sm">Mitglied einladen</p>
                <p className="text-blue-300/80 text-xs">
                  Diese Funktion ist derzeit noch nicht verfügbar. Sie wird in einem zukünftigen Update hinzugefügt.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Role Overview */}
          <div className="mb-6">
            <h3 className="text-white font-semibold text-lg mb-4">Rollen-Übersicht</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(ROLE_DISPLAY_INFO).map(([role, info]) => (
                <div key={role} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    {getRoleIcon(role as UserRole)}
                    <h4 className={`font-semibold ${info.color}`}>{info.name}</h4>
                  </div>
                  <p className="text-white/60 text-sm">{info.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Family Members */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Familienmitglieder</h3>
              {isAdmin && (
                <button 
                  onClick={handleInviteMember}
                  className="flex items-center gap-2 bg-turquoise-500/20 hover:bg-turquoise-500/30 text-turquoise-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Mitglied einladen
                </button>
              )}
            </div>
            <div className="space-y-3">
              {familyMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>

          {/* Permission Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-blue-400 font-medium mb-1">Sicherheitshinweis</h4>
                <p className="text-blue-300/80 text-sm">
                  Nur Administratoren können Rollen ändern und neue Mitglieder einladen. 
                  Mitglieder können nur ihre eigenen Daten bearbeiten, während Betrachter nur lesenden Zugriff haben.
                  Du kannst deine eigene Administrator-Rolle nicht ändern.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex-shrink-0">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white font-semibold py-3 px-6 rounded-xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200 active:scale-[0.98]"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>

      {/* Role Change Confirmation Dialog */}
      {showRoleChangeConfirmation && memberToConfirm && newRoleInfo && currentRoleInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-yellow-500/10 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Rolle ändern bestätigen</h3>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-white/80 mb-4">
                Möchtest du die Rolle von <span className="font-semibold text-white">{memberToConfirm.name}</span> wirklich ändern?
              </p>
              
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Aktuelle Rolle:</span>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${currentRoleInfo.badge}`}>
                    {getRoleIcon(memberToConfirm.userRole)}
                    <span className="text-xs font-medium">{currentRoleInfo.name}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="text-white/40">↓</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Neue Rolle:</span>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${newRoleInfo.badge}`}>
                    {getRoleIcon(newRoleToConfirm)}
                    <span className="text-xs font-medium">{newRoleInfo.name}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <p className="text-yellow-400/80 text-xs">
                  <strong>Hinweis:</strong> Diese Änderung wirkt sich sofort auf die Zugriffsrechte von {memberToConfirm.name} aus.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelRoleChange}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-all duration-200"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmRoleChange}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-400 text-white font-semibold py-3 rounded-xl hover:from-yellow-600 hover:to-yellow-500 transition-all duration-200 active:scale-[0.98]"
              >
                Ja, ändern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};