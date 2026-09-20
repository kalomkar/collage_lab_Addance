import fs from 'fs';
import path from 'path';
import { User, CollegeSettings, Semester, Student, Subject, Teacher, LabSession, AttendanceRecord, GeneratedReport, EmailHistoryRecord } from '../src/types';

interface DatabaseSchema {
  users: User[];
  settings: CollegeSettings;
  semesters: Semester[];
  students: Student[];
  subjects: Subject[];
  teachers: Teacher[];
  labSessions: LabSession[];
  attendanceRecords: AttendanceRecord[];
  generatedReports: GeneratedReport[];
  emailHistory: EmailHistoryRecord[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const defaultData: DatabaseSchema = {
  users: [
    {
      id: 'u-admin-main',
      name: 'Amrutha Patil',
      email: 'amruthapatil3355@gmail.com',
      password: '@dm!n',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'u-admin-1',
      name: 'System Administrator',
      email: 'admin@college.edu',
      password: 'admin123',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'u-lab-1',
      name: 'Prof. Ramesh Kumar (Lab In-Charge)',
      email: 'lab@college.edu',
      password: 'lab123',
      role: 'lab_incharge',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  settings: {
    collegeName: 'Government BCA College & Technology Institute',
    address: 'Tech Campus, Main Road, City - 585101',
    department: 'Department of Computer Applications (BCA)',
    principalName: 'Dr. V. S. Deshmukh',
    principalEmail: 'principal@college.edu',
    senderEmail: 'lab-system@college.edu',
    academicYear: '2026-2027',
    reportTitle: 'COMPUTER LAB DAILY ATTENDANCE REPORT',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: 'lab-system@college.edu',
    smtpPassword: '',
    smtpUseTls: true,
    smtpUseSsl: false
  },
  semesters: [
    { id: 'sem-1', name: 'BCA 1st Semester', course: 'BCA', section: 'A', academicYear: '2026-2027', isActive: true },
    { id: 'sem-3', name: 'BCA 3rd Semester', course: 'BCA', section: 'A', academicYear: '2026-2027', isActive: true },
    { id: 'sem-5', name: 'BCA 5th Semester', course: 'BCA', section: 'A', academicYear: '2026-2027', isActive: true }
  ],
  students: [
    { id: 'stu-101', rollNumber: '101', enrollmentName: 'ENR2026001', name: 'Aarav Sharma', semesterId: 'sem-1', academicYear: '2026-2027', section: 'A', isActive: true, createdAt: new Date().toISOString() } as any,
    { id: 'stu-102', rollNumber: '102', enrollmentName: 'ENR2026002', name: 'Ananya Patel', semesterId: 'sem-1', academicYear: '2026-2027', section: 'A', isActive: true, createdAt: new Date().toISOString() } as any,
    { id: 'stu-103', rollNumber: '103', enrollmentName: 'ENR2026003', name: 'Rohan Gupta', semesterId: 'sem-1', academicYear: '2026-2027', section: 'A', isActive: true, createdAt: new Date().toISOString() } as any,
    { id: 'stu-104', rollNumber: '104', enrollmentName: 'ENR2026004', name: 'Priya Verma', semesterId: 'sem-1', academicYear: '2026-2027', section: 'A', isActive: true, createdAt: new Date().toISOString() } as any,
    { id: 'stu-105', rollNumber: '105', enrollmentName: 'ENR2026005', name: 'Vikram Singh', semesterId: 'sem-1', academicYear: '2026-2027', section: 'A', isActive: true, createdAt: new Date().toISOString() } as any,
    
    { id: 'stu-301', rollNumber: '301', enrollmentName: 'ENR2025001', name: 'Aditi Joshi', semesterId: 'sem-3', academicYear: '2026-2027', section: 'A', isActive: true, createdAt: new Date().toISOString() } as any,
    { id: 'stu-302', rollNumber: '302', enrollmentName: 'ENR2025002', name: 'Karan Malhotra', semesterId: 'sem-3', academicYear: '2026-2027', section: 'A', isActive: true, createdAt: new Date().toISOString() } as any,
    { id: 'stu-303', rollNumber: '303', enrollmentName: 'ENR2025003', name: 'Neha Kulkarni', semesterId: 'sem-3', academicYear: '2026-2027', section: 'A', isActive: true, createdAt: new Date().toISOString() } as any,
    { id: 'stu-304', rollNumber: '304', enrollmentName: 'ENR2025004', name: 'Rahul Deshmukh', semesterId: 'sem-3', academicYear: '2026-2027', section: 'A', isActive: true, createdAt: new Date().toISOString() } as any,

    { id: 'stu-501', rollNumber: '501', enrollmentName: 'ENR2024001', name: 'Sneha Reddy', semesterId: 'sem-5', academicYear: '2026-2027', section: 'A', isActive: true, createdAt: new Date().toISOString() } as any,
    { id: 'stu-502', rollNumber: '502', enrollmentName: 'ENR2024002', name: 'Amit Kulkarni', semesterId: 'sem-5', academicYear: '2026-2027', section: 'A', isActive: true, createdAt: new Date().toISOString() } as any,
    { id: 'stu-503', rollNumber: '503', enrollmentName: 'ENR2024003', name: 'Pooja Hegde', semesterId: 'sem-5', academicYear: '2026-2027', section: 'A', isActive: true, createdAt: new Date().toISOString() } as any
  ],
  subjects: [
    { id: 'sub-1', subjectCode: 'BCA-101', subjectName: 'C Programming Lab', semesterId: 'sem-1', academicYear: '2026-2027', isActive: true },
    { id: 'sub-2', subjectCode: 'BCA-102', subjectName: 'PC Software & Office Lab', semesterId: 'sem-1', academicYear: '2026-2027', isActive: true },
    { id: 'sub-3', subjectCode: 'BCA-301', subjectName: 'Data Structures & DBMS Lab', semesterId: 'sem-3', academicYear: '2026-2027', isActive: true },
    { id: 'sub-4', subjectCode: 'BCA-302', subjectName: 'Object Oriented Programming (C++) Lab', semesterId: 'sem-3', academicYear: '2026-2027', isActive: true },
    { id: 'sub-5', subjectCode: 'BCA-501', subjectName: 'Python & Web Programming Lab', semesterId: 'sem-5', academicYear: '2026-2027', isActive: true },
    { id: 'sub-6', subjectCode: 'BCA-502', subjectName: 'Java & Android Lab', semesterId: 'sem-5', academicYear: '2026-2027', isActive: true }
  ],
  teachers: [
    { id: 't-1', name: 'Mrs. Sunita Patil', employeeId: 'EMP-012', department: 'Computer Science', email: 'sunita.patil@college.edu', isActive: true },
    { id: 't-2', name: 'Mr. Anand Kulkarni', employeeId: 'EMP-018', department: 'Computer Science', email: 'anand.kulkarni@college.edu', isActive: true },
    { id: 't-3', name: 'Dr. Rajeshwari Swami', employeeId: 'EMP-024', department: 'Computer Science', email: 'rajeshwari.swami@college.edu', isActive: true }
  ],
  labSessions: [],
  attendanceRecords: [],
  generatedReports: [],
  emailHistory: []
};

class JsonDatabase {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      this.data = defaultData;
      this.save();
    } else {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure all collections exist
        if (!this.data.users) this.data.users = defaultData.users;
        // Ensure primary admin amruthapatil3355@gmail.com is present in users
        const primaryAdmin = defaultData.users.find(u => u.email === 'amruthapatil3355@gmail.com');
        if (primaryAdmin && !this.data.users.some(u => u.email.toLowerCase() === primaryAdmin.email.toLowerCase())) {
          this.data.users.unshift(primaryAdmin);
        }
        if (!this.data.settings) this.data.settings = defaultData.settings;
        if (!this.data.semesters) this.data.semesters = defaultData.semesters;
        if (!this.data.students) this.data.students = defaultData.students;
        if (!this.data.subjects) this.data.subjects = defaultData.subjects;
        if (!this.data.teachers) this.data.teachers = defaultData.teachers;
        if (!this.data.labSessions) this.data.labSessions = [];
        if (!this.data.attendanceRecords) this.data.attendanceRecords = [];
        if (!this.data.generatedReports) this.data.generatedReports = [];
        if (!this.data.emailHistory) this.data.emailHistory = [];
      } catch (err) {
        console.error('Error reading db.json, falling back to defaults', err);
        this.data = defaultData;
        this.save();
      }
    }
  }

  private save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  public saveData(newData: DatabaseSchema) {
    this.data = newData;
    this.save();
  }

  // Generic helpers
  public getSettings() {
    return this.data.settings;
  }

  public updateSettings(newSettings: Partial<CollegeSettings>) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
    return this.data.settings;
  }

