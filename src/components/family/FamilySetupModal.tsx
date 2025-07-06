import React, { useState } from 'react';
import { X, Users, Plus } from 'lucide-react';
import { useFamily } from '../../hooks/useFamily';

interface FamilySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FamilySetupModal: React.FC<FamilySetupModalProps> = ({ isOpen, onClose }) => {
  const [familyName, setFamilyName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { createFamily } = useFamily();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('Family setup form submitted:', { familyName, description });

    try {
      await createFamily(familyName, description);
      console.log('Family created successfully, closing modal');
      onClose();
    } catch (err) {
      console.error('Family setup error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.log('Setting error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-turquoise-500/10 rounded-xl">
              <Users className="w-6 h-6 text-turquoise-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Familie erstellen</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Familienname
            </label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
              placeholder="z.B. Familie Mustermann"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Beschreibung (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Kurze Beschreibung eurer Familie..."
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <div className="text-red-400 text-sm">
                <p className="font-medium mb-1">Fehler beim Erstellen der Familie:</p>
                <p className="text-xs opacity-90">{error}</p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs opacity-70 hover:opacity-100">
                    Technische Details anzeigen
                  </summary>
                  <pre className="mt-1 text-xs opacity-60 whitespace-pre-wrap break-all">
                    {JSON.stringify(error, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white font-semibold py-4 rounded-xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {loading ? 'Wird erstellt...' : 'Familie erstellen'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-turquoise-500/10 rounded-xl">
          <p className="text-turquoise-400 text-sm">
            💡 Nach der Erstellung kannst du Familienmitglieder über die Einstellungen einladen.
          </p>
        </div>
      </div>
    </div>
  );
};