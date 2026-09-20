import React, { useEffect, useState } from 'react';
import { LabSession } from '../types';
import { CalendarDays, Search, FileText } from 'lucide-react';

export const LabSessionsList: React.FC<{ setCurrentTab: (tab: string) => void }> = ({ setCurrentTab }) => {
  const [sessions, setSessions] = useState<LabSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchSessions();
  }, [filterDate]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const url = filterDate ? `/api/lab-sessions?date=${filterDate}` : '/api/lab-sessions';
      const res = await fetch(url);
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error('Error fetching sessions', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-blue-600" />
            <span>Lab Sessions Log</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">View all conducted computer lab sessions and attendance counts</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Clear Filter
            </button>
          )}
          <button
            onClick={() => setCurrentTab('reports')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
          >
            <FileText className="w-4 h-4" />
            <span>Daily Reports</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Semester</th>
                <th className="px-6 py-3.5">Subject</th>
                <th className="px-6 py-3.5">Teacher</th>
                <th className="px-6 py-3.5">Timing & Room</th>
                <th className="px-6 py-3.5">Attendance</th>
                <th className="px-6 py-3.5">Created By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">Loading sessions...</td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">No lab sessions found.</td>
                </tr>
              ) : (
                sessions.map(session => (
                  <tr key={session.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-800">{session.attendanceDate}</td>
                    <td className="px-6 py-4 text-slate-600">{session.semesterName}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{session.subjectCode} - {session.subjectName}</td>
                    <td className="px-6 py-4 text-slate-600">{session.teacherName}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      <div>{session.startTime} - {session.endTime}</div>
                      <div className="text-slate-400">{session.labRoom}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        {session.presentCount} / {session.totalStudents} ({session.attendancePercentage}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{session.createdBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
