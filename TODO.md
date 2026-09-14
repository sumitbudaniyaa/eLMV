# Project Roadmap & Implementation Tasks (TODO.md)

This tracker records the delivery status of all 13 phases for the **Online Verification System for Weighing and Measuring Instruments**.
In accordance with hard project rules, every phase must be fully implemented, tested, and reflected across all markdown documents before advancing. No item is deferred.

---

## Status Legend
- `[ ]` Not Started
- `[/]` In Progress
- `[x]` Completed & Verified

---

## Phase 0: Project Scaffolding & Foundational Setup
- [x] Root workspace setup (`package.json` workspaces for `server`, `client`, `mobile`, `shared`)
- [x] TypeScript configurations (`tsconfig.json` base and package-specific)
- [x] `docker-compose.yml` with PostgreSQL 16 & local database configuration
- [x] Root and package-level `.env.example` configurations
- [x] `shared/` package scaffolding with initial Zod schemas & TypeScript types
- [x] `server/` scaffolding: Express, Prisma ORM initialization, pino structured logger, centralized error handler
- [x] `client/` scaffolding: Vite + React + TypeScript, Tailwind CSS, shadcn/ui configuration, react-i18next setup
- [x] `mobile/` scaffolding: Expo React Native with TypeScript, i18next setup
- [x] CI lint and test configuration (ESLint, Prettier, test scripts)
- [x] Baseline repository documentation: `ARCHITECTURE.md`, `TODO.md`, `DATABASE.md`, `API.md`, `CHANGELOG.md`, `AGENT_NOTES.md`

## Phase 1: Authentication & Role-Based Access Control (RBAC)
- [x] Prisma User & Session/RefreshToken models
- [x] Password hashing with bcrypt & custom dual-token JWT mechanism (access + refresh) with cryptographic `jti`
- [x] Server auth routes: `/register`, `/login`, `/refresh`, `/logout`, `/me`
- [x] Role-based authorization middleware (`requireAuth`, `requireRole`) for `CONSUMER`, `LMO`, `GATC`, `ADMIN`
- [x] Shared Zod auth schemas in `shared/src/schemas/auth.schema.ts`
- [x] Web client auth: Login, Registration, Session management, Protected routes, AuthContext
- [x] Mobile client auth: SecureStore token persistence, AuthContext, Login & Register screens
- [x] Unit & integration tests for auth routes and token lifecycle (Supertest)

## Phase 2: Stakeholder & Instrument Registry
- [x] Prisma models for `StakeholderProfile`, `GATCProfile`, `Instrument`
- [x] Ownership rules and validation logic (manufacturers, dealers, repairers, commercial establishments)
- [x] Server CRUD endpoints for instruments with serial number uniqueness & capacity limits
- [x] Shared Zod instrument schemas (`shared/src/schemas/instrument.schema.ts`)
- [x] Web client: Instrument listing with loading skeletons & empty states, registration dialog, detailed view
- [x] Mobile client: Instrument registry view, detail screen, barcode/serial lookup
- [x] Ownership checks and unauthorized access prevention tests

## Phase 3: Application Submission & Workflow Engine
- [x] Prisma models for `Application` and application audit history
- [x] Application state machine: `SUBMITTED → SCHEDULED → INSPECTED → CERTIFIED / REJECTED → EXPIRED`
- [x] Server application routes: submission (`NEW`, `RE_VERIFICATION`), officer assignment, scheduling
- [x] Shared Zod application schemas (`shared/src/schemas/application.schema.ts`)
- [x] Web client: Application submission modal with fee computation, application tracking table, scheduling calendar/dialog
- [x] Mobile client: Officer assigned applications view, consumer submission & status tracking
- [x] Automated state transition and permission boundary tests

## Phase 4: Inspection & Observation Recording
- [x] Prisma `InspectionRecord` model supporting structured observation JSON and photo attachments
- [x] Server inspection routes: submit inspection results (`PASSED` / `FAILED`), error tolerances, remarks
- [x] Cloudinary integration for on-site inspection photo uploads (`server/src/config/cloudinary.ts`)
- [x] Shared Zod inspection schemas (`shared/src/schemas/inspection.schema.ts`)
- [x] Web client: LMO/GATC inspection recording form with dynamic tolerance calculators
- [x] Mobile client: Field inspection screen with camera/photo upload, offline drafting, test recording
- [x] Inspection validation tests (tolerance limits, photo requirements)

## Phase 5: PKI Keypair Management & Certificate Generation
- [x] Cryptographic keypair generation (ECDSA NIST P-256) and secure server-side encrypted storage (AES-256-GCM)
- [x] Prisma `SigningKey` and `Certificate` models
- [x] Deterministic canonical JSON payload generator and cryptographic signature module
- [x] High-resolution QR code generator embedding verification URL and token (`qrcode`)
- [x] Certificate PDF generator using `pdf-lib` embedding verification metadata, QR code, and digital stamp
- [x] Server certificate generation service triggered upon inspection approval
- [x] Cloudinary raw file upload for generated PDF certificates
- [x] Signature generation and key rotation unit tests

## Phase 6: Public Verification Portal (No-Auth)
- [x] Public verification endpoint `/api/v1/verification/verify/:identifier` (no auth required)
- [x] Server-side cryptographic signature validation against active/historical public keys
- [x] Web public verification page (`/verify`): HTML5 QR code scanner, manual certificate/serial input, cryptographic validation badge
- [x] Mobile public QR verification screen using Expo camera
- [x] Tamper-detection tests (verifying that modified payload bytes fail cryptographic check)

## Phase 7: Automated Notifications & Expiry Engine
- [x] Prisma `Notification` model with channels (`EMAIL`, `SMS`, `PUSH`, `IN_APP`)
- [x] Background cron engine (`node-cron`) for automated verification expiry checks and reminder dispatches
- [x] In-app notification center and auto-transitioning overdue certificates to `EXPIRED`
- [x] Notification endpoints (`/api/v1/notifications`)
- [x] End-to-end notification trigger tests

## Phase 8: Role-Specific Operational Dashboards
- [x] Role-tailored metrics and task queues:
  - Consumer Dashboard: Registered instruments, pending applications, active certificates, renewal alerts
  - LMO Dashboard: Assigned inspection queue, scheduled site visits, recent certifications, rejections
  - GATC Dashboard: Authorized tests queue, calibration logs, certified batches
  - Admin Dashboard: Department-wide pendency, revenue/fee stats, officer activity, enforcement alerts
- [x] Web UI implementation with shadcn/ui cards, data tables, and action items
- [x] Mobile dashboard views tailored for on-the-move officers and consumers
- [x] Zero mock data verification: strictly powered by real database queries

## Phase 9: Analytics & Business Intelligence (BI) Module
- [x] Server analytics aggregation service with optimized SQL/Prisma queries:
  - Verification Turnaround Time (TAT) distribution
  - Pendency trends (aging buckets: <7d, 7-15d, 15-30d, >30d)
  - Officer workload and productivity matrix
  - Regional/district compliance distribution
- [x] Shared analytics response schemas
- [x] Web Analytics Dashboard: Interactive charts (Recharts) with date filters
- [x] Chart styling strictly adhering to black/white & semantic color rules

## Phase 10: Search, Audit Trail & Exports
- [x] Global search across instruments, applications, and certificates
- [x] Prisma `AuditLog` tracking all entity creations, state transitions, logins, and certificate signings
- [x] Audit log endpoint (`/api/v1/audit`) restricted to Admin users
- [x] Digital PDF export with embedded PKI signatures

## Phase 11: Comprehensive Internationalization (i18n)
- [x] Full translation keys extracted across all web features (English & Hindi)
- [x] Full translation keys extracted across all mobile features (English & Hindi)
- [x] Language toggle components with persistent user preference
- [x] Formatting for Indian numbering conventions, currency (₹), and dates (`en-IN`)
- [x] Verification that no hardcoded UI strings remain

## Phase 12: Testing, Security Hardening & Deployment
- [x] Backend test suite: Jest + Supertest covering PKI, Auth, Certificates, and Tamper Detection (17/17 tests passing)
- [x] Full monorepo TypeScript compilation across all packages with zero errors
- [x] Security audit: Helmet security headers, CORS guards, bcrypt hashing, AES-256-GCM encrypted keys, rate limiting
- [x] Containerized local database (`docker-compose.yml`) and local Postgres support

