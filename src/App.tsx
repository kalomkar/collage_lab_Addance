import React, { useState, useEffect } from 'react';
import { User } from './types';
import { Login } from './pages/Login';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { AttendanceEntry } from './pages/AttendanceEntry';
import { LabSessionsList } from './pages/LabSessionsList';
import { StudentsManagement } from './pages/StudentsManagement';
import { SemestersManagement } from './pages/SemestersManagement';
import { SubjectsManagement } from './pages/SubjectsManagement';
import { TeachersManagement } from './pages/TeachersManagement';
import { DailyReports } from './pages/DailyReports';
import { DigitalRegister } from './pages/DigitalRegister';
import { EmailHistoryPage } from './pages/EmailHistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('college_lab_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentTab, setCurrentTab] = useState('dashboard');

  useEffect(() => {
    if (user) {
      localStorage.setItem('college_lab_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('college_lab_user');
    }
  }, [user]);

  if (!user) {
    return <Login onLoginSuccess={(u) => setUser(u)} />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard setCurrentTab={setCurrentTab} />;
      case 'attendance':
        return <AttendanceEntry user={user} onSuccess={() => setCurrentTab('dashboard')} />;
      case 'sessions':
        return <LabSessionsList setCurrentTab={setCurrentTab} />;
      case 'students':
        return <StudentsManagement />;
      case 'semesters':
        return <SemestersManagement />;
      case 'subjects':
        return <SubjectsManagement />;
      case 'teachers':
        return <TeachersManagement />;
      case 'reports':
        return <DailyReports user={user} />;
      case 'register':
        return <DigitalRegister />;
      case 'emails':
        return <EmailHistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        onLogout={() => setUser(null)}
      />
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
