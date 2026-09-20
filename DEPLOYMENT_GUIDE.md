# 🚀 College Lab Attendance System - Complete Deployment & Cloud Fix Guide

Is guide me Render deployment ke sabhi issues (15-min server sleep, database wash/wipe, aur email delivery failure) ka permanent solution diya gaya hai.

---

## ⚡ 1. Render Server 15 Minutes Me Band Hone Ka Fix (24/7 Active Rahega)

### 📌 Problem:
Render ke Free Tier par jab 15 minutes tak koi website use nahi karta, to server **sleep mode** me chala jata hai.

### ✅ Permanent Free Solution (UptimeRobot - 100% Free):
1. **[UptimeRobot.com](https://uptimerobot.com)** par jakar Free Account banayein.
2. **"+ Add New Monitor"** button par click karein.
3. Form me ye details bharein:
   - **Monitor Type:** `HTTP(s)`
   - **Friendly Name:** `College Lab Attendance System`
   - **URL (or IP):** `https://YOUR-APP-NAME.onrender.com/api/health` *(Apne Render app ka URL dalein)*
   - **Monitoring Interval:** `5 minutes`
4. **"Create Monitor"** par click karein.

🎉 **Result:** UptimeRobot har 5 minute me aapke Render server ko ping karega, jisse **Render kabhi bhi sleep nahi hoga aur 24/7 active rahega!**

---

## 💾 2. Render Par Database Wash / Data Loss Hone Ka Fix

### 📌 Problem:
Render ke free web services me disk **ephemeral (temporary)** hoti hai. Jab bhi server restart hota hai ya new deploy hota hai, file system initial git state par reset ho jata hai.

### ✅ Solutions:
1. **1-Click Database Backup & Restore (Built-in):**
   - **Settings** page par jayein -> **"Database Backup & Restore"** section me jayein.
   - **"Download Database Backup (.json)"** par click karke apne sare students, sessions aur settings ka offline backup save kar sakte hain.
   - Jab bhi zaroorat ho, **"Upload & Restore Backup (.json)"** par click karke 1 second me sara data wapas restore kar sakte hain!

2. **Render Environment URL:**
   - Render Dashboard -> Your Web Service -> **Environment** tab me `SERVER_URL` = `https://your-app.onrender.com` set kar dein. Isse server khud ko bhi keep-alive ping karta rahega.

---

## ✉️ 3. Render Par Principal Ko Mail Na Jaane Ka Fix

### 📌 Problem:
- Local computer par Port 587 chal jata hai, par **Render cloud container Port 25 aur Port 587 ko block/throttle kar deta hai**.
- Normal Gmail password cloud par block ho jata hai jab tak **16-Digit Google App Password** use na kiya jaye.

### ✅ 2 Guaranteed Solutions:

#### Method A: Gmail API (100% Recommended & Fastest)
- **Daily Reports** page par jayein.
- **"Sign in with Google"** par click karein aur apna college Google account connect karein.
- Ye method HTTPS Port 443 use karta hai jo **Render par kabhi block nahi hota**. Principal ko instant Word report chali jayegi!

#### Method B: SMTP Port 465 (SSL)
- Settings page me ya Render Environment Variables me ye configuration rakhein:
  - `SMTP_HOST`: `smtp.gmail.com`
  - `SMTP_PORT`: `465` *(587 ki jagah 465 use karein!)*
  - `SMTP_USERNAME`: `your-college-email@gmail.com`
  - `SMTP_PASSWORD`: `16-digit Google App Password` *(Google Account -> Security -> 2-Step Verification -> App Passwords me generate karein, regular password nahi chalega)*
  - `PRINCIPAL_EMAIL`: `principal-email@college.edu`

---

## 🌐 4. Alternative Free Platforms (Jaha Server Sleep Nahi Hota)

Agar aap Render ke alawa aur better free platforms chahte hain:

1. **[Koyeb.com](https://www.koyeb.com):**
   - Free Web Service provide karta hai.
   - **Server sleep nahi hota** (24/7 online rehta hai free tier par bhi).
   - Direct GitHub repo connect karke deploy ho jata hai.

2. **[Vercel.com](https://vercel.com):**
   - Serverless frontend + API fast hosting.
   - 100% uptime with global edge CDN.

---

## 🛠️ 5. Local Development Commands

- **Development Mode:** `npm run dev`
- **Production Build:** `npm run build`
- **Start Production Server:** `npm start`
