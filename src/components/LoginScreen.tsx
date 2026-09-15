import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, Server, AlertCircle, ArrowRight } from 'lucide-react';
import { UserSession } from '../types';

interface LoginScreenProps {
  onLogin: (session: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Por favor, informe o usuário e a senha para acessar.');
      return;
    }

    setIsLoading(true);

    // Realistic authentication flow (accepts demo credentials or any valid non-empty login for user convenience)
    setTimeout(() => {
      // Default recommended user: admin / admin123 or any user
      if (password.length < 4) {
        setError('A senha deve conter no mínimo 4 dígitos.');
        setIsLoading(false);
        return;
      }

      const session: UserSession = {
        username: username.trim(),
        name: username.toLowerCase().includes('admin') ? 'Administrador T.I.' : `Técnico (${username.trim()})`,
        role: 'Responsável T.I. / Suporte',
        authenticated: true,
      };

      setIsLoading(false);
      onLogin(session);
    }, 450);
  };

  const handleQuickDemoFill = () => {
    setUsername('admin.ti');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-red-950 selection:bg-red-600 selection:text-white">
      {/* Background ambient lighting in black & corporate red */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(220,38,38,0.35),transparent_75%)]" 
      />
      <div 
        className="absolute bottom-0 right-0 w-[500px] h-[500px] pointer-events-none opacity-20 bg-[radial-gradient(circle_at_100%_100%,rgba(239,68,68,0.4),transparent_60%)]" 
      />
      
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        {/* Main Card */}
        <div className="bg-zinc-900/90 border border-red-900/40 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden p-8 sm:p-10 transition-all duration-300">
          
          {/* Header & Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-950 border border-red-500/30 shadow-lg shadow-red-900/40 mb-4">
              <Server className="w-8 h-8 text-white" />
            </div>
            
            <div className="inline-block px-3 py-1 mb-2 text-xs font-semibold tracking-wider text-red-400 uppercase bg-red-950/60 border border-red-800/40 rounded-full">
              Departamento de T.I.
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Gestão de Estoque
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Produtos, Impressoras e Movimentações
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 uppercase tracking-wide">
                Usuário / Login
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex: admin.ti ou seu usuário"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950/80 border border-zinc-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 rounded-xl text-white placeholder-zinc-600 text-sm outline-none transition-all"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 uppercase tracking-wide">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-zinc-950/80 border border-zinc-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 rounded-xl text-white placeholder-zinc-600 text-sm outline-none transition-all"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 hover:from-red-500 to-red-700 active:from-red-700 active:to-red-800 text-white font-semibold rounded-xl shadow-lg shadow-red-900/40 hover:shadow-red-900/60 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Access Helper */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-col items-center">
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-xs text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-zinc-800/50 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
              <span>Usar credenciais de demonstração (admin.ti / admin123)</span>
            </button>
          </div>

          {/* Bottom Security Note */}
          <div className="mt-6 text-center">
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Acesso corporativo seguro. Unidades monitoradas: <strong className="text-zinc-400">ACARAÚ, PREÁ, CD, SERRARIA</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
