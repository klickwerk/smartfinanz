import React, { useState } from 'react';
import { X, Users, Home, CheckCircle, AlertTriangle } from 'lucide-react';
import { usePermissions } from '../../context/PermissionsContext';

interface CreateFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateFamilyModal: React.FC<CreateFamilyModalProps> = ({
  isOpen,
  onClose
}) => {
  const { createFamily } = usePermissions();
  const [familyName, setFamilyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<{success?: boolean; message?: string}>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!familyName.trim()) {
      setResult({
        success: false,
        message: 'Bitte gib einen Familiennamen ein'
      });
      return;
    }

    setIsCreating(true);
    setResult({});

    try {
      const createResult = await createFamily(familyName.trim());
      
      if (createResult.success) {
        setResult({
          success: true,
          message: 'Familie erfolgreich erstellt! Du bist jetzt der Administrator.'
        });
        
        // Close modal after success
        setTimeout(() => {
          setFamilyName('');
          setResult({});
          onClose();
        }, 2000);
      } else {
        setResult({
          success: false,
          message: createResult.error || 'Fehler beim Erstellen der Familie'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Ein unerwarteter Fehler ist aufgetreten'
      });
      console.error('Error creating family:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setFamilyName('');
    setResult({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-turquoise-500/10 rounded-xl">
              <Users className="w-6 h-6 text-turquoise-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Familie erstellen</h2>
              <p className="text-white/60 text-sm">Erstelle deine eigene Familie für gemeinsame Finanzen</p>
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
          {/* Status Message */}
          {result.message && (
            <div className={`mb-6 p-4 rounded-xl ${
              result.success 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <div className="flex items-center gap-3">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
                <p className={`text-sm ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                  {result.message}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Family Name Input */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">
                Familienname
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                  placeholder="z.B. Familie Mustermann, Die Müllers..."
                  required
                  maxLength={50}
                  disabled={isCreating || result.success}
                />
                <Home className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
              </div>
              <p className="text-white/60 text-xs mt-2">
                Wähle einen Namen, der deine Familie repräsentiert
              </p>
            </div>

            {/* Family Benefits Info */}
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-white font-medium text-sm mb-3">Was bringt dir eine Familie?</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-turquoise-400 mt-1">•</span>
                  <span>Gemeinsame Budgets und Ausgaben verwalten</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-turquoise-400 mt-1">•</span>
                  <span>Sparziele zusammen erreichen</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-turquoise-400 mt-1">•</span>
                  <span>Familienmitglieder einladen und Berechtigungen verwalten</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-turquoise-400 mt-1">•</span>
                  <span>Übersicht über alle Familienfinanzen</span>
                </li>
              </ul>
            </div>

            {/* Admin Role Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-blue-400 font-medium mb-1">Du wirst Administrator</h4>
                  <p className="text-blue-300/80 text-sm">
                    Als Ersteller der Familie erhältst du automatisch Administrator-Rechte. 
                    Du kannst Mitglieder einladen, Berechtigungen verwalten und alle Familienfinanzen kontrollieren.
                  </p>
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
              disabled={isCreating}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSubmit}
              disabled={!familyName.trim() || isCreating || result.success}
              className={`flex-1 font-semibold py-4 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                familyName.trim() && !isCreating && !result.success
                  ? 'bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white hover:from-turquoise-600 hover:to-turquoise-500'
                  : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isCreating ? 'Familie wird erstellt...' : result.success ? 'Familie erstellt!' : 'Familie erstellen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};