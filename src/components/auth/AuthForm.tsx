import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

type AuthMode = 'login' | 'register' | 'forgot-password';

export const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();
  const { activeTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(getErrorMessage(error.message));
        }
      } else if (mode === 'register') {
        if (!fullName.trim()) {
          setError('Vollständiger Name ist erforderlich');
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(getErrorMessage(error.message));
        } else {
          setSuccess('Registrierung erfolgreich! Bitte überprüfe deine E-Mail für die Bestätigung.');
        }
      } else if (mode === 'forgot-password') {
        const { error } = await resetPassword(email);
        if (error) {
          setError(getErrorMessage(error.message));
        } else {
          setSuccess('Passwort-Reset-Link wurde an deine E-Mail gesendet.');
        }
      }
    } catch (error) {
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (message: string): string => {
    // Translate common Supabase error messages to German
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Ungültige Anmeldedaten',
      'Email not confirmed': 'E-Mail noch nicht bestätigt',
      'User already registered': 'Benutzer bereits registriert',
      'Password should be at least 6 characters': 'Passwort sollte mindestens 6 Zeichen haben',
      'Invalid email': 'Ungültige E-Mail-Adresse',
      'Email rate limit exceeded': 'E-Mail-Limit überschritten. Bitte warte einen Moment.',
    };
    
    return errorMap[message] || message;
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Willkommen zurück';
      case 'register': return 'Konto erstellen';
      case 'forgot-password': return 'Passwort zurücksetzen';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return 'Melde dich in deinem FinanzApp-Konto an';
      case 'register': return 'Erstelle dein neues FinanzApp-Konto';
      case 'forgot-password': return 'Gib deine E-Mail-Adresse ein, um dein Passwort zurückzusetzen';
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Lädt...';
    switch (mode) {
      case 'login': return 'Anmelden';
      case 'register': return 'Registrieren';
      case 'forgot-password': return 'Reset-Link senden';
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Dynamic Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0 transition-all duration-500"
        style={{
          backgroundImage: `url(${activeTheme.backgroundImage})`,
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Dynamic Dark Overlay */}
      <div className={`fixed inset-0 bg-gradient-to-b ${activeTheme.gradientFrom} ${activeTheme.gradientVia} ${activeTheme.gradientTo} z-10 transition-all duration-500`} />
      
      {/* Auth Form */}
      <div className="relative z-20 w-full max-w-md">
        <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-turquoise-500 to-turquoise-400 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              FA
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{getTitle()}</h1>
            <p className="text-white/60 text-sm">{getSubtitle()}</p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="text-green-400 text-sm text-center">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name - Only for registration */}
            {mode === 'register' && (
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Vollständiger Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                    placeholder="Max Mustermann"
                    required
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                E-Mail-Adresse
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                  placeholder="deine@email.at"
                  required
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              </div>
            </div>

            {/* Password - Not for forgot password */}
            {mode !== 'forgot-password' && (
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Passwort
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 pr-12 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white font-semibold py-4 rounded-xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {mode === 'login' && <LogIn className="w-5 h-5" />}
              {mode === 'register' && <UserPlus className="w-5 h-5" />}
              {mode === 'forgot-password' && <Mail className="w-5 h-5" />}
              {getButtonText()}
            </button>
          </form>

          {/* Mode Switching */}
          <div className="mt-8 space-y-4">
            {mode === 'login' && (
              <>
                <div className="text-center">
                  <button
                    onClick={() => setMode('forgot-password')}
                    className="text-turquoise-400 hover:text-turquoise-300 text-sm transition-colors"
                  >
                    Passwort vergessen?
                  </button>
                </div>
                <div className="text-center">
                  <span className="text-white/60 text-sm">Noch kein Konto? </span>
                  <button
                    onClick={() => setMode('register')}
                    className="text-turquoise-400 hover:text-turquoise-300 text-sm font-medium transition-colors"
                  >
                    Jetzt registrieren
                  </button>
                </div>
              </>
            )}

            {mode === 'register' && (
              <div className="text-center">
                <span className="text-white/60 text-sm">Bereits ein Konto? </span>
                <button
                  onClick={() => setMode('login')}
                  className="text-turquoise-400 hover:text-turquoise-300 text-sm font-medium transition-colors"
                >
                  Jetzt anmelden
                </button>
              </div>
            )}

            {mode === 'forgot-password' && (
              <div className="text-center">
                <button
                  onClick={() => setMode('login')}
                  className="text-turquoise-400 hover:text-turquoise-300 text-sm font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Zurück zur Anmeldung
                </button>
              </div>
            )}
          </div>

          {/* Demo Notice */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-blue-400 text-xs text-center">
              <strong>Demo-Hinweis:</strong> Stelle sicher, dass deine Supabase-Konfiguration in der .env-Datei korrekt eingerichtet ist.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};