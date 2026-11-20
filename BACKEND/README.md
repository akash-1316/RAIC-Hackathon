# RAIC Hackathon Backend

Node.js + Express + MongoDB API designed for the supplied React participant frontend.

## Setup
1. Install Node.js 18+ and MongoDB Atlas/local MongoDB.
2. `cp .env.example .env` and set `MONGO_URI`, a long random `JWT_SECRET`, frontend origins and a strong initial admin password.
3. `npm install`
4. `npm run dev`

The server seeds Basic, Advanced and Hard tiers as inactive placeholders with zero prices. Set the official prices and activate the tiers in the admin panel before opening registrations. Existing tiers are not overwritten on restart. It also creates the initial admin account if configured. Change/remove the bootstrap admin password after first login. Admin creation is not publicly available.

## API
Base URL: `http://localhost:5000/api`
- `POST /auth/signup` body `{name,email,phone,password}`
- `POST /auth/login` body `{email,password}`
- `GET /auth/me`
- `GET /tiers` returns `{tiers}` with both `price` and compatibility `amount`
- `POST /registrations` body `{teamName,collegeName,tier,members:[{name,email,phone}]}`
- `GET /registrations/mine` returns `{registration,payments,registrationHistory,workflow}`
- `POST /registrations/:id/cancel`
- `POST /payments` multipart fields `registrationId` (Mongo document `_id`), `transactionId`, `amount`, `proof`
- `GET /payments/:id/receipt` returns PDF for an approved payment
- Admin endpoints are under `/admin`; all require an admin JWT.

## Workflow
Registration is automatic (no registration approval). A user may have one active registration; cancelled records are retained. A payment can be pending, approved or rejected. A pending payment blocks another submission; a rejected payment may be resubmitted. Only admins can approve/reject. Rejection requires remarks. Approval creates a unique receipt number; PDF is generated on download. No email, SMTP or Nodemailer integration exists.

## Security / production notes
Payment proof files are stored outside public static paths and served only through an admin-protected route. Use durable private object storage for production deployments with ephemeral disks. Configure HTTPS, secure secrets, MongoDB backups, upload scanning and an actual payment-account/gateway reconciliation process. An uploaded screenshot or UTR is not independently proof of settlement. This starter performs duplicate UTR checks but does not contact a bank/payment provider.
