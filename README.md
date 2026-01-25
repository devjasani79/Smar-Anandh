# 🙏 SmarAnandh (स्मरणानंद)
### *Dignified Care, Joyful Living*

**SmarAnandh** is a high-accessibility digital wellness companion designed specifically for elderly Indian users. It bridges the gap between modern medical management and the emotional need for family connection and spiritual joy.



---

## ✨ Key Features

### 👴 For the Senior (The Companion App)
* **Dual-Key Security:** Simple access using a Guardian’s phone number + a 4-digit Family PIN. No complex passwords.
* **Dawa (Medicine):** Large-print, color-coded medication reminders with clear instructions (e.g., "After Breakfast").
* **Santosh (Joy):** A curated "Joy Center" for Bhajans, old classics, and family photo albums.
* **Madad (Help):** One-touch emergency calling and quick-dial buttons for primary family members.
* **Hinglish Support:** Language options including Hindi, English, and Hinglish for natural interaction.

### 🛡️ For the Guardian (The Dashboard)
* **Onboarding Flow:** Seamlessly set up a senior's profile and medication schedule in minutes.
* **Real-time Monitoring:** Get notified when medications are taken or missed via activity logs.
* **Content Curation:** Remotely update the senior’s music preferences and "Yaadein" (Memory) albums.
* **Health Vitals:** Track blood pressure, sugar levels, and weight over time with visual trends.

---

## 🛠️ Technical Architecture

* **Frontend:** React 18 with TypeScript & Vite.
* **Styling:** Tailwind CSS & shadcn/ui (Optimized for high contrast and large touch targets).
* **Backend:** Supabase (Auth, PostgreSQL, Edge Functions).
* **Database:** Relational schema with Row Level Security (RLS) to ensure family data privacy.
* **PWA:** Fully installable as a Progressive Web App for an "App-like" feel on tablets and phones.



---

## 🚀 Quick Start

### Prerequisites
* Node.js (v18+)
* Supabase Account

### Setup
1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd smaranandh

2. **Install Dependencies:**
    ```bash
    npm install

3. **Environment Variables: Create a .env file and add your Supabase credentials:**
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

4. **Run Locally:**
   ```bash
   npm run dev

## 🏗️ Database Schema & Security
The app uses a **Guardian-First** architecture to ensure data integrity and privacy.

* **Profiles & Roles:** Every user is assigned a `guardian` role upon registration via the `user_roles` table.
* **Senior Links:** Seniors are linked to Guardians via the `guardian_senior_links` table, allowing multiple family members to care for one senior.
* **RLS Policies:** Data is sandboxed; Row Level Security (RLS) ensures a Guardian can only see or modify data for Seniors they are explicitly linked to.



---

## 🎨 Design Philosophy
SmarAnandh is built with a "Senior-First" UX approach:

* **Cognitive Load:** Minimized menus. We maintain a maximum of 4 large, distinct buttons per screen for the senior interface to prevent choice paralysis.
* **Visual Accessibility:** WCAG AA compliant contrast ratios. Font sizes start at 18px to ensure readability for users with presbyopia or visual impairments.
* **Tactile Feedback:** Enhanced `TactileButton` components use depth-based CSS and micro-interactions to simulate the "click" of physical hardware buttons.



---

## 📝 License
This project is licensed under the **MIT License**.