## Phase 13: Industry-Standard Enterprise UI/UX Overhaul
- [x] Modern responsive AppShell with collapsible sidebar and mobile drawer
- [x] Statutory government brand header with live jurisdiction badge and active PKI heartbeat pill
- [x] Glassmorphic top navigation bar with dynamic breadcrumbs, command bar (`⌘K`), bilingual switcher, and theme toggle
- [x] High-security National Public Verification Portal (`/verify`) with camera QR scanner, double guilloche certificate card, and MPE tolerance gauge
- [x] Operational Command Center (`/dashboard`) with metric KPI cards, urgent Section 24 renewal countdown, and scheduled inspection queue
- [x] Instrument Registry (`/instruments`) with compliance KPI cards, search toolbar, category filters, and polished table
- [x] Application Workflow (`/applications`) with visual 4-stage pipeline stepper and role-based action buttons
- [x] Analytics & BI (`/analytics`) with responsive Recharts bar charts, custom tooltips, and regional compliance tables
- [x] Regulatory Audit Ledger (`/audit`) with action filters, change digest code previews, and pagination
- [x] Authentication cards (`/login`, `/register`) with official scale emblem and evaluator quick-fill demo accounts
- [x] Refined design system tokens: `--radius: 0.5rem` (8px), zinc neutrals, smooth active states (`active:scale-[0.98]`), and status pill badges with dot indicators

## Phase 14: Bilingual Dashboard, Theme Refinements & Camera Scanner Overhaul
- [x] Full bilingual coverage across all dashboard roles (Trader, LMO Officer, GATC Lab, Admin), KPI metrics, and action tables
- [x] Bilingual action dialogs: Register Instrument, Submit Application, Schedule Inspection, and Record Inspection
- [x] Explicit light theme default across AppShell and AuthLayout; removal of OS dark-mode auto-lock
- [x] Refined sidebar active item highlight (subtle greyish tone `bg-zinc-100` / `dark:bg-zinc-800` replacing stark solid black/white)
- [x] Fixed KPI stat card icon border clipping by eliminating `sm:pt-0` breakpoint conflicts in `card.tsx`
- [x] Replaced legacy `Html5QrcodeScanner` with headless `Html5Qrcode` controller featuring laptop FaceTime webcam fallback
- [x] Added instant "Upload QR Image" file decoder fallback for verification without requiring a webcam
- [x] Verified complete zero-error build across monorepo (`npm run build --workspace=@sih/client`)

## Phase 15: Architecture Hardening, LMO Jurisdictions & Cryptographic Finalization
- [x] Added dedicated `OfficerProfile` model (`badgeNumber`, `jurisdictionDistrict`, `jurisdictionState`, `jurisdictionZone`) for territorial LMO assignment
- [x] Added statutory Government Gazette Notification Reference (`notificationRefNumber`) to `GATCProfile`
- [x] Synchronized PostgreSQL database schema via `prisma db push` and updated database seed
- [x] Documented Statutory Fee & Treasury Receipt Architecture (Rule 14 / Schedule XII) across `ARCHITECTURE.md` and `API.md`
- [x] Definitively locked asymmetric signing algorithm strictly to **ECDSA NIST P-256 (`prime256v1`) with SHA-256** per FIPS 186-4
- [x] Formally resolved JWT delivery: in-memory Bearer access token + `httpOnly`, `Secure`, `SameSite=Strict` cookie refresh token on web
- [x] Verified single-use Cryptographic Refresh Token Rotation (RTR) in `auth.service.ts`
- [x] Replaced hardcoded Unsplash photo link in `RecordInspectionDialog.tsx` with authentic photo upload zone and thumbnail preview
- [x] Strict role-gating: Removed "+ New Application" and "+ Register Instrument" from LMO/GATC, ensuring regulatory conflict-of-interest prevention
- [x] Full monorepo build and test suite passing (`17/17` backend tests, zero errors across all workspaces)

## Phase 16: Certificate Lifecycle Transition, Statutory QR Seal & Single-Page Print
- [x] Added "Issue Certificate" action on `ApplicationListPage.tsx` for `INSPECTED` status across LMO, GATC, and Admin
- [x] Added 1-click auto-issuance option in `RecordInspectionDialog.tsx` upon passing physical inspection
- [x] Made `validUntil` optional in `issueCertificateSchema` with 1-year statutory default
- [x] Streamlined Certificate view: hidden search bar and camera QR scanner during certificate inspection
- [x] Removed technical PKI description and raw Base64 signature dump
- [x] Rendered high-resolution statutory verification QR code (`QRCodeSVG`) directly on the certificate
- [x] Implemented `@media print` CSS rules in `index.css` formatting strictly `#certificate-print-card` to fit onto one single A4 page
- [x] Verified full monorepo build (`npm run build --workspace=@sih/client`) and backend tests (`17/17` passing)

## Phase 17: Universal In-App Omnisearch (Command Palette ⌘K)
- [x] Converted static TopBar header `/verify` search link into an active in-app global search trigger button
- [x] Created `GlobalSearchDialog.tsx` modal for instant multi-entity querying
- [x] Live search across registered instruments (serial, make, model, capacity, category)
- [x] Live search across verification applications (application number, status, instrument)
- [x] Indexed app navigation pages and direct shortcuts to Dashboard, Instruments, Applications, Analytics, Audit, and Verify
- [x] Quick Actions for adding instruments, submitting applications, toggling language (हिन्दी / English), and switching theme (dark / light)
- [x] Direct certificate lookup routing when certificate numbers are entered
- [x] Global keyboard shortcut integration (`⌘K` / `Ctrl+K` and `ESC` to dismiss)
## Phase 18: Certificate Action Responsive Controls & Pure Statutory Print Isolation
- [x] Removed redundant "Download Verified Certificate" button completely from both top control bar and bottom action bar
- [x] Retained single clean "Print Certificate" button supporting direct physical print and PDF export
- [x] Moved bottom action buttons completely outside `#certificate-print-card` ensuring no buttons reside in the printed certificate DOM
- [x] Hardened `@media print` rules in `index.css` with strict `display: none !important; visibility: hidden !important;` on all buttons and `.no-print` elements
- [x] Configured `#certificate-print-card *:not(button):not(.no-print)` to isolate only official statutory certificate content in print
- [x] Refactored Top Control Bar in `PublicVerificationPage.tsx` with responsive layout (`flex items-center justify-between gap-2.5 pb-1`)
- [x] Added `min-w-0 flex-1` container constraint to certificate statutory header preventing QR code displacement
- [x] Verified zero horizontal scrollbars and clean single-page printing formatting
- [x] Verified full clean build (`npm run build --workspace=@sih/client`) and test suite passing (`17/17` passing)

## Phase 19: Continuous Grid Alignment for Sidebar & Shell Headers/Footers
- [x] Standardized sidebar brand header and TopBar header to matching `h-14` (56px) height with `border-b border-border` and `bg-card`
- [x] Standardized sidebar user profile footer and AppShell statutory footer to matching `h-14` (56px) height with `border-t border-border` and `bg-card`
- [x] Converted AppShell layout into viewport-locked enterprise architecture (`h-screen overflow-hidden` with `<main className="flex-1 overflow-y-auto ...">`)
- [x] Synchronized mobile drawer header and footer to matching `h-14` height
- [x] Verified seamless unbroken horizontal grid lines across top header and bottom footer
- [x] Verified unbroken horizontal grid lines across top header and bottom footer
- [x] Verified client build (`npm run build --workspace=@sih/client`) and monorepo test suite (`17/17` passing)

## Phase 20: PDF Streaming Endpoint, Consumer-Only Registration, Jaipur Re-Seed & Scheduling Fix
- [x] Consolidated Certificate action controls exclusively to bottom action bar in `PublicVerificationPage.tsx`
- [x] Added binary streaming PDF download endpoint (`GET /api/v1/verification/pdf/:identifier`) with pdf-lib generating official certificates on-the-fly
- [x] Added working "Download PDF" button in certificate bottom bar alongside "Print Certificate"
- [x] Enforced Consumer-only self-registration in `auth.service.ts` rejecting privileged roles with HTTP 403
- [x] Removed role dropdown from `RegisterPage.tsx`, locking self-registration strictly to `CONSUMER`
- [x] Relocated and re-seeded entire dataset to **Jaipur, Rajasthan** (jurisdictions, badges, pincodes, GSTIN, addresses, certificates `LM-RJ-2026-0000001`)
- [x] Fixed `scheduleApplicationSchema` in `shared/src/schemas/application.schema.ts` to accept HTML `datetime-local` format (`YYYY-MM-DDTHH:mm`) and ISO dates, resolving "Valid ISO scheduled datetime required" error
- [x] Rebuilt `@sih/shared`, `@sih/client` and verified all 17 backend tests passing (`auth.test.ts`, `pki.test.ts`, `certificates.test.ts`)

