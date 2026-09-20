import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Mail, GraduationCap } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('amruthapatil3355@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch (err: any) {
      setError('Network or server error during login. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 lg:p-8 overflow-hidden bg-slate-950">
      {/* Full-screen SRN Mehta CBSE banner background with dark cinematic overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center filter brightness-90 scale-105 transition-transform duration-1000" 
          style={{ backgroundImage: `url('/src/assets/images/srn_mehta_login_bg_1789746387311.jpg')` }} 
        />
        {/* Deep gradient overlay for premium glassmorphism contrast */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/90 via-blue-950/70 to-slate-900/60 backdrop-blur-[2px]" />
      </div>

      {/* Glassmorphism Centered Card */}
      <div className="relative z-20 max-w-xl w-full bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-8 lg:p-10 text-white">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl shadow-inner border border-white/20 mb-4 text-blue-300">
            <GraduationCap className="w-9 h-9" />
          </div>
          <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">SRN NAVAL TRUST • ESTD 1991</span>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-1 text-white">
            SRN MEHTA <span className="text-blue-400">CBSE</span>
          </h1>
          <p className="text-slate-300 text-xs lg:text-sm mt-1">
            College Laboratory Attendance & Automated Daily Reporting Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-500/20 border border-red-500/40 text-red-200 text-xs rounded-xl font-medium backdrop-blur-md">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Authorized Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/15 backdrop-blur-md transition"
                placeholder="amruthapatil3355@gmail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/15 backdrop-blur-md transition"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition duration-200 text-sm tracking-wide disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/15 text-center text-xs text-slate-400 flex items-center justify-between">
          <span>Official Campus Portal</span>
          <span className="text-blue-300 font-semibold bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">Secure Access</span>
        </div>
      </div>
    </div>
  );
};


