import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Globe, HelpCircle, Users, Home, DollarSign, Languages, Lock, Database, Smartphone, LogOut } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { CurrencySelectorModal } from './CurrencySelectorModal';
import { LanguageSelectorModal } from './LanguageSelectorModal';
import { ThemeSelectorModal } from './ThemeSelectorModal';
import { DefaultViewSelectorModal } from './DefaultViewSelectorModal';
import { FamilyManagementModal } from './FamilyManagementModal';
import { AccountSecurityModal } from './AccountSecurityModal';
import { DataManagementModal } from './DataManagementModal';
import { AppSecurityModal } from './AppSecurityModal';
import { NotificationsModal } from './NotificationsModal';
import { PersonalDataModal } from './PersonalDataModal';
import { useCurrency } from '../../context/CurrencyContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useDefaultView } from '../../context/DefaultViewContext';
import { usePermissions } from '../../context/PermissionsContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { formatCurrency } from '../../utils/formatUtils';
import { getLanguageDisplayName } from '../../constants/languages';
import { ROLE_DISPLAY_INFO } from '../../constants/permissions';
import { mockProjects } from '../../data/mockData';

export const Settings: React.FC = () => {
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isDefaultViewModalOpen, setIsDefaultViewModalOpen] = useState(false);
  const [isFamilyManagementModalOpen, setIsFamilyManagementModalOpen] = useState(false);
  const [isAccountSecurityModalOpen, setIsAccountSecurityModalOpen] = useState(false);
  const [isDataManagementModalOpen, setIsDataManagementModalOpen] = useState(false);
  const [isAppSecurityModalOpen, setIsAppSecurityModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isPersonalDataModalOpen, setIsPersonalDataModalOpen] = useState(false);
  
  const { displayCurrency } = useCurrency();
  const { currentLanguage } = useLanguage();
  const { activeTheme } = useTheme();
  const { defaultView } = useDefaultView();
  const { currentUser, isAdmin, updateUserName } = usePermissions();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  // Calculate total wealth from projects and add some additional assets
  const totalProjectValue = mockProjects.reduce((sum, project) => sum + project.currentAmount, 0);
  const additionalAssets = 0; // No mock data
  const totalWealth = totalProjectValue + additionalAssets;

  // Get default view display name
  const getDefaultViewDisplayName = (viewId: string): string => {
    const viewNames: Record<string, string> = {
      'dashboard': t('navigation.home'),
      'planung': t('navigation.planning'),
      'budgets': t('navigation.budgets'),
      'projects': t('navigation.projects'),
      'settings': t('navigation.settings')
    };
    
    return viewNames[viewId] || viewId;
  };

  // Handle personal data update
  const handlePersonalDataUpdate = (newName: string) => {
    updateUserName(currentUser.id, newName);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const settingsGroups = [
    {
      title: t('settings.groups.profile'),
      items: [
        { 
          icon: User, 
          label: t('settings.items.personalData'), 
          value: currentUser.name, 
          action: () => setIsPersonalDataModalOpen(true)
        },
        { 
          icon: Bell, 
          label: t('settings.items.notifications'), 
          value: t('settings.values.enabled'), 
          action: () => setIsNotificationsModalOpen(true)
        }
      ]
    },
    {
      title: t('settings.groups.family'),
      items: [
        { 
          icon: Users, 
          label: t('settings.items.manageFamily'), 
          value: t('settings.values.inviteMembers'), 
          action: () => setIsFamilyManagementModalOpen(true)
        },
        { 
          icon: Home, 
          label: t('settings.items.defaultView'), 
          value: getDefaultViewDisplayName(defaultView), 
          action: () => setIsDefaultViewModalOpen(true)
        }
      ]
    },
    {
      title: t('settings.groups.app'),
      items: [
        { 
          icon: Palette, 
          label: t('settings.items.design'), 
          value: activeTheme.name, 
          action: () => setIsThemeModalOpen(true)
        },
        { 
          icon: Languages, 
          label: t('settings.items.language'), 
          value: getLanguageDisplayName(currentLanguage.code), 
          action: () => setIsLanguageModalOpen(true)
        },
        { 
          icon: DollarSign, 
          label: t('settings.items.currency'), 
          value: `${displayCurrency.symbol} ${displayCurrency.label}`, 
          action: () => setIsCurrencyModalOpen(true)
        }
      ]
    },
    {
      title: t('settings.groups.privacy'),
      items: [
        { 
          icon: Lock, 
          label: t('settings.items.accountSecurity'), 
          value: t('settings.values.secure'), 
          action: () => setIsAccountSecurityModalOpen(true)
        },
        { 
          icon: Database, 
          label: t('settings.items.dataManagement'), 
          value: t('settings.values.protected'), 
          action: () => setIsDataManagementModalOpen(true)
        },
        { 
          icon: Smartphone, 
          label: t('settings.items.appSecurity'), 
          value: t('settings.values.configured'), 
          action: () => setIsAppSecurityModalOpen(true)
        }
      ]
    },
    {
      title: t('settings.groups.support'),
      items: [
        { icon: HelpCircle, label: t('settings.items.help'), value: null, action: null },
        { 
          icon: LogOut, 
          label: 'Abmelden', 
          value: null, 
          action: handleLogout,
          isDestructive: true
        }
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('settings.title')}</h1>
          <p className="text-white/60">{t('settings.subtitle')}</p>
        </div>
      </div>

      {/* Profile Card */}
      <GlassCard>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-turquoise-500 to-turquoise-400 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold text-lg">
                {currentUser.name}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_DISPLAY_INFO[currentUser.role].badge}`}>
                {ROLE_DISPLAY_INFO[currentUser.role].name}
              </span>
            </div>
            <p className="text-white/60 text-sm">{user?.email || currentUser.email}</p>
            <p className="text-turquoise-400 text-xs font-medium mt-1">{t('settings.premiumMember')}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-semibold">{formatCurrency(totalWealth, displayCurrency.value)}</p>
            <p className="text-white/60 text-sm">{t('settings.totalWealth')}</p>
          </div>
        </div>
      </GlassCard>

      {/* Settings Groups */}
      {settingsGroups.map((group) => (
        <div key={group.title} className="space-y-3">
          <h2 className="text-white/80 font-semibold text-sm uppercase tracking-wider px-2">
            {group.title}
          </h2>
          <GlassCard className="p-0">
            {group.items.map((item, index) => (
              <button
                key={item.label}
                onClick={item.action || undefined}
                disabled={!item.action}
                className={`w-full flex items-center justify-between p-4 transition-colors ${
                  item.action ? 'hover:bg-white/5 cursor-pointer' : 'cursor-default'
                } ${
                  index !== group.items.length - 1 ? 'border-b border-white/10' : ''
                } ${
                  index === 0 ? 'rounded-t-2xl' : ''
                } ${
                  index === group.items.length - 1 ? 'rounded-b-2xl' : ''
                } ${
                  item.isDestructive ? 'hover:bg-red-500/10' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.isDestructive ? 'bg-red-500/10' : 'bg-white/10'}`}>
                    <item.icon className={`w-5 h-5 ${item.isDestructive ? 'text-red-400' : 'text-white/60'}`} />
                  </div>
                  <span className={`font-medium ${item.isDestructive ? 'text-red-400' : 'text-white'}`}>
                    {item.label}
                  </span>
                </div>
                {item.value && (
                  <span className="text-white/60 text-sm">{item.value}</span>
                )}
              </button>
            ))}
          </GlassCard>
        </div>
      ))}

      {/* App Info */}
      <div className="text-center pt-6">
        <p className="text-white/40 text-sm">{t('settings.appInfo')}</p>
        <p className="text-white/40 text-xs mt-1">{t('settings.madeWith')}</p>
      </div>

      {/* All Modals */}
      <PersonalDataModal
        isOpen={isPersonalDataModalOpen}
        onClose={() => setIsPersonalDataModalOpen(false)}
        onSubmit={handlePersonalDataUpdate}
        currentUser={{
          ...currentUser,
          name: currentUser.name,
          email: user?.email || currentUser.email
        }}
      />

      <CurrencySelectorModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
      />

      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />

      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      <DefaultViewSelectorModal
        isOpen={isDefaultViewModalOpen}
        onClose={() => setIsDefaultViewModalOpen(false)}
      />

      <FamilyManagementModal
        isOpen={isFamilyManagementModalOpen}
        onClose={() => setIsFamilyManagementModalOpen(false)}
      />

      <AccountSecurityModal
        isOpen={isAccountSecurityModalOpen}
        onClose={() => setIsAccountSecurityModalOpen(false)}
      />

      <DataManagementModal
        isOpen={isDataManagementModalOpen}
        onClose={() => setIsDataManagementModalOpen(false)}
      />

      <AppSecurityModal
        isOpen={isAppSecurityModalOpen}
        onClose={() => setIsAppSecurityModalOpen(false)}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
      />
    </div>
  );
};