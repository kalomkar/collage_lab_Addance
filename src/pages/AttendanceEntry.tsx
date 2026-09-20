import React, { useState, useEffect } from 'react';
import { Semester, Subject, Teacher, Student, User } from '../types';
import { ClipboardCheck, CheckCircle2, Search, Save, AlertCircle } from 'lucide-react';

interface AttendanceEntryProps {
  user: User;
  onSuccess: () => void;
}

export const AttendanceEntry: React.FC<AttendanceEntryProps> = ({ user, onSuccess }) => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [labRoom, setLabRoom] = useState('Lab-1 (Ground Floor)');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [remarks, setRemarks] = useState('Regular practical session conducted successfully.');

  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'Present' | 'Absent'>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Load initial reference data
    Promise.all([
      fetch('/api/semesters').then(r => r.json()),
      fetch('/api/teachers').then(r => r.json())
    ]).then(([semData, teacherData]) => {
      setSemesters(semData);
      setTeachers(teacherData);
      if (semData.length > 0) {
        setSelectedSemesterId(semData[0].id);
      }
      if (teacherData.length > 0) {
        setSelectedTeacherId(teacherData[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedSemesterId) {
      // Load subjects and students for selected semester
      Promise.all([
        fetch(`/api/subjects?semesterId=${selectedSemesterId}`).then(r => r.json()),
        fetch(`/api/students?semesterId=${selectedSemesterId}`).then(r => r.json())
      ]).then(([subData, stuData]) => {
        setSubjects(subData);
        if (subData.length > 0) {
          setSelectedSubjectId(subData[0].id);
        } else {
          setSelectedSubjectId('');
        }
        setStudents(stuData);
        
        // Initialize all students as Present by default
        const initialMap: Record<string, 'Present' | 'Absent'> = {};
        stuData.forEach((s: Student) => {
          initialMap[s.id] = 'Present';
        });
        setAttendanceMap(initialMap);
      });
    } else {
      setSubjects([]);
      setStudents([]);
      setAttendanceMap({});
    }
  }, [selectedSemesterId]);

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent') => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: 'Present' | 'Absent') => {
    const updated: Record<string, 'Present' | 'Absent'> = {};
    students.forEach(s => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const totalStudents = students.length;
  const presentCount = Object.values(attendanceMap).filter(v => v === 'Present').length;
  const absentCount = totalStudents - presentCount;
  const attendancePercentage = totalStudents > 0 ? Number(((presentCount / totalStudents) * 100).toFixed(1)) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedSemesterId || !selectedSubjectId || !selectedTeacherId) {
      setErrorMsg('Please select semester, subject, and teacher.');
      return;
    }

    if (totalStudents === 0) {
      setErrorMsg('No students registered in this semester. Please add students first.');
      return;
    }

    setSubmitting(true);
    try {
      const records = students.map(s => ({
        studentId: s.id,
        attendanceStatus: attendanceMap[s.id] || 'Present'
      }));

      const payload = {
        sessionData: {
          attendanceDate: selectedDate,
          semesterId: selectedSemesterId,
          subjectId: selectedSubjectId,
          teacherId: selectedTeacherId,
          labRoom,
          startTime,
          endTime,
          remarks,
          status: 'finalized',
          createdBy: user.name
        },
        attendanceRecords: records
      };

      const res = await fetch('/api/lab-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Lab attendance successfully recorded and saved to database!');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setErrorMsg(data.error || 'Failed to save attendance.');
      }
    } catch (err: any) {
      setErrorMsg('Network error while saving attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s as any).enrollmentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-blue-600" />
            <span>Mark Lab Attendance</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Record session details and mark student attendance</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Session Configuration Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Date</label>
            <input
              type="date"
              required
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Semester</label>
            <select
              value={selectedSemesterId}
              onChange={e => setSelectedSemesterId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-600"
            >
              {semesters.map(sem => (
                <option key={sem.id} value={sem.id}>{sem.name} ({sem.course} - Sec {sem.section})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Subject / Lab</label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-600"
            >
              {subjects.length === 0 ? (
                <option value="">No subjects found for this semester</option>
              ) : (
                subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.subjectCode} — {sub.subjectName}</option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Subject Teacher</label>
            <select
              value={selectedTeacherId}
              onChange={e => setSelectedTeacherId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-600"
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Lab Room</label>
            <input
              type="text"
              value={labRoom}
              onChange={e => setLabRoom(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Session Remarks / Notes</label>
            <input
              type="text"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Attendance Marking Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="font-bold text-slate-900 text-base">Student Attendance List</h2>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">Total: {totalStudents}</span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">Present: {presentCount}</span>
                <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-lg">Absent: {absentCount}</span>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">Ratio: {attendancePercentage}%</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search student or roll no..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <button
                type="button"
                onClick={() => markAll('Present')}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => markAll('Absent')}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition"
              >
                All Absent
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[450px]">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200 z-10">
                <tr>
                  <th className="px-6 py-3 w-16">Sl No.</th>
                  <th className="px-6 py-3">Roll No.</th>
                  <th className="px-6 py-3">Enrollment No.</th>
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3 text-center">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">
                      {students.length === 0 ? 'No students found in this semester. Please add students first.' : 'No students matching search.'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => {
                    const status = attendanceMap[student.id] || 'Present';
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3.5 text-slate-500 font-medium">{idx + 1}</td>
                        <td className="px-6 py-3.5 font-semibold text-slate-800">{student.rollNumber}</td>
                        <td className="px-6 py-3.5 text-slate-600 font-mono text-xs">{(student as any).enrollmentName || '—'}</td>
                        <td className="px-6 py-3.5 font-medium text-slate-900">{student.name}</td>
                        <td className="px-6 py-3.5 text-center">
                          <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200 gap-1">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'Present')}
                              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                                status === 'Present'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'Absent')}
                              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                                status === 'Absent'
                                  ? 'bg-red-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
            <button
              type="submit"
              disabled={submitting || totalStudents === 0}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving Session...' : 'Finalize & Save Attendance'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
