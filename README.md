# 💨 Fartfolio

### *Track your assets.*

> The world's most serious flatulence portfolio management platform.

**Live app → [fartfolio-green.vercel.app](https://fartfolio-green.vercel.app)**

<img width="377" height="816" alt="imagen" src="https://github.com/user-attachments/assets/95bbbf7a-d654-40c9-b69c-af5925d3c674" />

---

## What is Fartfolio?

Fartfolio is a mobile-first web app for tracking, analyzing, and benchmarking your personal flatulence output against a global market of fellow investors. Because every toot counts. 📊

Features include real-time leaderboards, daily/weekly/monthly emissions reports, a 7-day bar chart, market share analytics, and a rank progression system from *Junior Analyst* all the way to *Grand Poobah CFO*.

---

## Features

- 💨 **One-tap emissions logging** — with satisfying sound effects and particle animations
- 📊 **Personal dashboard** — today, week, month, and all-time stats
- 📈 **7-Day Emissions Report** — bar chart of your daily output
- 🌍 **Global leaderboard** — see your market share vs. all investors worldwide
- 🏆 **Rank progression** — Junior Analyst → Asset Manager → VP of Emissions → Grand Poobah CFO 💩
- 🔐 **Google OAuth** — sign in with your Google account
- 📡 **Analyst Notes** — rotating fart-finance wisdom on every rip
- 🛡️ **Admin dashboard** — Board of Directors view with global aggregate metrics
- 📱 **PWA** — installable on iOS and Android, works like a native app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Auth | Supabase (Google OAuth) |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |
| PWA | vite-plugin-pwa |

---

## Getting Started

### Prerequisites

- Node.js v20+
- A [Supabase](https://supabase.com) account
- A [Google Cloud](https://console.cloud.google.com) project with OAuth credentials
- A [Vercel](https://vercel.com) account

### Local Development

```bash
# Clone the repo
git clone https://github.com/iamctodd/fartfolio.git
cd fartfolio

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase URL and anon key

# Start dev server
npm run dev
```

### Environment Variables

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from **Supabase → Settings → API**.

### Database Setup

1. Go to **Supabase → SQL Editor**
2. Paste and run the contents of `schema.sql`
3. This creates the `profiles`, `farts`, and `leaderboard` tables with Row Level Security

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add your Supabase callback URL to **Authorized Redirect URIs**:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
4. Add your domain to **Authorized JavaScript Origins**:
   ```
   https://your-vercel-app.vercel.app
   ```
5. Paste Client ID and Secret into **Supabase → Authentication → Providers → Google**

---

## Deployment

### Vercel

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add environment variables in **Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy 🚀

### PWA Installation

**iPhone:** Safari → Share → Add to Home Screen

**Android:** Chrome → ⋮ Menu → Add to Home Screen

---

## Admin Access

The Board of Directors dashboard shows global aggregate metrics and the full leaderboard across all users. Access it from the main screen using the board password. 🔐

---

## Rank System

| Rank | Minimum Rips |
|---|---|
| Junior Analyst 📋 | 0 |
| Asset Manager 💼 | 5 |
| Senior Trader 📈 | 15 |
| Portfolio Director 🎯 | 30 |
| VP of Emissions 🏢 | 50 |
| Chief Gas Officer 🦨 | 75 |
| Grand Poobah CFO 💩 | 100 |

---

## Roadmap

- [ ] Capacitor iOS/Android native build
- [ ] Push notifications (*"Market conditions are ripe 💨"*)
- [ ] Streak tracking
- [ ] Custom sound effects per rank
- [ ] Monthly earnings reports via email
- [ ] IPO mode — go public with your portfolio

---

## Contributing

PRs welcome. All contributions must pass the smell test. 👃

---

## License

MIT — rip freely.

---

*Built with Claude. Deployed with Vercel. Powered by beans.* 🫘
