# Architecture Specification — Online Verification System for Weighing & Measuring Instruments

## 1. System Overview

The **Online Verification System for Weighing & Measuring Instruments** is an enterprise-grade digital platform designed to administer and enforce verification, stamping, and certification workflows under India's **Legal Metrology Act, 2009** and the **Legal Metrology (General) Rules, 2011**.

The system facilitates end-to-end digital governance across four primary stakeholder classes:
1. **CONSUMER / TRADER**: Owners, manufacturers, dealers, repairers, and commercial establishments operating weighing and measuring instruments who must register instruments and schedule periodic verifications per Section 24.
2. **LMO (Legal Metrology Officer)**: Statutory enforcement officers assigned to explicit territorial jurisdictions (`jurisdictionDistrict`, `jurisdictionState`, `jurisdictionZone`, and statutory `badgeNumber` via `OfficerProfile`). The system auto-filters and routes pending verification applications directly based on this territorial jurisdiction.
3. **GATC (Government Approved Test Centre)**: Centers notified by the Central or State Government under the Legal Metrology Act. Each center profile explicitly tracks its statutory Government Gazette Notification Reference (`notificationRefNumber`), NABL accreditation (`accreditationNumber`), and authorized testing scope (`authorizedScope`).
4. **ADMIN (State/Central Legal Metrology Department)**: Regulators and controllers supervising department-wide pendency, officer workload, statutory fee collection revenue (₹), Section 24 audit ledgers, and compliance analytics.

---

## 2. Monorepo Architecture

The repository is structured as an npm/TypeScript workspace monorepo consisting of:

```
├── package.json               # Root workspace manifest linking client, server, mobile, shared
├── docker-compose.yml         # Container orchestration for local PostgreSQL & services
├── ARCHITECTURE.md            # System architecture and architectural decision records (ADRs)
├── TODO.md                    # Canonical phase checklist tracking full delivery
├── DATABASE.md                # Detailed Prisma database schema and relational documentation
├── API.md                     # RESTful API specifications (/api/v1) and payload contracts
├── CHANGELOG.md               # Continuous changelog updated on every completed phase
├── AGENT_NOTES.md             # Execution notes, technical decisions, and environment details
│
├── shared/                    # Shared code consumed by server, client, and mobile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── schemas/           # Shared Zod validation schemas (Auth, Instrument, Inspection, etc.)
│       ├── types/             # Inferred TypeScript types, enums, API request/response types
│       └── constants/         # Shared business constants, status codes, regulatory tolerances
│
├── server/                    # Node.js + Express + TypeScript backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   └── schema.prisma      # Prisma ORM schema definition
│   └── src/
│       ├── config/            # Env validation, database client, logger, Cloudinary client
│       ├── middleware/        # JWT auth, RBAC guard, Zod request validation, rate limiting, error handler
│       ├── keys/              # Asymmetric PKI keypair generation, storage, and rotation management
│       ├── utils/             # QR code generator, PDF certificate generator (pdf-lib), cryptographic signing
│       └── modules/           # Domain feature modules
│           ├── auth/          # Dual-token JWT (access Bearer + httpOnly cookie refresh) with token rotation
│           ├── users/         # Profiles: Stakeholder, LMO Jurisdiction (OfficerProfile), GATC Gazette (GATCProfile)
│           ├── instruments/   # Instrument registry, specifications, serial lookup, statutory tolerances
│           ├── applications/  # Application workflow engine, statutory fee calculation (Rule 14), treasury receipts
│           ├── inspections/   # Physical observation recording, field testing data, MPE tolerances
│           ├── certificates/  # Asymmetric PKI signed certificate generation (ECDSA NIST P-256)
│           ├── verification/  # Public signature-verifying inspection portal (no-auth, headless QR camera)
│           ├── notifications/ # Cron-based expiry alerts, email/SMS/push dispatches
│           ├── dashboard/     # Role-specific operational dashboards (Trader, LMO, GATC, Admin)
│           ├── analytics/     # Turnaround time, pendency trends, officer workload, statutory fee revenue
│           └── audit/         # Immutable audit logging for regulatory Section 24 compliance
│
├── client/                    # Web frontend (React + Vite + TypeScript + Tailwind CSS)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── components.json        # shadcn/ui configuration
│   └── src/
│       ├── components/ui/     # shadcn/ui primitive components (buttons, dialogs, tables, cards, etc.)
│       ├── features/          # Feature-based pages and views matching backend modules
│       ├── hooks/             # Custom React hooks, TanStack Query hooks
│       ├── lib/               # Axios/fetch API client, theme provider, utils
│       ├── routes/            # React Router protected and public routes
│       └── i18n/              # react-i18next configuration and English/Hindi locale dictionaries
│
└── mobile/                    # Mobile app (React Native + Expo + TypeScript)
    ├── package.json
    ├── app.json
    └── src/
        ├── components/        # UI primitives & officer components (OfficerHeader, RosterCard, ApplicationDrawer, CertificateModal)
        ├── screens/           # Operational screens: LoginScreen, RosterScreen, VerifyScreen, RegistryScreen
        ├── lib/               # SecureStore token storage, Axios mobileApi with 401 refresh interceptor, AuthContext
        └── i18n/              # i18next configuration and dynamic English/Hindi locale dictionaries
```