## Phase 21: Role-Scoped Analytics & Persona-Specific Business Intelligence
- [x] Refactored `AnalyticsService` and `AnalyticsController` to enforce strict role-based data isolation:
  - Turnaround time (`getTurnaroundTime`): Scoped to user applications (Consumer), assigned inspections (LMO/GATC), or statewide (Admin)
  - Pendency aging (`getPendencyTrends`): Scoped to user pending items or statewide roster
  - Workload & performance (`getOfficerWorkload`): Scoped to personal throughput for officers, full matrix for Admin
  - Regional compliance (`getRegionalBreakdown`): Grouped by district (Admin), jurisdiction category (LMO), testing scope (GATC), or commercial equipment category (Consumer)
- [x] Included `officerProfile` in `auth.service.ts:getMe()` and `AuthContext` to support jurisdiction-aware client UI
- [x] Redesigned `AnalyticsPage.tsx` with role-specific KPI cards, charts, and bottom data sections
- [x] Added "My Field Inspection & Quality Record" card for LMO and "Laboratory Testing & Calibration Record" card for GATC
- [x] Added "My Commercial Equipment Stamping Registry" table for Consumer
- [x] Verified full client build and all 17 backend tests passing (`17/17`)

## Phase 22: Responsive Mobile Lifecycle Stepper Overhaul
- [x] Replaced vertically stacked centered blocks with a compact, structured **2x2 card grid** on mobile viewports (`< md`) in `ApplicationListPage.tsx`
- [x] Implemented circular accent badge nodes (`bg-primary/10 border border-primary/20 text-primary font-bold text-[11px]`), left-aligned bold step titles, and concise subtitles
- [x] Retained the desktop horizontal connected workflow (`hidden md:flex`) with clean arrow dividers
- [x] Reduced vertical height from ~250px to ~70px on mobile screens, eliminating vertical clutter
- [x] Verified clean client compilation (`npm run build --workspace=@sih/client`) with zero errors

## Phase 23: Mobile Input Auto-Zoom Prevention & ngrok Tunnel Integration
- [x] Configured official ngrok CLI with user authtoken and deployed live background daemon on port 5173 (`https://vapouringly-nonallegoric-teodora.ngrok-free.dev`)
- [x] Configured Vite dev server with `host: true`, `cors: true`, and `allowedHosts: true`
- [x] Implemented global mobile CSS rule in `client/src/index.css` enforcing `font-size: 16px !important` on `input, select, textarea` on viewports `<= 768px` to suppress iOS Safari automatic zoom-in
- [x] Added viewport scale lock in `client/index.html` (`width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`)
- [x] Updated `client/src/components/ui/input.tsx` with responsive sizing (`h-9 sm:h-8 text-base sm:text-xs`)
- [x] Verified client build (`npm run build --workspace=@sih/client`) and backend tests (`17/17` passing)

## Phase 24: Mobile Placeholder Typography Refinement & Proportional Sizing
- [x] Resolved oversized placeholder text on mobile inputs caused by 16px font-size inheritance
- [x] Added explicit `font-size: 12px !important` across `input::placeholder`, `textarea::placeholder`, `::-webkit-input-placeholder`, and `::-moz-placeholder` in `client/src/index.css`
- [x] Added `placeholder:text-xs` to `client/src/components/ui/input.tsx` and `client/src/components/layout/GlobalSearchDialog.tsx`
- [x] Confirmed iOS auto-zoom suppression remains fully active (computed input font size remains 16px on focus) while placeholder hints stay sleek and compact (12px)
- [x] Added `npm run tunnel` to root `package.json` for deterministic 1-command startup targeting static domain
- [x] Verified full client build (`npm run build --workspace=@sih/client`) and test suite (`17/17` passing)

## Phase 25: Unified Dev Command with Integrated ngrok Tunnel
- [x] Updated root `npm run dev` in `package.json` to concurrently start `SERVER`, `CLIENT`, and `TUNNEL`
- [x] Created `scripts/start-tunnel.js` with prominent URL banner, spam log filtering, and graceful error isolation
- [x] Added `npm run dev:local` for offline development without opening a public tunnel
- [x] Enhanced `scripts/free-ports.js` to kill lingering ngrok processes and free port 4040 on startup
- [x] Verified client build (`npm run build --workspace=@sih/client`) succeeds cleanly

## Phase 26: 3-Portal Architecture & Hierarchical Regulatory Provisioning
- [x] Refactored `Role` enum across Prisma, shared contracts, and server to: `CONSUMER`, `LMO`, `GATC_ADMIN`, `GATC_INSPECTOR`, `ADMIN`
- [x] Extended `GATCProfile` with `agencyName` and `inspectors` relation, and created `GATCInspectorProfile` linking technical staff to parent test lab
- [x] Added `assignedGatcProfile` relation on `Application` for agency delegation
- [x] Seeded complete Jaipur ecosystem with 5 personas (`admin@metrology.gov.in`, `lmo.jaipur@metrology.gov.in`, `gatc.lead@precisionlab.org`, `inspector.rahul@precisionlab.org`, `trader.rajesh@shreestores.com`)
- [x] Built server Admin Provisioning module (`/api/v1/admin/officers`, `/api/v1/admin/gatc-agencies`) with Zod validation, bcrypt hashing, audit logging, and role guards
- [x] Built server GATC Agency Management module (`/api/v1/gatc/inspectors`, `/api/v1/gatc/dashboard`, `/api/v1/gatc/delegate`) with tenant isolation
- [x] Implemented Supertest integration tests in `admin.test.ts` and `gatc.test.ts` (all 24 backend integration tests passing)
- [x] Created **Consumer Portal (`/consumer/*`)**: `ConsumerLayout`, `ConsumerDashboardPage`, `ConsumerInstrumentsPage`, `ConsumerApplicationsPage`, `ConsumerVerificationPage`
- [x] Created **Regulatory & Agency Admin Portal (`/admin/*`)**: `OfficerManagementPage`, `GatcAgencyManagementPage`, `GatcStaffPage`, `GatcDashboardPage`, `StateAdminDashboardPage`, `AdminApplicationsPage`, `AdminInstrumentsPage`, `AdminAnalyticsPage`, `AdminAuditPage`
- [x] Created **Field Inspection Suite (`/field/*`)**: `FieldLayout`, `FieldRosterPage`, `FieldVerificationPage`
- [x] Configured top-level routing in `client/src/App.tsx` with role guards and intelligent redirection (`RoleBasedRedirect`)
- [x] Verified client build (`npm run build --workspace=@sih/client`) passes with 0 errors

## Phase 27: Subdomain Architecture & Multi-Port Local Development
- [x] Created `client/src/lib/subdomain.ts` for dynamic portal resolution based on port (`5173`, `5174`, `5175`), subdomain, or environment variable
- [x] Created dedicated `ConsumerApp.tsx` router bound to `consumer.domain.com` (Port 5173) with clean top-level paths (`/dashboard`, `/instruments`, etc.)
- [x] Created dedicated `AdminApp.tsx` router bound to `admin.domain.com` (Port 5174) with clean top-level paths (`/dashboard`, `/officers`, `/agencies`, `/agency`, `/inspectors`)
- [x] Created dedicated `FieldApp.tsx` router bound to `field.domain.com` (Port 5175) with clean top-level paths (`/roster`, `/verify`)
- [x] Created `WrongPortalNotice.tsx` component providing cross-portal authentication security and 1-click workplace switching
- [x] Updated `server/src/app.ts` CORS configuration to allow cross-origin requests from ports `5173`, `5174`, `5175`, `*.localhost`, and production wildcard subdomains
- [x] Added `dev:consumer`, `dev:admin`, and `dev:field` scripts to `client/package.json`
- [x] Updated root `package.json` `npm run dev` and `npm run dev:local` to concurrently spin up `SERVER`, `CONSUMER`, `ADMIN`, and `FIELD`
- [x] Enhanced `scripts/free-ports.js` to automatically free ports `5001`, `5173`, `5174`, `5175`, and `4040`
- [x] Verified monorepo build (`npm run build`) passes with 0 errors and all 24 backend integration tests pass

