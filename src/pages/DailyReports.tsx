import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Mail, CheckCircle2, AlertCircle, Calendar, 
  Send, LogIn, LogOut, ShieldCheck, HelpCircle, Loader2, Users, ChevronDown, ChevronUp
} from 'lucide-react';
import { LabSession, User } from '../types';
import { initAuth, googleSignIn, googleSignOut, getAccessToken } from '../services/googleAuth';
import { sendEmailViaGmailApi } from '../services/gmailService';
import type { User as FirebaseUser } from 'firebase/auth';

export const DailyReports: React.FC<{ user: User }> = ({ user }) => {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessions, setSessions] = useState<LabSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [generatedFilename, setGeneratedFilename] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Expanded sessions to preview student names
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [sessionStudents, setSessionStudents] = useState<Record<string, any[]>>({});
  const [loadingStudents, setLoadingStudents] = useState<Record<string, boolean>>({});

  const toggleSessionExpand = async (sessionId: string) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
      return;
    }
    setExpandedSessionId(sessionId);
    if (!sessionStudents[sessionId]) {
      setLoadingStudents(prev => ({ ...prev, [sessionId]: true }));
      try {
        const res = await fetch(`/api/lab-sessions/${sessionId}/attendance`);
        if (res.ok) {
          const records = await res.json();
          setSessionStudents(prev => ({ ...prev, [sessionId]: records }));
        }
      } catch (err) {
        console.error('Failed to load session student attendance records', err);
      } finally {
        setLoadingStudents(prev => ({ ...prev, [sessionId]: false }));
      }
    }
  };

  // Google OAuth / Gmail API state
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [hasGoogleToken, setHasGoogleToken] = useState(false);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [sendMethod, setSendMethod] = useState<'gmail' | 'smtp'>('gmail');
  const [principalEmail, setPrincipalEmail] = useState('srnmehtacollegekalburgi@gmail.com');
  const [collegeName, setCollegeName] = useState('SRN Mehta College');

  // Confirmation modal state for sending email (mandatory destructive / mutating operation requirement)
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchSessionsForDate();
    fetchCollegeSettings();

    // Listen for Google Auth state
    const unsubscribe = initAuth(
      (fbUser, token) => {
        setGoogleUser(fbUser);
        setHasGoogleToken(!!token);
      },
      () => {
        setGoogleUser(null);
        setHasGoogleToken(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [reportDate]);

  const fetchCollegeSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.principalEmail) setPrincipalEmail(data.principalEmail);
        if (data.collegeName) setCollegeName(data.collegeName);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const fetchSessionsForDate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lab-sessions?date=${reportDate}`);
      const data = await res.json();
      setSessions(data);
      setGeneratedFilename(`BCA_Lab_Daily_Attendance_Report_${reportDate}.docx`);
    } catch (err) {
      console.error('Error fetching sessions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSigningInGoogle(true);
    setMessage('');
    setError('');
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setHasGoogleToken(true);
        setMessage(`Connected to Google as ${result.user.email}! Gmail API is ready for automated sending.`);
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await googleSignOut();
      setGoogleUser(null);
      setHasGoogleToken(false);
      setMessage('Disconnected from Google account.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: reportDate, username: user.name })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedFilename(data.filename);
        setMessage('Word report (.docx) generated successfully!');
      } else {
        setError(data.error || 'Failed to generate report.');
      }
    } catch (err) {
      setError('Network error during report generation.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    window.open(`/api/reports/${generatedFilename}/download`, '_blank');
  };

  // Trigger confirmation dialog
  const promptSendEmail = () => {
    if (sessions.length === 0) {
      setError(`No attendance sessions recorded for ${reportDate}. Please record lab attendance first.`);
      return;
    }
    setShowConfirmModal(true);
  };

  // Perform actual email dispatch
  const executeSendEmail = async () => {
    setShowConfirmModal(false);
    setMessage('');
    setError('');

    try {
      let token = await getAccessToken();

      // If user selected Gmail API but hasn't signed in yet, seamlessly prompt Google Sign-In right now
      if (sendMethod === 'gmail' && !token) {
        setIsSigningInGoogle(true);
        try {
          const authResult = await googleSignIn();
          if (!authResult) {
            // User closed the popup without signing in
            return;
          }
          setGoogleUser(authResult.user);
          setHasGoogleToken(true);
          token = authResult.accessToken;
        } finally {
          setIsSigningInGoogle(false);
        }
      }

      setSendingEmail(true);

      // Step 1: Ensure report exists or generate it
      const genRes = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: reportDate, username: user.name })
      });
      const genData = await genRes.json();
      const currentFilename = genData.filename || generatedFilename;
      setGeneratedFilename(currentFilename);

      if (sendMethod === 'gmail') {
        // --- Gmail API Flow ---
        if (!token) {
          throw new Error('You must complete Google Sign-In to send via Gmail API.');
        }

        // Fetch Word docx base64
        const fileRes = await fetch(`/api/reports/${currentFilename}/base64`);
        if (!fileRes.ok) {
          throw new Error('Unable to retrieve the Word report file from the server.');
        }
        const fileData = await fileRes.json();

        const subject = `BCA Computer Lab Daily Attendance Report – ${reportDate}`;
        const bodyText = `Respected Principal Sir/Madam,\n\nPlease find attached the Computer Lab Daily Attendance Report for ${reportDate}.\n\nTotal Sessions: ${sessions.length}\nTotal Attendance: ${totalPresent} / ${totalEntries} (${overallPercentage}%)\n\nThis report has been automatically dispatched via Google Gmail API from the College Lab Attendance System.\n\nRegards,\n${user.name}\nComputer Lab In-Charge\n${collegeName}`;

        await sendEmailViaGmailApi({
          to: principalEmail,
          from: googleUser?.email || undefined,
          subject,
          bodyText,
          attachmentFilename: currentFilename,
          attachmentBase64: fileData.base64
        });

        // Record history in backend database
        await fetch('/api/email/record-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: principalEmail,
            subject,
            attachmentFilename: currentFilename,
            status: 'Sent',
            sentBy: `${user.name} (Gmail API: ${googleUser?.email})`
          })
        });

        setMessage(`✓ Attendance report successfully sent via Gmail API directly to the Principal at ${principalEmail}!`);
      } else {
        // --- SMTP Fallback Flow ---
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        try {
          const res = await fetch('/api/email/send-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: reportDate, username: user.name, recipientEmail: principalEmail }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          const data = await res.json();
          if (res.ok && data.success) {
            setMessage(data.message);
          } else {
            setError(data.error || 'Failed to send email via SMTP.');
          }
        } catch (err: any) {
          clearTimeout(timeoutId);
          if (err.name === 'AbortError') {
            setError('SMTP connection timed out. Switch to Gmail API above for instant, 100% reliable cloud delivery.');
          } else {
            setError(err.message || 'Failed to send email via SMTP.');
          }
        }
      }
    } catch (err: any) {
      console.error('Send email error:', err);
      setError(err.message || 'Failed to dispatch report.');
      // Record failed history
      fetch('/api/email/record-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: principalEmail,
          subject: `BCA Computer Lab Daily Attendance Report – ${reportDate}`,
          attachmentFilename: generatedFilename,
          status: 'Failed',
          sentBy: `${user.name} (${sendMethod.toUpperCase()})`,
          errorMessage: err.message
        })
      }).catch(() => {});
    } finally {
      setSendingEmail(false);
    }
  };

  const totalEntries = sessions.reduce((acc, s) => acc + (s.totalStudents || 0), 0);
  const totalPresent = sessions.reduce((acc, s) => acc + (s.presentCount || 0), 0);
  const totalAbsent = sessions.reduce((acc, s) => acc + (s.absentCount || 0), 0);
  const overallPercentage = totalEntries > 0 ? Number(((totalPresent / totalEntries) * 100).toFixed(1)) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            <span>Daily Report Automation (.docx)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate official Microsoft Word reports and deliver them automatically to the Principal via Gmail API
          </p>
        </div>

        {/* Google Account Status Badge */}
        <div className="flex items-center gap-2">
          {googleUser ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Gmail Connected: <strong>{googleUser.email}</strong></span>
              <button
                onClick={handleGoogleLogout}
                title="Disconnect Google Account"
                className="ml-2 text-slate-400 hover:text-red-600 p-0.5"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={isSigningInGoogle}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>{isSigningInGoogle ? 'Connecting...' : 'Sign in with Google for Gmail API'}</span>
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Gmail API Banner if not connected */}
      {!googleUser && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-blue-900">Direct Gmail Integration Enabled</h4>
              <p className="text-xs text-blue-700 mt-0.5">
                Authenticate with your college Google account once to automatically dispatch daily reports to the Principal with zero SMTP timeout issues on cloud servers.
              </p>
            </div>
          </div>
          <button
            onClick={handleGoogleLogin}
            disabled={isSigningInGoogle}
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Connect Gmail Now</span>
          </button>
        </div>
      )}

      {/* Date selector and action bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <label className="text-xs font-semibold uppercase text-slate-600">Select Report Date:</label>
            <input
              type="date"
              value={reportDate}
              onChange={e => setReportDate(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-600 font-medium"
            />
          </div>

          {/* Delivery Method Selector */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setSendMethod('gmail')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                sendMethod === 'gmail' 
                  ? 'bg-white text-blue-600 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Gmail API (Recommended)</span>
            </button>
            <button
              onClick={() => setSendMethod('smtp')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                sendMethod === 'smtp' 
                  ? 'bg-white text-slate-800 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Legacy SMTP</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Recipient Principal: <strong className="text-slate-800">{principalEmail}</strong>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={generating || sessions.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              <span>{generating ? 'Generating...' : 'Generate Word Report'}</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Download .docx</span>
            </button>

            <button
              onClick={promptSendEmail}
              disabled={sendingEmail || sessions.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50"
            >
              {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              <span>{sendingEmail ? 'Sending...' : 'Send to Principal'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Destructive/Mutating Operations (Sending Email to Principal) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Mail className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Confirm Email Dispatch</h3>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to send the <strong>Daily Lab Attendance Report</strong> for <strong>{reportDate}</strong> to the Principal?
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Recipient:</span>
                <span className="font-medium text-slate-900">{principalEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Delivery Method:</span>
                <span className="font-medium text-blue-600">{sendMethod === 'gmail' ? 'Gmail API (Direct)' : 'SMTP Mail Server'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Sender Account:</span>
                <span className="font-medium text-slate-900">{sendMethod === 'gmail' ? (googleUser?.email || 'Current Google Account') : user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Attachment:</span>
                <span className="font-mono text-slate-800">{generatedFilename}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Total Sessions:</span>
                <span className="font-medium text-slate-900">{sessions.length} sessions ({overallPercentage}% attendance)</span>
              </div>
            </div>

            {sendMethod === 'gmail' && !googleUser && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                ⚠️ You are not signed into Google yet. Clicking confirm will prompt Google sign-in to authorize sending this email.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={executeSendEmail}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
              >
                <Send className="w-4 h-4" />
                <span>Confirm & Send Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Preview Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
        <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Report Preview: {reportDate}</h2>
            <p className="text-xs text-slate-500">Filename: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">{generatedFilename}</code></p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Sessions Conducted</p>
            <p className="text-xl font-bold text-blue-600">{sessions.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 uppercase font-semibold">Total Students</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totalEntries}</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <p className="text-xs text-emerald-700 uppercase font-semibold">Present</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{totalPresent}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-xs text-red-700 uppercase font-semibold">Absent</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{totalAbsent}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs text-blue-700 uppercase font-semibold">Attendance Rate</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{overallPercentage}%</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Included Lab Sessions</h3>
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              No lab sessions recorded for {reportDate}. Please mark attendance first.
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((s, idx) => {
                const isExpanded = expandedSessionId === s.id;
                const students = sessionStudents[s.id] || [];
                const isLoading = loadingStudents[s.id];

                return (
                  <div key={s.id} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden transition">
                    <div 
                      onClick={() => toggleSessionExpand(s.id)}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/80 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-600 uppercase">Session {idx + 1}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-medium text-slate-500">{s.labRoom || 'Main Lab'}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-base">{s.semesterName} — {s.subjectName} ({s.subjectCode})</h4>
                        <p className="text-xs text-slate-600 mt-1">Faculty: <strong>{s.teacherName}</strong> | Time: {s.startTime} - {s.endTime}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Present: {s.presentCount} / {s.totalStudents} ({s.attendancePercentage}%)
                        </span>
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-xs"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{isExpanded ? 'Hide Students' : 'View Students'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Student Roll List */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 p-4 bg-white space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span>Complete Student Attendance Roll (Included in .docx Report)</span>
                          </h5>
                          <span className="text-xs text-slate-500 font-medium">
                            {students.length} Total Enrolled
                          </span>
                        </div>

                        {isLoading ? (
                          <div className="py-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span>Loading student list...</span>
                          </div>
                        ) : students.length === 0 ? (
                          <div className="py-4 text-center text-xs text-slate-400">
                            No individual student records found for this session.
                          </div>
                        ) : (
                          <div className="overflow-x-auto border border-slate-200 rounded-lg">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                                <tr>
                                  <th className="py-2.5 px-3 w-12">#</th>
                                  <th className="py-2.5 px-3">Roll No</th>
                                  <th className="py-2.5 px-3">Student Full Name</th>
                                  <th className="py-2.5 px-3">Enrollment / Reg No</th>
                                  <th className="py-2.5 px-3 text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {students.map((st: any, sIdx: number) => {
                                  const isPresent = st.attendanceStatus === 'Present';
                                  return (
                                    <tr key={st.id || sIdx} className="hover:bg-slate-50">
                                      <td className="py-2 px-3 text-slate-400 font-mono">{sIdx + 1}</td>
                                      <td className="py-2 px-3 font-semibold text-slate-800">{st.rollNumber}</td>
                                      <td className="py-2 px-3 font-medium text-slate-900">{st.studentName}</td>
                                      <td className="py-2 px-3 text-slate-500 font-mono">{st.enrollmentNumber || '-'}</td>
                                      <td className="py-2 px-3 text-right">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                          isPresent ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                          {isPresent ? '✓ Present' : '✗ Absent'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