---

## 3. UI/UX Design System & Principles

1. **Design Language**:
   - Strict shadcn/ui components on Web and matching minimal components on Mobile.
   - Small button sizes, compact data grids, minimal border radius (8px / `--radius: 0.5rem`), generous whitespace.
   - Base theme: Pure black and white (`#000000` / `#FFFFFF` / high-contrast zinc neutrals) defaulting to **light mode** on initial visit, with persistent user toggle support via `theme_mode`.
   - Navigation: Active sidebar items use a subtle greyish light shade (`bg-zinc-100` with subtle border in light mode; `dark:bg-zinc-800` in dark mode) ensuring clarity without harsh contrast.
2. **Semantic Status Colors**:
   - Zero decorative colors or gradients.
   - Light solid badges strictly reserved for lifecycle states:
     - `SUBMITTED`: Neutral / Zinc
     - `SCHEDULED`: Solid light Blue
     - `INSPECTED`: Solid light Amber
     - `CERTIFIED`: Solid light Emerald / Green
     - `REJECTED`: Solid light Rose / Red
     - `EXPIRED`: Solid light Gray / Muted
3. **Data Integrity & Feedback**:
   - Zero hardcoded or mock data.
   - Every view renders a loading skeleton during query execution and an explicit empty state when collections are empty.
4. **Mobile Native Architecture & Field Ergonomics**:
   - **Streamlined 3-Tab Interface**: Dedicated to operational throughput (`Roster`, `Verify`, `Registry`), removing redundant clutter and administrative settings.
   - **60FPS Native Spring Physics**: Smooth bottom sheets, micro-interactions, and tab transitions using `Animated.spring` with `useNativeDriver: true`.
   - **Gesture-Dismissable Drawer (`ApplicationDrawer.tsx`)**: Bottom-sheet application review drawer with natural downward drag-to-dismiss velocity tracking (`PanResponder`).
   - **Official Schedule XI Verification Certificate (`CertificateModal.tsx`)**: Fully replicated statutory certificate layout matching the web portal, complete with ECDSA NIST P-256 digital signature authenticity status, bilingual seals, and zero text overflow.
   - **Self-Healing Connectivity & Token Interception**: Automated 401 token refresh interceptor in `mobileApi` using refresh tokens from `expo-secure-store`, combined with an interactive offline fallback queue.
   - **Dynamic Bilingual Synchronization**: Instant, monorepo-wide English and Hindi toggle with full screen re-mounting via `key={lang}` and a dedicated login screen language pill.
5. **Button Visual Hierarchy & Native Mobile Camera QR Workflow**:
   - Strict button styling discipline: solid black (`#09090b`) is strictly reserved for primary action triggers (`verifyBtn`). Secondary triggers and cards (such as the Scan QR button and "View Official Schedule XI Certificate") use clean light-mode cards with subtle borders (`#ffffff` background, `#e4e4e7` border, `#18181b` text).
   - Integrated native camera QR code scanner with animated HUD viewfinder, corner reticles, flashlight torch toggle (`Flashlight` / `FlashlightOff`), and zero dummy/simulator buttons.
   - Direct-to-drawer QR verification: scanning physical QR codes immediately opens the official Schedule XI Certificate drawer (`CertificateModal.tsx`) without populating or polluting manual search fields.
6. **Portal Navigation Isolation & Decoupled Public Verification**:
   - Internal authenticated portal workspaces (`/admin/*`, `/consumer/*`, `/field/*`) provide clean, role-focused navigation menus (`Sidebar.tsx`, `ConsumerLayout.tsx`, `FieldLayout.tsx`) without redundant public verification links.
   - Public verification (`/verify`) is decoupled from internal navigation and maintained as an unauthenticated, universally accessible statutory endpoint accessed via direct links, printed certificates, or QR code scans.
7. **Unified eLMV Branding & Canonical State Emblem**:
   - Canonical **eLMV** (Legal Metrology Verification System) branding standardized across web sidebars, top bars, login screens, mobile headers, and configuration files.
   - Authentic State Emblem of India canonically positioned as the web application favicon (`client/public/favicon.jpeg`) and the mobile authentication hero element (`mobile/assets/emblem.jpeg`).

---

