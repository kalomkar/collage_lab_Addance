import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db";
import { generateWordReport } from "./server/services/wordGenerator";
import { sendReportEmail, verifySmtpConnection, sendTestEmail } from "./server/services/emailService";

const upload = multer({ dest: path.join(process.cwd(), 'uploads') });

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static serving for public assets (logos, wallpapers)
  const publicPath = path.join(process.cwd(), 'public');
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
  }

  // --- Keep-Alive / Health Endpoints for Render Uptime Monitoring ---
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      message: "College Lab Attendance System Server is active and operational."
    });
  });

  app.get("/api/ping", (req, res) => {
    res.send("pong");
  });

  // --- API Routes ---

  // 1. Auth
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const users = db.getUsers();
    const user = users.find(u => u.email.toLowerCase() === (email || '').trim().toLowerCase());

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (user.password) {
      if (user.password !== password) {
        return res.status(401).json({ error: "Invalid email or password." });
      }
    } else {
      if (!password || password.length < 3) {
        return res.status(401).json({ error: "Invalid password." });
      }
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  });

  // 2. Settings
  app.get("/api/settings", (req, res) => {
    res.json(db.getSettings());
  });

  app.put("/api/settings", (req, res) => {
    try {
      const updated = db.updateSettings(req.body);
      res.json({ success: true, settings: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Semesters
  app.get("/api/semesters", (req, res) => {
    res.json(db.getSemesters());
  });

  app.post("/api/semesters", (req, res) => {
    try {
      const newSem = db.addSemester(req.body);
      res.json({ success: true, semester: newSem });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Students
  app.get("/api/students", (req, res) => {
    const semesterId = req.query.semesterId as string;
    res.json(db.getStudents(semesterId));
  });

  app.post("/api/students", (req, res) => {
    try {
      const newStudent = db.addStudent(req.body);
      res.json({ success: true, student: newStudent });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/students/:id", (req, res) => {
    try {
      const updated = db.updateStudent(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: "Student not found" });
      res.json({ success: true, student: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/students/:id", (req, res) => {
    db.deleteStudent(req.params.id);
    res.json({ success: true });
  });

  // CSV Student Import
  app.post("/api/students/import", upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No CSV file uploaded." });
      }
      const semesterId = req.body.semesterId;
      const academicYear = req.body.academicYear || '2026-2027';
      const section = req.body.section || 'A';

      if (!semesterId) {
        return res.status(400).json({ error: "Semester ID is required for import." });
      }

      const fileContent = fs.readFileSync(req.file.path, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      let count = 0;
      for (const record of records) {
        const r = record as any;
        const rollNumber = r.rollNumber || r.RollNumber || r.roll_number || r.Roll;
        const name = r.name || r.Name || r.studentName;
        const enrollmentNumber = r.enrollmentNumber || r.EnrollmentNumber || r.enrollment || r.ENR || '';

        if (rollNumber && name) {
          db.addStudent({
            rollNumber,
            enrollmentName: enrollmentNumber,
            name,
            semesterId,
            academicYear,
            section,
            isActive: true
          } as any);
          count++;
        }
      }

      fs.unlinkSync(req.file.path);
      res.json({ success: true, count, message: `Successfully imported ${count} students.` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Subjects
  app.get("/api/subjects", (req, res) => {
    const semesterId = req.query.semesterId as string;
    res.json(db.getSubjects(semesterId));
  });

  app.post("/api/subjects", (req, res) => {
    try {
      const sub = db.addSubject(req.body);
      res.json({ success: true, subject: sub });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Teachers
  app.get("/api/teachers", (req, res) => {
    res.json(db.getTeachers());
  });

  app.post("/api/teachers", (req, res) => {
    try {
      const t = db.addTeacher(req.body);
      res.json({ success: true, teacher: t });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Lab Sessions & Attendance
  app.get("/api/lab-sessions", (req, res) => {
    const date = req.query.date as string;
    res.json(db.getLabSessions(date));
  });

  app.post("/api/lab-sessions", (req, res) => {
    try {
      const { sessionData, attendanceRecords } = req.body;
      const newSession = db.createLabSession(sessionData, attendanceRecords);
      res.json({ success: true, session: newSession });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/lab-sessions/:id/attendance", (req, res) => {
    try {
      const records = db.getAttendanceRecordsForSession(req.params.id);
      res.json(records);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. Dashboard Summary
  app.get("/api/dashboard/summary", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const sessions = db.getLabSessions();
    const todaySessions = sessions.filter(s => s.attendanceDate === today);
    
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalEntries = 0;

    sessions.forEach(s => {
      totalPresent += s.presentCount || 0;
      totalAbsent += s.absentCount || 0;
      totalEntries += s.totalStudents || 0;
    });

    const overallPercentage = totalEntries > 0 ? Number(((totalPresent / totalEntries) * 100).toFixed(1)) : 0;
    const reports = db.getGeneratedReports();
    const emails = db.getEmailHistory();
    const failedEmails = emails.filter(e => e.status === 'Failed').length;

    res.json({
      todaySessionsCount: todaySessions.length,
      todayAttendanceEntries: todaySessions.reduce((acc, s) => acc + (s.totalStudents || 0), 0),
      totalPresent,
      totalAbsent,
      overallPercentage,
      totalReportsGenerated: reports.length,
      totalEmailsSent: emails.filter(e => e.status === 'Sent').length,
      failedEmailsCount: failedEmails
    });
  });

  // 9. Word Report Generation & Download
  app.post("/api/reports/generate", async (req, res) => {
    try {
      const { date, username } = req.body;
      if (!date) return res.status(400).json({ error: "Date is required." });

      const { filePath, filename } = await generateWordReport(date);

      db.addGeneratedReport({
        reportDate: date,
        filename,
        filePath,
        generatedBy: username || 'System'
      });

      res.json({ success: true, filename, message: "Word report generated successfully." });
    } catch (err: any) {
      console.error("Report generation error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/reports/list", (req, res) => {
    res.json(db.getGeneratedReports());
  });

  app.get("/api/reports/:filename/download", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'reports', filename);
    if (fs.existsSync(filePath)) {
      res.download(filePath, filename);
    } else {
      res.status(404).json({ error: "Report file not found." });
    }
  });

  // Base64 content endpoint for sending directly via Gmail API
  app.get("/api/reports/:filename/base64", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'reports', filename);
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      res.json({
        filename,
        base64: fileBuffer.toString('base64'),
        size: fileBuffer.length
      });
    } else {
      res.status(404).json({ error: "Report file not found." });
    }
  });

  // Record history when email is dispatched via Gmail API or SMTP
  app.post("/api/email/record-history", (req, res) => {
    try {
      const { recipient, subject, attachmentFilename, status, sentBy, errorMessage } = req.body;
      db.addEmailHistory({
        recipient: recipient || 'Principal',
        subject: subject || 'Daily Attendance Report',
        attachmentFilename: attachmentFilename || '',
        status: status || 'Sent',
        sentBy: sentBy || 'System',
        errorMessage
      });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10. Email Sending & History
  app.post("/api/email/send-report", async (req, res) => {
    try {
      const { date, recipientEmail, username } = req.body;
      if (!date) return res.status(400).json({ error: "Date is required." });

      const filename = `BCA_Lab_Daily_Attendance_Report_${date}.docx`;
      const filePath = path.join(process.cwd(), 'reports', filename);

      // Generate report if it doesn't exist yet
      if (!fs.existsSync(filePath)) {
        await generateWordReport(date);
      }

      const settings = db.getSettings();
      const recipient = recipientEmail || settings.principalEmail;

      try {
        await sendReportEmail(date, filePath, filename, recipient);
        db.addEmailHistory({
          recipient,
          subject: `BCA Computer Lab Daily Attendance Report – ${date}`,
          attachmentFilename: filename,
          status: 'Sent',
          sentBy: username || 'System'
        });
        res.json({ success: true, message: `Report successfully emailed to ${recipient}` });
      } catch (smtpErr: any) {
        db.addEmailHistory({
          recipient,
          subject: `BCA Computer Lab Daily Attendance Report – ${date}`,
          attachmentFilename: filename,
          status: 'Failed',
          errorMessage: smtpErr.message,
          sentBy: username || 'System'
        });
        res.status(500).json({ error: `SMTP Send Failed: ${smtpErr.message}` });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/email/history", (req, res) => {
    res.json(db.getEmailHistory());
  });

  app.post("/api/settings/test-smtp", async (req, res) => {
    try {
      const { testEmail, config } = req.body;
      const verifyResult = await verifySmtpConnection(config);

      if (testEmail) {
        await sendTestEmail(testEmail, config);
        return res.json({
          success: true,
          message: `Connection successful! A test verification email was sent to ${testEmail}.`
        });
      }

      res.json({
        success: true,
        message: `SMTP Connection verified successfully with host ${verifyResult.host}:${verifyResult.port}!`
      });
    } catch (err: any) {
      console.error("SMTP Test Error:", err);
      res.status(500).json({ error: err.message || "Failed to connect to SMTP server." });
    }
  });

  // Database Backup and Restore API
  app.get("/api/backup/export", (req, res) => {
    try {
      const data = db.getData();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="college_lab_backup_${new Date().toISOString().split('T')[0]}.json"`);
      res.send(JSON.stringify(data, null, 2));
    } catch (err: any) {
      res.status(500).json({ error: "Failed to export database backup." });
    }
  });

  app.post("/api/backup/restore", upload.single('backupFile'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No backup JSON file provided." });
      }
      const content = fs.readFileSync(req.file.path, 'utf-8');
      const parsedData = JSON.parse(content);
      
      if (!parsedData || typeof parsedData !== 'object') {
        return res.status(400).json({ error: "Invalid backup file structure." });
      }

      db.saveData(parsedData);
      fs.unlinkSync(req.file.path);
      res.json({ success: true, message: "Database restored successfully!" });
    } catch (err: any) {
      console.error("Restore Error:", err);
      res.status(500).json({ error: err.message || "Failed to restore database." });
    }
  });

  // --- Vite / Static Middleware Setup ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`College Lab Attendance System running on http://0.0.0.0:${PORT}`);

    // Automated Self-Ping Keep-Alive for Cloud Free Tiers (Render/Heroku/Koyeb)
    const keepAliveUrl = process.env.SERVER_URL || process.env.RENDER_EXTERNAL_URL;
    if (keepAliveUrl) {
      console.log(`[Keep-Alive] Initializing 10-minute self-ping for ${keepAliveUrl}/api/health`);
      setInterval(async () => {
        try {
          const pingRes = await fetch(`${keepAliveUrl.replace(/\/$/, '')}/api/health`);
          if (pingRes.ok) {
            console.log(`[Keep-Alive] Ping successful at ${new Date().toLocaleTimeString()}`);
          }
        } catch (err: any) {
          console.warn(`[Keep-Alive] Ping warning: ${err.message}`);
        }
      }, 10 * 60 * 1000); // Every 10 minutes
    }
  });
}

startServer();
