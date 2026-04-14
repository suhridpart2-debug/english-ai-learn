# SpeakAI - AI English Speaking Practice App

A premium, mobile-first, Next.js 16+ powered AI speaking coach designed to help users achieve fluency. 

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS V4 + Framer Motion
- **State Management**: Zustand
- **Backend/Auth**: Supabase (via wrapper functions)
- **PWA**: `@ducanh2912/next-pwa`
- **Charts**: Recharts

## Features
- **PWA Ready**: Installable directly on your phone.
- **Microphone Integration**: Real-time waveform visualizers.
- **60-Second Challenge**: Speak for 60 seconds with instant AI analysis.
- **AI Mocking Engine**: Safe fallback mode generating simulated AI grading (Grammar, Fluency, Pronunciation).
- **History & Progress**: Track past iterations, view growth charts.
- **IELTS Mode**: Structured practice blocks.

## How to Run Locally

1. **Install Dependencies**
   Run `npm install` (dependencies are already installed in your workspace).

2. **Environment Variables**
   Create a `.env.local` file and add genuine keys if wiring up the backend (optional, app is mock-safe).
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
4. **View App**
   Open [http://localhost:3000](http://localhost:3000)

## How to Deploy on Vercel

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and click "Add New Project".
3. Import your GitHub repository.
4. Add the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the Environment Variables section.
5. Click **Deploy**. Vercel will automatically detect the Next.js framework and build the app.

## How to install on Phone as PWA

1. Deploy the app (e.g., via Vercel) so it serves over HTTPS.
2. Open the URL on your mobile browser (Safari on iOS, Chrome on Android).
3. **iOS (Safari)**: Tap the "Share" icon at the bottom, then scroll down and tap **"Add to Home Screen"**.
4. **Android (Chrome)**: A banner will pop up saying "Add SpeakAI to Home screen", or tap the 3-dot menu and select **"Install app"**.
5. The app will now launch in full-screen mode like a native app.

## How to convert to APK later

1. To compile this PWA into an Android APK, you can use **Bubblewrap** or **PWABuilder**.
2. Go to [pwabuilder.com](https://www.pwabuilder.com/).
3. Paste the deployed URL of your app.
4. PWABuilder will automatically package your manifest, service worker, and web assets into an `.apk` file or an `.aab` file ready for the Google Play Store.
