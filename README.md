# eLMV — Online Verification System for Weighing & Measuring Instruments

Unified statutory verification, certification, and regulatory tracking system under India's **Legal Metrology Act, 2009** (Act No. 1 of 2010).

---

## Quick Start (Single Command)

To run the entire ecosystem (Backend API, Consumer Web, Admin Web, Field Officer Web, Mobile Expo Bundler, and Public Ngrok Tunnel concurrently):

```bash
npm run dev
```

This single command automatically:
1. Frees ports `5001`, `5173`, `5174`, `5175`, `8081`, `4040` if occupied by stale processes (`scripts/free-ports.js`).
2. Builds the shared Zod schemas & types package (`@sih/shared`).
3. Starts the **Express Backend Server** on `http://localhost:5001`.
4. Starts the **Consumer Web App** on `http://localhost:5173`, **Admin Portal** on `http://localhost:5174`, and **Field Suite** on `http://localhost:5175`.
5. Opens a secure **Public Ngrok Tunnel** exposing port `5173` (with `/api` proxied to port `5001`).
6. Starts the **React Native / Expo Mobile App** in **Tunnel Mode** (`--tunnel`) with `EXPO_PUBLIC_API_URL` configured to the public tunnel gateway.

> **📱 Mobile Testing Across Any Network (Cellular / Remote Wi-Fi)**:
> You do **not** need to be on the same Wi-Fi network as your laptop! When you run `npm run dev`, Expo outputs a public tunnel QR code. Scan it with **Expo Go** on your phone (even on 4G/5G mobile data) — the app bundle downloads over the Expo tunnel, and all login, inspection, and verification API calls route seamlessly to your local backend via the Ngrok API proxy.

### Additional Development Commands

- **Run Full Stack with Public Tunnels (Default)**:
  ```bash
  npm run dev
  ```
- **Run Local LAN Only (No Tunnels)**:
  ```bash
  npm run dev:local
  ```
- **Launch Mobile App on iOS Simulator (Mac)**:
  ```bash
  npm run mobile:ios
  ```
- **Launch Mobile App on Android Emulator**:
  ```bash
  npm run mobile:android
  ```
- **Run Mobile in Dedicated Terminal (Tunnel Mode)**:
  ```bash
  npm run mobile:start
  ```
- **Run Backend Only**:
  ```bash
  npm run server:dev
  ```
- **Run Frontend Only**:
  ```bash
  npm run client:dev
  ```
- **Run Full Monorepo Build**:
  ```bash
  npm run build
  ```
- **Run Typecheck Across All Workspaces**:
  ```bash
  npm run typecheck
  ```
- **Run Integration & Unit Tests**:
  ```bash
  npm test
  ```
- **Seed Database**:
  ```bash
  npm run db:seed
  ```

---

## Live Endpoints & Ports

