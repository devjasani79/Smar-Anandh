# SmarAnandh — Project Workflow & Technical Documentation

## 🙏 Project Overview

**SmarAnandh** (स्मरआनंद — "Joyful Remembrance") is a digital elder care companion purpose-built for Indian families. In a country where 140 million+ seniors live increasingly separated from their children and grandchildren who have moved to metros for work, SmarAnandh bridges the emotional and practical gap of remote caregiving.

### The Problem

India is aging fast. By 2050, the senior population will exceed 300 million. Yet:

- **65% of medication non-adherence** happens due to forgetfulness, not refusal
- **70% of Indian families** have at least one member living in a different city from elderly parents
- **82% of elderly Indians** lack access to any digital healthcare tool
- **90% of seniors** report feeling lonely when children live in metros

Existing solutions are designed for Western markets — English-only, complex UIs requiring tech literacy, and culturally disconnected from Indian values of joint family care.

### The Solution

SmarAnandh is a **dual-mode application** — a Guardian dashboard for family members managing care remotely, and a Senior companion interface designed for users aged 70+ with limited tech experience:

- **Guardian Mode** (`/guardian/*`): Full-featured dashboard with medication management, activity monitoring, health vitals, joy configuration, and family contact management
- **Senior Mode** (`/app`, `/senior/*`): Ultra-simplified interface with 80px+ touch targets, Hinglish labels, one-action-per-screen philosophy, and PIN-based access (no email/password)

### Why It Works

Three design principles govern every feature:

1. **One Decision Per Screen** — Never overwhelm. Each screen has one clear action.
2. **Hinglish First** — Speak the language seniors think in. "Dawa" not "Medicine". "Khushi" not "Joy".
3. **Dignity Over Dependency** — Help them do things themselves rather than doing things for them.

### How It Can Grow

SmarAnandh is architected for scale from day one:

- **Multi-senior support**: One guardian can manage multiple elderly family members
- **Multi-language**: Database-level language preferences (currently Hindi/Hinglish/English, extensible to regional languages)
- **Pluggable modules**: Joy preferences, health vitals, and activity tracking are modular and extensible
- **API-ready backend**: Edge functions can be extended for third-party integrations (pharmacy APIs, wearable devices, telehealth)

See `docs/futures.md` for the complete roadmap including AI companions, wearable integration, OCR prescriptions, and monetization strategy.

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Backend | PostgreSQL backend (Auth, Storage, Edge Functions) |
| Fonts | Playfair Display (headings), Nunito (body), Poppins (UI) |
| State | React Query + Context API |
| Routing | React Router v6 |

### Design System

The app uses a warm Indian aesthetic with semantic design tokens:

- **Primary**: Saffron/Marigold (`#FF9933`) — warmth, Indian identity
- **Success**: Deep Sage Green (`#2E7D32`) — health, confirmation
- **Background**: Sandalwood Cream (`#FFF8F0`) — warm, non-clinical
- **Destructive**: Deep Red (`#D32F2F`) — alerts, SOS
- Dark mode fully supported with inverted warm tones

---

## 🔐 Authentication

### Guardian: Email + Password
1. Register with email, password, full name, phone number
2. Email confirmation required (no auto-confirm)
3. Complete Senior KYC onboarding (name, photo, health info, language)
4. Set 4-digit Family PIN
5. Welcome email sent automatically via Edge Function

### Senior: Dual-Key (Phone + PIN)
1. Enter Guardian's phone number
2. Enter 4-digit Family PIN
3. Validated server-side via `validate_family_pin_with_phone()` RPC
4. Phone number normalization strips non-digit chars for resilient matching
5. Session stored in localStorage (no auth.users record needed)

---

## 🗄️ Database Schema

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | Guardian profile (name, phone, avatar) | Own data only |
| `user_roles` | Role assignments (guardian enum) | Own roles only |
| `seniors` | Senior profiles, Family PIN, health data | Guardian-linked + self |
| `guardian_senior_links` | Many-to-many Guardian ↔ Senior | Own links only |
| `medications` | Medicine schedules (name, dosage, times) | Guardian-managed, senior-viewable |
| `medication_logs` | Dose tracking (taken/missed/snoozed) | Guardian-viewable, senior-managed |
| `joy_preferences` | Entertainment config (suno/dekho/yaadein/khel) | Guardian-managed, senior-viewable |
| `health_vitals` | BP, sugar, weight, temperature logs | Guardian-viewable, senior-managed |
| `activity_logs` | Activity tracking for dashboard | Guardian-viewable, senior-insertable |
| `family_members` | Emergency/family contacts | Guardian-managed, senior-viewable |
| `notifications` | Alerts, reminders, digests | Scoped by guardian/senior |

