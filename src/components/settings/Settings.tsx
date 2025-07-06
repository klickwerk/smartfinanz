import React from 'react';
import { User, Bell, Shield, Palette, Globe, HelpCircle, LogOut } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';

export const Settings: React.FC = () => {
  const settingsGroups = [
    {
      title: 'Profil',
      items: [
        { icon: User, label: 'Persönliche Daten', value: 'Max Mustermann' },
        { icon: Bell, label: 'Benachrichtigungen', value: 'Aktiviert' },
        { icon: Shield, label: 'Datenschutz & Sicherheit', value: null }
      ]
    },
    {
      title: 'App',
      items: [
        { icon: Palette, label: 'Design', value: 'Dunkel' },
        { icon: Globe, label: 'Sprache', value: 'Deutsch (Österreich)' }
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Hilfe & Support', value: null },
        { icon: LogOut, label: 'Abmelden', value: null, isDestructive: true }
      ]
    }
  ];

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
            MM
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">Max Mustermann</h3>
            <p className="text-white/60 text-sm">max@example.com</p>
            <p className="text-turquoise-400 text-xs font-medium mt-1">Premium Mitglied</p>
          </div>
          <div className="text-right">
            <p className="text-white font-semibold">€12.450</p>
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
                className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${
                  index !== group.items.length - 1 ? 'border-b border-white/10' : ''
                } ${
                  index === 0 ? 'rounded-t-2xl' : ''
                } ${
                  index === group.items.length - 1 ? 'rounded-b-2xl' : ''
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
      </div>
    </div>
  );
};