## 4. Security & Cryptographic Architecture

### 4.1. Authentication & Authorization
- **Authentication**: Custom JSON Web Token (JWT) architecture with strict token segregation:
  - **Access Tokens**: Short-lived (15 minutes), held strictly in-memory by web/mobile clients, transmitted exclusively via the `Authorization: Bearer <access_token>` HTTP header. Signed with `JWT_ACCESS_SECRET`.
  - **Refresh Tokens**: Long-lived (7 days), signed with `JWT_REFRESH_SECRET`, stored in the PostgreSQL `RefreshToken` table with revocation state.
    - **Web Delivery**: Delivered strictly via an `httpOnly`, `Secure`, `SameSite=Strict` cookie (`refresh_token`). Access from JavaScript is impossible (preventing XSS exfiltration), and `SameSite=Strict` with CORS origin verification protects against CSRF attacks. Bearer delivery is prohibited on web.
    - **Mobile Delivery**: Stored in hardware-backed Expo SecureStore (Android Keystore / iOS Keychain) and transmitted in the JSON payload body to `/api/v1/auth/refresh`.
  - **Refresh Token Rotation (RTR)**: On every session refresh, the presented refresh token is immediately invalidated (`isRevoked: true`), and a cryptographically unique replacement refresh token is issued and persisted. If an already-revoked token is submitted, the system flags token reuse, invalidates all sessions for that user, and logs a security audit event.
  - **Passwords**: Hashed using `bcrypt` (cost factor 12).
- **Role-Based Access Control (RBAC)**:
  - Enforced through higher-order route middleware: `requireRole(['ADMIN', 'LMO', 'GATC', 'CONSUMER'])`.
  - Roles: `CONSUMER`, `LMO`, `GATC`, `ADMIN`.
  - **Statutory Separation of Duties & Conflict-of-Interest Controls**:
    - Under the **Legal Metrology Act, 2009**, inspecting officers (`LMO`) and certifying laboratories (`GATC`) are statutory verification authorities and adjudicators. Permitting an enforcement officer or testing lab to apply for verification or register commercial instruments would represent an immediate conflict of interest (the certifier cannot also be the applicant).
    - Consequently, `+ New Application` and `+ Register Instrument` actions are strictly role-gated in the UI and API to **Commercial Traders (`CONSUMER`)**, with proxy creation reserved solely for **Department Regulators (`ADMIN`)** handling manual in-person filings.
  - **Statutory Role of the Instruments Registry (`/instruments`) per Persona**:
    - **CONSUMER (Commercial Trader / Enterprise)**: Acts as their commercial asset register to track weighing scale inventory, monitor calibration expiration dates per Section 24, and trigger re-verification applications before statutory deadlines.
    - **LMO (Legal Metrology Officer)**: Operates as their **Field Inspection & Spot-Check Database** under Section 15 powers of entry, search, and seizure. When inspecting a retail store, factory, or weighbridge, the officer cross-checks the physical instrument serial number, accuracy class, registered owner, and active stamping status to identify expired or unverified instruments before issuing compounding or seizure notices.
    - **ADMIN (Legal Metrology Department HQ)**: Serves as the **Statewide Master Regulatory Asset Ledger** under Sections 17 & 24 to monitor district compliance percentages, identify industrial asset clusters, detect overdue devices, and oversee the integrity of weights and measures across the state.
    - **GATC (Government Approved Test Centre)**: Acts as a technical device lookup directory to inspect physical equipment specifications (e.g., maximum capacity, verification scale interval `e`, accuracy class Class I/II/III/IV) and cross-reference laboratory test history during bench calibration.

### 4.2. Asymmetric PKI Certificate Signing
- **Algorithm**: Strictly **ECDSA NIST P-256 (`prime256v1`) with SHA-256 digest** (FIPS 186-4 compliant standard for official government document signatures).
  - *Standardization Rationale*: NIST P-256 is the universally recognized cryptographic standard for public sector and legal digital signatures, supported natively across modern runtimes and hardware security modules (HSMs). Unlike cryptocurrency-associated curves (`secp256k1`), P-256 complies directly with national digital governance guidelines while yielding compact 64-byte raw / 88-char Base64 signatures ideal for printed QR codes at Level H error correction.
- **Key Generation & Storage**:
  - Keypairs generated cryptographically on the server using Node.js `crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" })`.
  - Public keys stored in the `SigningKey` table with versioning (`keyVersion`, `publicKey`, `validFrom`, `validUntil`, `isActive`).
  - Private keys encrypted at rest using AES-256-GCM (`server/src/keys/pki.ts`) and injected via secrets management; never logged, committed, or exposed via API.
