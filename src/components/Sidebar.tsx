import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  CalendarDays, 
  Users, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Mail, 
  Settings, 
  LogOut,
  Database,
  Shield,
  Activity,
  Sparkles
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, user, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'attendance', label: 'Mark Attendance', icon: ClipboardCheck, badge: 'Live' },
    { id: 'sessions', label: 'Lab Sessions', icon: CalendarDays, badge: null },
    { id: 'reports', label: 'Daily Reports (.docx)', icon: FileText, badge: 'Auto' },
    { id: 'register', label: 'Digital Register', icon: Database, badge: null },
    { id: 'students', label: 'Students', icon: Users, badge: null },
    { id: 'semesters', label: 'Semesters', icon: GraduationCap, badge: null },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, badge: null },
    { id: 'teachers', label: 'Teachers / Faculty', icon: Users, badge: null },
    { id: 'emails', label: 'Email History', icon: Mail, badge: null },
    { id: 'settings', label: 'College Settings', icon: Settings, badge: null },
  ];

  return (
    <aside className="w-68 bg-slate-950 text-slate-100 flex flex-col shrink-0 min-h-screen border-r border-slate-800/80 shadow-2xl relative select-none">
      {/* College Identity Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20 border border-white/10 shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">SRN MEHTA</span>
            </div>
            <h1 className="font-extrabold text-sm text-white truncate leading-tight">
              Lab Attendance Portal
            </h1>
            <p className="text-[11px] text-slate-400 truncate">Dept. of Computer Science</p>
          </div>
        </div>
      </div>

      {/* User Profile Card with Status */}
      <div className="mx-3 my-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 shadow-inner">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Shield className="w-3 h-3 text-blue-400" />
            <span>Active Session</span>
          </span>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Online</span>
          </div>
        </div>
        <p className="text-xs font-bold text-white truncate">{user.name}</p>
        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800 text-[11px]">
          <span className="text-slate-400 truncate max-w-[130px]">{user.email}</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {user.role === 'admin' ? 'Admin' : 'Faculty'}
          </span>
        </div>
      </div>

      {/* Navigation Menu Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Operations
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 border border-blue-400/30 translate-x-1'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Server Health Status & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 space-y-2">
        <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cloud Server Active</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">v2.4</span>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:text-red-300 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Portal</span>
        </button>
      </div>
    </aside>
  );
};
