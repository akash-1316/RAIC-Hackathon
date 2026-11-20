# RAIC 24-Hour Hackathon — Frontend

A responsive React + Vite frontend starter inspired by the supplied Render reference. The supplied `back.jpg` wireframe artwork is included in `src/assets/back.jpg`.

## Requirements
- Node.js 18.18+ (Node.js 20 LTS recommended)
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

## Routes
- `/` — Home
- `/about` — About and participation rules
- `/tiers` — Basic, Advanced and Hard tiers
- `/team` — Organizing team placeholders
- `/pricing` — Pricing and rewards placeholders
- `/contact` — Contact enquiry form (frontend demo)
- `/signin` — Sign-in UI (backend not connected)
- `/signup` — Sign-up UI (frontend validation only)
- `/offline-payment` — Offline payment proof form (backend upload/admin verification not connected)

## Before launch
Replace placeholder event name/contact details, organizer profiles, event dates, venue, fee, prize amounts and payment instructions with officially confirmed information. Connect forms to a secure backend, persist registration data, validate uploaded files server-side, and implement authentication and admin payment verification. Do not collect real payments or upload sensitive payment proofs until the backend and storage are secured.
