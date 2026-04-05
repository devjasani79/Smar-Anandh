# SmarAnandh — Project Report & Plan

> Last updated: April 5, 2026

---

## 📋 Project Summary

**SmarAnandh** (स्मरआनंद — "Joyful Remembrance") is a dual-mode digital elder care companion for Indian families. It consists of a **Guardian Dashboard** for remote caregiving management and a **Senior Companion Interface** designed for users aged 70+ with minimal tech experience.

- **Production URL:** https://smar-anandh.vercel.app
- **Tech Stack:** React 18 + Vite 5 + TypeScript + Tailwind CSS + Supabase (standalone)
- **Deployment:** Vercel (frontend), Supabase Edge Functions (backend)

---

## 📜 Project History

### Phase 1–6: Foundation (Completed)
- Dual-mode auth system (Guardian: email/password + Google OAuth; Senior: phone + 4-digit PIN)
- Medication management with CRUD, time-slot scheduling, and prescription OCR scanning
- Senior companion interface with Hinglish labels, 80px+ touch targets, one-action-per-screen
- Joy activities module (Suno, Dekho, Khel, Yaadein)
- Family contacts management with emergency contact support
- Real-time medication tracking with live status indicators
- Guardian dashboard with activity feed, health vitals, and medication adherence charts
- Audit log viewer for tracking changes
- Welcome email automation via Edge Functions (Nodemailer/SMTP)
- Data export functionality for guardians
- PWA support with service worker

### Infrastructure Migration (April 2025)
- **Migrated from Lovable Cloud to standalone Supabase project** (`galvqhlqavwibrgakdyx`)
- Normalized environment variables for Vite frontend (`VITE_*`) and Edge Functions
- Configured Google OAuth with standalone Supabase callback
- Added Vercel SPA rewrite configuration (`vercel.json`)
- Deployed all Edge Functions to standalone project

### Critical Bug Fixes (April 5, 2026)
- **Fixed senior mode persistence on refresh** — `onAuthStateChange` was clearing the senior session (stored in localStorage) when no Supabase auth user existed. Standalone seniors (phone+PIN) don't have a Supabase user, so the session was being wiped on every page reload.
- **Fixed 404 on page refresh** — Added `vercel.json` SPA rewrite and fixed auth guard race condition in `GuardianLayout` to wait for role resolution before redirecting.
- **Created missing database tables** — `medication_adherence_stats` and `audit_logs` were referenced in code but never created, causing 404 errors on the Guardian dashboard.
- **Fixed welcome email not sending** when adding seniors from Guardian Settings (was only wired up in Onboarding flow).
- **Fixed medicine page UI overflow** — Buttons were going out of bounds on mobile; refactored to flex-wrap responsive layout.

---

## 🏛️ Current Architecture

### Frontend Routes
| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Landing | Public landing page |
| `/auth` | GuardianAuth | Guardian login/signup + Google OAuth |
| `/senior/auth` | SeniorAuth | Senior phone+PIN login |
| `/guardian` | GuardianLayout → GuardianHome | Dashboard with activity feed, stats |
| `/guardian/medicines` | GuardianMedicines | Medication CRUD + OCR |
| `/guardian/joy` | GuardianJoy | Joy preferences config |
| `/guardian/vitals` | GuardianHome | Health vitals (shared) |
| `/guardian/settings` | GuardianSettings | Senior management, audit logs, export |
| `/guardian/onboarding` | GuardianOnboarding | First-time senior setup wizard |
| `/app` | SeniorHome | Senior main screen |
| `/senior/dawa` | SeniorDawa | Medication time slots |
| `/senior/santosh` | SeniorSantosh | Joy activities |
| `/senior/parivaar` | SeniorParivaar | Family contacts |
| `/senior/madad` | SeniorMadad | SOS/Help |

### Database Tables
| Table | Purpose |
|-------|---------|
| `profiles` | Guardian user profiles |
| `user_roles` | Role assignments (guardian/senior enum) |
| `seniors` | Senior profiles with KYC data |
| `guardian_senior_links` | Many-to-many guardian↔senior relationships |
| `medications` | Medicine definitions with schedule |
| `medication_logs` | Daily medication status tracking |
| `medication_adherence_stats` | Aggregated adherence percentages (30-day) |
| `activity_logs` | Senior activity tracking |
| `health_vitals` | BP, sugar, weight, etc. |
| `family_members` | Senior's family contacts |
| `joy_preferences` | Suno/Dekho/Khel/Yaadein configs |
| `notifications` | Push/SMS notification queue |
| `audit_logs` | Change tracking for medications & profiles |