## Phase 28: Consumer Portal Transformation: Official Government Landing Page cum Citizen Web App
- [x] Built authentic vector State Emblem of India component (`StateEmblem.tsx`) with Lion Capital of Ashoka and *सत्यमेव जयते*
- [x] Added tricolor national top ribbon (Saffron, White, Green) with accessibility controls (A- A A+) and language/theme toggles
- [x] Designed institutional Ministry and Legal Metrology Division header with National Consumer Helpline 1915 badge
- [x] Built context-aware authentication header (displays "व्यापारी लॉगिन / Trader Login" when logged out; greets trader and provides "Go to My Dashboard" CTA when logged in)
- [x] Built public navigation bar with smooth anchor jumping (Home, Services, Track, Verify, Fee Calculator, Act 2009, Transparency)
- [x] Created statutory advisory ticker and hero spotlight for Section 24 mandatory re-verification awareness
- [x] Built 6 interactive citizen and commercial services cards
- [x] Created Live Application Tracker widget (`#track`) with 4-stage visual progression stepper (`SUBMITTED → SCHEDULED → INSPECTED → CERTIFIED`)
- [x] Implemented public backend endpoint `GET /api/v1/verification/track/:applicationNumber` in `verification.routes.ts`
- [x] Created Statutory Fee Calculator widget (`#calculator`) under Rule 14 / Schedule XII of Legal Metrology Rules, 2011
- [x] Added Section 24 and Section 30 statutory legal guidance section (`#act`)
- [x] Added statewide transparency indicators (`#transparency`) with verified instrument counts and TAT metrics
- [x] Added official Government statutory footer (`#contact`) with GIGW 3.0 / NIC compliance statement and helpline
- [x] Implemented 100% complete bilingual English (`en.json`) and Hindi (`hi.json`) translations under `consumerLanding`
- [x] Integrated `ConsumerLandingPage.tsx` into `ConsumerApp.tsx` as root public landing page with seamless workspace routing
- [x] Verified monorepo builds with 0 errors (`npm run build`) across shared, server, and client workspaces

## Phase 29: Comprehensive Bug Audit & Edge Case Hardening
- [x] Fixed `RecordInspectionDialog.tsx` double variable declaration and ensured `autoIssueCert` is strictly `false` by default
- [x] Added `FieldRosterPage.tsx` dedicated action buttons: "Digitally Sign & Issue" for `INSPECTED`, QR view for `CERTIFIED`, and red badge for `REJECTED`
- [x] Fixed `applications.service.ts` search query bug where `options.search` was overwriting `where.OR`, leaking applications across officer jurisdictions
- [x] Fixed `SubmitApplicationDialog.tsx` form re-sync when clicking "Apply for Verification" on different instruments in the table
- [x] Fixed `ScheduleInspectionDialog.tsx` UTC datetime offset shifting local scheduled inspection times into early morning hours
- [x] Verified monorepo builds (`npm run build`) with 0 errors

## Phase 30: Mobile Native Architecture & 60FPS Spring Physics Overhaul
- [x] Redesigned `LoginScreen.tsx` with minimalist, modern mobile interface, eliminating cluttered cards, adding password toggle, scale entrance, and 1-tap demo credentials
- [x] Overhauled bottom navigation in `App.tsx`: removed bulky borders, eliminated "Settings", streamlined to 3 focused tabs (`Roster`, `Verify`, `Registry`), added bounce spring scale feedback
- [x] Built native bottom-sheet drawer `ApplicationDrawer.tsx` with spring slide-up (`tension: 65, friction: 11`), backdrop fade, drag-to-dismiss gesture via `PanResponder`, and action triggers
- [x] Re-architected `CertificateModal.tsx` matching official Government of Rajasthan Schedule XI Certificate layout from web portal with zero text overflow
- [x] Added tactile micro-interactions across roster cards (`RosterCard.tsx`), filter chips (`tabs.tsx`), and action buttons

## Phase 31: Mobile Application Roster Visibility & Zero-Crash Interceptors
- [x] Fixed search filter TypeError crash in `RosterScreen.tsx` on undefined `instrument.district`
- [x] Extended `applications.service.ts` Prisma query with `district`, `state`, `category`, `accuracyClass` and verified role scoping for LMO and GATC inspectors
- [x] Added automated 401 token refresh interceptor in `mobileApi` (`mobile/src/lib/api.ts`) using refresh tokens in `expo-secure-store`
- [x] Re-seeded balanced applications across all statuses (`SCHEDULED`, `INSPECTED`, `CERTIFIED`, `SUBMITTED`)
- [x] Implemented `FALLBACK_APPLICATIONS` queue and offline sync banner with 1-tap retry in `RosterScreen.tsx`

## Phase 32: Monorepo-Wide Hindi/English Bilingual Localization & Dynamic Re-rendering
- [x] Integrated `useTranslation()` in `FieldRosterPage.tsx` with complete `"roster"` translation keys in `client/src/i18n/locales/en.json` and `hi.json`
- [x] Localized web KPI cards, filter tabs, search placeholders, empty states, status badges, and action buttons
- [x] Bound mobile screens in `App.tsx` with `key={lang}` and `currentLanguage={lang}` for instant dynamic re-rendering on language toggle
- [x] Bound mobile bottom navigation labels with `i18n.t("nav.*", { lng: lang })`
- [x] Localized `OfficerHeader.tsx`, `RosterScreen.tsx`, `RosterCard.tsx`, `ApplicationDrawer.tsx`, `VerifyScreen.tsx`, `RegistryScreen.tsx`, and `LoginScreen.tsx`
- [x] Added top-right language toggle pill in `LoginScreen.tsx`
- [x] Verified `@sih/client` build (0 errors) and `@sih/mobile` typecheck (0 errors)

## Phase 33: Unified eLMV Branding, Emblem Asset Relocation & Mobile Login Integration
- [x] Standardized application branding across entire monorepo to **eLMV** (Legal Metrology Verification System)
- [x] Relocated user-provided authentic State Emblem of India (`images.jpeg`) to canonical asset locations:
  - `client/public/emblem.jpeg` and `client/public/favicon.jpeg` — linked as primary favicon in `client/index.html`
  - `mobile/assets/emblem.jpeg` — embedded in `mobile/src/screens/LoginScreen.tsx` alongside eLMV and Government of India typography
- [x] Replaced legacy scale/placeholder icon badges with sleek typographic **eLMV** wordmarks in:
  - `Sidebar.tsx` (desktop header & mobile drawer)
  - `TopBar.tsx` (root breadcrumb link)
  - `LoginPage.tsx` & `RegisterPage.tsx` (hero wordmarks)
  - `ConsumerLayout.tsx` (brand bar)
  - `ConsumerLandingPage.tsx` (header & statutory footer)
  - `FieldLayout.tsx` (workstation brand header)
  - `OfficerHeader.tsx` (18px bold eLMV brand with live status indicator)
- [x] Updated mobile app configuration:
  - `mobile/app.json`: updated `name` to `"eLMV"`, `slug` to `"elmv"`, and updated camera permission strings
  - `mobile/App.tsx`: updated station loader to `"Initializing eLMV Station..."`
  - `mobile/src/i18n/locales/en.json` & `hi.json`: updated `appName`, `auth.footer`, and `header.brand` to `"eLMV"`
- [x] Cleaned up obsolete temporary assets (`AshokStambh.tsx`, legacy generated PNGs)
- [x] Verified zero errors across full monorepo build (`npm run build`) and mobile typecheck (`npm run typecheck`)

## Phase 34: Mobile Camera QR Scanner, Button Hierarchy Discipline & Direct Certificate Drawer
- [x] Implemented native QR code camera scanner modal in `VerifyScreen.tsx` using `expo-camera` (`CameraView` & `useCameraPermissions`)
- [x] Enforced strict button styling hierarchy: reserved solid black (`#09090b`) strictly for primary action buttons (`verifyBtn`)
- [x] Redesigned the Scan QR button from a solid black block into a sleek light-themed card (`#ffffff` background, `1.5px` border `#e4e4e7`, soft emerald `#ecfdf5` icon badge, dark typography, subtle chevron)
- [x] Redesigned secondary action "View Official Schedule XI Certificate" as a clean white/bordered button (`#ffffff` background, `#e4e4e7` border, `#18181b` text)
- [x] Designed HUD-style scanning viewfinder with corner reticles, top flashlight toggle, and animated vertical laser scanning line
- [x] Added robust QR payload parser (`extractIdentifier`) supporting URLs, query parameters, REST paths, JSON objects, and raw tokens
- [x] Implemented direct-to-drawer QR verification: scanning directly opens the Schedule XI Certificate drawer (`CertificateModal`) via `drawerCertNumber`, avoiding manual text input pollution
- [x] Completely removed dummy/simulator scan buttons from both the viewfinder modal and camera permission screen
- [x] Full Hindi bilingual localization across `VerifyScreen.tsx` and `CertificateModal.tsx` (headers, summary grids, specs, MPE tests, statutory notices, and alerts)
- [x] Verified zero type errors (`npm run typecheck --workspace=@sih/mobile`) and full monorepo build (`npm run build`)

