# BankLedger Core
### Institutional-Grade Core Banking & Double-Entry Ledger System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-v5.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-v19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-v8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)

---

## 📌 Executive Overview

**BankLedger** is a next-generation core banking ledger engineered around strict **double-entry accounting principles**, **atomic ACID transaction locks**, and **tamper-evident auditability**.

Designed to mirror modern banking core systems (such as Mambu, Thought Machine, and Temenos), BankLedger guarantees zero balance drift, protects against race conditions and double-spending, and enforces institutional compliance across all financial workflows.

---

## ✨ Core Features & Capabilities

### 1. 🏛️ Strict Double-Entry Bookkeeping Engine
- **Conservation of Value:** Every credit has an equal and opposite debit. Money is never synthesized or deleted arbitrarily.
- **Atomic Concurrency Locks:** Utilizes multi-document MongoDB transaction sessions with concurrency controls to prevent balance drifts, simultaneous double-spend attempts, or partial settlements.
- **Idempotent Execution:** Critical financial mutations carry idempotency safeguards to avoid duplicate debits from network retries.

### 2. 👥 Smart Beneficiary Discovery & Multi-Account Support
- **Human-Centric Payee Lookup:** Senders discover beneficiaries via email address rather than entering raw database IDs.
- **Multi-Account Governance:** If a recipient holds multiple currency accounts (e.g., Primary Savings vs. Secondary Checking), the sender can choose the designated target account.
- **Privacy Masking:** Beneficiary and sender account numbers are securely masked (e.g., `••••4829`) across statement views, email notifications, and receipts.

### 3. 🛡️ Risk-Based 2FA & High-Value OTP Authorization
- **Adaptive Risk Engine:** Standard transactions settle instantly; high-value transfers (e.g., exceeding ₹50,000) automatically trigger a 2FA challenge.
- **Time-Limited OTP Delivery:** One-time passwords are mathematically generated and dispatched to the user's verified email via a secure 5-minute expiry window.

### 4. ✉️ Permanent Notification Infrastructure
- **Gmail App Password Integration:** Zero-token-expiration SMTP delivery that operates permanently 24/7/365 without Google OAuth2 7-day token expirations.
- **Automated Financial Advices:**
  - **Debit Advices:** Real-time transfer summaries with reference IDs and recipient names.
  - **Credit Advices:** Instant inbound deposit notifications.
  - **Welcome & Onboarding:** Automatic confirmation upon account creation.
  - **Transfer OTP:** High-value authorization tokens with transaction context.

### 5. 🎨 Dual Institutional Design System
The frontend is styled with two corporate banking themes designed for zero eye-fatigue, zero AI-glow, and high contrast:
- **Midnight Executive (Dark Mode):**
  - Main Gradient: `linear-gradient(135deg, #182538, #263B54)`
  - Card Gradient: `linear-gradient(145deg, #1B2736, #243448)`
  - Action Gradient: `linear-gradient(90deg, #365C85, #527BA8)`
- **Warm Corporate (Light Mode):**
  - Main Gradient: `linear-gradient(135deg, #E8EDF2, #F8FAFC)`
  - Card Gradient: `linear-gradient(145deg, #FFFFFF, #F5F4F0)`
  - Action Gradient: `linear-gradient(90deg, #455D76, #607A94)`
- **Zero FOUT (Flash of Unstyled Theme):** Inline document head script synchronizes `localStorage` preferences instantly before DOM hydration.

### 6. 💳 Digital Virtual Debit Card & Ledger Tray
- Interactive executive debit card displaying cardholder credentials, expiry, and dynamic balance preview.
- Slide-out security tray revealing routing details, settlement statuses, and instant freeze/unfreeze controls.

### 7. 🧾 Real-Time Statement & Audit Trails
- Comprehensive, filterable ledger table (All Activity, Inflow Credits, Outflow Debits).
- Printable, audited digital transaction receipts detailing settlement mode, timestamp, reference ID, and participating accounts.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite 8 |
| **Styling & Design** | Tailwind CSS v4, Lucide React Icons |
| **State & Authentication** | React Context (`AuthContext`, `ThemeContext`), Axios Interceptors |
| **Backend Runtime** | Node.js (v18+ / v20+), Express.js (v5) |
| **Database & ODM** | MongoDB (Replica Set / Atlas), Mongoose 9 |
| **Security & Cryptography**| JWT (`jsonwebtoken`), `bcryptjs`, Cookie Parser |
| **Notification Engine** | Nodemailer (Gmail App Password SMTP & OAuth2 fallback) |
| **Deployment Targets** | Vercel (Frontend SPA), Render (Backend API), MongoDB Atlas (Database) |

---

## 📂 Project Architecture

