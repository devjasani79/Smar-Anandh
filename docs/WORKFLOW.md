# SmarAnandh - Project Workflow Documentation

## 🙏 Project Overview

**SmarAnandh** (स्मरआनंद - "Joyful Remembrance") is a senior care companion app designed for Indian families. It enables caregivers (Guardians) to manage their elderly loved ones' (Seniors) medication schedules, entertainment, and safety — while providing seniors with an ultra-simple, high-contrast interface.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication System](#authentication-system)
3. [User Roles & Session Modes](#user-roles--session-modes)
4. [Database Schema](#database-schema)
5. [Completed Features](#completed-features)
6. [Current Status](#current-status)
7. [Future Roadmap](#future-roadmap)
8. [Technical Stack](#technical-stack)
9. [File Structure](#file-structure)
10. [Testing Guide](#testing-guide)

---

## 🏗️ Architecture Overview

### Core Concept: Dual-Mode Application

```
┌─────────────────────────────────────────────────────────────┐
│                    SmarAnandh App                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │   GUARDIAN MODE     │    │    SENIOR MODE      │        │
│  │   (/guardian/*)     │    │    (/senior/*, /app)│        │
│  │                     │    │                     │        │
│  │ • Email/Password    │    │ • Phone + PIN       │        │
│  │ • Full dashboard    │    │ • Simplified UI     │        │
│  │ • Manage seniors    │    │ • Large buttons     │        │
│  │ • Add medications   │    │ • High contrast     │        │
│  │ • View analytics    │    │ • Hinglish text     │        │
│  │ • Settings access   │    │ • PIN-protected     │        │
│  └─────────────────────┘    └─────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication System

### Guardian Authentication (Email/Password)
- Uses Supabase Auth with email confirmation
- After signup, guardian completes Senior KYC onboarding
- Creates a 4-digit Family PIN for senior access

### Senior Authentication (Phone + PIN - Dual-Key System)
1. Senior enters **Guardian's Phone Number**
2. Senior enters **4-digit Family PIN**
3. System validates via `validate_family_pin_with_phone()` RPC function
4. On success, creates a **SeniorSession** in localStorage

```sql
-- Dual-key validation function
CREATE FUNCTION validate_family_pin_with_phone(guardian_phone TEXT, input_pin TEXT)
RETURNS TABLE(senior_id UUID, senior_name TEXT, ...)
```

### Session Modes
- **SessionMode = 'guardian'**: Full access to dashboard
- **SessionMode = 'senior'**: Locked to simplified interface
- PIN required to exit senior mode or access settings

---

## 👥 User Roles & Session Modes

### Database Roles
```typescript
type AppRole = 'guardian' | 'senior';
```

### AuthContext State
```typescript
interface AuthContextType {
  // Guardian (Supabase Auth)
  user: User | null;
  session: Session | null;
  guardianProfile: GuardianProfile | null;
  linkedSeniors: LinkedSenior[];
  
  // Session Mode
  sessionMode: 'guardian' | 'senior' | null;
  seniorSession: SeniorSession | null;
  
  // Methods
  signUp, signIn, signOut, resetPassword
  enterSeniorMode, exitSeniorMode
  validateDualKey  // Phone + PIN
}
```

---

## 🗄️ Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Guardian profile (name, phone, avatar) |
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

### Key RPC Functions
- `validate_family_pin_with_phone(phone, pin)` - Senior login
- `get_guardian_seniors(user_id)` - List linked seniors
- `is_guardian_of(user_id, senior_id)` - RLS helper
- `has_role(user_id, role)` - Role check

---

## ✅ Completed Features

### Phase 1: Foundation ✅
- [x] Project scaffolding with Vite + React + TypeScript
- [x] Tailwind CSS with custom design tokens
- [x] Supabase integration (Lovable Cloud)
- [x] Database schema with RLS policies

### Phase 2: Authentication ✅
- [x] Guardian signup/login (email/password)
- [x] Email confirmation flow
- [x] Password reset
- [x] Dual-key senior auth (phone + PIN)
- [x] Session persistence with localStorage

### Phase 3: Guardian Dashboard ✅
- [x] Dashboard home with senior cards
- [x] Medication management (add/edit/delete)
- [x] Settings page with profile management
- [x] Guardian profile editing (name, phone)
- [x] Add/remove seniors
- [x] Update Family PIN
- [x] Delete senior/account functionality
- [x] Photo uploads for seniors
- [x] Emergency contacts management

### Phase 4: Senior Interface ✅
- [x] Simplified home screen with large tiles
- [x] DAWA (Medicine) - View and mark taken
- [x] KHUSHI (Joy) - Music, Videos, Photos, Games
- [x] MADAD (Help) - Emergency SOS, quick messages
- [x] PARIVAAR (Family) - Contact family members
- [x] Hinglish UI text throughout
- [x] YouTube integration for bhajans & serials
- [x] Mood tracking

### Phase 5: Landing Page ✅
- [x] Hero carousel with overlay content
- [x] Responsive navbar with mobile menu
- [x] Feature highlights section
- [x] Testimonials
- [x] "How It Works" guide
- [x] CTA buttons

### Phase 6: Backend Functions ✅
- [x] `medication-reminders` edge function (cron job)
- [x] `log-medication` edge function (mark taken/snooze)
- [x] Notification system for missed doses
- [x] Activity logging

---

## 📍 Current Status

### Working Features
1. **Guardian Registration Flow**
   - Sign up with email, password, name, phone
   - Complete Senior KYC (name, photo, health info)
   - Set 4-digit Family PIN
   - Redirect to dashboard

2. **Senior Login Flow**
   - Enter guardian's phone number
   - Enter Family PIN
   - Access simplified senior interface

3. **Guardian Dashboard**
   - View linked seniors
   - Manage medications
   - Edit guardian profile (name, phone)
   - Settings with logout, delete

4. **Senior Interface**
   - All 4 main tiles functional (Dawa, Khushi, Madad, Parivaar)
   - YouTube playback for bhajans and serials
   - Mood check-in
   - High-contrast, large buttons
   - PIN-protected settings access

5. **Medication Reminders**
   - Edge function checks for due medications
   - Creates notification for guardians
   - Tracks missed doses

### Known Limitations
- Photo albums in Joy section are placeholder
- Push notifications not yet connected to devices
- Real phone/video calls not integrated

---

## 🚀 Future Roadmap

### Phase 7: Enhanced Medications
- [ ] OCR prescription scanning
- [ ] Medicine image recognition
- [ ] Smart refill reminders
- [ ] Pharmacy integration

### Phase 8: Push Notifications
- [ ] Device push notifications (Firebase/OneSignal)
- [ ] SMS alerts for missed doses
- [ ] Email summaries for guardians
- [ ] Cron job scheduler in Supabase

### Phase 9: Health Tracking
- [ ] Vital signs logging (BP, sugar, weight)
- [ ] Trend visualizations
- [ ] Health report exports
- [ ] Doctor appointment reminders

### Phase 10: Communication
- [ ] In-app voice/video calls (WebRTC)
- [ ] Voice messages
- [ ] Family photo sharing
- [ ] Activity feed for guardians

### Phase 11: AI Enhancements
- [ ] Smart medication scheduling suggestions
- [ ] Mood detection from interactions
- [ ] Personalized content recommendations
- [ ] Voice assistant integration

---

## 🛠️ Technical Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Animation**: Framer Motion
- **Routing**: React Router v6
- **State**: React Context + TanStack Query

### Backend (Lovable Cloud / Supabase)
- **Database**: PostgreSQL
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage (medicine-images, family-photos, senior-photos)
- **Edge Functions**: Deno runtime
- **RLS**: Row Level Security policies

### Fonts
- **Headings**: Playfair Display (serif)
- **Body**: Nunito (sans-serif)
- **UI**: Poppins (sans-serif)

---

## 📁 File Structure

```
src/
├── assets/                 # Images and static assets
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── landing/            # Landing page components
│   ├── MedicineCard.tsx
│   ├── NavTile.tsx
│   ├── TactileButton.tsx
│   └── ...
├── contexts/
│   └── AuthContext.tsx     # Main auth context
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── integrations/
│   └── supabase/
│       ├── client.ts       # Supabase client
│       └── types.ts        # Generated types
├── lib/
│   ├── translations.ts     # Hinglish translations
│   └── utils.ts
├── pages/
│   ├── auth/
│   │   ├── GuardianAuth.tsx
│   │   └── SeniorAuth.tsx
│   ├── guardian/
│   │   ├── GuardianHome.tsx
│   │   ├── GuardianLayout.tsx
│   │   ├── GuardianMedicines.tsx
│   │   ├── GuardianOnboarding.tsx
│   │   └── GuardianSettings.tsx
│   ├── senior/
│   │   ├── SeniorDawa.tsx
│   │   ├── SeniorHome.tsx
│   │   ├── SeniorMadad.tsx
│   │   ├── SeniorParivaar.tsx
│   │   └── SeniorSantosh.tsx
│   ├── Landing.tsx
│   └── NotFound.tsx
├── App.tsx
├── App.css
├── main.tsx
└── index.css               # Tailwind config + CSS variables

docs/
├── database-queries.sql    # All SQL queries for manual execution
└── WORKFLOW.md             # This file

supabase/
├── config.toml
└── migrations/             # Database migrations
```

---

## 🧪 Testing Guide

### Test Guardian Flow
1. Go to `/auth`
2. Create account with email, name, phone
3. Complete Senior KYC (name, photo optional)
4. Set 4-digit Family PIN
5. Verify redirect to `/guardian`

### Test Senior Flow
1. Go to `/senior/auth`
2. Enter guardian's phone number
3. Enter the Family PIN set during onboarding
4. Verify access to `/app` (Senior Home)
5. Test all 4 tiles (Dawa, Khushi, Madad, Parivaar)

### Test Settings
1. As Guardian, go to Settings
2. Verify logout works
3. Verify delete senior works
4. Verify delete account works

---

## 📝 Notes

### Security Considerations
- All tables have RLS enabled
- SECURITY DEFINER functions for cross-table queries
- PIN stored as plain text (should be hashed in production)
- Phone numbers used as identifiers (should validate format)

### Design Principles
- **Senior-first**: Everything optimized for elderly users
- **Hinglish UI**: Mix of Hindi and English for Indian context
- **High contrast**: Easy readability
- **Large touch targets**: 48px+ tap areas
- **Minimal cognitive load**: One action per screen

---

*Last Updated: February 2026*
*Version: 1.0.0*
