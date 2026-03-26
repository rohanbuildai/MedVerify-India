# 🏥 MedVerify India

> A full-stack MERN application built to help users verify medicines, report suspected counterfeit drugs, and provide admins with actionable public-safety insights.

## Overview

**MedVerify India** is a public-safety focused platform designed to fight counterfeit medicines in India.

It allows users to:

* Search and verify medicines from a trusted database
* View flagged / high-risk medicines
* Submit suspicious medicine reports with image evidence
* Track their own reports and verification activity
* Explore a public community reports feed
* Give administrators a dashboard to review trends and take action

This project is built as a **full-stack MERN app** with:

* **Frontend:** React (Create React App)
* **Backend:** Node.js + Express
* **Database:** MongoDB / MongoDB Atlas
* **Auth:** JWT-based authentication
* **Deployment:** Docker + Docker Compose support

---

## Features

### Public Features

* 🔎 **Medicine verification search** by medicine name, brand, or generic name
* 🚩 **Flagged medicines page** for medicines already marked suspicious/fake
* 📢 **Public reports feed** showing community-submitted suspicious medicine reports
* 📊 **Public stats endpoint** for platform-level safety metrics

### Authenticated User Features

* 👤 User registration and login
* ✉️ Email verification flow (backend implemented)
* 🔐 JWT authentication with protected routes
* 📝 Submit counterfeit medicine reports
* 🖼️ Upload up to **3 evidence images** per report
* 👍 Upvote existing reports to confirm similar issues
* 📂 View personal reports and dashboard metrics

### Admin / Pharmacist Features

* ➕ Add medicines to the verified database (admin / pharmacist)
* 🛠️ Update medicine records (admin only)
* 📈 Admin dashboard with:

  * Total users
  * Total medicines
  * Flagged medicines count
  * Pending vs actioned reports
  * Verification counts
  * Recent activity trends
  * Top affected states
* 🧾 Review and update report status

### Security & Backend Hardening

* 🛡️ `helmet` security headers
* ⏱️ API rate limiting (general + auth-specific)
* 🧹 Mongo query sanitization
* 📦 Response compression
* 🔒 Password hashing with `bcryptjs`
* 🍪 HTTP-only JWT cookies (backend response) + bearer token support

---

## Tech Stack

### Frontend

* React 18
* React Router DOM 6
* Axios
* React Hot Toast
* React Icons
* Recharts
* CSS modules / page-level CSS files

### Backend

* Node.js
* Express
* MongoDB + Mongoose
* JWT (`jsonwebtoken`)
* Bcrypt (`bcryptjs`)
* Multer (file uploads)
* Nodemailer (email verification / password reset)
* Express Validator
* Helmet / Rate Limit / Compression / Morgan

### DevOps / Deployment

* Docker
* Docker Compose
* Nginx (frontend container)

---

## Project Structure

```bash
medverify/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env.example
│   ├── Dockerfile
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── styles/
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── package.json
```

---

## Core API Endpoints

### Auth

* `POST /api/auth/register` — Register user / pharmacist (admin via secret key)
* `POST /api/auth/login` — Login
* `POST /api/auth/logout` — Logout (protected)
* `GET /api/auth/me` — Current user profile (protected)
* `POST /api/auth/forgot-password` — Request password reset
* `PUT /api/auth/reset-password/:token` — Reset password
* `GET /api/auth/verify-email/:token` — Verify email

### Medicines

* `GET /api/medicines/search?q=<query>` — Search medicines
* `GET /api/medicines/flagged` — Get flagged medicines
* `GET /api/medicines/stats` — Medicine stats
* `GET /api/medicines` — Get all medicines
* `GET /api/medicines/:id` — Get medicine details
* `POST /api/medicines` — Add medicine (admin / pharmacist)
* `PUT /api/medicines/:id` — Update medicine (admin only)

### Reports

* `GET /api/reports/public` — Public reports feed
* `GET /api/reports/stats` — Public report stats
* `POST /api/reports` — Submit report with images (protected)
* `GET /api/reports/my` — Current user reports (protected)
* `GET /api/reports/:id` — Get single report (protected)
* `POST /api/reports/:id/upvote` — Upvote report (protected)
* `GET /api/reports` — All reports (admin only)
* `PUT /api/reports/:id/status` — Update report status (admin only)

### Dashboard

* `GET /api/dashboard/public-stats` — Public homepage metrics
* `GET /api/dashboard/stats` — Admin dashboard stats (admin only)

### Health Check

* `GET /health`

---

## Data Models (High Level)

### `User`

* `name`, `email`, `password`
* `phone`, `state`, `city`
* `role` → `user | pharmacist | admin`
* `isEmailVerified`
* `reportsCount`, `verificationCount`

### `Medicine`

* `medicineId` (QR-friendly unique ID)
* `name`, `genericName`, `brand`, `manufacturer`
* `category`, `composition`, `dosageForm`, `strength`
* `licenseNumber`, `approvedBy`, `scheduleType`
* `physicalFeatures`, `packagingFeatures`
* `isFlaggedAsFake`, `riskLevel`

### `Report`

* `reportId`
* `medicineName`, `brandName`, `batchNumber`
* `suspicionType`, `description`
* `purchaseLocation` (city/state/address etc.)
* `images[]`
* `status`, `priority`
* `upvotes`, `upvoteCount`
* authority referral fields

### `Verification`

* `searchQuery`
* `result` → `authentic | suspicious | not_found | flagged`
* optional location and feedback metadata

---

## Local Development Setup

### 1) Clone the repository

```bash
git clone https://github.com/your-username/medverify-india.git
cd medverify-india
```

### 2) Install dependencies

