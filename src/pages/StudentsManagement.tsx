import React, { useEffect, useState } from 'react';
import { Student, Semester } from '../types';
import { Users, Plus, Upload, Trash2, Search, CheckCircle2 } from 'lucide-react';

export const StudentsManagement: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemId, setSelectedSemId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [rollNumber, setRollNumber] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [name, setName] = useState('');

  // CSV Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/semesters')
      .then(r => r.json())
      .then(data => {
        setSemesters(data);
        if (data.length > 0) setSelectedSemId(data[0].id);
      });
  }, []);

  useEffect(() => {
    if (selectedSemId) {
      fetchStudents();
    }
  }, [selectedSemId]);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`/api/students?semesterId=${selectedSemId}`);
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students', err);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNumber,
          enrollmentName: enrollmentNumber,
          name,
          semesterId: selectedSemId,
          academicYear: '2026-2027',
          section: 'A',
          isActive: true
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setRollNumber('');
        setEnrollmentNumber('');
        setName('');
        fetchStudents();
      }
    } catch (err) {
      console.error('Error adding student', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      await fetch(`/api/students/${id}`, { method: 'DELETE' });
      fetchStudents();
    }
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('semesterId', selectedSemId);

    try {
      const res = await fetch('/api/students/import', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message);
        setShowImportModal(false);
        setImportFile(null);
        fetchStudents();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert(data.error || 'Import failed.');
      }
    } catch (err) {
      alert('Error uploading CSV file.');
    } finally {
      setImporting(false);
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            <span>Student Directory</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage registered students per semester and import via CSV</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium shadow-sm transition"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-semibold uppercase text-slate-600">Select Semester:</label>
          <select
            value={selectedSemId}
            onChange={e => setSelectedSemId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-600"
          >
            {semesters.map(sem => (
              <option key={sem.id} value={sem.id}>{sem.name}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search student name or roll no..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
                <th className="px-6 py-3.5">Roll No.</th>
                <th className="px-6 py-3.5">Enrollment No.</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Academic Year</th>
                <th className="px-6 py-3.5">Section</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No students registered in this semester.</td>
                </tr>
              ) : (
                filtered.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3.5 font-semibold text-slate-800">{student.rollNumber}</td>
                    <td className="px-6 py-3.5 text-slate-600 font-mono text-xs">{(student as any).enrollmentName || '—'}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-900">{student.name}</td>
                    <td className="px-6 py-3.5 text-slate-600 text-xs">{student.academicYear}</td>
                    <td className="px-6 py-3.5 text-slate-600 text-xs">{student.section}</td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add New Student</h2>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Roll Number</label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={e => setRollNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. 106"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Enrollment Number</label>
                <input
                  type="text"
                  value={enrollmentNumber}
                  onChange={e => setEnrollmentNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. ENR2026006"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Import Students from CSV</h2>
            <p className="text-xs text-slate-500">CSV file must contain columns: <code className="bg-slate-100 px-1 py-0.5 rounded">rollNumber, name, enrollmentNumber</code></p>
            <form onSubmit={handleImportCsv} className="space-y-4">
              <div>
                <input
                  type="file"
                  accept=".csv"
                  required
                  onChange={e => setImportFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  {importing ? 'Importing...' : 'Upload & Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