  public getUsers() {
    return this.data.users;
  }

  public getSemesters() {
    return this.data.semesters;
  }

  public addSemester(sem: Omit<Semester, 'id'>) {
    const newSem: Semester = { id: `sem-${Date.now()}`, ...sem };
    this.data.semesters.push(newSem);
    this.save();
    return newSem;
  }

  public getStudents(semesterId?: string) {
    if (semesterId) {
      return this.data.students.filter(s => s.semesterId === semesterId);
    }
    return this.data.students;
  }

  public addStudent(stu: Omit<Student, 'id' | 'createdAt'>) {
    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...stu
    };
    this.data.students.push(newStudent);
    this.save();
    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Student>) {
    const idx = this.data.students.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.students[idx] = { ...this.data.students[idx], ...updates };
      this.save();
      return this.data.students[idx];
    }
    return null;
  }

  public deleteStudent(id: string) {
    this.data.students = this.data.students.filter(s => s.id !== id);
    this.save();
    return true;
  }

  public getSubjects(semesterId?: string) {
    if (semesterId) {
      return this.data.subjects.filter(s => s.semesterId === semesterId);
    }
    return this.data.subjects;
  }

  public addSubject(sub: Omit<Subject, 'id'>) {
    const newSubject: Subject = { id: `sub-${Date.now()}`, ...sub };
    this.data.subjects.push(newSubject);
    this.save();
    return newSubject;
  }

  public getTeachers() {
    return this.data.teachers;
  }

  public addTeacher(t: Omit<Teacher, 'id'>) {
    const newTeacher: Teacher = { id: `t-${Date.now()}`, ...t };
    this.data.teachers.push(newTeacher);
    this.save();
    return newTeacher;
  }

  public getLabSessions(date?: string) {
    let sessions = this.data.labSessions;
    if (date) {
      sessions = sessions.filter(s => s.attendanceDate === date);
    }
    // Enrich with joined data
    return sessions.map(session => {
      const semester = this.data.semesters.find(sem => sem.id === session.semesterId);
      const subject = this.data.subjects.find(sub => sub.id === session.subjectId);
      const teacher = this.data.teachers.find(t => t.id === session.teacherId);
      
      const records = this.data.attendanceRecords.filter(r => r.labSessionId === session.id);
      const totalStudents = records.length;
      const presentCount = records.filter(r => r.attendanceStatus === 'Present').length;
      const absentCount = records.filter(r => r.attendanceStatus === 'Absent').length;
      const attendancePercentage = totalStudents > 0 ? Number(((presentCount / totalStudents) * 100).toFixed(1)) : 0;

      return {
        ...session,
        semesterName: semester ? semester.name : 'Unknown Semester',
        subjectCode: subject ? subject.subjectCode : 'SUB',
        subjectName: subject ? subject.subjectName : 'Unknown Subject',
        teacherName: teacher ? teacher.name : 'Unknown Teacher',
        totalStudents,
        presentCount,
        absentCount,
        attendancePercentage
      };
    });
  }

  public createLabSession(sessionData: Omit<LabSession, 'id' | 'createdAt' | 'updatedAt'>, records: { studentId: string; attendanceStatus: 'Present' | 'Absent' }[]) {
    const sessionId = `session-${Date.now()}`;
    const now = new Date().toISOString();
    
    const newSession: LabSession = {
      id: sessionId,
      ...sessionData,
      createdAt: now,
      updatedAt: now
    };

    this.data.labSessions.push(newSession);

    // Remove any existing attendance records for this session if updating
    this.data.attendanceRecords = this.data.attendanceRecords.filter(r => r.labSessionId !== sessionId);

    // Add attendance records
    for (const rec of records) {
      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        labSessionId: sessionId,
        studentId: rec.studentId,
        attendanceStatus: rec.attendanceStatus,
        markedAt: now,
        markedBy: sessionData.createdBy
      };
      this.data.attendanceRecords.push(newRecord);
    }

    this.save();
    return newSession;
  }

  public getAttendanceRecordsForSession(sessionId: string) {
    const records = this.data.attendanceRecords.filter(r => r.labSessionId === sessionId);
    return records.map(rec => {
      const student = this.data.students.find(s => s.id === rec.studentId);
      return {
        ...rec,
        rollNumber: student ? student.rollNumber : '',
        enrollmentNumber: (student as any)?.enrollmentName || '',
        studentName: student ? student.name : 'Unknown Student'
      };
    });
  }

  public getGeneratedReports() {
    return this.data.generatedReports;
  }

  public addGeneratedReport(report: Omit<GeneratedReport, 'id' | 'generatedAt'>) {
    const newRep: GeneratedReport = {
      id: `rep-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      ...report
    };
    this.data.generatedReports.push(newRep);
    this.save();
    return newRep;
  }

  public getEmailHistory() {
    return this.data.emailHistory;
  }

  public addEmailHistory(history: Omit<EmailHistoryRecord, 'id' | 'sentAt'>) {
    const newHist: EmailHistoryRecord = {
      id: `email-${Date.now()}`,
      sentAt: new Date().toISOString(),
      ...history
    };
    this.data.emailHistory.push(newHist);
    this.save();
    return newHist;
  }
}

export const db = new JsonDatabase();
