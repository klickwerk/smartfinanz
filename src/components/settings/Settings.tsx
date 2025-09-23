import React from 'react';
import { User, Bell, Shield, Palette, Globe, HelpCircle, LogOut } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { useAuth } from '../../context/AuthContext';

export const Settings: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    if (window.confirm('Möchtest du dich wirklich abmelden?')) {
      const { error } = await signOut();
      if (error) {
        console.error('Error signing out:', error);
        alert('Fehler beim Abmelden');
      }
    }
  };

  const settingsGroups = [
    {
      title: 'Profil',
      items: [
        { icon: User, label: 'Persönliche Daten', value: user?.email || 'Unbekannt', action: null },
        { icon: Bell, label: 'Benachrichtigungen', value: 'Aktiviert', action: null },
        { icon: Shield, label: 'Datenschutz & Sicherheit', value: null, action: null }
      ]
    },
    {
      title: 'App',
      items: [
        { icon: Palette, label: 'Design', value: 'Dunkel', action: null },
        { icon: Globe, label: 'Sprache', value: 'Deutsch (Österreich)', action: null }
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Hilfe & Support', value: null, action: null },
        { icon: LogOut, label: 'Abmelden', value: null, isDestructive: true, action: handleSignOut }
      ]
    }
  ];

  // Extract user info
  const userEmail = user?.email || 'unknown@example.com';
  const userName = user?.user_metadata?.full_name || userEmail.split('@')[0];
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Einstellungen</h1>
          <p className="text-white/60">App und Profil verwalten</p>
        </div>
      </div>

      {/* Profile Card */}
      <GlassCard>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-turquoise-500 to-turquoise-400 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
            {userInitials}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">{userName}</h3>
            <p className="text-white/60 text-sm">{userEmail}</p>
            <p className="text-turquoise-400 text-xs font-medium mt-1">Free Account</p>
          </div>
          <div className="text-right">
            <p className="text-white font-semibold">€0</p>
            <p className="text-white/60 text-sm">Gesamtvermögen</p>
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
                className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${
                  index !== group.items.length - 1 ? 'border-b border-white/10' : ''
                } ${
                  index === 0 ? 'rounded-t-2xl' : ''
                } ${
                  index === group.items.length - 1 ? 'rounded-b-2xl' : ''
                } ${
                  item.action ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    item.isDestructive ? 'bg-red-500/10' : 'bg-white/10'
                  }`}>
                    <item.icon className={`w-5 h-5 ${
                      item.isDestructive ? 'text-red-400' : 'text-white/60'
                    }`} />
                  </div>
                  <span className={`font-medium ${
                    item.isDestructive ? 'text-red-400' : 'text-white'
                  }`}>
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
        <p className="text-white/40 text-sm">FinanzApp v1.0.0</p>
        <p className="text-white/40 text-xs mt-1">Made with ❤️ in Austria</p>
        <p className="text-white/30 text-xs mt-2">User ID: {user?.id.slice(0, 8)}...</p>
      </div>
    </div>
  );
};