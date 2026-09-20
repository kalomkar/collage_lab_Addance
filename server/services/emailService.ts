import nodemailer from 'nodemailer';
import fs from 'fs';
import { db } from '../db';

function getSmtpConfig(customConfig?: any) {
  const settings = db.getSettings();
  const host = customConfig?.smtpHost || process.env.SMTP_HOST || settings.smtpHost || 'smtp.gmail.com';
  // Default to 465 for Gmail / cloud hosts if not explicitly specified as 587
  let port = Number(customConfig?.smtpPort || process.env.SMTP_PORT || settings.smtpPort);
  if (!port || isNaN(port)) {
    port = host.includes('gmail.com') ? 465 : 587;
  }
  const username = customConfig?.smtpUsername || process.env.SMTP_USERNAME || settings.smtpUsername || '';
  const password = customConfig?.smtpPassword || process.env.SMTP_PASSWORD || settings.smtpPassword || '';
  const senderEmail = customConfig?.senderEmail || process.env.SMTP_SENDER_EMAIL || settings.senderEmail || username;

  return { host, port, username, password, senderEmail, settings };
}

/**
 * Creates a robust nodemailer transporter compatible with cloud providers (like Render, Heroku, AWS).
 * Render's free/starter tier blocks outbound TCP traffic on port 25 and often filters port 587.
 * Port 465 (Direct SSL) or Gmail Service with 2-step App Password is overwhelmingly recommended.
 */
function createNodemailerTransporter(host: string, port: number, username: string, pass: string) {
  const cleanHost = (host || 'smtp.gmail.com').trim().toLowerCase();
  const cleanUser = (username || '').trim();
  const cleanPass = (pass || '').trim().replace(/\s+/g, ''); // strip accidental spaces from copied app password
  const numPort = Number(port) || 465;
  const isPort465 = numPort === 465;

  const baseConfig: any = {
    auth: {
      user: cleanUser,
      pass: cleanPass
    },
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false
    }
  };

  if (cleanHost.includes('gmail.com')) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: numPort,
      secure: isPort465,
      ...baseConfig
    });
  }

  return nodemailer.createTransport({
    host: cleanHost,
    port: numPort,
    secure: isPort465,
    ...baseConfig
  });
}

/**
 * Send email via Resend API (HTTPS) if RESEND_API_KEY is configured.
 * This provides 100% reliable cloud delivery on Render with zero port blocks.
 */
async function sendViaResendIfConfigured(to: string, subject: string, text: string, html: string, attachmentPath?: string, filename?: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return null;

  try {
    const payload: any = {
      from: `College Lab Attendance System <onboarding@resend.dev>`,
      to: [to],
      subject,
      text,
      html
    };

    if (attachmentPath && fs.existsSync(attachmentPath) && filename) {
      const fileBuffer = fs.readFileSync(attachmentPath);
      payload.attachments = [
        {
          filename,
          content: fileBuffer.toString('base64')
        }
      ];
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Resend API returned error');
    }
    return { success: true, via: 'Resend API', id: data.id };
  } catch (err: any) {
    console.warn('Resend API dispatch failed, falling back to SMTP:', err.message);
    return null;
  }
}

export async function verifySmtpConnection(customConfig?: any) {
  const { host, port, username, password } = getSmtpConfig(customConfig);

  if (!host || !username || !password) {
    throw new Error('SMTP credentials incomplete. Host, Email Username, and 16-character App Password are required.');
  }

  // First attempt with configured port
  let transporter = createNodemailerTransporter(host, port, username, password);
  try {
    await transporter.verify();
    return { success: true, host, port, username };
  } catch (err: any) {
    // If port was 587 and timed out, automatically try port 465 SSL fallback
    if (port === 587) {
      console.log('Port 587 timed out or failed. Attempting Port 465 SSL fallback...');
      try {
        const fallbackTransporter = createNodemailerTransporter(host, 465, username, password);
        await fallbackTransporter.verify();
        return { success: true, host, port: 465, username, note: 'Switched to Port 465 SSL' };
      } catch (fallbackErr: any) {
        // Fall back to original error message
      }
    }

    let msg = err.message || 'SMTP Connection failed.';
    if (msg.includes('ETIMEDOUT') || msg.includes('ECONNREFUSED') || msg.includes('timeout')) {
      msg = `Cloud Network Timeout on port ${port}. Render free-tier containers block or restrict standard SMTP port 587/25. Please switch SMTP Port to 465 (SSL) with a 16-digit Google App Password, or use the direct Gmail API button on Daily Reports.`;
    } else if (msg.includes('Invalid login') || msg.includes('535') || msg.includes('Username and Password not accepted')) {
      msg = 'Google rejected credentials. If using Gmail, you MUST generate a 16-digit "App Password" at https://myaccount.google.com/apppasswords with 2-Step Verification turned ON.';
    }
    throw new Error(msg);
  }
}