From the root:

```bash
npm run install:all
```

Or manually:

```bash
npm install --prefix backend
npm install --prefix frontend
```

### 3) Configure environment variables

Create a `.env` file inside `backend/`:

```bash
cp backend/.env.example backend/.env
```

Update at least the following values:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=MedVerify India <noreply@medverify.in>

CLIENT_URL=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

ADMIN_EMAIL=admin@medverify.in
ADMIN_SECRET_KEY=your_admin_secret_key

MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### 4) Start the app

From the root:

```bash
npm run dev
```

This runs:

* **Frontend:** `http://localhost:3000`
* **Backend API:** `http://localhost:5000`

### 5) Seed sample data (optional but recommended)

```bash
npm run seed
```

This seeds:

* Sample medicine records
* A demo admin account

**Demo Admin Credentials:**

```txt
Email: admin@medverify.in
Password: Admin@MedVerify2024
```

> Do **not** keep these credentials in production.

---

## Docker Setup

### Run with Docker Compose

```bash
docker-compose up --build
```

Services:

* **Frontend:** exposed on port `80` (and `443` in compose)
* **Backend:** exposed on port `5000`

Before running, make sure the required environment variables are available to Docker Compose (e.g. via shell export or a root `.env` file used by Compose).

---

## Frontend Routes

### Public Routes

* `/`
* `/verify`
* `/verify/:id`
* `/reports/public`
* `/flagged`
* `/login`
* `/register`

### Protected Routes

* `/report`
* `/dashboard`
* `/profile`

### Admin Routes

* `/admin`
* `/admin/*`

---

## Important Notes / Known Gaps

This project is solid, but here’s the blunt truth: **it is not fully production-complete yet**.

### Current gaps visible in the codebase

* The frontend contains a **Forgot Password** link (`/forgot-password`) but no matching route/page is registered in `App.js`.
* Email verification and reset-password backend flows exist, but the frontend does **not currently expose dedicated pages** for those flows.
* The backend returns both an **HTTP-only cookie** and a **JWT token in JSON**, while the frontend primarily stores the token in `localStorage`. That works, but it’s a mixed auth strategy and should be standardized before production.
* There are signs of generated placeholder directories in the zip (brace-expanded folder artifacts), which should be cleaned before publishing.
* You should add:

  * tests
  * API docs (Swagger / Postman collection)
  * CI pipeline
  * file storage strategy for production uploads
  * audit logging / moderation workflow if this becomes public-facing

If you publish this on GitHub as-is, don’t pretend it’s enterprise-ready. Call it what it is: **a strong MVP / hackathon-grade full-stack project with real potential**.

---

## Recommended Improvements

* Add **QR code scan flow** in frontend (the backend already includes `qrcode` dependency)
* Add **forgot password / reset password UI**
* Add **email verification landing pages**
* Add **pagination + filters** for public reports and flagged medicines
* Add **unit/integration tests** (Jest + Supertest / React Testing Library)
* Add **role-based admin moderation audit trail**
* Add **cloud image storage** (S3 / Cloudinary) instead of local uploads for production
* Add **CDSCO integration** or official reference datasets if possible
* Add **PWA support** for rural / low-connectivity users
* Add **geospatial clustering** for counterfeit hotspots

---

## Security Considerations

Before production deployment:

* Use a strong `JWT_SECRET`
* Rotate and protect email credentials
* Move uploads to secure object storage
* Add stricter MIME-type validation for uploads
* Add antivirus / malware scanning for uploaded files
* Enforce HTTPS end-to-end
* Restrict CORS to the exact frontend domain
* Add account lockout / brute-force monitoring dashboards
* Avoid exposing demo credentials publicly

---

## Scripts

### Root

```bash
npm run install:all   # Install backend + frontend deps
npm run dev           # Run frontend + backend in parallel
npm run build         # Build frontend
npm run seed          # Seed sample data
npm start             # Start backend
```

### Backend

```bash
npm run dev --prefix backend
npm start --prefix backend
```

### Frontend

```bash
npm start --prefix frontend
npm run build --prefix frontend
```

---

## Contributing

Contributions are welcome.

If you want this repo to look serious on GitHub, add the following before asking for PRs:

1. A real issue template
2. A pull request template
3. A proper license
4. Screenshots / demo GIFs
5. Deployment instructions for Render / Railway / Vercel / EC2

---

## License

No license file was included in the current project archive.

**Recommendation:** add an explicit license before publishing, for example:

* MIT (simple, permissive)
* Apache-2.0 (better patent clarity)

Without a license, other people technically **cannot safely reuse your code**.

---

## Screenshots

Add screenshots here once available:

```md
![Home Page](./screenshots/home.png)
![Verify Medicine](./screenshots/verify.png)
![Admin Dashboard](./screenshots/admin-dashboard.png)
```

---

## Why This Project Matters

Counterfeit medicines are a real public health threat.

**MedVerify India** is a practical product idea with strong social impact: it combines public reporting, searchable medicine records, and admin-level review tools into one platform that could genuinely help surface suspicious drug activity faster.

That said, don’t oversell it. Right now it’s a **strong portfolio project / MVP**, not a finished national-scale healthtech platform.

---

## Author

Add your name / portfolio / LinkedIn / GitHub here.

```md
**Your Name**  
GitHub: https://github.com/your-username  
LinkedIn: https://linkedin.com/in/your-profile
```

---

## Final Reality Check

If this is going on GitHub:

* Clean the repo
* Add screenshots
* Add a license
* Add deployment steps
* Remove demo secrets from the README if you don’t want random people testing your admin login

That’s the difference between **“I built something”** and **“I present like an engineer people trust.”**
