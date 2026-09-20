import nodemailer from 'nodemailer';
import fs from 'fs';
import { db } from '../db';

function getSmtpConfig(customConfig?: any) {
  const settings = db.getSettings();
  const host = customConfig?.smtpHost || process.env.SMTP_HOST || settings.smtpHost || 'smtp.gmail.com';
  const port = Number(customConfig?.smtpPort || process.env.SMTP_PORT || settings.smtpPort) || 465;
  const username = customConfig?.smtpUsername || process.env.SMTP_USERNAME || settings.smtpUsername || '';
  const password = customConfig?.smtpPassword || process.env.SMTP_PASSWORD || settings.smtpPassword || '';
  const senderEmail = customConfig?.senderEmail || process.env.SMTP_SENDER_EMAIL || settings.senderEmail || username;

  return { host, port, username, password, senderEmail, settings };
}

/**
 * Creates a robust nodemailer transporter compatible with cloud providers (like Render, Heroku, AWS).
 * Render's free/starter tier blocks outbound TCP traffic on port 25 and sometimes filters port 587.
 * Port 465 (Direct SSL) or Gmail Service with 2-step App Password is recommended.
 */
function createNodemailerTransporter(host: string, port: number, username: string, pass: string) {
  const cleanHost = (host || 'smtp.gmail.com').trim().toLowerCase();
  const cleanUser = (username || '').trim();
  const cleanPass = (pass || '').trim().replace(/\s+/g, ''); // strip any accidentally copied spaces
  const numPort = Number(port) || 465;
  const isPort465 = numPort === 465;

  const baseConfig: any = {
    auth: {
      user: cleanUser,
      pass: cleanPass
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    tls: {
      rejectUnauthorized: false
    }
  };

  // If using Gmail host
  if (cleanHost.includes('gmail.com')) {
    // Port 465 direct SSL works best on cloud containers where port 587 STARTTLS may time out
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

export async function verifySmtpConnection(customConfig?: any) {
  const { host, port, username, password } = getSmtpConfig(customConfig);

  if (!host || !username || !password) {
    throw new Error('SMTP credentials incomplete. Host, Email Username, and 16-character App Password are required.');
  }

  const transporter = createNodemailerTransporter(host, port, username, password);
  try {
    await transporter.verify();
    return { success: true, host, port, username };
  } catch (err: any) {
    let msg = err.message || 'SMTP Connection failed.';
    if (msg.includes('ETIMEDOUT') || msg.includes('ECONNREFUSED') || msg.includes('timeout')) {
      msg = `Cloud Network Timeout on port ${port}. Render cloud servers block or restrict certain SMTP ports. Please try Port 465 (SSL) or use our direct Gmail API integration which works 100% reliably on Render.`;
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

  const transporter = createNodemailerTransporter(host, port, username, password);

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

  try {
    return await transporter.sendMail(mailOptions);
  } catch (err: any) {
    let msg = err.message;
    if (msg.includes('ETIMEDOUT') || msg.includes('ECONNREFUSED') || msg.includes('timeout')) {
      msg = `Connection timed out. On Render, outbound port 587 is frequently throttled. Switch to Port 465 with SSL or use the Gmail API.`;
    }
    throw new Error(msg);
  }
}

export async function sendReportEmail(reportDate: string, docxPath: string, filename: string, recipientEmail?: string) {
  const { host, port, username, password, senderEmail, settings } = getSmtpConfig();
  const recipient = recipientEmail || process.env.PRINCIPAL_EMAIL || settings.principalEmail;

  if (!host || !username || !password) {
    throw new Error('SMTP server is not fully configured. Please provide SMTP Host, Username, and Password in Settings or via .env file.');
  }

  const transporter = createNodemailerTransporter(host, port, username, password);

  const mailOptions = {
    from: `"${settings.collegeName} Lab System" <${senderEmail}>`,
    to: recipient,
    subject: `BCA Computer Lab Daily Attendance Report – ${reportDate}`,
    text: `Respected Sir/Madam,\n\nPlease find attached the Computer Lab Daily Attendance Report for ${reportDate}.\n\nThe report contains the semester-wise and subject-wise attendance details along with the complete student roll list.\n\nRegards,\nComputer Lab In-Charge\n${settings.collegeName}`,
    attachments: [
      {
        filename: filename,
        path: docxPath
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err: any) {
    let msg = err.message;
    if (msg.includes('ETIMEDOUT') || msg.includes('ECONNREFUSED') || msg.includes('timeout')) {
      msg = `SMTP connection timed out on port ${port}. Render cloud servers block or throttle standard SMTP ports. Please try Port 465 or use the Gmail API option on the Daily Reports page.`;
    }
    throw new Error(msg);
  }
}
