import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Mail, GraduationCap, Eye, EyeOff, ShieldCheck, Sparkles, Building2, UserCheck, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('amruthapatil3355@gmail.com');
  const [password, setPassword] = useState('@dm!n');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<'admin' | 'lab'>('admin');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      setError('Connection to server failed. If running on Render, please allow 30 seconds for the free server to wake up.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (role: 'admin' | 'lab' | 'sysadmin') => {
    if (role === 'admin') {
      setEmail('amruthapatil3355@gmail.com');
      setPassword('@dm!n');
      setActiveRole('admin');
    } else if (role === 'lab') {
      setEmail('lab@college.edu');
      setPassword('lab123');
      setActiveRole('lab');
    } else {
      setEmail('admin@college.edu');
      setPassword('admin123');
      setActiveRole('admin');
    }
    setError('');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-slate-950 font-sans selection:bg-blue-500 selection:text-white">
      {/* Dynamic Background: Full-width College Campus Wall with dark cinematic lighting */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center filter brightness-[0.45] saturate-[1.2] scale-105 transition-all duration-1000"
          style={{ 
            backgroundImage: `url('/images/srn_mehta_login_bg_1789746387311.jpg'), url('/src/assets/images/srn_mehta_login_bg_1789746387311.jpg')`
          }} 
        />
        {/* Modern Radial Gradient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/60 backdrop-blur-[3px]" />
      </div>

      {/* Main Glassmorphism Authentication Container */}
      <div className="relative z-20 max-w-xl w-full">
        {/* Glow Ring Border Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/40 via-indigo-500/40 to-cyan-500/40 rounded-[28px] blur-sm opacity-75 group-hover:opacity-100 transition duration-1000"></div>

        <div className="relative bg-slate-900/85 backdrop-blur-2xl rounded-[26px] shadow-2xl overflow-hidden border border-white/15 p-6 sm:p-8 lg:p-10 text-white">
          
          {/* Header Branding & Crest */}
          <div className="text-center mb-7">
            <div className="inline-flex relative mb-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25 border border-white/20">
                <GraduationCap className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-widest text-blue-400 uppercase">
              <Building2 className="w-3.5 h-3.5" />
              <span>SRN NAVAL TRUST • ESTD 1991</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-white">
              SRN MEHTA <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">CBSE / BCA</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-md mx-auto leading-relaxed">
              College Laboratory Attendance & Automated Daily Reporting System
            </p>
          </div>

          {/* Quick Role Switcher Pill */}
          <div className="bg-slate-950/60 p-1.5 rounded-xl border border-white/10 mb-6 flex gap-1.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleQuickSelect('admin')}
              className={`flex-1 py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeRole === 'admin'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administrator</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect('lab')}
              className={`flex-1 py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeRole === 'lab'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Lab In-Charge</span>
            </button>
          </div>

          {/* Error Message Toast */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/20 border border-red-500/40 text-red-200 text-xs rounded-xl font-medium backdrop-blur-md flex items-start gap-2.5 animate-in fade-in">
              <span className="text-red-400 font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Authorized Email Address
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
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/10 backdrop-blur-md transition shadow-inner"
                  placeholder="name@college.edu"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-blue-300 font-medium">Default: @dm!n</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/10 backdrop-blur-md transition shadow-inner"
                  placeholder="Enter your security password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-200 text-sm tracking-wide disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Campus Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Credentials Tester */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              ⚡ 1-Click Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  handleQuickSelect('admin');
                }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex flex-col"
              >
                <span className="font-bold text-blue-300">Amrutha Patil (Admin)</span>
                <span className="text-[10px] text-slate-400 truncate">amruthapatil3355@...</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleQuickSelect('lab');
                }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex flex-col"
              >
                <span className="font-bold text-emerald-300">Prof. Ramesh (Lab In-Charge)</span>
                <span className="text-[10px] text-slate-400 truncate">lab@college.edu</span>
              </button>
            </div>
          </div>

          {/* Footer Security Badges */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Official Campus System</span>
            </span>
            <span className="text-emerald-300 font-semibold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-[11px]">
              🔒 256-Bit SSL Encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
