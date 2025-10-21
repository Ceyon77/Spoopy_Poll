# Halloween Costume Contest — Netlify Voting App

A tiny, free-tier friendly voting app for live costume contests. Judges scan a QR, vote across categories, and you show a live results dashboard that auto-refreshes.

**Stack**
- Netlify static hosting (free)
- Netlify Functions (serverless API)
- Netlify Blobs (simple JSON storage) — no external DB
- Vanilla HTML/CSS/JS

## Quick Start (no coding required)

1. **Import to Netlify**
   - Create a new Git repo with these files (or drag this folder into a new repo on GitHub).
   - On Netlify: **Add new site → Import from Git** → pick your repo.
   - Accept defaults. Netlify will deploy automatically.

2. **Initialize the contest data**
   - Visit: `/.netlify/functions/init` once after deploy to seed config + empty votes.
     - (Alternatively, run locally with `npm i` then `npm run dev` and open **http://localhost:8888/.netlify/functions/init**)

3. **Share judge QR**
   - Your judge voting page is at `/` (e.g., https://<yoursite>.netlify.app/)
   - Generate a QR code pointing to your root URL with an external tool (or use any free QR site).

4. **Open the live results dashboard**
   - Visit `/results.html` on your site.
   - It auto-refreshes every 2 seconds and shows totals by category and overall.

### Editing contestants & categories
- Edit `public/assets/config.json` and redeploy (or visit `/init` again to reset blob config).
- Judges: default PINs are in `public/assets/judges.json`. A judge can only submit 1 ballot.

### Important
- This demo uses **simple protections**:
  - Judges enter a **4-digit PIN** (stored in `judges.json`). Each PIN can submit exactly one ballot.
  - Do not share the judge PINs publicly.
- For a more robust setup (unique invite URLs per judge, expiring tokens, audit logs), expand the functions, or plug in a managed auth (e.g., Netlify Identity) and/or external realtime service.

## Local Dev

```bash
npm i
npm run dev   # opens http://localhost:8888
# Visit http://localhost:8888/.netlify/functions/init once
```

## Files

- `public/index.html` — judge voting form
- `public/results.html` — live results dashboard
- `public/assets/config.json` — categories + contestants
- `public/assets/judges.json` — judge PINs
- `netlify/functions/init.js` — seeds blobs with config + empty votes
- `netlify/functions/vote.js` — accepts a ballot (one per judge PIN)
- `netlify/functions/results.js` — returns aggregated results
- `netlify.toml` — Netlify config