## Phase 35: Web Navigation Streamlining & Public Verification Decoupling
- [x] Removed `nav.verify` and Public Trust section (`nav.publicPortal`) from `client/src/components/layout/Sidebar.tsx` desktop navigation
- [x] Removed `nav.publicVerification` link from mobile drawer navigation in `Sidebar.tsx`
- [x] Removed `Verify Certificate` navigation link from `client/src/portals/consumer/ConsumerLayout.tsx`
- [x] Removed `Public Verification` navigation link from `client/src/portals/field/FieldLayout.tsx`
- [x] Preserved `/verify` route (`PublicVerificationPage.tsx`) across all web portal routers for QR code links and direct URL verification
- [x] Removed unused `ShieldCheck` icon imports across all three navigation layout files
- [x] Verified full monorepo build (`npm run build`) and mobile typecheck (`npm run typecheck`) with 0 errors

## Phase 36: Elimination of Redundant "Awaiting Sign" Stage & Auto-Sign Workflow Consolidation
- [x] Removed `"To Sign"` filter tab (`tabItems`) from mobile roster (`mobile/src/screens/RosterScreen.tsx`)
- [x] Converted `demo-app-3` in `FALLBACK_APPLICATIONS` from `INSPECTED` to `CERTIFIED` with certificate `LM-RJ-2026-0000003`
- [x] Replaced middle `"To Sign"` column in `mobile/src/components/officer/MetricCounters.tsx` with `"Total Pipeline"`
- [x] Removed `"Sign & Issue"` button and confirmation alert from mobile roster cards (`mobile/src/components/officer/RosterCard.tsx`)
- [x] Removed manual sign CTA button from mobile application drawer (`mobile/src/components/officer/ApplicationDrawer.tsx`)
- [x] Removed `"Awaiting Signature"` KPI card and filter tab from web field roster (`client/src/portals/field/pages/FieldRosterPage.tsx`)
- [x] Removed `"Digitally Sign & Issue Certificate"` action button and cleaned up unused mutation state and icons from `FieldRosterPage.tsx`
- [x] Verified monorepo build (`npm run build`) and mobile typecheck (`npm run typecheck`) with 0 errors

## Phase 37: Mobile Verification Screen Cleanup (Scan Card Badge & Input Field QR Icon Removal)
- [x] Removed green camera pill badge (`scanPill`) with icon and `"CAMERA"` / `"कैमरा"` text from the Scan Statutory QR Code card in `mobile/src/screens/VerifyScreen.tsx`
- [x] Removed inline scan QR logo (`Icons.QrCode` button) from the certificate/token input field wrapper (`inputWrapper`) in `VerifyScreen.tsx`
- [x] Pruned unused style definitions (`scanQrTitleRow`, `scanPill`, `scanPillText`, `inlineQrBtn`) from `VerifyScreen.tsx`
- [x] Verified zero TypeScript errors (`npm run typecheck --workspace=@sih/mobile`) and full monorepo build (`npm run build`)

## Phase 38: Mobile Inspection Modal Photo Proof Upload Option & Button Height Polish
- [x] Replaced image URL text input field in `mobile/src/components/officer/InspectionModal.tsx` with dedicated interactive photo proof upload component
- [x] Streamlined photo trigger to directly open the native camera (removed intermediate dialog and sample evidence option)
- [x] Implemented dedicated on-site CameraView capture submodal with corner framing guides, torch switcher, and shutter trigger in `InspectionModal.tsx`
- [x] Rendered attached photo preview card with thumbnail image, evidence file tag, verified status, and removal trigger
- [x] Increased height of bottom action buttons ("Cancel" and "Verify, Sign & Issue Certificate" / "Record Rejection") to 44px for enhanced touch ergonomics
- [x] Verified zero TypeScript errors (`npm run typecheck --workspace=@sih/mobile`) and monorepo build (`npm run build`)

## Phase 39: Green Inspection & Verification Button Label Simplification
- [x] Updated green inspection passed action button in `mobile/src/components/officer/InspectionModal.tsx` to strictly read `"Verify"` (*"सत्यापित करें"*)
- [x] Updated mobile and client locale dictionaries (`en.json` & `hi.json`) for `inspection.submitPassed` to `"Verify"` / `"सत्यापित करें"` and `submittingPassed` to `"Verifying..."` / `"सत्यापित हो रहा है..."`
- [x] Updated `mobile/src/screens/VerifyScreen.tsx` primary submit button to strictly read `"Verify"` (*"सत्यापित करें"*)
- [x] Verified zero TypeScript errors (`npm run typecheck --workspace=@sih/mobile`) and monorepo build (`npm run build`)

## Phase 40: Consumer Web Portal Landing Page Modernization (Government of India Architecture)
- [x] Analyzed reference Government of India portal architecture (`nic.in` / MeitY reference layout)
- [x] Created authentic vector SVG components for national initiatives (`SwachhBharatLogo` & `DigitalIndiaLogo` in `@/components/common/NationalLogos.tsx`)
- [x] Designed top utility strip with Hindi/English dynamic bilingual switch and dark/light mode toggle (pruned text size controls per user request)
- [x] Built official government branding header with authentic State Emblem of India (`/emblem.jpeg`) and official portal titles
- [x] Streamlined header by removing global search bar, national logos, and helpline pill, focusing the top bar strictly on official government identity and trader access/dashboard
- [x] Implemented sticky primary government navigation bar with active blue/gold indicator underlines for seamless section jumping
- [x] Engineered interactive 3-slide hero announcement carousel as a floating rounded island banner (`rounded-2xl sm:rounded-3xl`, `shadow-2xl`, with non-touching viewport margins) with auto-advancing timer (6.5s), manual previous/next navigation, pause/play toggle, and slide indicator dots
- [x] Designed Minister / Leadership section featuring Hon'ble Minister Shri Pralhad Joshi (Ministry of Consumer Affairs, Food and Public Distribution) with portrait, designation, and mission statement
- [x] Crafted "About Legal Metrology Division (eLMV)" showcase with signature deep-indigo accent bar and 3 statutory strategic pillars
- [x] Modernized 6-card citizen and trader services grid (Application Tracking, Certificate Verification, Stamping Application, Device Registry, Fee Calculator, and Statutory Compliance) with vibrant gradient icon backdrops, hover lift (`-translate-y-1.5`), and animated chevron transitions
- [x] Enhanced visual aesthetics across all sections with glassmorphism, ambient radial gradients, bento-grid strategic pillars, and elevated typography
- [x] Preserved full interactive features: live application tracker with API integration and 4-step progression stepper, and Schedule XII / Rule 14 fee calculator
- [x] Verified full monorepo build (`npm run build --workspaces`) with 0 errors

## Phase 41: Consumer Landing Hero & Header Streamlining
- [x] Removed the right-column glass showcase card ("Legal Metrology / Legal Metrology Act, 2009 / Section 24 Mandatory / Public SLA 5-14 Days / Scan QR Seal") from `ConsumerLandingPage.tsx`
- [x] Streamlined hero announcement container layout to a clean, well-spaced `max-w-4xl` structure
- [x] Removed `"Statutory"` green badge from the main portal branding header
- [x] Removed `"GOVERNMENT OF INDIA"` / `"भारत सरकार | GOVT. OF INDIA"` uppercase sub-headline from the main portal branding header
- [x] Reverted hero section from floating rounded island back to edge-to-edge full-bleed container with subtle grid overlay and restored advisory ticker border-b strip
- [x] Fixed sticky header scrolling bug by removing `sticky -top-12 z-40` from header and elevating navigation bar to `sticky top-0 z-40`
- [x] Populated missing translation dictionary keys (`carousel.slide*.badge`, `desc`, `action`, `nav.aboutUs`, `leadership.*`, `aboutElmv.*`) across both `en.json` and `hi.json` to eliminate raw fallback key strings
- [x] Verified full monorepo build (`npm run build --workspaces --if-present`) with 0 errors

## Phase 42: Consumer Landing Content Bloat Reversion & De-Gradienting Refactor
- [x] Reverted extraneous content sections (`#mandate`, `#rules`, `#packaged-commodities`, `#rrsl`) from `ConsumerLandingPage.tsx` per user request to maintain focused, high-utility landing page flow
- [x] Reverted top horizontal navigation bar links back to the streamlined list (`#hero`, `#about`, `#services`, `#track`, `/verify`, `#calculator`, `#act`)
- [x] Purged all gradients across the landing page to eliminate the "AI-generated" visual aesthetic:
  - Hero carousel: Replaced multi-gradient slide backgrounds with solid high-contrast statutory dark tones (`#0B1E3B`, `#08221B`, `#101B2B`)
  - Hero typography: Removed all `bg-gradient-to-*` and `bg-clip-text text-transparent` in favor of solid crisp `text-white font-black`
  - Hero buttons: Replaced gradient amber button with solid `bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold`
  - Removed all background radial dot matrix textures (`radial-gradient`)
  - Minister profile card: Replaced vertical gradient backdrop with clean solid `bg-white dark:bg-slate-900 border border-border shadow-sm`; removed neon glowing blur ring and floating award checkmark badge
  - Accent bars: Replaced multi-color gradient bar with crisp solid `#0B2545` / `sky-500` accent
  - Citizen Services: Replaced all 6 gradient icon wrappers with solid tinted badges (`bg-blue-50 text-blue-700`, `bg-emerald-50 text-emerald-700`, etc.)
  - Fee Calculator Summary: Replaced gradient wrapper with solid `bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700`
  - Certificate Verification Section: Replaced multi-color gradient with solid statutory `#0B1E3B` surface
