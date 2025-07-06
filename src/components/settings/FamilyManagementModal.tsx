import React, { useState } from 'react';
import { X, Shield, Users, Crown, Eye, Edit, Trash2, Plus, ChevronDown, AlertOctagon, Mail, UserPlus, CheckCircle, AlertTriangle } from 'lucide-react';
import { ROLE_DISPLAY_INFO } from '../../constants/permissions';
import { usePermissions } from '../../context/PermissionsContext';
import { getInitials } from '../../utils/memberUtils';
import { UserRole } from '../../types';

interface FamilyManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FamilyManagementModal: React.FC<FamilyManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentUser, isAdmin, familyMembersData, updateMemberRole, removeFamilyMember, userFamilyId, inviteFamilyMemberByEmail } = usePermissions();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('member');
  const [showRoleDropdown, setShowRoleDropdown] = useState<string | null>(null);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [memberToConfirmRemoval, setMemberToConfirmRemoval] = useState<any>(null);
  const [inviteStatus, setInviteStatus] = useState<{success?: boolean; message?: string}>({});
  const [isInviting, setIsInviting] = useState(false);

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

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;
    
    setIsInviting(true);
    setInviteStatus({});
    
    try {
      const result = await inviteFamilyMemberByEmail(inviteEmail, selectedRole, inviteName);
      
      if (result.success) {
        setInviteStatus({
          success: true,
          message: 'Einladung erfolgreich gesendet!'
        });
        
        // Reset form after successful invitation
        setTimeout(() => {
          setInviteEmail('');
          setInviteName('');
          setSelectedRole('member');
          setShowInviteForm(false);
          setInviteStatus({});
        }, 2000);
      } else {
        setInviteStatus({
          success: false,
          message: result.error || 'Fehler beim Senden der Einladung.'
        });
      }
    } catch (error) {
      setInviteStatus({
        success: false,
        message: 'Ein unerwarteter Fehler ist aufgetreten.'
      });
      console.error('Error inviting member:', error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    await updateMemberRole(memberId, newRole);
    setShowRoleDropdown(null);
  };

  const handleRemoveMember = (member) => {
    setMemberToConfirmRemoval(member);
    setShowRemoveConfirmation(true);
  };

  const confirmRemoveMember = async () => {
    if (memberToConfirmRemoval) {
      if (userFamilyId) {
        await removeFamilyMember(memberToConfirmRemoval.id, userFamilyId);
        setShowRemoveConfirmation(false);
        setMemberToConfirmRemoval(null);
      }
    }
  };

  const cancelRemoveMember = () => {
    setShowRemoveConfirmation(false);
    setMemberToConfirmRemoval(null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Familienverwaltung</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        {/* Current Members */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Familienmitglieder</h3>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {familyMembers.map((member) => (
              <div key={member.id} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${member.color} rounded-xl flex items-center justify-center text-white text-sm font-bold`}>
                    {member.avatar}
                  </div>
                  <div>
                    <p className="text-white font-medium">{member.name}</p>
                    <div className={`flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-xs font-medium ${ROLE_DISPLAY_INFO[member.userRole].badge}`}>
                      {getRoleIcon(member.userRole)}
                      <span>{ROLE_DISPLAY_INFO[member.userRole].name}</span>
                    </div>
                  </div>
                </div>

                {isAdmin && member.id !== currentUser.id && (
                  <div className="flex items-center gap-2">
                    {/* Role Change Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowRoleDropdown(showRoleDropdown === member.id ? null : member.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-white/60" />
                      </button>

                      {showRoleDropdown === member.id && (
                        <div className="absolute right-0 top-full mt-2 bg-zinc-800 border border-white/10 rounded-xl p-2 min-w-[150px] z-10">
                          {(['member', 'viewer'] as UserRole[]).map((role) => (
                            <button
                              key={role}
                              onClick={() => handleRoleChange(member.id, role)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                member.userRole === role
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'hover:bg-white/10 text-white/80'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {getRoleIcon(role)}
                                <span>{ROLE_DISPLAY_INFO[role].name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Remove Member */}
                    <button
                      onClick={() => handleRemoveMember(member)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                    >
                      <Trash2 className="w-4 h-4 text-white/60 group-hover:text-red-400" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {familyMembers.length === 0 && (
              <div className="bg-white/5 rounded-xl p-8 text-center">
                <Users className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/60">Keine Familienmitglieder gefunden</p>
                <p className="text-white/40 text-sm mt-1">Lade Familienmitglieder ein, um zu beginnen.</p>
              </div>
            )}
          </div>
        </div>

        {/* Invite New Member */}
        {isAdmin && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Neues Mitglied einladen</h3>
              {!showInviteForm && (
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Einladen</span>
                </button>
              )}
            </div>

            {showInviteForm && (
              <div className="bg-white/5 rounded-xl p-4 space-y-4">
                {/* Status Message */}
                {inviteStatus.message && (
                  <div className={`p-3 rounded-xl ${inviteStatus.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                    <div className="flex items-center gap-2">
                      {inviteStatus.success ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      )}
                      <p className={`text-sm ${inviteStatus.success ? 'text-green-400' : 'text-red-400'}`}>
                        {inviteStatus.message}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    E-Mail-Adresse
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="familie@example.com"
                      className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Name (optional)
                  </label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Max Mustermann"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Rolle
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowRoleDropdown(showRoleDropdown === 'invite' ? null : 'invite')}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {getRoleIcon(selectedRole)}
                        <span className="text-white">{ROLE_DISPLAY_INFO[selectedRole].name}</span>
                      </div>
                      <ChevronDown className="w-5 h-5 text-white/40" />
                    </button>

                    {showRoleDropdown === 'invite' && (
                      <div className="absolute top-full mt-2 w-full bg-zinc-800 border border-white/10 rounded-xl p-2 z-10">
                        {(['member', 'viewer'] as UserRole[]).map((role) => (
                          <button
                            key={role}
                            onClick={() => {
                              setSelectedRole(role);
                              setShowRoleDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedRole === role
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'hover:bg-white/10 text-white/80'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {getRoleIcon(role)}
                              <span>{ROLE_DISPLAY_INFO[role].name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowInviteForm(false);
                      setInviteEmail('');
                      setSelectedRole('member');
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-all duration-200"
                  >
                    {isInviting ? 'Wird gesendet...' : 'Abbrechen'}
                  </button>
                  <button
                    onClick={handleInviteMember}
                    disabled={!inviteEmail.trim() || isInviting}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-400 text-white font-semibold py-3 rounded-xl hover:from-blue-600 hover:to-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {isInviting ? 'Wird gesendet...' : 'Einladung senden'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Permissions Info */}
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-white font-medium mb-3">Berechtigungen</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-white/60">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span><strong>Administrator:</strong> Vollzugriff auf alle Funktionen</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Users className="w-4 h-4 text-green-400" />
              <span><strong>Mitglied:</strong> Kann eigene Daten einsehen und bearbeiten</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Eye className="w-4 h-4 text-gray-400" />
              <span><strong>Betrachter:</strong> Kann nur Daten einsehen, keine Änderungen vornehmen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Member Confirmation Dialog */}
      {showRemoveConfirmation && memberToConfirmRemoval && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-500/10 rounded-xl">
                  <AlertOctagon className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Mitglied entfernen</h3>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-white/80 mb-4">
                Möchtest du <span className="font-semibold text-white">{memberToConfirmRemoval.name}</span> wirklich aus der Familie entfernen?
              </p>
              
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${memberToConfirmRemoval.color} rounded-xl flex items-center justify-center text-white text-sm font-bold`}>
                    {memberToConfirmRemoval.avatar}
                  </div>
                  <div>
                    <p className="text-white font-medium">{memberToConfirmRemoval.name}</p>
                    <div className={`flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-xs font-medium ${ROLE_DISPLAY_INFO[memberToConfirmRemoval.userRole].badge}`}>
                      {getRoleIcon(memberToConfirmRemoval.userRole)}
                      <span>{ROLE_DISPLAY_INFO[memberToConfirmRemoval.userRole].name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400/80 text-xs">
                  <strong>Warnung:</strong> Diese Aktion entfernt das Mitglied aus der Familie. Das Mitglied verliert den Zugriff auf alle Familienfinanzen.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelRemoveMember} 
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-all duration-200"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmRemoveMember}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-400 text-white font-semibold py-3 rounded-xl hover:from-red-600 hover:to-red-500 transition-all duration-200 active:scale-[0.98]"
              >
                Ja, entfernen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};