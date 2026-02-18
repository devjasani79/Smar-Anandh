# SmarAnandh - Project Workflow Documentation

## 🙏 Project Overview

**SmarAnandh** (स्मरआनंद - "Joyful Remembrance") is a senior care companion app for Indian families. Guardians manage elderly loved ones' medications, entertainment, and safety while seniors get an ultra-simple, high-contrast Hinglish interface.

**Problem:** 140M+ Indian seniors, 65% miss medications, 70% of families live apart.
**Solution:** Dual-mode app — Guardian dashboard + Senior companion with PIN-based access.

---

## 🏗️ Architecture

### Dual-Mode System
- **Guardian Mode** (`/guardian/*`): Email/password auth, full dashboard, medication management, settings
- **Senior Mode** (`/app`, `/senior/*`): Phone + 4-digit PIN auth, simplified UI, 80px+ touch targets, Hinglish

### Tech Stack
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend:** Lovable Cloud (Supabase) — PostgreSQL, Auth, Storage, Edge Functions
- **Fonts:** Playfair Display (headings), Nunito (body), Poppins (UI)

---

## 🔐 Authentication

### Guardian: Email + Password (Supabase Auth)
1. Register with email, password, name, phone
2. Complete Senior KYC (name, photo, health info)
3. Set 4-digit Family PIN
4. Welcome email sent automatically

### Senior: Dual-Key (Phone + PIN)
1. Enter Guardian's phone number
2. Enter Family PIN
3. Validated via `validate_family_pin_with_phone()` RPC
4. Session stored in localStorage

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Guardian profile (name, phone) |
| `user_roles` | Role assignments (guardian/senior) |
| `seniors` | Senior profiles with Family PIN |
| `guardian_senior_links` | Guardian ↔ Senior relationships |
| `medications` | Medicine schedules |
| `medication_logs` | Dose tracking |
| `joy_preferences` | Entertainment settings |
| `health_vitals` | Vital signs logs |
| `activity_logs` | Activity tracking |
| `family_members` | Emergency contacts |
| `notifications` | Alerts & reminders |

---

## ✅ Completed Features

### Authentication & Onboarding
- Guardian signup/login with email confirmation
- Senior dual-key auth (phone + PIN)
- Guardian onboarding with Senior KYC
- Logout buttons on all screens
- Password reset flow

### Guardian Dashboard
- Dashboard with real-time activity feed, medication logs, health vitals
- Medication management (CRUD)
- Joy activities configuration (Suno, Dekho, Yaadein, Khelo)
- Settings: edit guardian profile, edit senior profile, emergency contacts
- Add/delete seniors, delete account
- Senior selector for multi-senior guardians

### Senior Interface
- Home screen with Hinglish greeting, photo, status pulse
- **DAWA** (💊): View medications, mark as taken per time slot
- **KHUSHI** (😊): YouTube bhajans, serials, photo albums, games, mood check-in
- **MADAD** (🆘): Emergency SOS with 5-second countdown, quick messages
- **PARIVAAR** (📞): Family contact directory with call/video/message buttons

### Landing Page
- Full-width hero carousel (responsive: 45vh mobile, 55-60vh desktop)
- Stats bar, features grid, 3-step setup guide
- Testimonials with ratings, CTA section
- Responsive navbar with mobile menu

### Backend Functions
- `send-welcome-email`: Nodemailer via Gmail SMTP, sends guardian/senior details + PIN
- `scheduled-notifications`: 3-hour cron for medicine reminders, inactivity checks, activity suggestions, email digests
- `medication-reminders`: Check due medications, create notifications
- `log-medication`: Mark taken/snooze actions

---

## 📁 File Structure

```
src/
├── assets/           # Hero images, morning photo
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── landing/      # HeroCarousel
│   ├── GlowIcon, NavTile, TactileButton, StatusPulse, HeroImage, SettingsGatekeeper
├── contexts/AuthContext.tsx
├── pages/
│   ├── auth/         # GuardianAuth, SeniorAuth
│   ├── guardian/     # Home, Layout, Medicines, Joy, Settings, Onboarding
│   ├── senior/       # Home, Dawa, Santosh, Madad, Parivaar
│   ├── Landing.tsx, NotFound.tsx
├── lib/translations.ts, utils.ts
supabase/functions/
├── send-welcome-email/
├── scheduled-notifications/
├── medication-reminders/
├── log-medication/
docs/
├── WORKFLOW.md, database-queries.sql, futures.md
```

---

## 🚀 Future Roadmap

See `docs/futures.md` for detailed feature plans, monetization strategy, and scaling architecture.

**Next phases:** Health vitals tracking, OCR prescriptions, voice calls (WebRTC), AI companion (Gemini), wearable integration, multi-language support.

---

*Last Updated: February 2026 · Version: 1.1.0*