- [x] Synchronized locale dictionaries (`client/src/i18n/locales/en.json` and `client/src/i18n/locales/hi.json`) to clean up unused keys and ensure all 116 active keys are 100% matched
- [x] Verified zero gradient/clip-text occurrences in `ConsumerLandingPage.tsx`
- [x] Verified full monorepo build (`npm run build --workspaces --if-present`) with 0 errors

## Phase 43: Consumer Landing Page Cleanliness Polish (Removal of 'Act No. 1 of 2010 • Central Portal', 'Verify Certificate' Nav & Section, and Pre-Section Badges)
- [x] Removed `Act No. 1 of 2010 • Central Portal` indicator badge from the top sticky navigation bar in `ConsumerLandingPage.tsx`
- [x] Removed `Verify Certificate` (`<Link to="/verify">`) link from the primary navigation bar in `ConsumerLandingPage.tsx`
- [x] Removed duplicate Quick Certificate / QR Verification spotlight section (`<section id="verify">`) from `ConsumerLandingPage.tsx`
- [x] Cleaned up unused `certInput`, `handleCertSubmit`, and `useNavigate` imports/declarations in `ConsumerLandingPage.tsx`
- [x] Removed all promotional pre-section pill badges across the landing page to eliminate AI-like layout artifacts:
  - Removed `aboutElmv.badge` ("STATUTORY APPARATUS • LEGAL METROLOGY ACT, 2009") before the About eLMV section
  - Removed `services.sectionBadge` ("ONLINE STATUTORY SERVICES") before the Citizen & Trader Services grid
  - Removed "Instant Public Service" badge before the Live Application Tracker section
  - Removed Rule 14 badge ("Legal Metrology (General) Rules, 2011 • Rule 14") before the Statutory Fee Calculator section
  - Removed "National Metrology Dashboard" badge before the Statewide Transparency Metrics section
  - Removed `section24.badge` ("MANDATORY STATUTORY OBLIGATION") before the Section 24 Legal Framework section
- [x] Synchronized locale dictionaries (`client/src/i18n/locales/en.json` and `client/src/i18n/locales/hi.json`) by removing orphan keys (`services.sectionBadge`)
- [x] Verified full monorepo build (`npm run build --workspaces --if-present`) passes with 0 errors

## Phase 44: Hero Section Slideshow Elimination & Core Value Proposition Focus
- [x] Removed slideshow carousel architecture (`carouselSlides`, `currentSlide`, `isCarouselPaused`, timer, slide controls, dot indicators) from `ConsumerLandingPage.tsx`
- [x] Cleaned up unused React hooks (`useRef`) and Lucide icon imports (`ChevronLeft`, `Pause`, `Play`)
- [x] Replaced multi-slide carousel with a single, authoritative, high-contrast Government of India hero banner (`bg-[#0B1E3B]` on `bg-[#081830]`):
  - Bold, impactful headline and narrative directly highlighting how simple it is to get certified online and how easily certificates can be verified
  - Primary CTA for applying online, secondary CTA for instant public QR verification, and tertiary anchor jump for live tracking
  - Dual Core Pillars:
    - **Pillar 1 (Easy to Get Certified)**: 3-step streamlined workflow (online application, scheduled site visit, instant digital certificate issuance)
    - **Pillar 2 (Easily Verified)**: Instant 1-click public verification (zero-login requirement, smartphone camera QR scanning, ECDSA NIST P-256 cryptographic proof)
- [x] Synchronized bilingual dictionaries in `client/src/i18n/locales/en.json` and `client/src/i18n/locales/hi.json`:
  - Defined comprehensive `hero` namespace across both languages
  - Cleaned up duplicate `hero` blocks and pruned obsolete `carousel` namespace
  - Verified 119/119 active translation keys present in both languages with 0 missing keys
- [x] Verified zero gradients, zero text clips, and 100% clean monorepo build (`npm run build --workspaces --if-present`)

## Phase 45: Statutory Advisory Continuous Running Ticker Marquee Implementation
- [x] Replaced static truncated paragraph in the statutory advisory banner with a continuous 60fps GPU-accelerated running marquee (`.animate-ticker`)
- [x] Added `@keyframes ticker-marquee` with `translate3d` hardware acceleration to `client/src/index.css`
- [x] Implemented seamless infinite looping by rendering dual synchronized text spans with separator bullets (`•`)
- [x] Added pause-on-hover interaction (`.animate-ticker:hover { animation-play-state: paused; }`), allowing citizens to comfortably pause and read the full legal advisory
- [x] Preserved high-contrast Government of India advisory styling (`bg-amber-50`, `bg-red-600` statutory badge, dark amber typography)
- [x] Verified zero layout shift, full responsive behavior, and clean monorepo compilation (`npm run build --workspaces --if-present`)






## Phase 46: Landing Page Cleanse: Elimination of "View Certificate" & "QR Code" References
- [x] Removed "Verify Certificate / QR Code" secondary CTA button from the Hero banner in `ConsumerLandingPage.tsx`
- [x] Replaced "ISO/IEC 18004 Tamper-Proof QR Seals" with "Legal Metrology (General) Rules, 2011" in the hero statutory standards bar
- [x] Replaced Card 2 in Citizen Services ("Verify Certificate & QR Seal") with "Consumer Helpline & Grievances" (`services.helpdesk`) linking to `#contact` with `PhoneCall` icon
- [x] Removed the "View Stamped Certificate" / `QrCode` button from the Live Application Tracker certified result card, retaining clean certificate issued details
- [x] Updated transparency metric subtitle from "PKI Signed & QR Sealed" to "PKI Signed & Digitally Verified"
- [x] Removed unused `QrCode` icon import from `lucide-react`
- [x] Synchronized `en.json` and `hi.json` locales:
  - Removed `verifyBtn` from `hero` namespace
  - Removed `services.verify` and added `services.helpdesk`
  - Removed `viewCert` from `tracker` namespace
  - Removed orphan `nav.verifyCert`
  - Updated narrative descriptions in `hero` and `aboutElmv` to remove QR mentions
  - Verified 100% key parity (117/117 keys matched across EN and HI with 0 missing keys)
- [x] Verified monorepo build passes cleanly with exit code 0 (`npm run build --workspaces --if-present`)

## Phase 47: Night Theme Deactivation & Pure Daylight Government Theme Enforcement
- [x] Enforced light mode on mount (`document.documentElement.classList.remove("dark")`, `localStorage.setItem("theme_mode", "light")`)
- [x] Removed `isDark` state and theme toggle button from header in `ConsumerLandingPage.tsx`
- [x] Removed unused `Sun` and `Moon` icon imports from `lucide-react`
- [x] Converted the dark navy Hero section (`bg-[#081830]` and `bg-[#0B1E3B]` with `bg-slate-900` cards) into a clean, authoritative daylight Government banner (`bg-[#F8FAFC]` with white cards, dark slate typography `text-[#0B2545]`/`text-slate-900`, and subtle borders)
- [x] Stripped all 74 `dark:` classes across `ConsumerLandingPage.tsx` to ensure 100% immunity to dark mode
- [x] Verified zero syntax errors, 117/117 key parity across `en.json` and `hi.json`, and clean monorepo build (`npm run build --workspaces --if-present`)

## Phase 48: Citizen & Commercial Metrology Services Card Hover Motion Elimination
- [x] Removed `hover:-translate-y-1.5` from all 6 service cards in the "Citizen & Commercial Metrology Services" grid (`<section id="services">`) in `ConsumerLandingPage.tsx`:
  - Card 1: Track Application Status
  - Card 2: Consumer Helpline & Grievances
  - Card 3: Apply for Initial / Re-Verification Stamping
  - Card 4: National Measuring Instrument Registry
  - Card 5: Statutory Fee Calculator (Sixth Schedule)
  - Card 6: Section 24 Legal Compliance Framework
- [x] Replaced `hover:shadow-xl hover:-translate-y-1.5` with stable, non-lifting `hover:shadow-md` while preserving smooth border color highlighting
- [x] Verified zero compilation regressions across monorepo (`npm run build --workspaces --if-present` exit code 0)