| Component | Port / Host | URL |
|---|---|---|
| **Consumer Web Portal** | `5173` | [http://localhost:5173](http://localhost:5173) |
| **Admin Management Portal** | `5174` | [http://localhost:5174](http://localhost:5174) |
| **Field Officer Web Suite** | `5175` | [http://localhost:5175](http://localhost:5175) |
| **Public Web & API Tunnel** | `Ngrok` | `https://vapouringly-nonallegoric-teodora.ngrok-free.dev` |
| **Mobile Metro Dev (Expo)** | `8081 / Tunnel` | `exp://...` (Rendered as QR in terminal) |
| **Backend REST API** | `5001` | [http://localhost:5001/api/v1](http://localhost:5001/api/v1) |
| **Server Health Check** | `5001` | [http://localhost:5001/health](http://localhost:5001/health) |
| **PostgreSQL Database** | `5432` | `postgresql://localhost:5432/legal_metrology` |

---

## Pre-Seeded Accounts (Password: `Password@123`)

| Role | Email | Description |
|---|---|---|
| **Admin** | `admin@metrology.gov.in` | Department-wide oversight, audit log, BI, officer workload, statutory fee collection |
| **LMO Officer** | `lmo.bangalore@metrology.gov.in` | Inspector Ananya Rao (Badge: `KA-LMO-2024-089`, Bengaluru Urban jurisdiction), site visit scheduling, physical inspection recording, PKI certification |
| **GATC Lab** | `gatc.lead@precisionlab.org` | Apex Metrology GATC (Gazette Ref: `GOI-DOCA-LM/2023/GATC-041`), accredited testing & calibration bench |
| **Trader / Owner** | `trader.rajesh@shreestores.com` | Commercial user (Shree Provision Stores), instrument registry, Section 24 re-verification applications |

> **Evaluator Tip**: On the login page ([http://localhost:5173/login](http://localhost:5173/login)), expand the **Test Credentials** section beneath the login card to view quick copy-paste credentials for each operational role.

---

## Key Features

1. **Asymmetric PKI Digital Signatures (ECDSA NIST P-256)**:
   - Every verification certificate is cryptographically signed strictly using ECDSA NIST P-256 (`prime256v1`) with SHA-256 (FIPS 186-4 compliant).
   - Deterministic JSON canonicalization ensures byte-reproducible digests.
   - Private keys are stored encrypted at rest using AES-256-GCM.
2. **Public Verification Portal (`/verify`)**:
   - No authentication required.
   - Validates digital signatures against the official public key.
   - Built-in live camera QR scanner with automatic laptop/MacBook camera fallback and instant QR image file upload.
   - Sample active certificate: `LM-KA-2026-0000001`.
3. **Statutory Fee & Treasury Receipt Engine (Rule 14 / Schedule XII)**:
   - Automated fee computation based on instrument category and capacity.
   - Generates official statutory Treasury Receipts (`REC-YYYY-XXXXXX`) with payment reconciliation feeding the Admin revenue dashboard.
4. **Territorial Jurisdictional Routing**:
   - Explicit `OfficerProfile` mapping enforcement officers to districts and zones (`Bengaluru Urban`, `South Zone`) for automated application assignment.
   - Explicit Government Gazette Notification tracking (`notificationRefNumber`) for authorized GATC test centers.
5. **Bilingual Support (English & हिन्दी)**:
   - Full translation coverage across all dashboard views, navigation elements, KPI cards, and action dialogs.
   - Persistent language selection saved across sessions without full-page reloads.
6. **Theme Customization (Default: Light)**:
   - Clean, high-contrast light mode by default with an instant toggle for dark mode.
7. **Statutory Tolerance Engine**:
   - Automated Maximum Permissible Error (MPE) calculation per Legal Metrology Rules, 2011.
   - Rejects applications where observed error exceeds statutory tolerance limits.
8. **End-to-End Workflow**:
   - `SUBMITTED → SCHEDULED → INSPECTED → CERTIFIED → EXPIRED`.
   - Automated daily background cron job flagging instruments due for re-verification within 30 days under Section 24.
9. **Operational BI & Analytics**:
   - Turnaround Time (TAT) distribution, aging pendency buckets, regional compliance rates, officer workload matrices, and statutory fee collections.
10. **Statutory Separation of Duties & Multi-Persona Registry**:
    - Enforces legal separation between applicant and adjudicator under the Legal Metrology Act, 2009: LMO officers and GATC labs cannot self-apply for verification or register commercial devices.
    - Role-adaptive Instruments Registry (`/instruments`): serves as a commercial inventory for Traders, a Section 15 on-site spot-check database for LMOs, a statewide master ledger for Admin, and a technical calibration reference for GATC laboratories.
11. **Mobile Field Inspection Suite (`@sih/mobile`)**:
    - High-performance React Native / Expo application tailored for on-ground statutory enforcement officers and test centre inspectors with unified **eLMV** branding and State Emblem authentication.
    - Minimalist, distraction-free 3-tab layout (`Roster`, `Verify`, `Registry`).
    - 60FPS native spring physics, tactile press feedback, and drag-to-dismiss bottom sheet drawer (`ApplicationDrawer`).
    - Integrated native camera QR code scanner with animated HUD viewfinder, corner reticles, flashlight torch toggle (`Flashlight` / `FlashlightOff`), and instant direct-to-drawer Schedule XI certificate verification.
    - Strict button hierarchy: primary action buttons solid black (`#09090b`), secondary cards and triggers styled in clean light-mode cards with subtle borders.
    - Full-fidelity official Government of Rajasthan Schedule XI Verification Certificate viewer (`CertificateModal`) matching the web portal with zero text truncation.
    - Automated 401 token refresh interceptor via `expo-secure-store` and offline fallback queue.
    - Complete bilingual localization (English & हिन्दी) with dynamic screen re-mounting and dedicated login screen language switcher.
12. **Role-Isolated Web Portals & Decoupled Public Verification**:
    - Dedicated portal workspaces for Traders (`/consumer/*`), Regulators (`/admin/*`), and Field Officers (`/field/*`).
    - Authenticated navigation menus (`Sidebar.tsx`, `ConsumerLayout.tsx`, `FieldLayout.tsx`) are strictly streamlined to role-specific tasks, decoupling public verification from internal navigation while preserving universal `/verify` URL resolution for QR code verification.

---

## Deployment & Free Hosting Guide

### 1. Database (Free Cloud PostgreSQL)
Use **[Supabase](https://supabase.com)** or **[Neon.tech](https://neon.tech)** for a 100% free PostgreSQL instance:
1. Create a free project and copy your connection string:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
   ```
2. Run database migrations from the project root:
   ```bash
   npm run db:push
   npm run db:seed
   ```

### 2. Frontend Web Portals (Vercel)
Deploy the React web application for free on **[Vercel](https://vercel.com)**:
1. Import your GitHub repository in Vercel.
2. In Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-backend-api.onrender.com/api/v1`
4. Routing rewrites are handled automatically via `client/vercel.json` to prevent 404s on page refresh/navigation.

### 3. Backend REST API (Render / Koyeb)
Deploy the Express API for free on **[Render](https://render.com)**:
1. Create a new **Web Service** and connect your GitHub repository.
2. Configure settings:
   - **Root Directory**: Leave empty (repo root) or `server`
   - **Build Command**: `npm install && npm run build --workspace=@sih/shared && npm run build --workspace=@sih/server`
   - **Start Command**: `npm run start --workspace=@sih/server`
3. Add Environment Variables (matching `.env.example`):
   - `PORT`: `5001`
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `postgresql://...` (your Supabase/Neon connection string)
   - `JWT_ACCESS_SECRET`: `<secure-random-32-hex-bytes>`
   - `JWT_REFRESH_SECRET`: `<secure-random-32-hex-bytes>`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`

### 4. Mobile App (Expo EAS)
1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Build an Android APK for distribution:
   ```bash
   cd mobile
   eas build -p android --profile preview
   ```

---

## Documentation

- [ARCHITECTURE.md](file:///Users/Sumit/Desktop/sih/ARCHITECTURE.md) — System architecture, PKI specifications, workflow diagrams, and security model.
- [API.md](file:///Users/Sumit/Desktop/sih/API.md) — Complete REST API specification with endpoints, request bodies, and responses.
- [DATABASE.md](file:///Users/Sumit/Desktop/sih/DATABASE.md) — PostgreSQL database schema and model relationships.
- [CHANGELOG.md](file:///Users/Sumit/Desktop/sih/CHANGELOG.md) — Release notes and phase progression across all delivered releases.
- [TODO.md](file:///Users/Sumit/Desktop/sih/TODO.md) — Complete implementation checklist across all 36 delivered phases.
- [AGENT_NOTES.md](file:///Users/Sumit/Desktop/sih/AGENT_NOTES.md) — Architectural decision records (ADR-001 to ADR-032) and engineering log.


