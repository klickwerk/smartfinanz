import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../common/GlassCard';

export const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  
  const { signIn, signUp, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Bitte fülle alle Felder aus');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    if (!isLogin && formData.password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen haben');
      return;
    }

    const { error: authError } = isLogin 
      ? await signIn(formData.email, formData.password)
      : await signUp(formData.email, formData.password);

    if (authError) {
      console.error('Auth error:', authError);
      
      // Deutsche Fehlermeldungen
      switch (authError.message) {
        case 'Invalid login credentials':
          setError('Ungültige Login-Daten');
          break;
        case 'Email not confirmed':
          setError('Bitte bestätige deine E-Mail-Adresse');
          break;
        case 'User already registered':
          setError('E-Mail-Adresse bereits registriert');
          break;
        default:
          setError(authError.message || 'Ein Fehler ist aufgetreten');
      }
    } else if (!isLogin) {
      setError('');
      // Erfolgreiche Registrierung
      alert('Registrierung erfolgreich! Bitte überprüfe deine E-Mail für die Bestätigung.');
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-zinc-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* App Logo/Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-turquoise-500 to-turquoise-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">€</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">FinanzApp</h1>
          <p className="text-white/60">Intelligente Finanzplanung</p>
        </div>

        <GlassCard>
          <div className="space-y-6">
            {/* Tab Toggle */}
            <div className="flex bg-white/5 rounded-2xl p-1">
              <button
                type="button"
                onClick={() => {setIsLogin(true); setError('');}}
                className={`flex-1 py-3 rounded-xl transition-all font-medium ${
                  isLogin
                    ? 'bg-turquoise-500/20 text-turquoise-400'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Anmelden
              </button>
              <button
                type="button"
                onClick={() => {setIsLogin(false); setError('');}}
                className={`flex-1 py-3 rounded-xl transition-all font-medium ${
                  !isLogin
                    ? 'bg-turquoise-500/20 text-turquoise-400'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Registrieren
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  placeholder="E-Mail-Adresse"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={inputClass}
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Passwort"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className={inputClass}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Confirm Password for Signup */}
              {!isLogin && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Passwort bestätigen"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={inputClass}
                    required
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white font-semibold py-4 rounded-xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Wird verarbeitet...' : isLogin ? 'Anmelden' : 'Registrieren'}
              </button>
            </form>

            {/* Demo Account Info */}
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/60 text-sm mb-2">Demo-Account zum Testen:</p>
              <p className="text-white/80 text-xs">E-Mail: demo@example.com</p>
              <p className="text-white/80 text-xs">Passwort: demo123</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};