# LOVORA by Sisirey

A responsive celebration-creation platform starter built with React, Vite, Framer Motion, Supabase, and Vercel.

## Important audio architecture

**Music and sound effects are not hardcoded in `index.html`.** The client reads the shared audio catalogue from Supabase tables (`audio_tracks`, `site_settings`). Audio files live in the Supabase Storage bucket `lovora-audio`. The Audio Studio UI at `/audio` can upload and manage tracks once you finish configuring secure admin permissions.

> Security note: a `VITE_AUDIO_ADMIN_EMAILS` value is visible in browser JavaScript and is only a UI gate. It is not a security boundary. Before production, enforce upload/update/delete permissions with Supabase RLS and/or a server-side admin endpoint. The provided SQL intentionally does not grant public write permissions. The upload UI will need trusted policies before uploads work.

## 1. Create GitHub repository

Create a repository named `lovora-by-sisirey`, upload these files, and commit them. Keep `.env` out of GitHub.

## 2. Run locally

Install Node.js 20.19+ or 22.12+.

```bash
npm install
cp .env.example .env
npm run dev
```

Without Supabase configured, the homepage and theme previews run, but authentication, saving, publishing, and the shared audio catalogue need Supabase.

## 3. Configure Supabase

1. Create a project in Supabase.
2. Open **SQL Editor** and run `supabase/schema.sql`.
3. Copy the Project URL and publishable/anon key from the project API settings.
4. Put them in `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
VITE_AUDIO_ADMIN_EMAILS=you@example.com
```

5. In Supabase Authentication settings, configure your site URL and redirect URLs for local development and your Vercel domain.
6. Create an account through `/auth`.

### Audio admin security before uploads

`VITE_AUDIO_ADMIN_EMAILS` only hides the upload controls from other users; it cannot securely authorize database changes. The starter SQL leaves write permissions closed. For production, create a trusted server-side admin workflow (recommended) or add carefully scoped RLS policies based on a server-maintained admin role. Do not put the Supabase service-role key in any `VITE_` variable or client-side code.

Once secure write permissions are configured, visit `/audio` while signed in as the approved admin:
- Upload background music or sound effects.
- Enable/disable tracks.
- Remove tracks.
- Change default music/effects/vibration settings.
These changes update Supabase and do not require editing `index.html` or redeploying the frontend.

## 4. Deploy to Vercel

1. Push the repository to GitHub.
2. In Vercel, **Add New → Project** and import `lovora-by-sisirey`.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_AUDIO_ADMIN_EMAILS` in Vercel project environment variables.
5. Deploy. After changing environment variables, redeploy the project.

## 5. Current starter scope

Implemented UI and baseline wiring:
- Premium dark homepage and responsive layout
- Dynamic theme presets
- Celebration type selection
- Editor with live preview and editable message/sections
- Supabase sign-up/sign-in
- Dashboard list of projects
- Supabase-backed audio catalogue, music preview, effects and vibration controls
- Audio Studio UI for managing tracks
- Immersive reveal page route
- Starter database schema and basic owner/published-page RLS

## 6. Before public launch

This is a starter, not a finished audited production service. Finish secure audio admin policies/server endpoint, photo storage/upload, robust published-page read policy testing, project delete/unpublish controls, form validation, rate limits, and browser/device testing. Add only audio you own or have permission to distribute. Browser audio requires a user gesture; vibration works only in supported browsers/devices.