### Key RPC Functions

- `validate_family_pin_with_phone(phone, pin)` — Dual-key senior auth
- `get_guardian_seniors(user_id)` — Get all linked seniors
- `has_role(user_id, role)` — Role check (security definer)
- `is_guardian_of(user_id, senior_id)` — Relationship check for RLS
- `get_senior_id_for_user(user_id)` — Senior self-lookup

### Storage Buckets

- `senior-photos` — Senior profile photos (public)
- `medicine-images` — Pill/prescription images (public)
- `family-photos` — Family member photos (public)

---

## ✅ Completed Features

### Landing Page
- Full-width hero carousel with responsive sizing (45vh mobile → 70vh desktop)
- Animated stats bar, feature cards with gradients
- 3-step setup guide with connecting lines
- Testimonials with star ratings
- Gradient CTA section with dual buttons
- Responsive navbar with mobile drawer
- Framer Motion stagger animations throughout

### Authentication & Onboarding
- Guardian signup/login with email confirmation
- Password reset flow
- Senior dual-key auth (phone + PIN)
- Guardian onboarding wizard (2-step: Senior KYC → PIN setup)
- Photo upload to storage during onboarding
- Logout on all screens (guardian, senior, onboarding)

### Guardian Dashboard
- Real-time activity feed, medication logs, health vitals
- Senior selector for multi-senior guardians
- Medication CRUD (add/edit/delete, prescription scanning placeholder)
- Joy configuration (Suno, Dekho, Yaadein, Khelo modules)
- Settings: edit guardian profile, edit senior profile, manage contacts
- Add/delete seniors, delete account

### Senior Interface
- Home screen with Hinglish greeting, profile photo, status pulse
- **DAWA** (💊): View medications by time slot, mark as taken
- **KHUSHI** (😊): YouTube bhajans, TV serials, photo albums, brain games, mood check-in
- **MADAD** (🆘): Emergency SOS with 5-second countdown, quick messages to guardian
- **PARIVAAR** (📞): Family directory with call/video/message buttons

### Backend Functions
- `send-welcome-email`: Gmail SMTP via Edge Function, sends guardian/senior details + PIN
- `scheduled-notifications`: 3-hour cron for medicine reminders, inactivity checks, activity suggestions
- `medication-reminders`: Check due medications, create notification records
- `log-medication`: Mark taken/snooze actions

---

## 📁 File Structure

```
src/
├── assets/              # Hero carousel images, morning photo
├── components/
│   ├── ui/              # shadcn/ui components (50+ components)
│   ├── landing/         # HeroCarousel
│   ├── GlowIcon.tsx     # Icon wrapper with glow effect
│   ├── NavTile.tsx      # Senior navigation tile
│   ├── TactileButton.tsx # Accessible large button
│   ├── StatusPulse.tsx  # Animated status indicator
│   ├── HeroImage.tsx    # Senior profile image display
│   └── SettingsGatekeeper.tsx # PIN gate for settings access
├── contexts/
│   └── AuthContext.tsx   # Auth state, senior mode, linked seniors
├── pages/
│   ├── auth/            # GuardianAuth, SeniorAuth
│   ├── guardian/        # Home, Layout, Medicines, Joy, Settings, Onboarding
│   ├── senior/          # Home, Dawa, Santosh, Madad, Parivaar
│   ├── Landing.tsx      # Landing page
│   └── NotFound.tsx     # 404
├── lib/
│   ├── translations.ts  # Hinglish/Hindi/English strings
│   └── utils.ts         # Utility functions
└── integrations/
    └── supabase/        # Auto-generated client & types

supabase/functions/
├── send-welcome-email/
├── scheduled-notifications/
├── medication-reminders/
└── log-medication/

docs/
├── WORKFLOW.md          # This file
├── database-queries.sql # Complete SQL reference
└── futures.md           # Vision, roadmap, monetization
```

---

*Last Updated: March 2026 · Version: 1.2.0*
