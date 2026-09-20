import React, { useEffect, useState } from 'react';
import { Subject, Semester } from '../types';
import { BookOpen, Plus } from 'lucide-react';

export const SubjectsManagement: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [semesterId, setSemesterId] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/subjects').then(r => r.json()),
      fetch('/api/semesters').then(r => r.json())
    ]).then(([subData, semData]) => {
      setSubjects(subData);
      setSemesters(semData);
      if (semData.length > 0) setSemesterId(semData[0].id);
    });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectCode, subjectName, semesterId, academicYear: '2026-2027', isActive: true })
    });
    setShowModal(false);
    setSubjectCode('');
    setSubjectName('');
    const res = await fetch('/api/subjects');
    setSubjects(await res.json());
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-blue-600" />
            <span>Subject Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage practical lab subjects and course codes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
              <th className="px-6 py-3.5">Subject Code</th>
              <th className="px-6 py-3.5">Subject Name</th>
              <th className="px-6 py-3.5">Semester</th>
              <th className="px-6 py-3.5">Academic Year</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subjects.map(sub => {
              const sem = semesters.find(s => s.id === sub.semesterId);
              return (
                <tr key={sub.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-semibold text-slate-800">{sub.subjectCode}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{sub.subjectName}</td>
                  <td className="px-6 py-4 text-slate-600">{sem ? sem.name : 'Unknown'}</td>
                  <td className="px-6 py-4 text-slate-600">{sub.academicYear}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add Lab Subject</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  value={subjectCode}
                  onChange={e => setSubjectCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. BCA-103"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={e => setSubjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. Advanced Data Structures Lab"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Semester</label>
                <select
                  value={semesterId}
                  onChange={e => setSemesterId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  {semesters.map(sem => (
                    <option key={sem.id} value={sem.id}>{sem.name}</option>
                  ))}
                </select>
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
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