### Edge Functions
| Function | Purpose | Deploy Status |
|----------|---------|---------------|
| `send-welcome-email` | Welcome email to new guardians | ✅ Deployed |
| `scan-prescription` | OCR-based prescription reading | ✅ Deployed |
| `log-medication` | Server-side medication logging | ✅ Deployed |
| `medication-reminders` | Reminder dispatch logic | ✅ Deployed |
| `scheduled-notifications` | Cron-based notification processing | ✅ Deployed |

### Environment Variables
**Frontend (Vercel):**
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Anon/public key
- `VITE_SUPABASE_PROJECT_ID` — Project ref for Edge Function URLs
- `VITE_APP_URL` — Production URL (https://smar-anandh.vercel.app)

**Edge Functions (Supabase Secrets):**
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `GMAIL_APP_PASSWORD` — For SMTP email sending
- `APP_URL` — Production URL for email links

---

## 🔮 Next Steps & Future Plan

### Immediate Priorities (Next Sprint)
1. **End-to-end testing** — Verify OAuth flow, senior login, medicine add/view, and page refresh on production
2. **Medication visibility for seniors** — Ensure medicines added by guardians appear in the Senior Dawa screen (verify RLS policies and query paths)
3. **Medication reminders** — Verify the `medication-reminders` Edge Function triggers correctly and logs are created for pending meds each day
4. **Adherence stats population** — Wire `refresh_adherence_stats()` to run on a schedule or after medication log changes

### Short-Term Features (Q2 2026)
5. **Health Vitals Dashboard** — Simple BP/sugar input forms for seniors, trend charts for guardians with anomaly alerts
6. **Medication reminder notifications** — Push notifications via service worker + SMS fallback for missed medicines
7. **Multi-language expansion** — Add Tamil, Telugu, Bengali, Marathi UI strings using the existing `translations.ts` framework
8. **Photo gallery (Yaadein)** — Family photo albums curated by guardians, viewable by seniors

### Medium-Term Features (Q3–Q4 2026)
9. **AI Companion** — Conversational Hinglish chatbot using Gemini for loneliness support, daily check-ins, and cognitive exercises
10. **Smart Prescription Scanner v2** — Multi-medicine extraction, dosage validation, drug interaction warnings
11. **Wearable Integration** — Connect to affordable Indian wearables for auto-vitals (step count, heart rate, sleep)
12. **Family Group Features** — Multiple guardians per senior, shared care responsibilities, handoff notes

### Long-Term Vision (2027+)
13. **Telehealth Integration** — Video consultations with doctors directly from the app
14. **Pharmacy API** — Auto-refill reminders, online medicine ordering
15. **Government Health Scheme Integration** — Ayushman Bharat eligibility checker, scheme enrollment assistance
16. **Regional Language Voice Control** — Voice-first interface for seniors who can't read

### How to Implement Key Features

**AI Companion (Phase 9):**
- Use Lovable AI supported models (Gemini 2.5 Flash for conversational, Gemini 2.5 Pro for complex reasoning)
- Create an Edge Function that proxies AI calls with senior context (name, language, medications, mood history)
- Senior interface: simple chat bubble UI with pre-suggested topics ("Aaj kaisa din raha?", "Koi kahani sunao")
- Guardian dashboard: conversation summaries and mood tracking

**Medication Reminders (Phase 6b):**
- The `scheduled-notifications` Edge Function already exists — wire it to a pg_cron job
- Create medication_log entries for each day's scheduled times (based on `medications.times`)
- Send push notifications via Web Push API + SMS via Twilio for critical misses
- Escalation logic: 1st reminder → 15min snooze → 2nd reminder → notify guardian

**Wearable Integration (Phase 10):**
- Start with Google Fit / Apple Health REST APIs (most Indian wearables sync to these)
- Edge Function to poll/receive webhooks and write to `health_vitals`
- Auto-detect anomalies (sudden BP spike, no steps for 24h) and alert guardians

---

## 📊 Metrics to Track
- Daily Active Seniors (target: 70%+ of registered seniors)
- Medication adherence rate (target: 85%+)
- Guardian dashboard visits per week
- Time-to-first-medicine-add after signup
- Senior session duration and feature usage distribution
- Welcome email open/click rate

---

## 🔐 Security Posture
- RLS on all tables with `is_guardian_of()` and `get_senior_id_for_user()` security definer functions
- Family PINs stored in `seniors.family_pin` (plain text — **migrate to pgcrypto hash**)
- Separate `user_roles` table (never stored on profiles)
- Google OAuth via standalone Supabase (not Lovable-managed)
- CORS headers on all Edge Functions
- No client-side admin checks — all via server-side RLS

---

*This document is the single source of truth for project status. Update after each major change.*
