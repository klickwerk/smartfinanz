import React, { useState } from 'react';
import { X, Bell, DollarSign, Target, AlertTriangle, TrendingUp, Users, Calendar, Smartphone, Mail, Volume2 } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  category: 'financial' | 'family' | 'system';
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    // Financial Notifications
    {
      id: 'budget-exceeded',
      title: 'Budget überschritten',
      description: 'Benachrichtigung wenn ein Budget überschritten wird',
      enabled: true,
      category: 'financial',
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
      priority: 'high'
    },
    {
      id: 'budget-warning',
      title: 'Budget-Warnung',
      description: 'Warnung bei 80% Budget-Verbrauch',
      enabled: true,
      category: 'financial',
      icon: <DollarSign className="w-5 h-5 text-yellow-400" />,
      priority: 'medium'
    },
    {
      id: 'goal-milestone',
      title: 'Sparziel-Meilensteine',
      description: 'Benachrichtigung bei erreichten Sparzielen',
      enabled: true,
      category: 'financial',
      icon: <Target className="w-5 h-5 text-green-400" />,
      priority: 'high'
    },
    {
      id: 'monthly-summary',
      title: 'Monatliche Zusammenfassung',
      description: 'Übersicht der monatlichen Finanzen',
      enabled: false,
      category: 'financial',
      icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
      priority: 'low'
    },
    {
      id: 'transaction-reminders',
      title: 'Transaktions-Erinnerungen',
      description: 'Erinnerung an ausstehende Transaktionen',
      enabled: true,
      category: 'financial',
      icon: <Calendar className="w-5 h-5 text-purple-400" />,
      priority: 'medium'
    },
    
    // Family Notifications
    {
      id: 'family-activity',
      title: 'Familienaktivitäten',
      description: 'Benachrichtigung bei neuen Familientransaktionen',
      enabled: false,
      category: 'family',
      icon: <Users className="w-5 h-5 text-turquoise-400" />,
      priority: 'low'
    },
    {
      id: 'member-invites',
      title: 'Mitglieder-Einladungen',
      description: 'Benachrichtigung bei neuen Familienmitgliedern',
      enabled: true,
      category: 'family',
      icon: <Users className="w-5 h-5 text-green-400" />,
      priority: 'medium'
    },
    {
      id: 'shared-goals',
      title: 'Gemeinsame Sparziele',
      description: 'Updates zu gemeinsamen Sparzielen',
      enabled: true,
      category: 'family',
      icon: <Target className="w-5 h-5 text-purple-400" />,
      priority: 'medium'
    },
    
    // System Notifications
    {
      id: 'app-updates',
      title: 'App-Updates',
      description: 'Benachrichtigung über neue Features',
      enabled: false,
      category: 'system',
      icon: <Smartphone className="w-5 h-5 text-blue-400" />,
      priority: 'low'
    },
    {
      id: 'security-alerts',
      title: 'Sicherheitswarnungen',
      description: 'Wichtige Sicherheitsbenachrichtigungen',
      enabled: true,
      category: 'system',
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
      priority: 'high'
    }
  ]);

  // Delivery method settings
  const [deliverySettings, setDeliverySettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    soundEnabled: true,
    vibrationEnabled: true
  });

  if (!isOpen) return null;

  const handleToggleNotification = (id: string) => {
    setNotificationSettings(prev => 
      prev.map(setting => 
        setting.id === id 
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };

  const handleToggleDelivery = (setting: keyof typeof deliverySettings) => {
    setDeliverySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'financial': return 'Finanzielle Benachrichtigungen';
      case 'family': return 'Familien-Benachrichtigungen';
      case 'system': return 'System-Benachrichtigungen';
      default: return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial': return <DollarSign className="w-5 h-5 text-green-400" />;
      case 'family': return <Users className="w-5 h-5 text-purple-400" />;
      case 'system': return <Smartphone className="w-5 h-5 text-blue-400" />;
      default: return <Bell className="w-5 h-5 text-white/60" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-white/60';
    }
  };

  const NotificationToggle: React.FC<{ setting: NotificationSetting }> = ({ setting }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-lg">
          {setting.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-white font-medium">{setting.title}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full bg-white/10 ${getPriorityColor(setting.priority)}`}>
              {setting.priority === 'high' ? 'Hoch' : setting.priority === 'medium' ? 'Mittel' : 'Niedrig'}
            </span>
          </div>
          <p className="text-white/60 text-sm">{setting.description}</p>
        </div>
      </div>
      <button
        onClick={() => handleToggleNotification(setting.id)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          setting.enabled ? 'bg-turquoise-500' : 'bg-white/20'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            setting.enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const DeliveryToggle: React.FC<{
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

  // Group notifications by category
  const groupedNotifications = notificationSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, NotificationSetting[]>);

  // Calculate enabled notifications count
  const enabledCount = notificationSettings.filter(s => s.enabled).length;
  const totalCount = notificationSettings.length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-turquoise-500/10 rounded-xl">
              <Bell className="w-6 h-6 text-turquoise-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Benachrichtigungen</h2>
              <p className="text-white/60 text-sm">
                Verwalte deine Benachrichtigungseinstellungen ({enabledCount}/{totalCount} aktiv)
              </p>
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
          <div className="space-y-8">
            {/* Delivery Methods */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Benachrichtigungsart</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DeliveryToggle
                  title="Push-Benachrichtigungen"
                  description="Benachrichtigungen in der App anzeigen"
                  enabled={deliverySettings.pushNotifications}
                  onToggle={() => handleToggleDelivery('pushNotifications')}
                  icon={<Smartphone className="w-5 h-5 text-white/60" />}
                />

                <DeliveryToggle
                  title="E-Mail-Benachrichtigungen"
                  description="Wichtige Updates per E-Mail erhalten"
                  enabled={deliverySettings.emailNotifications}
                  onToggle={() => handleToggleDelivery('emailNotifications')}
                  icon={<Mail className="w-5 h-5 text-white/60" />}
                />

                <DeliveryToggle
                  title="Ton aktiviert"
                  description="Benachrichtigungstöne abspielen"
                  enabled={deliverySettings.soundEnabled}
                  onToggle={() => handleToggleDelivery('soundEnabled')}
                  icon={<Volume2 className="w-5 h-5 text-white/60" />}
                />

                <DeliveryToggle
                  title="Vibration aktiviert"
                  description="Gerät bei Benachrichtigungen vibrieren lassen"
                  enabled={deliverySettings.vibrationEnabled}
                  onToggle={() => handleToggleDelivery('vibrationEnabled')}
                  icon={<Smartphone className="w-5 h-5 text-white/60" />}
                />
              </div>
            </div>

            {/* Notification Categories */}
            {Object.entries(groupedNotifications).map(([category, settings]) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  {getCategoryIcon(category)}
                  <h3 className="text-white font-semibold text-lg">{getCategoryTitle(category)}</h3>
                  <span className="bg-white/10 text-white/60 px-2 py-1 rounded-full text-xs">
                    {settings.filter(s => s.enabled).length}/{settings.length} aktiv
                  </span>
                </div>
                <div className="space-y-3">
                  {settings.map((setting) => (
                    <NotificationToggle key={setting.id} setting={setting} />
                  ))}
                </div>
              </div>
            ))}

            {/* Quick Actions */}
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Schnellaktionen</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setNotificationSettings(prev => 
                      prev.map(setting => ({ ...setting, enabled: true }))
                    );
                  }}
                  className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-3 rounded-xl font-medium transition-colors"
                >
                  Alle aktivieren
                </button>
                <button
                  onClick={() => {
                    setNotificationSettings(prev => 
                      prev.map(setting => ({ ...setting, enabled: false }))
                    );
                  }}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-xl font-medium transition-colors"
                >
                  Alle deaktivieren
                </button>
                <button
                  onClick={() => {
                    setNotificationSettings(prev => 
                      prev.map(setting => ({ 
                        ...setting, 
                        enabled: setting.priority === 'high' 
                      }))
                    );
                  }}
                  className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 py-3 rounded-xl font-medium transition-colors"
                >
                  Nur wichtige
                </button>
              </div>
            </div>

            {/* Information */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-blue-400 font-medium mb-1">Benachrichtigungshinweise</h4>
                  <ul className="text-blue-300/80 text-sm space-y-1">
                    <li>• Sicherheitswarnungen können nicht deaktiviert werden</li>
                    <li>• E-Mail-Benachrichtigungen werden nur für wichtige Updates gesendet</li>
                    <li>• Du kannst jederzeit einzelne Benachrichtigungen anpassen</li>
                    <li>• Push-Benachrichtigungen erfordern Browser-Berechtigung</li>
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
              Einstellungen speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};