export async function sendTestEmail(testRecipient: string, customConfig?: any) {
  const { host, port, username, password, senderEmail, settings } = getSmtpConfig(customConfig);

  if (!host || !username || !password) {
    throw new Error('SMTP server is not fully configured. Please provide Host, Username, and App Password.');
  }

  const mailOptions = {
    from: `"${settings.collegeName || 'College Lab'}" <${senderEmail}>`,
    to: testRecipient,
    subject: `SMTP Test Verification - ${settings.collegeName || 'Computer Lab System'}`,
    text: `Hello,\n\nThis is a test message to confirm that your SMTP Mail Server configuration is active and working properly.\n\nServer: ${host}:${port}\nUser: ${username}\nTimestamp: ${new Date().toLocaleString()}\n\nYou are ready to send automated Daily Attendance Word (.docx) reports!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
        <h2 style="color: #1e3a8a; margin-top: 0; font-size: 20px;">SMTP Test Verification Successful</h2>
        <p style="color: #334155; font-size: 14px;">This email confirms that your SMTP mail server configuration is active and functional.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px; font-weight: bold; width: 140px; color: #475569;">SMTP Host:</td><td>${host}</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px; font-weight: bold; color: #475569;">Port:</td><td>${port}</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px; font-weight: bold; color: #475569;">Sender Account:</td><td>${username}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Test Timestamp:</td><td>${new Date().toLocaleString()}</td></tr>
        </table>
        <p style="color: #15803d; font-weight: 600; font-size: 14px;">✓ Ready to dispatch daily attendance Word reports to the Principal.</p>
      </div>
    `
  };

  // Check Resend first if available
  const resendResult = await sendViaResendIfConfigured(testRecipient, mailOptions.subject, mailOptions.text, mailOptions.html);
  if (resendResult) return resendResult;

  let transporter = createNodemailerTransporter(host, port, username, password);

  try {
    return await transporter.sendMail(mailOptions);
  } catch (err: any) {
    // If port 587 timed out on Render, attempt Port 465 SSL auto-retry
    if (port === 587) {
      console.log('Sending failed on port 587, attempting Port 465 SSL retry...');
      try {
        const fallbackTransporter = createNodemailerTransporter(host, 465, username, password);
        return await fallbackTransporter.sendMail(mailOptions);
      } catch (fallbackErr) {
        // Fall through
      }
    }

    let msg = err.message;
    if (msg.includes('ETIMEDOUT') || msg.includes('ECONNREFUSED') || msg.includes('timeout')) {
      msg = `Connection timed out on port ${port}. Render cloud servers block or throttle standard SMTP ports. Please switch to Port 465 with SSL in Settings or use the Gmail API option on the Daily Reports page.`;
    }
    throw new Error(msg);
  }
}

export async function sendReportEmail(reportDate: string, docxPath: string, filename: string, recipientEmail?: string) {
  const { host, port, username, password, senderEmail, settings } = getSmtpConfig();
  const recipient = recipientEmail || process.env.PRINCIPAL_EMAIL || settings.principalEmail;

  if (!recipient) {
    throw new Error('Recipient email is missing. Please set Principal Email in Settings.');
  }

  const subject = `BCA Computer Lab Daily Attendance Report – ${reportDate}`;
  const text = `Respected Sir/Madam,\n\nPlease find attached the Computer Lab Daily Attendance Report for ${reportDate}.\n\nThe report contains the semester-wise and subject-wise attendance details along with the complete student roll list.\n\nRegards,\nComputer Lab In-Charge\n${settings.collegeName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
      <h2 style="color: #1e3a8a; margin-top: 0; font-size: 18px;">${settings.collegeName}</h2>
      <p style="color: #475569; font-size: 13px; margin-top: 2px;">${settings.department}</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
      <p style="color: #1e293b; font-size: 14px;"><strong>Respected Principal Sir/Madam,</strong></p>
      <p style="color: #334155; font-size: 14px; line-height: 1.5;">
        Please find attached the official <strong>Computer Lab Daily Attendance Report</strong> for <strong>${reportDate}</strong>.
      </p>
      <p style="color: #334155; font-size: 14px; line-height: 1.5;">
        The report contains complete semester-wise, subject-wise attendance statistics along with the full student roll attendance register.
      </p>
      <div style="margin: 20px 0; padding: 12px 16px; background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 4px;">
        <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Attached Report Document:</span>
        <div style="font-size: 13px; font-weight: bold; color: #1e293b; margin-top: 4px;">📎 ${filename}</div>
      </div>
      <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
        Regards,<br />
        <strong>Computer Lab In-Charge</strong><br />
        ${settings.collegeName}
      </p>
    </div>
  `;

  // 1. Try Resend API if configured
  const resendResult = await sendViaResendIfConfigured(recipient, subject, text, html, docxPath, filename);
  if (resendResult) return resendResult;

  // 2. Validate SMTP credentials
  if (!host || !username || !password) {
    throw new Error('SMTP server is not fully configured. Please provide SMTP Host, Username, and App Password in Settings or via Render environment variables.');
  }

  let transporter = createNodemailerTransporter(host, port, username, password);

  const mailOptions = {
    from: `"${settings.collegeName} Lab System" <${senderEmail}>`,
    to: recipient,
    subject,
    text,
    html,
    attachments: [
      {
        filename: filename,
        path: docxPath
      }
    ]
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (err: any) {
    // If port 587 timed out on Render, auto-retry with Port 465 SSL
    if (port === 587) {
      console.log('Sending report failed on port 587, attempting Port 465 SSL retry...');
      try {
        const fallbackTransporter = createNodemailerTransporter(host, 465, username, password);
        return await fallbackTransporter.sendMail(mailOptions);
      } catch (fallbackErr) {
        // Fall through to descriptive error
      }
    }

    let msg = err.message;
    if (msg.includes('ETIMEDOUT') || msg.includes('ECONNREFUSED') || msg.includes('timeout')) {
      msg = `SMTP connection timed out on port ${port}. Render cloud servers block or throttle standard SMTP ports. Please switch to Port 465 (SSL) in Settings or use the Gmail API option on the Daily Reports page for guaranteed instant delivery.`;
    }
    throw new Error(msg);
  }
}

