import React, { useEffect, useState, useRef } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle, Mail, Send, RefreshCw, Key, HelpCircle, Download, Upload, Database, ShieldCheck, LogIn, LogOut } from 'lucide-react';
import { CollegeSettings } from '../types';
import { initAuth, googleSignIn, googleSignOut } from '../services/googleAuth';
import type { User as FirebaseUser } from 'firebase/auth';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<CollegeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [backupMsg, setBackupMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [restoring, setRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setSettings(data);
        if (data.principalEmail) {
          setTestRecipient(data.principalEmail);
        }
        setLoading(false);
      });

    const unsubscribe = initAuth(
      (fbUser) => setGoogleUser(fbUser),
      () => setGoogleUser(null)
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleChange = (field: keyof CollegeSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleTestSmtp = async (sendEmail: boolean) => {
    if (!settings) return;
    setTestingSmtp(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/settings/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testEmail: sendEmail ? testRecipient : undefined,
          config: {
            smtpHost: settings.smtpHost,
            smtpPort: settings.smtpPort,
            smtpUsername: settings.smtpUsername,
            smtpPassword: settings.smtpPassword,
            senderEmail: settings.senderEmail
          }
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({ success: false, message: data.error || 'SMTP verification failed.' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: 'Network error communicating with the backend server.' });
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleDownloadBackup = () => {
    window.location.href = '/api/backup/export';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Are you sure you want to restore data from this backup file? Existing data will be overwritten with the backup file content.')) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setRestoring(true);
    setBackupMsg(null);

    const formData = new FormData();
    formData.append('backupFile', file);

    try {
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBackupMsg({ success: true, text: 'Database restored successfully! Reloading page...' });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setBackupMsg({ success: false, text: data.error || 'Failed to restore database.' });
      }
    } catch (err: any) {
      setBackupMsg({ success: false, text: 'Error uploading backup file.' });
    } finally {
      setRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('College & SMTP settings updated successfully!');
      } else {
        setErrorMsg(data.error || 'Failed to update settings.');
      }
    } catch (err) {
      setErrorMsg('Network error while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
  }


  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-blue-600" />
          <span>College Settings & SMTP Configuration</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Configure college identity, principal recipient email, and SMTP mail server credentials</p>
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
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">College & Department Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">College Name</label>
              <input
                type="text"
                value={settings.collegeName}
                onChange={e => handleChange('collegeName', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Department Name</label>
              <input
                type="text"
                value={settings.department}
                onChange={e => handleChange('department', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">College Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={e => handleChange('address', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Principal Name</label>
              <input
                type="text"
                value={settings.principalName}
                onChange={e => handleChange('principalName', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Principal Email (Recipient)</label>
              <input
                type="email"
                value={settings.principalEmail}
                onChange={e => handleChange('principalEmail', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Academic Year</label>
              <input
                type="text"
                value={settings.academicYear}
                onChange={e => handleChange('academicYear', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Report Title</label>
              <input
                type="text"
                value={settings.reportTitle}
                onChange={e => handleChange('reportTitle', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Gmail API Integration Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Google Workspace & Gmail API (Recommended)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct OAuth integration to deliver Word reports automatically to the Principal with zero cloud port blocks or SMTP timeouts.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-md font-medium border border-emerald-200">
              <span>Status: {googleUser ? 'Connected' : 'Not Connected'}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {googleUser ? `Authenticated Account: ${googleUser.email}` : 'Connect your Google / Gmail Account'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {googleUser 
                  ? 'Your Google account is authorized to send daily attendance Word (.docx) reports directly to the Principal.'
                  : 'Sign in with Google to grant permission to automatically send daily attendance reports to the Principal.'}
              </p>
            </div>

            <div>
              {googleUser ? (
                <button
                  type="button"
                  onClick={async () => {
                    await googleSignOut();
                    setSuccessMsg('Disconnected from Google account.');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 rounded-lg text-xs font-semibold transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect Account</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isGoogleSigningIn}
                  onClick={async () => {
                    setIsGoogleSigningIn(true);
                    try {
                      const res = await googleSignIn();
                      if (res) setSuccessMsg(`Connected to Google as ${res.user.email}!`);
                    } catch (err: any) {
                      setErrorMsg(err.message || 'Google Sign-In failed');
                    } finally {
                      setIsGoogleSigningIn(false);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isGoogleSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SMTP Configuration */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>SMTP Mail Server Configuration</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Used for dispatching daily attendance Word reports (.docx) automatically to the Principal</p>
            </div>
            <div className="flex items-center gap-2 text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md font-mono">
              <span>Port: 587 (TLS) | 465 (SSL)</span>
            </div>
          </div>

          {/* Quick Helper Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 space-y-2">
            <div className="font-semibold flex items-center gap-1.5 text-blue-950">
              <Key className="w-3.5 h-3.5" />
              <span>Important note for Cloud Deployment (Render / Heroku / AWS):</span>
            </div>
            <p>
              <strong>Why Port 587 fails on Render:</strong> Render and most cloud providers block or throttle outbound port 25 and port 587 to prevent spam. If you are hosting on Render, change <strong>SMTP Port to 465 (SSL)</strong> and use a 16-character <strong>Google App Password</strong> (from your Google Account &gt; Security &gt; 2-Step Verification &gt; App Passwords).
            </p>
            <p className="text-blue-800">
              <strong>Even Better:</strong> Use the <strong>Gmail API (Connected above)</strong> on the Daily Reports page! Gmail API uses HTTPS (Port 443) which is <strong>never blocked</strong> on Render, providing 100% instant email delivery.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">SMTP Host</label>
              <input
                type="text"
                value={settings.smtpHost}
                onChange={e => handleChange('smtpHost', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">SMTP Port</label>
              <input
                type="number"
                value={settings.smtpPort}
                onChange={e => handleChange('smtpPort', Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                placeholder="587"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">SMTP Username / Sender Email</label>
              <input
                type="text"
                value={settings.smtpUsername}
                onChange={e => handleChange('smtpUsername', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                placeholder="e.g. your-lab@gmail.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">SMTP Password / App Password</label>
              <input
                type="password"
                value={settings.smtpPassword || ''}
                onChange={e => handleChange('smtpPassword', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                placeholder="••••••••••••••••"
              />
            </div>
          </div>

          {/* Test SMTP Section */}
          <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-600 tracking-wider">Test SMTP Mail Connection</h3>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="email"
                value={testRecipient}
                onChange={e => setTestRecipient(e.target.value)}
                placeholder="Recipient email for test delivery"
                className="w-full sm:flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={testingSmtp || !settings.smtpHost || !settings.smtpUsername || !settings.smtpPassword}
                  onClick={() => handleTestSmtp(false)}
                  className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  title="Verify SMTP credentials with mail server without sending an email"
                >
                  {testingSmtp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span>Verify Port & Login</span>
                </button>
                <button
                  type="button"
                  disabled={testingSmtp || !testRecipient || !settings.smtpHost || !settings.smtpUsername || !settings.smtpPassword}
                  onClick={() => handleTestSmtp(true)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  {testingSmtp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send Test Email</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{testResult.success ? 'Success' : 'SMTP Error'}</p>
                  <p className="mt-0.5">{testResult.message}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Database Backup & Restore Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <span>Database Backup & Restore</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Download a complete backup of your students, semesters, subjects, teachers, attendance logs, and settings or restore them anytime.
              </p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded font-medium">
              Offline JSON Backup
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Download Backup File</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Export all entered students, teachers, subjects, and attendance history as a safe JSON backup to your computer.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>Download Database Backup (.json)</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Restore from Backup</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Upload a previously downloaded JSON backup file to instantly restore all your entered college data.
                </p>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json,application/json"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={restoring}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{restoring ? 'Restoring Database...' : 'Upload & Restore Backup (.json)'}</span>
                </button>
              </div>
            </div>
          </div>

          {backupMsg && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                backupMsg.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {backupMsg.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{backupMsg.text}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
