import React, { useEffect, useState } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import { EmailHistoryRecord } from '../types';

export const EmailHistoryPage: React.FC = () => {
  const [emails, setEmails] = useState<EmailHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/email/history');
      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.error('Error fetching email history', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Mail className="w-7 h-7 text-blue-600" />
            <span>Email Delivery History</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Audit log of all daily reports sent to the Principal via SMTP</p>
        </div>
        <button
          onClick={fetchEmails}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium shadow-sm transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
                <th className="px-6 py-3.5">Recipient</th>
                <th className="px-6 py-3.5">Subject</th>
                <th className="px-6 py-3.5">Attachment</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Sent Time</th>
                <th className="px-6 py-3.5">Sent By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading email history...</td>
                </tr>
              ) : emails.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No emails sent yet.</td>
                </tr>
              ) : (
                emails.map(email => (
                  <tr key={email.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-800">{email.recipient}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs">{email.subject}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{email.attachmentFilename}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        email.status === 'Sent' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {email.status}
                      </span>
                      {email.errorMessage && (
                        <p className="text-[10px] text-red-500 mt-0.5 max-w-xs truncate" title={email.errorMessage}>
                          {email.errorMessage}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(email.sentAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{email.sentBy}</td>
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
