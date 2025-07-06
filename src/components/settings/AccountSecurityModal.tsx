import React, { useState } from 'react';
import { X, Shield, Key, Smartphone, Monitor, Clock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface AccountSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSecurityModal: React.FC<AccountSecurityModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Mock data - in real app this would come from API
  const [securityData, setSecurityData] = useState({
    lastPasswordChange: '2024-12-15',
    twoFactorEnabled: true,
    activeSessions: 3,
    lastLogin: '2025-01-20 14:30'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock password change
    alert('Passwort-Änderung ist noch nicht implementiert.');
    setActiveSection(null);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleToggle2FA = () => {
    setSecurityData(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
  };

  const mockActiveSessions = [
    {
      id: '1',
      device: 'MacBook Pro',
      location: 'Wien, Österreich',
      lastActive: '2025-01-20 14:30',
      current: true
    },
    {
      id: '2',
      device: 'iPhone 15',
      location: 'Wien, Österreich',
      lastActive: '2025-01-20 12:15',
      current: false
    },
    {
      id: '3',
      device: 'Chrome Browser',
      location: 'Wien, Österreich',
      lastActive: '2025-01-19 18:45',
      current: false
    }
  ];

  const mockLoginActivity = [
    {
      id: '1',
      date: '2025-01-20 14:30',
      device: 'MacBook Pro',
      location: 'Wien, Österreich',
      success: true
    },
    {
      id: '2',
      date: '2025-01-20 12:15',
      device: 'iPhone 15',
      location: 'Wien, Österreich',
      success: true
    },
    {
      id: '3',
      date: '2025-01-19 18:45',
      device: 'Chrome Browser',
      location: 'Wien, Österreich',
      success: true
    },
    {
      id: '4',
      date: '2025-01-19 09:22',
      device: 'Unknown Device',
      location: 'Berlin, Deutschland',
      success: false
    }
  ];

  const SecuritySection: React.FC<{ 
    id: string; 
    title: string; 
    description: string; 
    status: string; 
    statusColor: string;
    icon: React.ReactNode;
    action: () => void;
  }> = ({ id, title, description, status, statusColor, icon, action }) => (
    <button
      onClick={action}
      className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-lg">
          {icon}
        </div>
        <div className="text-left">
          <p className="text-white font-medium">{title}</p>
          <p className="text-white/60 text-sm">{description}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-sm font-medium ${statusColor}`}>{status}</span>
      </div>
    </button>
  );

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
              <h2 className="text-2xl font-bold text-white">{t('settings.privacy.accountSecurity.title')}</h2>
              <p className="text-white/60 text-sm">{t('settings.privacy.accountSecurity.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!activeSection ? (
            <div className="space-y-6">
              {/* Security Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SecuritySection
                  id="password"
                  title={t('settings.privacy.accountSecurity.changePassword')}
                  description={t('settings.privacy.accountSecurity.lastPasswordChange', { date: securityData.lastPasswordChange })}
                  status={t('settings.values.secure')}
                  statusColor="text-green-400"
                  icon={<Key className="w-5 h-5 text-white/60" />}
                  action={() => setActiveSection('password')}
                />

                <SecuritySection
                  id="2fa"
                  title={t('settings.privacy.accountSecurity.twoFactorAuth')}
                  description={securityData.twoFactorEnabled ? t('settings.privacy.accountSecurity.twoFactorEnabled') : t('settings.privacy.accountSecurity.twoFactorDisabled')}
                  status={securityData.twoFactorEnabled ? t('settings.values.enabled') : 'Deaktiviert'}
                  statusColor={securityData.twoFactorEnabled ? 'text-green-400' : 'text-yellow-400'}
                  icon={<Smartphone className="w-5 h-5 text-white/60" />}
                  action={() => setActiveSection('2fa')}
                />

                <SecuritySection
                  id="sessions"
                  title={t('settings.privacy.accountSecurity.activeSessions')}
                  description={t('settings.privacy.accountSecurity.activeSessions_count', { count: securityData.activeSessions })}
                  status={t('common.view')}
                  statusColor="text-blue-400"
                  icon={<Monitor className="w-5 h-5 text-white/60" />}
                  action={() => setActiveSection('sessions')}
                />

                <SecuritySection
                  id="activity"
                  title={t('settings.privacy.accountSecurity.loginActivity')}
                  description={t('settings.privacy.accountSecurity.lastLogin', { date: securityData.lastLogin })}
                  status={t('common.view')}
                  statusColor="text-blue-400"
                  icon={<Clock className="w-5 h-5 text-white/60" />}
                  action={() => setActiveSection('activity')}
                />
              </div>

              {/* Security Tips */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-blue-400 font-medium mb-1">Sicherheitstipps</h4>
                    <ul className="text-blue-300/80 text-sm space-y-1">
                      <li>• Verwende ein starkes, einzigartiges Passwort</li>
                      <li>• Aktiviere die Zwei-Faktor-Authentifizierung</li>
                      <li>• Überprüfe regelmäßig deine aktiven Sitzungen</li>
                      <li>• Melde dich von unbekannten Geräten ab</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={() => setActiveSection(null)}
                className="flex items-center gap-2 text-turquoise-400 hover:text-turquoise-300 transition-colors"
              >
                <X className="w-4 h-4" />
                Zurück zur Übersicht
              </button>

              {/* Password Change Section */}
              {activeSection === 'password' && (
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-white font-semibold text-lg mb-4">Passwort ändern</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Aktuelles Passwort</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                          placeholder="Aktuelles Passwort eingeben"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Neues Passwort</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                          placeholder="Neues Passwort eingeben"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Passwort bestätigen</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                          placeholder="Neues Passwort bestätigen"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setActiveSection(null)}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-all duration-200"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white font-semibold py-3 rounded-xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200"
                      >
                        Passwort ändern
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 2FA Section */}
              {activeSection === '2fa' && (
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-white font-semibold text-lg mb-4">Zwei-Faktor-Authentifizierung</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <p className="text-white font-medium">2FA Status</p>
                        <p className="text-white/60 text-sm">
                          {securityData.twoFactorEnabled ? 'Aktiviert und konfiguriert' : 'Nicht aktiviert'}
                        </p>
                      </div>
                      <button
                        onClick={handleToggle2FA}
                        className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                          securityData.twoFactorEnabled
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                      >
                        {securityData.twoFactorEnabled ? 'Deaktivieren' : 'Aktivieren'}
                      </button>
                    </div>

                    {securityData.twoFactorEnabled && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <p className="text-green-400 font-medium">2FA ist aktiviert</p>
                        </div>
                        <p className="text-green-300/80 text-sm">
                          Dein Konto ist durch Zwei-Faktor-Authentifizierung geschützt.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Active Sessions Section */}
              {activeSection === 'sessions' && (
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-white font-semibold text-lg mb-4">Aktive Sitzungen</h3>
                  <div className="space-y-3">
                    {mockActiveSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Monitor className="w-5 h-5 text-white/60" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium">{session.device}</p>
                              {session.current && (
                                <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs font-medium">
                                  Aktuell
                                </span>
                              )}
                            </div>
                            <p className="text-white/60 text-sm">{session.location}</p>
                            <p className="text-white/40 text-xs">Zuletzt aktiv: {session.lastActive}</p>
                          </div>
                        </div>
                        {!session.current && (
                          <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                            Abmelden
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Login Activity Section */}
              {activeSection === 'activity' && (
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-white font-semibold text-lg mb-4">Anmeldeaktivität</h3>
                  <div className="space-y-3">
                    {mockLoginActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          {activity.success ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                          )}
                          <div>
                            <p className="text-white font-medium">{activity.device}</p>
                            <p className="text-white/60 text-sm">{activity.location}</p>
                            <p className="text-white/40 text-xs">{activity.date}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.success 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {activity.success ? 'Erfolgreich' : 'Fehlgeschlagen'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex-shrink-0">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white font-semibold py-3 px-6 rounded-xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200 active:scale-[0.98]"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};