- **Signing Flow**:
  1. Certificate metadata (Certificate ID, Application ID, Instrument Serial, Applicant ID, Officer ID, Verification Date, Expiry Date, Tolerances Observed) is canonicalized as a deterministic JSON string.
  2. A SHA-256 cryptographic hash is generated.
  3. The active private key signs the hash, producing a Base64/Hex digital signature.
  4. The signature, along with `keyVersion` and verification URL, is embedded into:
     - The database `Certificate` record.
     - The high-resolution QR code rendered via `qrcode`.
     - The digitally stamped PDF certificate generated via `pdf-lib`.
- **Public Verification Flow**:
  1. Anyone can scan the QR code via mobile camera or webcam, upload a QR image directly, or visit `/verify?token=<qrToken>` or `/api/v1/verification/verify/<certificateNumber>`.
  2. The scanner uses a headless `Html5Qrcode` controller with automatic fallback from rear-facing environment cameras to front-facing user webcams (ensuring seamless support across laptops and MacBooks), complete with live viewfinder reticle alignment guides and client-side image decoding.
  3. The server loads the corresponding `SigningKey` public key by `keyVersion`.
  4. The cryptographic signature is verified against the canonical certificate payload.
  5. If valid, the portal displays verified instrument, applicant, and inspection metrics with a verified cryptographic stamp and one-click stamped PDF download. If the signature is forged or mismatched, verification fails regardless of database content.

---

## 5. Storage Architecture (Cloudinary)
- **Document & Photo Storage**:
  - Verification site photos and calibration reports are uploaded with automatic optimization and secure HTTPS delivery.
- **Certificate PDFs**:
  - Generated on-the-fly via `pdf-lib`.
  - Uploaded to Cloudinary with `resource_type: "raw"` to preserve byte-level binary integrity of PDF files.

---

## 6. Internationalization (i18n) Architecture
- **Web**: `react-i18next` with `i18next-browser-languagedetector`.
- **Mobile**: `i18next` with device locale detection.
- **Languages**: English (`en`) and Hindi (`hi`) at launch with instant runtime language switching.
- **Bilingual Coverage**: Complete localization across all four operational role dashboards (`CONSUMER`, `LMO`, `GATC`, `ADMIN`), action tables, KPI metrics, and statutory workflow dialogs (Instrument Registration, Verification Application, Inspection Scheduling, and Field Test Observation Recording).
- **Extensibility**: All UI strings are decoupled from presentation components into structured JSON locale namespaces (`common.json`, `auth.json`, `instruments.json`, `inspections.json`, `certificates.json`). Adding a new regional Indian language (e.g., Marathi, Tamil, Bengali) requires adding a translation JSON file with zero code modifications.

---

## 7. Analytics & BI Engine
- **Dedicated Aggregation Layer**: Real-time SQL aggregations via Prisma & raw SQL queries where appropriate:
  1. **Pendency Trends**: Grouped by days pending (<7 days, 7-15 days, 15-30 days, >30 days).
  2. **Turnaround Time (TAT)**: Average hours/days elapsed from `SUBMITTED` to `CERTIFIED`.
  3. **Officer Workload**: Breakdown of inspections completed, pending, and rejection rates per officer.
  4. **Regional Distribution**: Geographic compliance by district/zone.
  5. **Statutory Fee Collection**: Aggregated revenue (₹) across settled treasury receipts (`_sum: { feeAmount: true }`).
- Visualized using modern charts (Recharts on web) adhering to the strict black/white and semantic palette.

---

## 8. Statutory Fee, Treasury Receipts & Payment Architecture

- **Regulatory Mandate**: Under Section 24 of the Legal Metrology Act, 2009 and **Rule 14 / Schedule XII of the Legal Metrology (General) Rules, 2011**, statutory fees are prescribed for verification and re-verification of weighing and measuring instruments according to class and capacity.
- **Automated Fee Computation Engine**:
  - When an applicant submits a verification application (`/api/v1/applications`), the engine calculates the statutory fee based on instrument category and capacity (e.g., Non-Automatic Weighing Instrument: ₹500, Automatic Weighing Instrument: ₹1,000, Fuel Dispenser: ₹2,000, Storage Tank: ₹5,000).
- **Statutory Treasury Receipt Generation**:
  - The system records `feeAmount` and automatically generates a unique statutory treasury receipt reference (`feeReceiptNumber`, formatted as `REC-YYYY-XXXXXX`).
  - Application transitions from `SUBMITTED` to `SCHEDULED` require payment confirmation (`feePaid: true`).
- **Revenue Reconciliation & Audit**:
  - All fee transactions are tracked in the database and feed the real-time **Statutory Revenue Collection (₹)** KPI on the Department Controller / Admin Command Center and BI Analytics engine.
  - Ensures complete financial transparency, eliminating manual cash leakage and unreceipted verification in the field.
