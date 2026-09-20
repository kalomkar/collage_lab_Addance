export type UserRole = 'admin' | 'lab_incharge' | 'principal';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface CollegeSettings {
  collegeName: string;
  address: string;
  department: string;
  logoPath?: string;
  principalName: string;
  principalEmail: string;
  senderEmail: string;
  academicYear: string;
  reportTitle: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword?: string;
  smtpUseTls: boolean;
  smtpUseSsl: boolean;
}

export interface Semester {
  id: string;
  name: string;
  course: string;
  section: string;
  academicYear: string;
  isActive: boolean;
}

export interface Student {
  id: string;
  rollNumber: string;
  enrollmentNumber: string;
  name: string;
  semesterId: string;
  academicYear: string;
  section: string;
  isActive: boolean;
  createdAt: string;
}

export interface Subject {
  id: string;
  subjectCode: string;
  subjectName: string;
  semesterId: string;
  academicYear: string;
  isActive: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  email: string;
  isActive: boolean;
}

export interface LabSession {
  id: string;
  attendanceDate: string;
  semesterId: string;
  subjectId: string;
  teacherId: string;
  labRoom: string;
  startTime: string;
  endTime: string;
  remarks: string;
  status: 'draft' | 'finalized';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // Joined fields for display
  semesterName?: string;
  subjectCode?: string;
  subjectName?: string;
  teacherName?: string;
  totalStudents?: number;
  presentCount?: number;
  absentCount?: number;
  attendancePercentage?: number;
}

export interface AttendanceRecord {
  id: string;
  labSessionId: string;
  studentId: string;
  attendanceStatus: 'Present' | 'Absent';
  markedAt: string;
  markedBy: string;

  // Joined fields
  rollNumber?: string;
  enrollmentNumber?: string;
  studentName?: string;
}

export interface GeneratedReport {
  id: string;
  reportDate: string;
  filename: string;
  filePath: string;
  generatedBy: string;
  generatedAt: string;
}

export interface EmailHistoryRecord {
  id: string;
  reportId?: string;
  recipient: string;
  subject: string;
  attachmentFilename: string;
  status: 'Sent' | 'Failed' | 'Pending';
  errorMessage?: string;
  sentBy: string;
  sentAt: string;
}

export interface DashboardSummary {
  todaySessionsCount: number;
  todayAttendanceEntries: number;
  totalPresent: number;
  totalAbsent: number;
  overallPercentage: number;
  totalReportsGenerated: number;
  totalEmailsSent: number;
  failedEmailsCount: number;
}