```
BankLedger/
├── Backend/
│   ├── src/
│   │   ├── config/             # Database connection & client pooling
│   │   ├── controllers/        # Request handlers (auth, account, transaction)
│   │   ├── middleware/         # JWT verification, system user gate, error handlers
│   │   ├── models/             # Mongoose schemas (User, Account, Transaction, Blacklist)
│   │   ├── routes/             # REST API routing endpoints
│   │   └── services/           # Double-entry ledger logic & permanent email service
│   ├── .env.example            # Environment variable reference
│   ├── package.json
│   ├── server.js               # Application entrypoint & graceful shutdown handlers
│   └── test-email.js           # CLI testing utility for SMTP email verification
│
├── Frontend/
│   ├── src/
│   │   ├── assets/             # Branding icons and emblems
│   │   ├── components/         # Reusable UI widgets
│   │   │   ├── AccountGovernanceModal.jsx
│   │   │   ├── BalanceCard.jsx
│   │   │   ├── CashCounterModal.jsx
│   │   │   ├── DigitalBankCard.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── QuickPayees.jsx
│   │   │   ├── StatementTable.jsx
│   │   │   ├── TransactionReceiptModal.jsx
│   │   │   └── TransferModal.jsx
│   │   ├── context/            # AuthContext & ThemeContext
│   │   ├── pages/              # AuthPage & DashboardPage
│   │   ├── api.js              # Axios instance with auth interceptors
│   │   ├── App.jsx
│   │   ├── index.css           # Tailwind v4 theme variables & custom utilities
│   │   └── main.jsx
│   ├── index.html              # FOUT-prevention script & metadata
│   ├── package.json
│   ├── vercel.json             # SPA routing rewrite configuration for Vercel
│   └── vite.config.js
│
├── .gitignore                  # Production exclusion rules
└── README.md                   # System documentation
```

---

## 🔌 API Reference

### 1. Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user profile & generate primary ledger account | No |
| `POST` | `/api/auth/login` | Authenticate credentials & issue JWT token | No |
| `POST` | `/api/auth/logout` | Invalidate token & blacklist JWT session | Yes |
| `GET` | `/api/auth/me` | Retrieve authenticated profile & active account listings | Yes |
| `GET` | `/api/auth/lookup-recipient?email=...` | Look up verified recipient by email & retrieve available accounts | Yes |

### 2. Account Endpoints (`/api/accounts`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/accounts` | Fetch all accounts held by authenticated user | Yes |
| `POST` | `/api/accounts/create` | Open an additional currency account (e.g. INR) | Yes |
| `GET` | `/api/accounts/:id` | Fetch specific account metadata and balance | Yes |
| `PATCH` | `/api/accounts/:id/freeze` | Freeze or unfreeze an account (Manager / Compliance) | Yes (System) |

### 3. Transaction & Ledger Endpoints (`/api/transactions`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/transactions/transfer` | Execute atomic double-entry transfer between two accounts | Yes |
| `POST` | `/api/transactions/send-transfer-otp`| Request high-value 2FA OTP for pending transfer | Yes |
| `POST` | `/api/transactions/cash-counter` | Perform audited physical deposit or withdrawal | Yes (System) |
| `GET` | `/api/transactions/account/:id` | Fetch complete ledger statement and audit history | Yes |

---

## 🚀 Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org) (v18.0.0 or higher)
- [MongoDB](https://www.mongodb.com) (Local instance or MongoDB Atlas connection string)
- Git

### 1. Clone & Configure Backend

```powershell
# Navigate into backend
cd Backend

# Install dependencies
npm install

# Create environment configuration
copy .env.example .env
```

Open `Backend/.env` and supply your variables:
```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/banking_ledger_system?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
CORS_ORIGIN=http://localhost:5173

# Permanent Email Delivery (Gmail App Password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_16_character_app_password
```

Verify your email connection:
```powershell
node test-email.js
```

Start the backend server:
```powershell
npm run dev
# Server runs on http://localhost:3000
```

### 2. Configure & Launch Frontend

In a second terminal window:

```powershell
# Navigate into frontend
cd Frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
# Application available at http://localhost:5173
```

---

## 🌐 Production Deployment Guide

### Option 1: Cloud Deployment (Vercel + Render + MongoDB Atlas)

#### 1. Database (MongoDB Atlas)
1. Create a free **M0 Shared Cluster** on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User with password authentication under **Database Access**.
3. Under **Network Access**, add `0.0.0.0/0` (Allow Access From Anywhere).
4. Copy the connection string to use as `MONGO_URI`.

#### 2. Backend API (Render)
1. Sign in to [Render](https://render.com) and create a **New Web Service** pointing to your GitHub repository.
2. Configuration:
   - **Root Directory:** `Backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
3. Add Environment Variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `CORS_ORIGIN`: Set to `*` initially, then lock to your Vercel domain once deployed.
4. Copy the assigned URL (e.g., `https://bankledger-api.onrender.com`).

#### 3. Frontend SPA (Vercel)
1. Sign in to [Vercel](https://vercel.com) and import the repository.
2. Configuration:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `Frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://bankledger-api.onrender.com` *(without trailing slash)*
4. Click **Deploy**. Vercel will build and assign your production domain.

#### 4. Lock CORS
Go back to Render → Environment Variables → Set `CORS_ORIGIN` to your Vercel URL (`https://bankledger.vercel.app`).

---

## 🔒 Security & Compliance Architecture

- **ACID Double-Entry Integrity:** Fund movements are encapsulated in transactional session boundaries. Either both debit and credit legs settle successfully, or the entire operation rolls back automatically.
- **Strict Account Isolation:** Users can only query accounts, statements, and cards linked directly to their authenticated user ID.
- **Manager Separation of Duties:** Administrative operations (cashier deposits, account freeze/unfreeze) require the `systemUser: true` privilege flag.
- **Token Invalidation:** Logging out registers the active JWT signature into a blacklist model with TTL auto-expiry, preventing replay attacks.
- **Privacy Masking:** All emails, logs, and UI components mask financial identifiers to protect customer confidentiality.

---

## 📄 License
This project is licensed under the **ISC License**.

