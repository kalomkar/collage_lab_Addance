import React, { useEffect, useState } from 'react';
import { 
  ClipboardCheck, 
  CalendarDays, 
  Users, 
  UserCheck, 
  UserX, 
  Percent, 
  FileText, 
  Mail, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { DashboardSummary, LabSession, EmailHistoryRecord } from '../types';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentTab }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentSessions, setRecentSessions] = useState<LabSession[]>([]);
  const [recentEmails, setRecentEmails] = useState<EmailHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sumRes, sessRes, emailRes] = await Promise.all([
        fetch('/api/dashboard/summary'),
        fetch('/api/lab-sessions'),
        fetch('/api/email/history')
      ]);

      const sumData = await sumRes.json();
      const sessData = await sessRes.json();
      const emailData = await emailRes.json();

      setSummary(sumData);
      setRecentSessions(sessData.slice(-5).reverse());
      setRecentEmails(emailData.slice(-5).reverse());
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Computer Lab Attendance & Principal Report System</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('attendance')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm shadow-sm transition"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Mark Lab Attendance</span>
          </button>
          <button
            onClick={() => setCurrentTab('reports')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium text-sm shadow-sm transition"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Daily Report (.docx)</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Today's Sessions</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{summary?.todaySessionsCount || 0}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CalendarDays className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Present</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{summary?.totalPresent || 0}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Absent</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{summary?.totalAbsent || 0}</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <UserX className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overall Attendance</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{summary?.overallPercentage || 0}%</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Percent className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Word Reports Generated</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{summary?.totalReportsGenerated || 0}</p>
          </div>
          <FileText className="w-8 h-8 text-slate-400" />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Emails Sent to Principal</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{summary?.totalEmailsSent || 0}</p>
          </div>
          <Mail className="w-8 h-8 text-emerald-500" />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Failed Email Deliveries</p>
            <p className="text-xl font-bold text-red-600 mt-1">{summary?.failedEmailsCount || 0}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
      </div>

      {/* Recent Lab Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">Recent Lab Sessions</h2>
            <button
              onClick={() => setCurrentTab('sessions')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Semester</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSessions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-slate-400 text-sm">
                      No lab sessions recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentSessions.map(session => (
                    <tr key={session.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3.5 font-medium text-slate-800">{session.attendanceDate}</td>
                      <td className="px-5 py-3.5 text-slate-600">{session.semesterName}</td>
                      <td className="px-5 py-3.5 text-slate-600">{session.subjectName}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                          {session.presentCount} / {session.totalStudents} ({session.attendancePercentage}%)
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Email History */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">Recent Email Deliveries</h2>
            <button
              onClick={() => setCurrentTab('emails')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
                  <th className="px-5 py-3">Recipient</th>
                  <th className="px-5 py-3">Attachment</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentEmails.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-slate-400 text-sm">
                      No emails sent yet.
                    </td>
                  </tr>
                ) : (
                  recentEmails.map(email => (
                    <tr key={email.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3.5 text-slate-800 truncate max-w-[150px]">{email.recipient}</td>
                      <td className="px-5 py-3.5 text-slate-600 text-xs truncate max-w-[140px]">{email.attachmentFilename}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          email.status === 'Sent' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {email.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">
                        {new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
