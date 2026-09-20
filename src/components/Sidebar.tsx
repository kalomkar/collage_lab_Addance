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
  Database
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Mark Attendance', icon: ClipboardCheck },
    { id: 'sessions', label: 'Lab Sessions', icon: CalendarDays },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'semesters', label: 'Semesters', icon: GraduationCap },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'teachers', label: 'Teachers', icon: BookOpen },
    { id: 'reports', label: 'Daily Reports (.docx)', icon: FileText },
    { id: 'register', label: 'Digital Register', icon: Database },
    { id: 'emails', label: 'Email History', icon: Mail },
    { id: 'settings', label: 'College Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 min-h-screen shadow-xl">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xl">
            BCA
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">College Lab System</h1>
            <p className="text-xs text-slate-400">Attendance & Reports</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800">
        <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Logged in as</p>
        <p className="text-sm font-medium text-white truncate">{user.name}</p>
        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] rounded uppercase font-semibold tracking-wide">
          {user.role.replace('_', ' ')}
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