## Phase 49: Elimination of National & State Transparency Metrics Section
- [x] Removed `<section id="transparency">` ("National & State Transparency Metrics") entirely from `ConsumerLandingPage.tsx`
- [x] Renumbered succeeding section comments to maintain clean code structure (Section 24 is now 11, Footer is 12)
- [x] Pruned unused `stats` namespace (`consumerLanding.stats`) from both `client/src/i18n/locales/en.json` and `client/src/i18n/locales/hi.json`
- [x] Verified 100% key parity across `en.json` and `hi.json` (142/142 keys with 0 missing keys in either language)
- [x] Full monorepo build verified with exit code 0 (`npm run build --workspaces --if-present`)

## Phase 50: User App UI Harmonization with Government Landing Page Design System
- [x] Architected dedicated Government of India layout `ConsumerLayout.tsx` for the Consumer/Trader Portal:
  - Added National Tricolor top bar (`#FF9933` / `#FFFFFF` / `#138808`)
  - Added Official Government utility bar (`bg-[#0B1E3B]`) with National Flag, "भारत सरकार | Government of India", and bilingual language switcher
  - Added State Emblem of India branding header with official ministry typography, "National Verification Portal For Measuring Instruments", Trader Portal badge, and Sign Out action
  - Added Government Navy horizontal navigation bar (`#0B1E3B`) with active amber/gold indicators (`border-b-2 border-amber-400 text-amber-300`) for `/dashboard`, `/instruments`, `/applications`, `/verify`
  - Integrated official statutory Government footer (`bg-[#071326]`) with NCH Helpline (`1800-11-4000`), quick links, and GIGW compliance statement
- [x] Updated `ConsumerApp.tsx` routing to use `ConsumerLayout` for all authenticated consumer views (`/dashboard`, `/instruments`, `/applications`, `/verify`), replacing generic sidebar `AppShell`
- [x] Harmonized `AuthLayout.tsx` (`/login`, `/register`) with National Tricolor, State Emblem header, daylight mode (`bg-[#F8FAFC]`), language switcher, and official footer
- [x] Modernized `LoginPage.tsx` & `RegisterPage.tsx` with high-contrast Government Navy buttons (`bg-[#0B2545] hover:bg-[#133966]`), white cards (`bg-white border border-slate-200 rounded-2xl`), and matching typography
- [x] Updated Consumer KPI metric cards, quick actions, and headers across `DashboardPage.tsx`, `InstrumentListPage.tsx`, and `ApplicationListPage.tsx` with white cards, tinted icon badges (`bg-blue-50 text-blue-700`, `bg-emerald-50 text-emerald-700`), and Government Navy primary CTAs
- [x] Strictly enforced daylight mode on mount across `ConsumerLayout.tsx` and `AuthLayout.tsx`, with zero card hover lift (`hover:shadow-md`, zero `hover:-translate-y-*`)
- [x] Verified zero compilation regressions across monorepo (`npm run build --workspaces --if-present` exit code 0)

## Phase 51: Auth Header Bilingual Separation & Strict Locale Enforcement
- [x] Removed concatenated dual-language default title (`"व्यापारी पंजीकरण • Trader Registration"`) from `RegisterPage.tsx`
- [x] Removed concatenated dual-language default title (`"व्यापारी लॉगिन • Trader Sign In"`) from `LoginPage.tsx`
- [x] Added `auth.registerTitle` and `auth.loginHeading` keys with strict language separation to `en.json` ("Trader Registration", "Trader Sign In") and `hi.json` ("व्यापारी पंजीकरण", "व्यापारी लॉगिन")
- [x] Ensured English shows purely in English mode and Hindi shows purely in Hindi mode upon toggling
- [x] Verified monorepo build passes with 0 errors (`npm run build --workspaces --if-present`)

## Phase 52: Login Layout Branding Alignment with National Verification Portal
- [x] Updated the branding title in `AuthLayout.tsx` to `consumerLanding.header.portalTitle`:
  - English: "eLMV — National Verification & Stamping Portal"
  - Hindi: "eLMV — राष्ट्रीय ऑनलाइन सत्यापन एवं मुद्रांकन पोर्टल"
- [x] Updated the branding subtitle in `AuthLayout.tsx` to `consumerLanding.header.portalSubtitle`:
  - English: "Statutory Portal under the Legal Metrology Act, 2009 (Act No. 1 of 2010)"
  - Hindi: "विधिक मापविज्ञान अधिनियम, 2009 (2010 का अधिनियम सं. 1) के अंतर्गत वैधानिक पोर्टल"
- [x] Verified seamless dynamic bilingual re-rendering on language toggle
- [x] Verified monorepo build passes with 0 errors (`npm run build --workspaces --if-present`)

## Phase 53: Password Visibility Toggle ("View Password" Eye Icon) Integration
- [x] Integrated password reveal/hide eye icon (`Eye`, `EyeOff` from `lucide-react`) across all web application password input fields:
  - `LoginPage.tsx`: Commercial Trader / User login form
  - `RegisterPage.tsx`: Commercial Trader / User registration form
  - `OfficerManagementPage.tsx`: Admin provision LMO officer modal
  - `GatcAgencyManagementPage.tsx`: Admin provision GATC agency modal
  - `GatcStaffPage.tsx`: GATC agency provision inspector modal
- [x] Added accessible `aria-label` and `title` attributes for assistive technology compliance
- [x] Verified seamless toggle behavior between `type="password"` and `type="text"`
- [x] Verified monorepo build passes with 0 errors (`npm run build --workspaces --if-present`)

## Phase 54: Elimination of Footers in User App (Landing Page Only)
- [x] Removed statutory Government footer from authenticated Consumer layout (`ConsumerLayout.tsx`)
- [x] Removed statutory Government footer from Authentication layout (`AuthLayout.tsx`)
- [x] Retained the complete official statutory Government footer exclusively on the public landing page (`ConsumerLandingPage.tsx`)
- [x] Verified monorepo build passes with 0 errors (`npm run build --workspaces --if-present`)

## Phase 55: Elimination of "Verify Certificate" from User App Navigation & Routes
- [x] Removed "Verify Certificate" (`/verify`) navigation tab and `ShieldCheck` icon from `ConsumerLayout.tsx`
- [x] Pruned unused `ShieldCheck` import from `lucide-react`
- [x] Removed `/verify` and `/consumer/verify` routes from under authenticated `ConsumerLayout` in `ConsumerApp.tsx`
- [x] Retained standalone public `/verify` endpoint under `AuthLayout` for direct link/QR resolution
- [x] Verified monorepo build passes with 0 errors (`npm run build --workspaces --if-present`)

## Phase 56: User App Dialog Synchronization & Granular Auth Error Reporting Across Web and Mobile Apps
- [x] Modernized and synchronized all modal dialogs in the Consumer / Trader Portal and administrative pages with the Government of India daylight design system:
  - Base `dialog.tsx`: Upgraded dialog frame (`bg-white border-slate-200 shadow-2xl rounded-2xl p-6 sm:p-7`), backdrop (`bg-[#0B2545]/40 backdrop-blur-xs`), `DialogTitle` (`text-base sm:text-lg font-black tracking-tight text-[#0B2545] leading-snug`), `DialogDescription` (`text-xs text-slate-500 leading-relaxed`), and `DialogFooter` (`border-t border-slate-100 mt-5 pt-4`).
  - `RegisterInstrumentDialog.tsx`: Harmonized inputs, selects, labels, Government Navy CTA (`bg-[#0B2545] hover:bg-[#133966] text-white font-bold rounded-xl h-9 px-4 text-xs`), sleek cancel button, and high-visibility error alert banner with `AlertCircle`.
  - `SubmitApplicationDialog.tsx`: Harmonized instrument and application type selects, remarks textarea, dynamic statutory fee summary box (`bg-slate-50 border-slate-200 rounded-xl`), Government Navy CTA, and high-visibility error alert banner with `AlertCircle`.
  - `ScheduleInspectionDialog.tsx`: Harmonized input and instruction fields, Government Navy CTA, and error alert banner with `AlertCircle`.
- [x] Upgraded server-side authentication error handling in `server/src/modules/auth/auth.service.ts`:
  - Differentiated errors: if email not found, throws `"No account found with this email address. Please check your email or register."` (401 UNAUTHORIZED).
  - If password mismatch, throws `"Invalid password. Please check your password and try again."` (401 UNAUTHORIZED).
  - If deactivated account, throws `"This account has been deactivated. Please contact administration."` (403 FORBIDDEN).
- [x] Updated web client authentication pipeline (`client/src/context/AuthContext.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`):
  - Extracted server-provided error messages (`err.response?.data?.error?.message || err.message`) during login and registration.
  - Surfaced the exact server message directly inside `LoginPage.tsx` and `RegisterPage.tsx` error alert blocks.
