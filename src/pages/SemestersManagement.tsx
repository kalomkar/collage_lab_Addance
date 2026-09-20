import React, { useEffect, useState } from 'react';
import { Semester } from '../types';
import { GraduationCap, Plus } from 'lucide-react';

export const SemestersManagement: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [course, setCourse] = useState('BCA');
  const [section, setSection] = useState('A');
  const [academicYear, setAcademicYear] = useState('2026-2027');

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    const res = await fetch('/api/semesters');
    const data = await res.json();
    setSemesters(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/semesters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, course, section, academicYear, isActive: true })
    });
    setShowModal(false);
    setName('');
    fetchSemesters();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-blue-600" />
            <span>Semester Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage BCA Semesters and academic sections</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Semester</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
              <th className="px-6 py-3.5">Semester Name</th>
              <th className="px-6 py-3.5">Course</th>
              <th className="px-6 py-3.5">Section</th>
              <th className="px-6 py-3.5">Academic Year</th>
              <th className="px-6 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {semesters.map(sem => (
              <tr key={sem.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-semibold text-slate-800">{sem.name}</td>
                <td className="px-6 py-4 text-slate-600">{sem.course}</td>
                <td className="px-6 py-4 text-slate-600">{sem.section}</td>
                <td className="px-6 py-4 text-slate-600">{sem.academicYear}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add Semester</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Semester Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. BCA 7th Semester"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Course</label>
                <input
                  type="text"
                  required
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Section</label>
                <input
                  type="text"
                  required
                  value={section}
                  onChange={e => setSection(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Save Semester
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
