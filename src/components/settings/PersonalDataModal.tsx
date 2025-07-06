import React, { useState } from 'react';
import { X, User, Mail, Camera, Save } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface PersonalDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newName: string) => void;
  currentUser: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
}

export const PersonalDataModal: React.FC<PersonalDataModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(currentUser.name);
  const [hasChanges, setHasChanges] = useState(false);

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setHasChanges(newName !== currentUser.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && hasChanges) {
      // Call the onSubmit handler with the new name
      onSubmit(name.trim());
      
      // Show success message or feedback
      setHasChanges(false);
      onClose();
    }
  };

  const handleCancel = () => {
    setName(currentUser.name);
    setHasChanges(false);
    onClose();
  };

  // Generate avatar initials from name
  const getAvatarInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-turquoise-500/10 rounded-xl">
              <User className="w-6 h-6 text-turquoise-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{t('forms.personalData.title')}</h2>
              <p className="text-white/60 text-sm">{t('forms.personalData.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gradient-to-br from-turquoise-500 to-turquoise-400 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {currentUser.avatar || getAvatarInitials(name)}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-colors"
                  title={t('forms.personalData.changeAvatar')}
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-white/60 text-sm mt-3">{t('forms.personalData.avatarHint')}</p>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">
                {t('forms.personalData.nameField')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                  placeholder={t('placeholders.name')}
                  required
                  maxLength={50}
                />
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
              </div>
              {hasChanges && (
                <p className="text-turquoise-400 text-xs mt-2">
                  {t('forms.personalData.unsavedChanges')}
                </p>
              )}
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">
                {t('forms.personalData.emailField')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={currentUser.email || 'demo@finanzapp.at'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/60 cursor-not-allowed"
                  disabled
                  readOnly
                />
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
              </div>
              <p className="text-white/40 text-xs mt-2">
                {t('forms.personalData.emailHint')}
              </p>
            </div>

            {/* Account Info */}
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-white font-medium text-sm mb-3">{t('forms.personalData.accountInfo')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">{t('forms.personalData.accountType')}</span>
                  <span className="text-turquoise-400 font-medium">{t('settings.premiumMember')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">{t('forms.personalData.memberSince')}</span>
                  <span className="text-white">Januar 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">{t('forms.personalData.lastLogin')}</span>
                  <span className="text-white">Heute, 14:30</span>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-4 rounded-xl transition-all duration-200"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!hasChanges || !name.trim()}
              className={`flex-1 font-semibold py-4 rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 ${
                hasChanges && name.trim()
                  ? 'bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white hover:from-turquoise-600 hover:to-turquoise-500'
                  : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-5 h-5" />
              {t('forms.personalData.saveButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};