- [x] Updated mobile client authentication pipeline (`mobile/src/lib/auth.tsx`, `mobile/src/screens/LoginScreen.tsx`):
  - Intercepted and extracted server error responses (`err.response?.data?.error?.message || err.message`) during mobile officer sign in.
  - Surfaced the exact error message (e.g., `"Invalid password. Please check your password and try again."`) in the native `Alert.alert("Sign In Failed", msg)` popup.
- [x] Verified zero compilation regressions across monorepo (`npm run build --workspaces --if-present` exit code 0).

## Phase 57: Live Application Tracker Clean Layout, Height Synchronization & Icon Centering
- [x] Reverted unwanted extra UI components (dark navy header banners and 4-stage workflow preview grids) from the Live Application Tracker section in `ConsumerLandingPage.tsx` per user rejection, restoring the clean daylight card layout.
- [x] Fixed root cause of input/button height discrepancy in `client/src/components/ui/input.tsx`: removed the responsive `sm:h-8` constraint from the base `Input` class which was shrinking the input to 32px on desktop breakpoints.
- [x] Aligned both the application number input and track button to identical height (`h-11 sm:h-11`, 44px) with `items-stretch sm:items-center`.
- [x] Fixed search icon positioning by wrapping `<Search>` inside `pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 z-10`, vertically locking it to the center of the input box and eliminating overflow.
- [x] Completely removed the "Quick Test" option and sample reference number (`LM-APP-2026-0000001`) from `ConsumerLandingPage.tsx`, initializing `trackInput` state to empty string `""`.
- [x] Retained clean tracked application card with 4-stage progression stepper and bento details when a reference number is submitted.
- [x] Verified zero compilation regressions across monorepo (`npm run build --workspaces --if-present` exit code 0).

## Phase 58: Universal Settings & Credentials Management Across Web and Mobile Apps
- [x] Defined shared Zod schemas (`updateCredentialsSchema`, `changePasswordSchema`) and TypeScript types in `@sih/shared`.
- [x] Implemented backend endpoints in `@sih/server`:
  - `PATCH /api/v1/users/credentials`: Allows updating full name and contact phone; strictly validates that email cannot be modified (`400 Bad Request: Email address is statutory and cannot be modified`); validates phone uniqueness (`409 Conflict`).
  - `POST /api/v1/users/change-password`: Verifies current password against existing bcrypt hash; enforces password complexity; updates password hash; records audit log.
- [x] Built responsive Government daylight `SettingsPage.tsx` in `@sih/client`:
  - Profile & Credentials card with read-only locked email, lock badge, statutory note, editable name, and editable phone.
  - Password Management card with current password, new password, and confirm password fields, each with password visibility eye (`Eye` / `EyeOff`) toggles.
- [x] Integrated `/settings` route and navigation links across all web applications:
  - Consumer Portal: Added to `ConsumerApp.tsx` routes, `ConsumerLayout.tsx` navigation bar, and clickable trader profile pill.
  - Admin Portal: Added to `AdminApp.tsx` routes, `Sidebar.tsx`, and `TopBar.tsx`.
  - Field Portal: Added to `FieldApp.tsx` routes, `Sidebar.tsx`, and `TopBar.tsx`.
  - Global Omnisearch: Added Settings shortcut to `GlobalSearchDialog.tsx` (`⌘K`).
- [x] Overhauled `mobile/src/screens/SettingsScreen.tsx`:
  - Added personal credentials card with locked read-only statutory email, editable name, and editable phone.
  - Added password change card with eye visibility toggles for all password fields.
  - Added 4th bottom navigation tab (**Settings** / **सेटिंग्स**) in `mobile/App.tsx` with animated spring feedback.
  - Added "Account Settings & Credentials" action in `OfficerHeader.tsx` profile sheet.
- [x] Added 100% complete bilingual English and Hindi translations across web and mobile locale dictionaries.
- [x] Verified zero compilation regressions across monorepo (`npm run build --workspaces --if-present` exit code 0) and mobile typecheck (`npm run typecheck --workspace=@sih/mobile` exit code 0).

## Phase 59: Landing Header Alignment, Password Security Defaults & Vercel SPA Routing
- [x] Replaced citizen convenience bar in `client/src/portals/consumer/ConsumerLayout.tsx` with the exact landing page top strip:
  - Saffron, white, and green Indian tricolor ribbon (`h-1 shadow-xs`).
  - Frosted daylight Government attribution strip with bilingual text (`consumerLanding.topStrip.govtOfIndia` & `consumerLanding.topStrip.ministry`) and pill language switcher.
- [x] Removed pre-filled default passwords (`"Password@123"`) and renamed fields:
  - `OfficerManagementPage.tsx`: Cleared initial & reset state `password: ""`, renamed label to `Password *`, added placeholder `Enter password (min. 8 characters)`.
  - `GatcStaffPage.tsx`: Cleared initial & reset state `password: ""`, renamed label to `Password *`, added placeholder `Enter password (min. 8 characters)`.
  - `GatcAgencyManagementPage.tsx`: Cleared initial & reset state `adminPassword: ""`, renamed label to `Admin Password *`, added placeholder `Enter password (min. 8 characters)`.
- [x] Configured `client/vercel.json` with SPA rewrite rule (`"source": "/(.*)", "destination": "/index.html"`) for zero-404 client-side routing on Vercel.
- [x] Created root `.gitignore` blocking `.env`, `server/.env`, and secrets while retaining `.env.example`.
- [x] Pushed codebase to remote GitHub repository (`https://github.com/sumitbudaniyaa/sih26.git`).

## Phase 60: Multi-Network Tunnel Architecture & Single-Command (`npm run dev`) Unified Ecosystem
- [x] Integrated `@expo/ngrok` dependency in `@sih/mobile` for native Expo Go tunnel support.
- [x] Updated `scripts/start-mobile.js` to automatically start Expo in `--tunnel` mode and bind `EXPO_PUBLIC_API_URL` to the public gateway URL.
- [x] Configured `mobile/src/lib/config.ts` with `PUBLIC_TUNNEL_URL` fallback and `process.env.EXPO_PUBLIC_API_URL` precedence so mobile clients on cellular 4G/5G or remote Wi-Fi can communicate with the backend.
- [x] Updated `mobile/src/lib/api.ts` with `ngrok-skip-browser-warning: "true"` headers across Axios defaults and request interceptors to prevent HTML splash screens from intercepting JSON API responses.
- [x] Updated `server/src/app.ts` CORS origin whitelist to permit modern ngrok domains (`.ngrok-free.dev`, `.ngrok-free.app`, `.ngrok.app`, `.ngrok.io`, `.loca.lt`).
- [x] Enabled single-command full-stack developer experience via `npm run dev`:
  - Automatically cleans ports (`5001`, `5173`, `5174`, `5175`, `8081`, `4040`).
  - Concurrently runs Express Server, Consumer Web, Admin Web, Field Officer Web, Ngrok Gateway, and Expo Metro Tunnel.
  - Allows immediate multi-network QR scanning on physical devices with Expo Go.
- [x] Verified monorepo builds and typechecks cleanly (`exit code 0`).

## Phase 61: Mobile Settings Navigation Gestures, Header Cleanup & Password Modal
- [x] Converted Settings Screen modal transition to horizontal slide-in (right-to-left) with backdrop fade in `mobile/src/screens/SettingsScreen.tsx` and `mobile/App.tsx`.
- [x] Implemented full-surface and left-edge swipe-right-to-dismiss gestures using `PanResponder` with `onMoveShouldSetPanResponderCapture`, dynamic `scrollEnabled` toggling, and an absolute left edge gesture strip (`width: 28`) across both the header and scrollable content body.
- [x] Synchronized status bar color: Wrapped top header in `headerSafeArea` with Android `StatusBar.currentHeight` top inset and `<StatusBar barStyle="dark-content" backgroundColor="#ffffff" />` to unify the phone status bar area (clock, battery, Wi-Fi) with the white header.
- [x] Updated Settings top navigation bar:
  - Added clean "Profile" / "प्रोफ़ाइल" title text immediately beside the back chevron button.
  - Removed the cross (`×`) icon button.
- [x] Removed duplicate "Edit Details" button on Officer Details card, keeping only one clean action button.
- [x] Migrated password change form to an interactive dialog modal (`RNModal`) with encrypted status row (`••••••••••••` with "Protected" badge), show/hide eye toggles, and validation.
- [x] Upgraded `scripts/start-tunnel.js` to disambiguate Homebrew ngrok v3 binary from `@expo/ngrok` v2 wrappers.
- [x] Verified full monorepo builds and typechecks cleanly (`npm run build` and `npm run typecheck` exit code 0).



