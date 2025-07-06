import React, { useState } from 'react';
import { X, Smartphone, Bell, Lock, Timer, Fingerprint, Shield } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface AppSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppSecurityModal: React.FC<AppSecurityModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();
  
  // Mock security settings - in real app this would come from API/localStorage
  const [securitySettings, setSecuritySettings] = useState({
    appLockEnabled: true,
    biometricEnabled: false,
    autoLockTime: 5, // minutes
    securityNotifications: true,
    loginAlerts: true,
    suspiciousActivityAlerts: true
  });

  if (!isOpen) return null;

  const handleToggleSetting = (setting: keyof typeof securitySettings) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleAutoLockTimeChange = (minutes: number) => {
    setSecuritySettings(prev => ({
      ...prev,
      autoLockTime: minutes
    }));
  };

  const SecurityToggle: React.FC<{
    title: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
    icon: React.ReactNode;
  }> = ({ title, description, enabled, onToggle, icon }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-white font-medium">{title}</p>
          <p className="text-white/60 text-sm">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-turquoise-500' : 'bg-white/20'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-turquoise-500/10 rounded-xl">
              <Smartphone className="w-6 h-6 text-turquoise-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{t('settings.privacy.appSecurity.title')}</h2>
              <p className="text-white/60 text-sm">{t('settings.privacy.appSecurity.subtitle')}</p>
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
          <div className="space-y-6">
            {/* App Lock Section */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">App-Sperre</h3>
              <div className="space-y-4">
                <SecurityToggle
                  title={t('settings.privacy.appSecurity.appLock')}
                  description={securitySettings.appLockEnabled ? t('settings.privacy.appSecurity.appLockEnabled') : t('settings.privacy.appSecurity.appLockDisabled')}
                  enabled={securitySettings.appLockEnabled}
                  onToggle={() => handleToggleSetting('appLockEnabled')}
                  icon={<Lock className="w-5 h-5 text-white/60" />}
                />

                {securitySettings.appLockEnabled && (
                  <>
                    <SecurityToggle
                      title={t('settings.privacy.appSecurity.biometricAuth')}
                      description="Fingerabdruck oder Gesichtserkennung verwenden"
                      enabled={securitySettings.biometricEnabled}
                      onToggle={() => handleToggleSetting('biometricEnabled')}
                      icon={<Fingerprint className="w-5 h-5 text-white/60" />}
                    />

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/10 rounded-lg">
                          <Timer className="w-5 h-5 text-white/60" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{t('settings.privacy.appSecurity.autoLock')}</p>
                          <p className="text-white/60 text-sm">App automatisch sperren nach Inaktivität</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 5, 15, 30].map((minutes) => (
                          <button
                            key={minutes}
                            onClick={() => handleAutoLockTimeChange(minutes)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                              securitySettings.autoLockTime === minutes
                                ? 'bg-turquoise-500/20 text-turquoise-400'
                                : 'bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            {minutes} Min
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Security Notifications Section */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Sicherheitsbenachrichtigungen</h3>
              <div className="space-y-4">
                <SecurityToggle
                  title={t('settings.privacy.appSecurity.securityNotifications')}
                  description={securitySettings.securityNotifications ? t('settings.privacy.appSecurity.notificationsEnabled') : t('settings.privacy.appSecurity.notificationsDisabled')}
                  enabled={securitySettings.securityNotifications}
                  onToggle={() => handleToggleSetting('securityNotifications')}
                  icon={<Bell className="w-5 h-5 text-white/60" />}
                />

                {securitySettings.securityNotifications && (
                  <>
                    <div className="ml-6 space-y-3">
                      <SecurityToggle
                        title="Anmelde-Benachrichtigungen"
                        description="Benachrichtigung bei neuen Anmeldungen"
                        enabled={securitySettings.loginAlerts}
                        onToggle={() => handleToggleSetting('loginAlerts')}
                        icon={<Shield className="w-5 h-5 text-white/60" />}
                      />

                      <SecurityToggle
                        title="Verdächtige Aktivitäten"
                        description="Warnung bei ungewöhnlichen Aktivitäten"
                        enabled={securitySettings.suspiciousActivityAlerts}
                        onToggle={() => handleToggleSetting('suspiciousActivityAlerts')}
                        icon={<Shield className="w-5 h-5 text-white/60" />}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Security Status Overview */}
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Sicherheitsstatus</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${securitySettings.appLockEnabled ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-white/80 text-sm">App-Sperre</span>
                  <span className={`text-xs font-medium ${securitySettings.appLockEnabled ? 'text-green-400' : 'text-red-400'}`}>
                    {securitySettings.appLockEnabled ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${securitySettings.biometricEnabled ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <span className="text-white/80 text-sm">Biometrie</span>
                  <span className={`text-xs font-medium ${securitySettings.biometricEnabled ? 'text-green-400' : 'text-yellow-400'}`}>
                    {securitySettings.biometricEnabled ? 'Aktiv' : 'Optional'}
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${securitySettings.securityNotifications ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <span className="text-white/80 text-sm">Benachrichtigungen</span>
                  <span className={`text-xs font-medium ${securitySettings.securityNotifications ? 'text-green-400' : 'text-yellow-400'}`}>
                    {securitySettings.securityNotifications ? 'Aktiv' : 'Deaktiviert'}
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-white/80 text-sm">Auto-Sperre</span>
                  <span className="text-xs font-medium text-green-400">
                    {securitySettings.autoLockTime} Min
                  </span>
                </div>
              </div>
            </div>

            {/* Security Tips */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-blue-400 font-medium mb-1">Sicherheitstipps</h4>
                  <ul className="text-blue-300/80 text-sm space-y-1">
                    <li>• Aktiviere die App-Sperre für zusätzlichen Schutz</li>
                    <li>• Nutze biometrische Authentifizierung wenn verfügbar</li>
                    <li>• Stelle eine kurze Auto-Sperre-Zeit ein</li>
                    <li>• Aktiviere Sicherheitsbenachrichtigungen</li>
                    <li>• Überprüfe regelmäßig deine Anmeldeaktivitäten</li>
                  </ul>
                </div>
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
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};