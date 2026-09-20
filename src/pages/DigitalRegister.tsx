import React, { useEffect, useState } from 'react';
import { Database, Search } from 'lucide-react';
import { LabSession } from '../types';

export const DigitalRegister: React.FC = () => {
  const [sessions, setSessions] = useState<LabSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lab-sessions')
      .then(r => r.json())
      .then(data => {
        setSessions(data);
        setLoading(false);
      });
  }, []);

  const filtered = sessions.filter(s =>
    s.attendanceDate.includes(searchTerm) ||
    s.semesterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.teacherName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-7 h-7 text-blue-600" />
            <span>Digital Attendance Register</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Searchable digital archives of all lab sessions and attendance logs</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by date (YYYY-MM-DD), semester, subject, or teacher..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600"
          />
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
                <th className="px-6 py-3.5">Room & Time</th>
                <th className="px-6 py-3.5">Present / Total</th>
                <th className="px-6 py-3.5">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">Loading register records...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">No attendance records found.</td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-800">{s.attendanceDate}</td>
                    <td className="px-6 py-4 text-slate-600">{s.semesterName}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{s.subjectCode} - {s.subjectName}</td>
                    <td className="px-6 py-4 text-slate-600">{s.teacherName}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      <div>{s.startTime} - {s.endTime}</div>
                      <div className="text-slate-400">{s.labRoom}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-semibold">{s.presentCount} / {s.totalStudents}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        {s.attendancePercentage}%
                      </span>
                    </td>
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
