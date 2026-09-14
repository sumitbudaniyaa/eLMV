# Agent Engineering Journal & Architecture Decisions (AGENT_NOTES.md)

## 1. Environment & Infrastructure Context

- **Host Operating System**: macOS (Darwin arm64)
- **Node.js Runtime**: v24.15.0
- **Package Manager**: npm 11.12.1
- **Local Database Engine**: PostgreSQL 18 is running locally via Homebrew on `localhost:5432` (`legal_metrology` database). In addition, `docker-compose.yml` provides a localized containerized PostgreSQL 16 instance.
- **Test Suite Status**: 24/24 tests passing (`auth.test.ts`, `pki.test.ts`, `certificates.test.ts`, `admin.test.ts`, `gatc.test.ts`).
- **Compilation Status**: Monorepo (`@sih/shared`, `@sih/server`, `@sih/client`, `@sih/mobile`) compiles with 0 errors.

---

## 2. Architectural Decision Records (ADRs)

### ADR-001: Monorepo Workspace Strategy
- **Decision**: Use npm workspaces with four workspace directories: `shared`, `server`, `client`, and `mobile`.
- **Rationale**:
  - Eliminates schema duplication: Zod schemas and TypeScript interfaces defined once in `shared/` are directly imported by Express (server), Vite (client), and Expo (mobile).
  - Clean boundary isolation: UI code never leaks into server code, and server dependencies do not bloat the frontend bundles.

### ADR-002: Asymmetric PKI Cryptographic Signing (ECDSA NIST P-256)
- **Decision**: Implement ECDSA using NIST P-256 (`prime256v1`) with SHA-256.
- **Rationale**:
  - ECDSA P-256 signatures are compact (64 bytes raw, ~88 characters Base64) compared to RSA-2048/4096 (256–512 bytes).
  - Critical for printed physical certificates: compact payloads allow high error correction levels (Level H) in QR codes, ensuring scan reliability even if certificates are folded or worn.
  - Private keys are encrypted at rest using AES-256-GCM (`server/src/keys/pki.ts`) and never exposed via any API.

### ADR-003: UI Design System & Strict Color Discipline
- **Decision**: Minimalist high-contrast monochrome design system (shadcn/ui on web, matching custom primitives on mobile) with light solid semantic accents.
- **Rationale**:
  - Regulatory and government software demands clarity, legibility, and high density without visual distraction.
  - Pure black/white base (`#000000` / `#FFFFFF`) with subtle borders guarantees maximum readability under diverse lighting conditions in the field.
  - Zero gradients or decorative colors ensures unambiguous status identification (`SUBMITTED`, `SCHEDULED`, `INSPECTED`, `CERTIFIED`, `REJECTED`, `EXPIRED`).

### ADR-004: Public Verification Independence
- **Decision**: Public verification validates the cryptographic digital signature against the canonical certificate payload and signing key, rather than relying solely on a mutable database row lookup.
- **Rationale**:
  - Prevents tampering: Even if a database row were altered, the cryptographic signature check fails immediately with `SIGNATURE_FORGED_OR_ALTERED`.
  - Allows offline or decentralized verification of printed certificates via public key pinning.

### ADR-005: Internationalization (i18n) Architecture
- **Decision**: Use `react-i18next` for web and `i18next` for mobile with modular JSON namespaces (`common`, `nav`, `auth`, `status`).
- **Rationale**:
  - Legal Metrology is administered at both central and state levels across India.
  - Launch languages: English (`en`) and Hindi (`hi`).
  - Adding future state languages requires only dropping in translation JSON files with zero code modification.

---

## 3. Phase Progress & Audit Tracking

| Phase | Description | Status | Blockers / Notes |
|---|---|---|---|
| Phase 0 | Scaffolding & Setup | Completed | Monorepo workspaces, configs, docs, schemas, Prisma DB pushed & seeded |
| Phase 1 | Auth & RBAC | Completed | Dual-token JWT with bcrypt and role guards across server, web, mobile |
| Phase 2 | Stakeholder & Instrument Registry | Completed | CRUD, ownership rules, loading skeletons, registration dialog |
| Phase 3 | Application Workflow Engine | Completed | Full state machine, fee calculation, visit scheduling |
| Phase 4 | Inspection Recording | Completed | Structured observation recording, MPE tolerance checking, Cloudinary |
| Phase 5 | PKI & Certificate Issuance | Completed | ECDSA P-256 signing, QR generation, stamped PDF via pdf-lib |
| Phase 6 | Public Verification Portal | Completed | No-auth endpoint, live signature check, camera QR scanner, tamper detection |
| Phase 7 | Notifications & Expiry Engine | Completed | Daily cron job at 00:00, 30-day alerts, auto-transition to EXPIRED |
| Phase 8 | Operational Dashboards | Completed | Role-specific views (Consumer, LMO, GATC, Admin) |
| Phase 9 | Analytics & BI Module | Completed | Real SQL aggregations for TAT, aging pendency, workload, Recharts |
| Phase 10 | Search, Audit Log, Exports | Completed | Admin audit log inspector, global search, signed PDF export |
| Phase 11 | Full i18n Pass (EN + HI) | Completed | English and Hindi translations across web and mobile |
| Phase 12 | Testing & Hardening | Completed | 17/17 tests passing, live dev servers running on port 5001 & 5173 |
| Phase 13 | Enterprise UI/UX Overhaul | Completed | Modern AppShell, brand headers, PKI status pill, command bar, national verify portal |
| Phase 14 | Bilingual Dashboard, Theme Refinements & Camera Scanner Overhaul | Completed | Full Hindi translations in dashboard & dialogs, default light mode, greyish active sidebar, headless QR scanner |
| Phase 15 | Architecture Hardening, LMO Jurisdictions & Cryptographic Finalization | Completed | OfficerProfile, GATC gazette ref, Rule 14 fee architecture, NIST P-256 lock, RTR rotation |
| Phase 16 | Certificate Lifecycle Transition, Statutory QR Seal & Single-Page Print | Completed | Issue Certificate workflow, auto-issue toggle, high-res statutory QRCodeSVG, @media print A4 single-page bounds |
| Phase 17 | Universal In-App Omnisearch (Command Palette ⌘K) | Completed | GlobalSearchDialog, live instruments/applications query, instant page routing, quick actions, ⌘K trigger |
| Phase 18 | Certificate Action Responsive Controls & Overflow Prevention | Completed | Flex-wrap layout, responsive button sizing (Print/PDF), header truncation guards, shortened i18n labels |
| Phase 19 | Continuous Grid Alignment for Sidebar & Shell Headers/Footers | Completed | Synchronized h-14 heights for sidebar/shell headers and footers, h-screen overflow-hidden viewport grid |
| Phase 20 | PDF Streaming Endpoint, Consumer-Only Registration, Jaipur Re-Seed & Scheduling Fix | Completed | Bottom-only cert buttons, binary PDF stream endpoint, Consumer-only self-registration, Jaipur seed data, datetime-local scheduling fix |
| Phase 21 | Role-Scoped Analytics & Persona-Specific Business Intelligence | Completed | Strict role isolation across TAT, pendency, workload, and category compliance; tailored client UI |
| Phase 22 | Responsive Mobile Lifecycle Stepper Overhaul | Completed | 2x2 compact card grid on mobile, circular accent badges, left-aligned typography |
| Phase 23 | Mobile Input Auto-Zoom Prevention & ngrok Tunnel Integration | Completed | 16px font rule on mobile inputs, viewport scale lock, live public ngrok tunnel |
| Phase 24 | Mobile Placeholder Typography Refinement & Proportional Sizing | Completed | 12px placeholder rule override, sleek compact hints, zero iOS focus auto-zoom |
| Phase 25 | Unified Dev Command with Integrated ngrok Tunnel | Completed | Single npm run dev starts backend, frontend, and static ngrok tunnel with log filtering |
| Phase 26 | 3-Portal Architecture & Hierarchical Regulatory Provisioning | Completed | Dedicated Consumer, Admin, and Field portals; strict role hierarchy; GATC agency delegation |
| Phase 27 | Subdomain Architecture & Multi-Port Local Development | Completed | Dynamic portal resolution (5173, 5174, 5175), WrongPortalNotice security, CORS multi-origin |
| Phase 28 | Consumer Portal Transformation: Official Government Landing Page | Completed | State Emblem, tricolor ribbon, Live Application Tracker, Rule 14 Fee Calculator, bilingual EN/HI |
| Phase 29 | Comprehensive Bug Audit & Edge Case Hardening | Completed | RecordInspectionDialog autoIssue default false, FieldRosterPage actions, district query fix, timezone fix |
| Phase 30 | Mobile Native Architecture & 60FPS Spring Physics Overhaul | Completed | Minimalist Login, 3-tab navigation, PanResponder drag-to-dismiss ApplicationDrawer, Schedule XI cert |
| Phase 31 | Mobile Application Roster Visibility & Zero-Crash Interceptors | Completed | TypeError search fix, backend district select, 401 token refresh interceptor, balanced seed data |
| Phase 32 | Monorepo-Wide Hindi/English Bilingual Localization & Dynamic Re-rendering | Completed | FieldRosterPage useTranslation, mobile key={lang} dynamic re-renders, all screens localized |
| Phase 33 | Unified eLMV Branding & Emblem Asset Relocation | Completed | Canonical eLMV identity, State Emblem favicon & mobile login integration, clean typographic wordmarks |
| Phase 34 | Mobile Camera QR Scanner, Button Discipline & Direct Verification | Completed | expo-camera integration, primary/secondary button hierarchy, light scan card, direct drawer launch, demo buttons removed |
| Phase 35 | Web Navigation Streamlining & Public Verification Decoupling | Completed | Removed nav.verify & publicPortal from Sidebar desktop/mobile, ConsumerLayout, FieldLayout; preserved /verify route |
| Phase 36 | Elimination of Redundant "Awaiting Sign" Stage & Auto-Sign Consolidation | Completed | Removed "To Sign" tab & buttons from mobile & web rosters; converted demo data to CERTIFIED; aligned with 1-step auto-signing |
| Phase 37 | Mobile Verification Screen Cleanup | Completed | Stripped green camera pill from scan card and inline QR logo from input field |
| Phase 38 | Mobile Inspection Photo Proof Upload & Button Touch Ergonomics | Completed | Built native on-site CameraView capture submodal, photo thumbnail preview, 44px buttons |
| Phase 39 | Green Primary Button Label Simplification to "Verify" | Completed | Standardized primary action button to "Verify" across mobile inspection and verification |
| Phase 40 | Consumer Web Portal Landing Page Modernization | Completed | Gov of India portal architecture, Swachh Bharat & Digital India logos, hero announcement carousel, minister card, About eLMV section |
| Phase 41 | Consumer Landing Hero Card Streamlining | Completed | Removed right-column Legal Metrology showcase card from hero carousel banner, streamlined layout to max-w-4xl |
| Phase 42 | Consumer Landing Content Bloat Reversion & De-Gradienting Refactor | Completed | Reverted extraneous sections (#mandate, #rules, etc.); purged all gradients, clip-text, glow rings; 100% i18n sync |
| Phase 43 | Consumer Landing Page Cleanliness Polish | Completed | Removed 'Act No. 1 of 2010 • Central Portal' badge, 'Verify Certificate' nav link & section #verify, purged all pre-section promotional badges |
| Phase 44 | Hero Section Slideshow Elimination & Focused Value Banner | Completed | Replaced auto-advancing slideshow with a single high-contrast Government banner highlighting easy certification & instant verification |
| Phase 45 | Statutory Advisory Continuous Running Ticker Marquee | Completed | Transformed Section 24 statutory advisory notice into a continuous hardware-accelerated running ticker with pause-on-hover |
| Phase 46 | Landing Page Cleanse: Elimination of View Certificate & QR Code Mentions | Completed | Purged all View Certificate buttons, Verify Certificate CTAs, and QR code references across landing page and i18n locales |
| Phase 47 | Night Theme Deactivation & Pure Daylight Government Theme Enforcement | Completed | Enforced light mode on mount, removed theme toggle and Sun/Moon icons, converted hero to daylight theme, purged all 74 dark: classes |
| Phase 48 | Citizen & Commercial Metrology Services Card Hover Motion Elimination | Completed | Removed hover vertical translation (hover:-translate-y-1.5) across all 6 service cards, replaced with stable hover:shadow-md |
| Phase 49 | Elimination of National & State Transparency Metrics Section | Completed | Removed <section id="transparency"> and pruned unused stats namespace in en.json and hi.json |
| Phase 50 | User App UI Harmonization with Government Landing Page Design System | Completed | ConsumerLayout with Tricolor strip, Emblem header, horizontal Navy navbar, Government footer; AuthLayout & page modernization |
| Phase 51 | Auth Header Bilingual Separation & Strict Locale Enforcement | Completed | Separated mixed strings into pure English or pure Hindi in RegisterPage and LoginPage via en.json and hi.json |
| Phase 52 | Login Layout Branding Alignment with National Verification Portal | Completed | Aligned AuthLayout branding with eLMV National Verification & Stamping Portal and Section 24 statutory subtitle |
| Phase 53 | Password Visibility Toggle ("View Password" Eye Icon) Integration | Completed | Integrated Eye/EyeOff toggles across LoginPage, RegisterPage, OfficerManagementPage, GatcAgencyManagementPage, GatcStaffPage |
| Phase 54 | Elimination of Footers in User App (Landing Page Only) | Completed | Removed footer from ConsumerLayout and AuthLayout; preserved statutory footer strictly on ConsumerLandingPage |
| Phase 55 | Elimination of "Verify Certificate" from User App Navigation & Routes | Completed | Removed /verify tab and ShieldCheck from ConsumerLayout and routes in ConsumerApp |

---

### ADR-006: Enterprise Design Shell & Micro-Interactions
- **Decision**: Refine layout from simple top-nav to an industry-standard enterprise AppShell (`Sidebar.tsx` + `TopBar.tsx`) with 8px radius tokens (`--radius: 0.5rem`), zinc neutral palettes, subtle active feedback (`active:scale-[0.98]`), dynamic breadcrumbs, and command bar (`⌘K`).
- **Rationale**:
  - Provides world-class SaaS aesthetic (Linear/Stripe benchmark) combined with official national digital service authority.
  - Sidebar categorizes tasks into Core Operations, Verification & Trust, and Intelligence with live PKI key engine status indicator.
  - Retains strict compliance with zero mock data and high-contrast monochrome base with light solid status badges.

### ADR-007: Bilingual Hindi Expansion Across Internal Dashboards & Modals
- **Decision**: Expand the i18n system to deeply localize all four internal role dashboards (`CONSUMER`, `LMO`, `GATC`, `ADMIN`), action tables, and statutory workflow dialogs (Register Instrument, Submit Application, Schedule Inspection, Record Test Observations).
- **Rationale**:
  - Ground-level verification officers, state metrology inspectors, and commercial traders operate fluently in regional languages and official state vernaculars.
  - Decoupling all modal titles, form labels, helper descriptions, and MPE tolerance tooltips into structured translation namespaces guarantees zero untranslated UI text when switching between English and Hindi.

### ADR-008: Default Light Theme & User-Controlled Preference Persistence
- **Decision**: Initialize the web application in high-contrast light mode by default, removing automatic OS-level dark-mode locks (`window.matchMedia("(prefers-color-scheme: dark)")`). Persist explicit user toggle actions using a dedicated `theme_mode` localStorage key.
- **Rationale**:
  - Government and regulatory enterprise systems expect an authoritative, high-contrast light aesthetic upon first visit.
  - Automatic OS dark-mode overrides caused confusion on Mac and mobile devices whose operating systems were set to dark mode.
  - In the sidebar, active route selection is styled with a subtle greyish light shade (`bg-zinc-100 dark:bg-zinc-800` with subtle border) rather than stark solid pitch black/white, providing a softer, polished visual hierarchy.

### ADR-009: Headless QR Code Scanner Architecture & Multi-Device Fallback
- **Decision**: Transition from the legacy `Html5QrcodeScanner` UI wrapper to direct programmatic control via headless `Html5Qrcode`. Implement automated device capability probing and fallback handling.
- **Rationale**:
  - `Html5QrcodeScanner` injects uncontrolled third-party DOM elements that conflict with React 18 StrictMode lifecycle mounting, causing unrecoverable camera initialization crashes on navigation.
  - Mobile devices possess rear-facing cameras (`{ facingMode: "environment" }`), whereas MacBooks and desktop workstations only feature front-facing user webcams (`{ facingMode: "user" }`). Specifying `environment` on MacBooks triggers an unhandled `OverconstrainedError`. Headless control catches this constraint error and gracefully falls back to the active user webcam.
  - Adding a direct client-side file upload QR decoder (`scanFile()`) guarantees verification functionality on workstations lacking webcam peripherals or in environments with strict browser camera permission policies.

### ADR-010: Cryptographic Curve Standardization on NIST P-256 (prime256v1)
- **Decision**: Formally lock the asymmetric signing algorithm strictly to **ECDSA NIST P-256 (`prime256v1`) with SHA-256**. Prohibit cryptocurrency curves (`secp256k1`) and eliminate ambiguity across architectural specifications.
- **Rationale**:
  - NIST P-256 is the benchmark standard under FIPS 186-4 and international e-governance guidelines for digital document signing and public-key infrastructure.
  - Generates compact 64-byte raw / 88-char Base64 signatures, allowing high error-correction Level H QR codes on physical certificates without density degradation.

### ADR-011: Strict Token Segregation & Cryptographic Refresh Token Rotation
- **Decision**: Standardize authentication on in-memory Bearer access tokens (15m expiration) paired with `httpOnly`, `Secure`, `SameSite=Strict` cookie delivery for refresh tokens on web (Expo SecureStore on mobile). Implement automatic single-use Refresh Token Rotation (RTR).
- **Rationale**:
  - Eliminates XSS token exfiltration risks by keeping refresh tokens completely inaccessible to client JavaScript.
  - Enforcing `SameSite=Strict` and origin validation mitigates CSRF vectors.
  - Refresh Token Rotation ensures that if an in-flight refresh token is intercepted, any second attempt to use it will immediately invalidate all active sessions for that user, containing potential compromise.

### ADR-012: Territorial Jurisdictional Profiles & Statutory Gazette Modeling
- **Decision**: Introduce explicit `OfficerProfile` (`badgeNumber`, `jurisdictionDistrict`, `jurisdictionState`, `jurisdictionZone`) for Legal Metrology Officers, and explicit Government Gazette Notification reference (`notificationRefNumber`) on `GATCProfile`.
- **Rationale**:
  - Section 14 and Section 24 of the Legal Metrology Act mandate territorial jurisdiction for enforcement officers; application routing and officer queues require explicit district/state boundaries rather than generic user accounts.
  - Problem Statement explicitly notes GATCs are "notified by the Government"; tracking the official Gazette Notification Reference Number alongside NABL accreditation numbers establishes legal traceability.

### ADR-013: Statutory Separation of Duties & Role-Gated Action Controls
- **Decision**: Strictly gate `+ New Application` and `+ Register Instrument` exclusively to Commercial Traders (`CONSUMER`) and Department Administrators (`ADMIN` proxy). Prevent Legal Metrology Officers (`LMO`) and Government Approved Test Centres (`GATC`) from initiating verification applications or registering commercial instruments.
- **Rationale**:
  - Under the Legal Metrology Act, 2009, LMO officers and GATC laboratories are statutory verification authorities and adjudicators. Permitting an inspecting officer or testing laboratory to submit applications or register personal commercial instruments constitutes an overt conflict of interest (the certifier cannot also be the applicant).
  - In the Instruments Registry (`/instruments`), the user experience adapts to role: Traders see `Apply for Verification` and manage their inventory; while LMO, GATC, and Admin see an `Applications` history button and an `Owner / Trader` attribution column. This converts the registry into a Section 15 on-site spot-check database for officers and a statewide asset ledger for department controllers.

### ADR-014: Universal In-App Omnisearch Engine (Command Palette ⌘K)
- **Decision**: Replace the static `/verify` portal navigation link in the top navigation bar with an interactive, multi-entity In-App Omnisearch Engine (`GlobalSearchDialog.tsx`).
- **Rationale**:
  - The top navigation bar in an enterprise governance portal should provide comprehensive discovery across the platform rather than a redundant link to an external verification page.
  - The omnisearch palette indexes live registered instruments (by serial, make, model, capacity), applications (by ID and status), navigational routes, and immediate system actions (language switching, theme toggles, registration shortcuts) with universal `⌘K` / `Ctrl+K` accessibility.

### ADR-015: Responsive Action Layouts & Pure Statutory Print Isolation
- **Decision**: Implement responsive flex-wrap and fluid width constraints on all certificate presentation action bars, relocate all action buttons completely outside the `#certificate-print-card` DOM container, pair with concise multilingual copy, and enforce hardened `@media print` isolation using explicit `:not(button):not(.no-print)` selectors.
- **Rationale**:
  - Multilingual translations (e.g. Hindi) frequently exceed English character counts. Fixed-width button groups without flex wrapping cause horizontal clipping and mobile viewport scroll degradation.
  - Using `flex-wrap items-center` with `flex-col sm:flex-row items-stretch sm:items-center` ensures that on narrow smartphone viewports, buttons gracefully stack or share full row widths, while maintaining tight right-aligned positioning on desktop screens.
  - Placing action buttons inside the certificate card container risked CSS selector specificity collisions (e.g., `#certificate-print-card * { visibility: visible }` overriding `button { display: none }`). Structurally relocating action bars completely outside `#certificate-print-card` guarantees that the printed DOM element contains strictly authentic statutory content—leaving zero possibility of buttons appearing in printed certificates or exported PDFs.

### ADR-016: Continuous Grid Alignment for Sidebar & Shell Headers/Footers
- **Decision**: Align the bottom border of the sidebar brand header with the bottom border of the TopBar header at an exact matching height (`h-14` / 56px), and align the top border of the sidebar profile footer with the top border of the page statutory footer at an exact matching height (`h-14` / 56px). Lock the parent shell to `h-screen overflow-hidden` with independently scrollable `<main>`.
- **Rationale**:
  - In modern high-density administrative portals, misaligned horizontal dividers between navigation sidebars and page content panes create visual stutter and disorienting broken grid lines.
  - Standardizing both top headers to `h-14` ensures the horizontal border line runs seamlessly from the extreme left edge of the sidebar to the right edge of the page.
  - Standardizing both bottom footers to `h-14` ensures the statutory notice divider line similarly runs continuously across the bottom of the viewport, giving the entire workspace a unified architectural grid structure.

### ADR-017: Commercial Consumer-Only Self-Registration Policy
- **Decision**: Restrict public self-registration (`POST /api/v1/auth/register` and `RegisterPage.tsx`) strictly to `CONSUMER` (commercial trader / device owner). Reject any registration attempt specifying `ADMIN`, `LMO`, or `GATC` roles with HTTP 403 FORBIDDEN, and remove the role dropdown selector from the registration UI.
- **Rationale**:
  - In national statutory regulatory frameworks, inspecting officers (`LMO`), government-approved testing laboratories (`GATC`), and state controllers (`ADMIN`) are appointed government authorities. Allowing open public registration of enforcement and adjudicative roles is a severe security vulnerability.
  - Privileged accounts are provisioned and assigned strictly by existing state administrators through official government onboarding.

### ADR-019: Role-Scoped Analytics & Personal Business Intelligence Architecture
- **Decision**: Restructure all analytics backend services (`/api/v1/analytics/*`) and frontend visualizations (`AnalyticsPage.tsx`) to strictly scope metrics to the authenticated user's role and personal identity:
  - **Traders (`CONSUMER`)**: Metrics calculate strictly from the trader's personal applications and instruments (personal turnaround time, overdue applications queue, category compliance rate, and personal equipment stamping registry).
  - **Enforcement Officers (`LMO`)**: Metrics calculate strictly from inspections assigned to and conducted by the officer, aging of their personal field queue, category compliance within their jurisdiction district (Jaipur), and their personal throughput/rejection matrix.
  - **Testing Laboratories (`GATC`)**: Metrics calculate strictly from laboratory testing batches assigned to the lab, calibration turnaround times, accredited equipment scopes, and lab throughput records.
  - **State Controllers (`ADMIN`)**: Retains statewide oversight across all districts, officers, and commercial establishments.
- **Rationale**:
  - Exposing statewide aggregate metrics or other officers' performance data to commercial traders or individual field officers violates privacy, creates confusion, and lacks operational relevance. Users need actionable insights directly tied to their own compliance obligations or enforcement caseload.

### ADR-020: Responsive 2x2 Grid Stepper Architecture for Mobile Viewports
- **Decision**: In `ApplicationListPage.tsx`, convert the mobile presentation of the Verification Lifecycle Stepper from an unconstrained vertical stack with centered items into a structured **2x2 card grid** (`grid grid-cols-2 gap-2 md:hidden`). Pair each step with a circular accent badge (`h-5 w-5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[11px]`), left-aligned bold title, and concise subtitle.
- **Rationale**:
  - The previous mobile implementation (`flex flex-col items-center`) centered all text blocks and omitted connector icons, resulting in an unformatted vertical dump of 4 text blocks that consumed >250px of vertical space on smartphone screens.
  - A 2x2 card grid takes only ~70px of vertical space, groups steps cleanly into pairs (Filing & Scheduling / Inspection & Issuance), guarantees left-aligned visual stability, and retains high density while preserving the desktop horizontal connected workflow.

### ADR-021: Mobile Input Viewport Auto-Zoom Suppression Architecture
- **Decision**: Suppress the automatic mobile browser viewport zoom-in triggered by iOS Safari and Android Chrome when focusing input fields:
  1. Set a global CSS rule in `client/src/index.css`: `@media screen and (max-width: 768px) { input, select, textarea { font-size: 16px !important; } }`.
  2. In `client/index.html`, declare `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />`.
  3. In `client/src/components/ui/input.tsx`, apply `text-base sm:text-xs` and `h-9 sm:h-8`.
- **Rationale**:
  - iOS Safari enforces a built-in accessibility rule where focusing any input element with `font-size < 16px` automatically zooms in the browser viewport. Because compact desktop design systems utilize `text-xs` (12px), tapping inputs on mobile phones causes jarring viewport scaling that cuts off headers, modal dismiss buttons, and navigation bars.
  - Ensuring the computed `font-size` is 16px on mobile viewports natively disables the WebKit auto-zoom heuristic, while the viewport scale lock guarantees a stable 1.0 zoom scale across all form inputs and dialogs.

### ADR-022: Mobile Placeholder Typography Isolation & Proportional Sizing
- **Decision**: Decouple placeholder typography from the input element's computed font-size:
  1. Add explicit `font-size: 12px !important; line-height: normal;` rules targeting `input::placeholder`, `textarea::placeholder`, `input::-webkit-input-placeholder`, and `input::-moz-placeholder` in `client/src/index.css`.
  2. Add `placeholder:text-xs` to `client/src/components/ui/input.tsx` and `client/src/components/layout/GlobalSearchDialog.tsx`.
- **Rationale**:
  - Setting `font-size: 16px !important` on input elements natively causes the `::placeholder` pseudo-element to inherit the 16px size, bloating hint text and visually distorting compact inputs.
  - WebKit calculates the viewport zoom factor strictly from the focused `HTMLInputElement`'s computed font-size (`16px >= 16px` -> no zoom). WebKit does NOT inspect the pseudo-element `::placeholder` font size.
  - Applying `12px !important` exclusively to `::placeholder` preserves a sleek, high-density, professional appearance on mobile while completely preventing unwanted iOS Safari viewport zoom.

### ADR-023: Integrated Persistent Tunnel in Developer Lifecycle
- **Decision**: Incorporate ngrok tunnel launching directly into `npm run dev` with resilient process isolation:
  1. Concurrently launch `server:dev`, `client:dev`, and `tunnel` (`node scripts/start-tunnel.js`).
  2. Provide `npm run dev:local` for offline development.
  3. Filter connection ping noise in `scripts/start-tunnel.js` so console output remains readable for application logs.
  4. Ensure tunnel exits do not abort the local HTTP servers.
  5. Add port 4040 cleanup and ngrok process termination to `scripts/free-ports.js`.
- **Rationale**:
  - Developers and testers requiring mobile responsiveness testing on actual devices should not have to manually run multiple terminals or remember ngrok subcommands. A single `npm run dev` brings up the entire local and public testing environment seamlessly.

### ADR-024: 3-Portal Ecosystem Architecture & Hierarchical Regulatory Provisioning
- **Decision**: Restructure the web application ecosystem into 3 distinct, purpose-built portals and enforce strict hierarchical account provisioning:
  1. **Consumer Portal (`/consumer/*`)**: Pure citizen/trader portal for equipment owners.
  2. **Regulatory & Agency Admin Portal (`/admin/*`)**: Desktop governance portal for State Controller (`ADMIN`) and accredited agency heads (`GATC_ADMIN`).
  3. **Field Inspection Suite (`/field/*`)**: Touch-optimized web station for on-ground officers (`LMO` and `GATC_INSPECTOR`).
  4. **Hierarchical Provisioning Rules**:
     - Public self-registration is strictly restricted to `CONSUMER` (any attempt to register privileged roles is rejected with HTTP 403).
     - State Controller (`ADMIN`) alone provisions `LMO` officers and `GATC_ADMIN` accredited agencies.
     - `GATC_ADMIN` alone provisions in-house `GATC_INSPECTOR` technical staff.
     - Technical staff are linked via `GATCInspectorProfile` directly to their parent institutional `GATCProfile`.
- **Rationale**:
  - Reflects the Legal Metrology Act, 2009: GATC is an accredited institutional entity (agency/laboratory), not a single individual.
  - Enforces strict institutional separation of duties and prevents regulatory conflicts of interest.
### ADR-025: Subdomain Architecture & Multi-Port Local Development
- **Decision**: Architect the frontend as 3 dedicated subdomain applications with clean top-level routes (`/dashboard`, `/officers`, `/roster`) and simultaneous multi-port development:
  1. **Consumer App (`ConsumerApp.tsx`)**: Bound to `consumer.domain.com` (Dev port `5173`).
  2. **Regulatory & Agency Admin App (`AdminApp.tsx`)**: Bound to `admin.domain.com` (Dev port `5174`).
  3. **Field Inspection Suite (`FieldApp.tsx`)**: Bound to `field.domain.com` (Dev port `5175`).
  4. **Dynamic Portal Resolution (`subdomain.ts`)**: Detects active portal from port (`5173`/`5174`/`5175`), subdomain prefix (`consumer.`/`admin.`/`field.`), or build environment.
  5. **Cross-Portal Security (`WrongPortalNotice.tsx`)**: Enforces institutional boundaries at runtime. If an account authenticates on the wrong subdomain, it provides a clear advisory and 1-click switch button to their designated workplace.
  6. **Unified Developer Experience**: Root `npm run dev` concurrently launches Express on `5001`, Consumer on `5173`, Admin on `5174`, Field on `5175`, and ngrok tunnel.
- **Rationale**:
  - Eliminates awkward URL prefix nesting (`/admin/dashboard` or `/consumer/dashboard`) when each portal is served from its own distinct subdomain in production (`admin.domain.com/dashboard`, `consumer.domain.com/dashboard`).
  - Simulates the exact multi-subdomain production topology in local development via dedicated local ports without requiring `/etc/hosts` modifications.

### ADR-026: Mobile 60FPS Spring Physics, Gesture Dismissal & Modern Minimalism
- **Decision**: Overhaul the React Native mobile user experience with native spring physics (`Animated.spring` with `useNativeDriver: true`, `tension: 65, friction: 11`), drag-to-dismiss gesture handling via `PanResponder`, and minimalist aesthetic:
  1. Eliminate bulky cards and redundant settings from navigation; standardize on a streamlined 3-tab layout (`Roster`, `Verify`, `Registry`).
  2. Implement an animated bottom-sheet drawer (`ApplicationDrawer.tsx`) for full application inspection details, equipment specs, and action triggers.
  3. Replicate the official Government of Rajasthan Schedule XI Verification Certificate in `CertificateModal.tsx` with zero text truncation or horizontal overflow.
  4. Add tactile micro-interactions (`0.98` scale spring) to roster cards, filter chips, and primary buttons.
- **Rationale**:
  - Field officers conducting statutory on-site verifications in noisy or outdoor retail markets need fast, fluid, gesture-responsive controls that do not feel clunky or web-wrapped.
  - Drag-to-dismiss bottom sheets provide natural one-handed ergonomics on mobile devices.

### ADR-027: Mobile API Resiliency, Automated JWT Interceptors & Roster Scoping
- **Decision**: Implement self-healing network and authentication resiliency in `@sih/mobile`:
  1. Add an automated 401 Axios response interceptor in `mobileApi` (`mobile/src/lib/api.ts`) that silently exchanges refresh tokens from `expo-secure-store` and replays failed requests.
  2. Guard all client-side search filtering (`RosterScreen.tsx`) with safe nullish coalescing to prevent `TypeError` crashes on missing model fields.
  3. Maintain an interactive `FALLBACK_APPLICATIONS` queue and offline banner with a 1-tap retry button so officers never face blank screens in low-connectivity areas.
  4. Ensure backend queries (`applications.service.ts`) comprehensively select `district`, `state`, `category`, and `accuracyClass`.
- **Rationale**:
  - Access tokens expire after 15 minutes. In mobile environments where apps stay backgrounded, without automated interceptors all subsequent API calls silently fail with `401 Unauthorized`.
  - Field inspections occur in basements, warehouses, and rural mandis where connectivity is intermittent; the application must degrade gracefully without crashing.

### ADR-028: Dynamic Locale Re-Mounting & Monorepo Bilingual Synchronization
- **Decision**: Implement dynamic bilingual reactivity across `@sih/client` and `@sih/mobile`:
  1. Subscribe web field roster views (`FieldRosterPage.tsx`) directly to `react-i18next` with complete English and Hindi translation dictionaries.
  2. Key mobile viewport screens with `key={lang}` and `currentLanguage={lang}` to guarantee instantaneous re-rendering when the active language changes.
  3. Provide language toggle accessibility at all touchpoints, including a dedicated top-right language switcher pill on the mobile `LoginScreen.tsx`.
- **Rationale**:
  - Legal Metrology officers and commercial traders across India operate in both English and Hindi.
  - Stale language caching in React Native component trees causes partial or untranslated screens unless screen viewports re-mount upon state changes.

### ADR-029: Unified eLMV Branding & Canonical State Emblem Placement
- **Decision**: Standardize application branding across all web and mobile touchpoints to **eLMV** (Legal Metrology Verification System) and establish canonical placement for the authentic State Emblem of India:
  1. Web favicon: Relocated user graphic to `client/public/emblem.jpeg` and linked as primary favicon in `client/index.html`.
  2. Mobile login: Embedded `mobile/assets/emblem.jpeg` at native aspect ratio paired with bold eLMV typography and Government of India attribution.
  3. Layout headers: Standardized typography to high-contrast eLMV wordmarks in navigation sidebars, top bars, and portal layouts, replacing arbitrary scale icon placeholders.
- **Rationale**:
  - National digital services require authoritative, consistent statutory identity across platforms.
  - Eliminates visual clutter and ensures unmistakable brand recognition across citizen, officer, and administrative tiers.

### ADR-030: Primary Button Hierarchy, Direct QR-to-Drawer Verification & Elimination of Dummy Actions
- **Decision**: Enforce strict button color hierarchy discipline and direct workflow routing in the mobile verification experience:
  1. **Strict Button Hierarchy**: Solid black (`#09090b`) is reserved exclusively for primary action triggers (`verifyBtn`). Secondary buttons (such as "View Official Schedule XI Certificate" and the Scan QR trigger) are styled with clean white/bordered backgrounds (`#ffffff`, border `#e4e4e7`, dark `#18181b` text).
  2. **Direct Drawer Verification on Scan**: When a statutory QR code is scanned, the mobile app immediately opens the official Schedule XI Certificate bottom sheet drawer (`CertificateModal.tsx`) using dedicated `drawerCertNumber` state, without populating or polluting the manual search text input.
  3. **Zero Dummy Elements**: Remove all artificial simulation buttons ("Simulate Scan (Demo Certificate)" / "Simulate Demo QR Scan") from the scanner HUD and permission views for production-grade authenticity.
- **Rationale**:
  - Making every interactive card or secondary button solid black destroys visual hierarchy and makes the UI visually noisy and confusing.
  - Officers scanning on-site physical QR codes expect immediate certificate inspection without extraneous steps (like populating an input box and requiring a second click).
  - Eliminating demo scan buttons ensures the application behaves strictly as a production tool, avoiding false positives or simulated data in real field checks.

### ADR-031: Dedicated Portal Navigation Isolation & Public Verification Route Decoupling
- **Decision**: Decouple the public verification `/verify` route from internal authenticated portal navigation menus across web applications:
  1. `client/src/components/layout/Sidebar.tsx`: Removed the dedicated "Public Trust" navigation section (`t("nav.publicPortal")` & `t("nav.verify")`) and mobile drawer link (`t("nav.publicVerification")`).
  2. `client/src/portals/consumer/ConsumerLayout.tsx`: Removed `"Verify Certificate"` (`/verify`) from the trader navigation bar.
  3. `client/src/portals/field/FieldLayout.tsx`: Removed `"Public Verification"` (`/verify`) from the field officer top bar.
  4. **Route Preservation**: The underlying `/verify` page route (`PublicVerificationPage.tsx`) remains accessible for physical QR code scanning, printed Schedule XI certificates, and direct verification URLs.
- **Rationale**:
  - Authenticated portals (Admin, Trader/Consumer, Field Inspection) are specialized work environments focused on specific duties (filing applications, inspecting instruments, running lab tests, auditing).
  - Public verification is an external public utility invoked via QR scans or direct link lookups, not a routine internal workflow within authenticated portal sessions.
  - Streamlines navigation bars to keep user focus strictly on role-specific tasks while preserving universal URL resolution for public trust verification.

### ADR-032: Elimination of Redundant "Awaiting Sign" Stage & 1-Step Verification Alignment
- **Decision**: Completely prune the intermediate "Awaiting Sign" / "To Sign" state and UI categories across mobile and web interfaces:
  1. **Mobile Roster (`RosterScreen.tsx`)**: Removed the `"To Sign"` filter tab, leaving four unambiguous operational tabs: **All**, **Scheduled**, **Certified**, and **Rejected**.
  2. **Mobile Metrics (`MetricCounters.tsx`)**: Replaced the middle `"To Sign"` counter column with **Total Pipeline** (`totalCount`).
  3. **Action Triggers (`RosterCard.tsx`, `ApplicationDrawer.tsx`)**: Removed the obsolete manual `"Sign & Issue"` buttons and confirmation dialogs.
  4. **Fallback & Demo Data (`FALLBACK_APPLICATIONS`)**: Updated `demo-app-3` from `ApplicationStatus.INSPECTED` to `ApplicationStatus.CERTIFIED` with a valid certificate (`LM-RJ-2026-0000003`).
  5. **Web Field Roster (`FieldRosterPage.tsx`)**: Removed the `"Awaiting Signature"` KPI card, the `"Awaiting Signature"` filter tab, and the `"Digitally Sign & Issue Certificate"` table action button.
- **Rationale**:
  - In earlier iterations, on-site test observation recording and digital signature issuance were two separate stages.
  - The workflow was streamlined so that when an inspection passes statutory tolerances (`isPassed === true`), digital certificate generation (`POST /api/v1/certificates/issue`) is executed atomically/immediately upon inspection submission.
  - Leaving an "Awaiting Sign" tab and manual signing buttons created confusion for field officers and users, suggesting that passed inspections were languishing unsigned when they had already been automatically certified.

### ADR-033: Mobile Verification Screen Streamlining & Input Clutter Reduction
- **Decision**: Refine the visual presentation of the Public Verification screen (`VerifyScreen.tsx`) in the mobile app:
  1. **Removed Camera Badge from Scan Card**: Stripped the green `"CAMERA"` / `"कैमरा"` pill badge (`scanPill`) from the top right of the Scan Statutory QR Code card, keeping the card title clean and uncluttered.
  2. **Removed Inline Scan Logo from Input**: Removed the duplicate `Icons.QrCode` button located inside the search/certificate number text input field, leaving the text input focused purely on alphanumeric input while the prominent card above acts as the single, clear entry point for QR scanning.
- **Rationale**:
  - Having both a prominent dedicated scan card and a second mini scan icon inside the text input created visual redundancy and confusion over the primary interaction target.
  - Removing the green camera pill badge simplifies the scan card header and prevents awkward text collisions on smaller phone screens.

### ADR-034: Inspection Modal Photo Proof Upload Option & Button Touch Target Enhancement
- **Decision**: Replace the raw image URL text input in `InspectionModal.tsx` with a dedicated on-site photo evidence workflow, and calibrate the height of modal action buttons:
  1. **Direct Camera Photo Capture**: Instead of requiring officers to type or paste a web URL in a text field or pick artificial dummy evidence, tapping the photo proof target directly opens a built-in `CameraView` capture submodal for real on-site photo taking.
  2. **Preview and Remove Controls**: When a photo is captured, it displays an evidence preview card with image thumbnail, file metadata, statutory verified indicator, and clear button.
  3. **Calibrated Button Height (44px)**: Increased the height of bottom action buttons ("Cancel" and "Verify, Sign & Issue Certificate" / "Record Rejection") from 32px (`size="sm"`) to 44px (`size="md"` with explicit height), aligning with Apple and Android touch target guidelines for one-handed thumb interactions in field conditions.
- **Rationale**:
  - Field officers conducting physical tests cannot manually construct or paste URLs while standing at trader premises, nor should production apps offer fake/sample data injection. Direct camera access ensures authentic, verifiable inspection evidence capture.
  - 32px buttons were too narrow and prone to misclicks during on-site inspections; 44px provides ideal physical ergonomics without crowding the modal sheet.

### ADR-035: Green Primary Button Label Simplification to "Verify"
- **Decision**: Simplify the label of the primary green button across verification and inspection interfaces to strictly `"Verify"` (*"सत्यापित करें"*):
  1. `InspectionModal.tsx`: When an on-site inspection passes statutory MPE tolerance, the green action button now strictly displays `"Verify"` (*"सत्यापित करें"*) instead of the verbose legacy phrase `"Verify, Sign & Issue Certificate"`.
  2. Submitting progress state updated to `"Verifying..."` (*"सत्यापित हो रहा है..."*).
  3. `VerifyScreen.tsx`: Updated search submit CTA button to `"Verify"` (*"सत्यापित करें"*).
- **Rationale**:
  - The phrase "Sign & Issue Certificate" is obsolete and misleading now that passing an inspection automatically signs and issues the certificate atomically in one step.
  - Clean, concise CTA labeling ("Verify") aligns with standard mobile interface guidelines, avoids multi-line wrapping inside modal action buttons, and provides immediate visual clarity.

### ADR-036: Consumer Web Portal Landing Page Modernization (Government of India Architecture)
- **Decision**: Re-architect the Consumer Web App landing page (`/` and `/home` in `client/src/portals/consumer/pages/ConsumerLandingPage.tsx`) using premier Government of India portal standards (inspired by National Informatics Centre / MeitY reference architecture):
  1. **Tricolor & Utility Strip**: National tricolor band header with Hindi/English dynamic toggle and dark/light mode toggle (pruned text resize controls for clean minimalism).
  2. **Official Branding Header**: Authentic State Emblem of India (`/emblem.jpeg`) with dual ministry attribution, and context-aware Trader Login/Dashboard CTAs. The header was streamlined by removing the central search bar, secondary initiative logos (Digital India & Swachh Bharat), and the top helpline pill, focusing the header purely on core statutory identity and portal authentication. Dedicated search and verification tools remain prominent in their respective sections below (`#track` and `#verify`), while full helpline details are anchored in the footer.
  3. **Primary Horizontal Navigation**: Sticky navy navbar (`#0B1E3B`) with active underline indicators (`amber-400` / `sky-400`) and smooth section jumping.
  4. **Hero Announcement Carousel**: 3-slide auto-rotating announcement banner (6.5s interval) with slide category tags, statutory headlines, CTAs, metrology seal showcase card, and a comprehensive control bar (prev, next, pause/play, dot indicators).
  5. **Leadership & About Division Section**: Minister card featuring Hon'ble Minister Shri Pralhad Joshi (Ministry of Consumer Affairs, Food and Public Distribution) and an "About eLMV" section with a distinctive deep-indigo accent bar and 3 statutory strategic pillars.
  6. **Modern Aesthetics & Visual Hierarchy**: Implemented layered glassmorphic cards (`backdrop-blur-xl`), floating 3D-styled hero showcase badge, bento-grid layout for strategic pillars, hover lift micro-interactions (`hover:-translate-y-1.5`), connected progression nodes on application tracking, and vibrant gradient backdrops on service cards.
  7. **Zero Feature Loss**: Preserved all existing interactive statutory features, including the live application tracker with API query and 4-step stepper, and the Schedule XII / Rule 14 fee calculator across all 6 equipment categories.
- **Rationale**:
  - Consumer and trader confidence in statutory legal metrology requires an authoritative, unmistakably official Government of India web portal presence.
  - Elevating the portal with modern glassmorphism, responsive micro-interactions, and visual polish creates a world-class user experience comparable to leading international digital public infrastructure.
  - Maintaining instant access to high-utility verification tools preserves production readiness.

### ADR-037: Consumer Landing Hero & Header Streamlining
- **Decision**: 
  1. Remove the green `"Statutory"` pill badge and the uppercase `"GOVERNMENT OF INDIA"` / `"भारत सरकार | GOVT. OF INDIA"` attribution line from the main header of `ConsumerLandingPage.tsx`.
  2. Remove the right-column glass showcase card ("Legal Metrology / Legal Metrology Act, 2009 / Section 24 Mandatory / Public SLA 5-14 Days / Scan QR Seal") from the hero banner in `ConsumerLandingPage.tsx`.
  3. Revert the hero announcement carousel container from the floating rounded island back to edge-to-edge full-bleed presentation, with contiguous full-width ticker strip beneath it.
  4. Fix sticky scroll behavior by removing `sticky -top-12 z-40` from the branding `<header>` and setting `<nav>` to `sticky top-0 z-40`.
  5. Populate all missing i18n localization dictionary keys across `en.json` and `hi.json` for carousel slides (`badge`, `desc`, `action`), navigation (`aboutUs`), leadership designations, and About eLMV statutory pillars.
  6. Remove the slide category pill badge (`"NATIONAL MANDATE • SECTION 24"` / `"Government of India • Central Ministry"`) from the top of each carousel slide.
- **Rationale**:
  - Eliminating the redundant green "Statutory" pill and uppercase "GOVERNMENT OF INDIA" line gives the State Emblem and portal title uncluttered typographic clarity, while the top tricolor ribbon and utility bar continue to clearly communicate statutory and national jurisdiction.
  - Eliminating the secondary card from the hero banner allows the announcement slides, action buttons, and regulatory compliance standards to occupy a clean, well-balanced `max-w-4xl` layout without visual crowding.
  - Reverting to full-bleed edge-to-edge structure maintains visual cohesion with standard Central Government portal design systems where the hero banner and ticker flow seamlessly across the viewport width.
  - The previous `-top-12 z-40` on the header caused a ~32px sliver of the header to stay stuck and visible over the navigation bar during scrolling. Removing stickiness from the header and promoting the nav to `z-40` ensures clean scroll transitions where the header scrolls off naturally and only the navy navbar docks to the top.
  - In i18next, any missing translation key falls back to rendering the raw dot-notated key name on screen (e.g. `consumerLanding.carousel.slide2.desc`). Comprehensive dictionary synchronization prevents any untranslated key leaking into the production UI.
  - Removing the slide category pill badge places direct visual focus on the bold announcement headlines and action CTAs.
  - Verification links remain fully accessible through the primary navigation bar (`/verify`), dedicated service card, and certificate verification section.

### ADR-038: Non-AI Government Visual Hierarchy & Bloat Removal
- **Decision**: 
  1. Revert the 4 large, verbose statutory legal content sections (`#mandate`, `#rules`, `#packaged-commodities`, `#rrsl`) and extraneous navigation links from `ConsumerLandingPage.tsx` per user feedback.
  2. Purge 100% of gradients (`bg-gradient-to-*`) and gradient text clipping (`bg-clip-text text-transparent`) across the consumer landing page.
  3. Replace hero carousel multi-gradient slide backdrops with solid, high-contrast statutory dark surfaces (`#0B1E3B`, `#08221B`, `#101B2B`) and bold solid white typography (`text-white font-black`).
  4. Replace gradient CTA buttons with solid high-contrast amber buttons (`bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold`).
  5. Remove all `radial-gradient` dot matrix background textures.
  6. Replace Minister profile card gradient with solid `bg-white dark:bg-slate-900 border border-border shadow-sm`; remove neon glowing blur ring and floating award badge.
  7. Replace gradient icon containers in the 6 Citizen Services cards with solid tinted badges (`bg-blue-50 text-blue-700`, `bg-emerald-50 text-emerald-700`, etc.).
  8. Replace Fee Calculator summary and Certificate Verification gradients with solid statutory surfaces (`#0B1E3B`, `bg-slate-50`).
  9. Maintain strict 100% translation key completeness in `en.json` and `hi.json` with automated validation.
- **Rationale**:
  - Official Government of India portals (NIC, MeitY, DCA) rely on solid, authoritative navy and neutral slate surfaces, high-contrast typography, and crisp subtle borders.
  - Multi-tone gradients, glowing neon blur rings, and metallic clipped text create a generic "AI SaaS template" appearance that undermines the statutory authority and official credibility of a government metrology portal.
  - Excessive walls of legal text clutter the consumer landing page, detracting from the primary public utilities (Application Tracker, Certificate Verification, Fee Calculator). Keeping the page streamlined, functional, and tool-centric delivers the optimal citizen experience.

### ADR-039: Consumer Landing Page Cleanliness & Promotional Badges Purge
- **Decision**: 
  1. Remove the `Act No. 1 of 2010 • Central Portal` indicator badge from the top sticky navigation bar in `ConsumerLandingPage.tsx`.
  2. Remove the `Verify Certificate` link from the top navigation bar, ensuring that the navigation bar exclusively manages smooth internal section anchors (`#hero`, `#about`, `#services`, `#track`, `#calculator`, `#act`).
  3. Remove the redundant Quick Certificate / QR Verification spotlight section (`<section id="verify">`), eliminating duplicate search inputs and cleanly directing certificate verification traffic to the dedicated public verification portal (`/verify`) and Citizen Services Card 2.
  4. Prune unused `certInput` and `handleCertSubmit` states, and clean up the `useNavigate` import and declaration.
  5. Purge all promotional pre-section pill badges across the landing page:
     - `aboutElmv.badge` ("STATUTORY APPARATUS • LEGAL METROLOGY ACT, 2009")
     - `services.sectionBadge` ("ONLINE STATUTORY SERVICES")
     - "Instant Public Service" badge before Application Tracker
     - Rule 14 badge before Fee Calculator
     - "National Metrology Dashboard" badge before Transparency Metrics
     - `section24.badge` ("MANDATORY STATUTORY OBLIGATION") before Section 24 Guidelines
  6. Synchronize locale dictionaries (`en.json` and `hi.json`) by removing orphan keys (`services.sectionBadge`).
- **Rationale**:
  - Promotional badge pills preceding every section heading create an artificial "AI marketing template" feel. Clean government portals begin sections directly with clear, authoritative titles.
  - Having a standalone "Verify Certificate" spotlight on the landing page created confusion and redundancy when the full verification tool (`/verify`) already provides camera scanning, cryptographic signature inspection, and PDF download features.
  - The navigation bar is now strictly an on-page section switcher, eliminating navigation jumps to external routes from the main landing page header.

### ADR-040: Hero Section Slideshow Elimination & Focused Value Banner
- **Decision**: 
  1. Remove the multi-slide announcement carousel architecture (`carouselSlides`, `currentSlide`, `isCarouselPaused`, timer intervals, navigation toolbar buttons, slide indicators, and slide counter) from `ConsumerLandingPage.tsx`.
  2. Prune unused React hooks (`useRef`) and Lucide icon imports (`ChevronLeft`, `Pause`, `Play`).
  3. Replace the carousel with a single, authoritative, high-contrast Government of India hero banner (`bg-[#0B1E3B]` on `bg-[#081830]`) focusing directly on:
     - **Ease of Certification**: Paperless online application in under 5 minutes, scheduled on-site inspection, automated Schedule XI digital certificate issuance.
     - **Ease of Verification**: Instant 1-click smartphone QR verification, zero-login requirement, real-time cryptographic audit against central statutory ledger.
  4. Provide clean, high-contrast action CTAs for applying online, public verification (`/verify`), and live application tracking (`#track`).
  5. Harmonize the `hero` i18n namespace across `en.json` and `hi.json`, pruning obsolete `carousel` keys and duplicate object definitions.
- **Rationale**:
  - Auto-rotating carousels and slideshows add cognitive friction, distraction, and mobile battery overhead.
  - A single, focused banner delivers an unmistakable message to citizens and traders: applying for legal metrology certification is now effortless, and verifying any instrument's authenticity is instant.
  - Conforms to strict Government of India visual guidelines with solid authoritative navy backgrounds, zero gradients, and high-contrast typography.

### ADR-041: Statutory Advisory Continuous Running Ticker Marquee Implementation
- **Decision**:
  1. Transform the static, truncated statutory advisory notice under the hero banner into a continuous, infinite hardware-accelerated horizontal running ticker marquee in `ConsumerLandingPage.tsx`.
  2. Implement `@keyframes ticker-marquee` and `.animate-ticker` in `client/src/index.css` using `translate3d(0, 0, 0)` to `translate3d(-50%, 0, 0)` over a 30s linear infinite loop with `will-change: transform`.
  3. Render dual synchronized spans of the Section 24 advisory text separated by an authoritative bullet `•`, ensuring seamless, gap-free looping across all viewport widths.
  4. Implement `hover:[animation-play-state:paused]` allowing users to hover/pause the marquee to read the statutory mandate at their own pace, complying with WCAG 2.2.2 (Pause, Stop, Hide).
  5. Retain high-contrast solid government styling (`bg-[#0B1E3B]` on dark navy `#081830` with solid saffron alert badge `bg-amber-500/20 text-amber-300 border-amber-500/30`), with zero gradients or artificial text shadows.
- **Rationale**:
  - The static single-line advisory was previously truncated with an ellipsis on smaller viewports, cutting off critical statutory context regarding Section 30 prosecution.
  - A running ticker draws prominent attention to mandatory annual re-verification requirements under Section 24 of the Legal Metrology Act, 2009, matching standard government portal advisories (e.g., NIC/GOI alert tickers).
  - The CSS hardware-accelerated translate3d implementation guarantees smooth 60fps scrolling with zero CPU layout thrashing.

### ADR-042: Landing Page Cleanse: Elimination of View Certificate & QR Code Mentions
- **Decision**:
  1. Remove the "Verify Certificate / QR Code" secondary CTA button from the Hero banner in `ConsumerLandingPage.tsx`, leaving clean primary ("Apply for Stamping") and secondary ("Track Application") actions.
  2. Replace "ISO/IEC 18004 Tamper-Proof QR Seals" in the hero statutory standards bar with "Legal Metrology (General) Rules, 2011".
  3. Replace Card 2 in Citizen Services ("Verify Certificate & QR Seal") with "Consumer Helpline & Grievances" (`services.helpdesk`), linking directly to the `#contact` helpline section with `PhoneCall` icon.
  4. Remove the "View Stamped Certificate" button containing `<QrCode>` and the link to `/verify` from the Live Application Tracker result card, preserving clean certificate details (certificate number and validity period).
  5. Update Statewide Transparency Metrics subtitle from "PKI Signed & QR Sealed" to "PKI Signed & Digitally Verified".
  6. Remove unused `QrCode` icon import from `lucide-react`.
  7. Purge all references to QR seals from narrative descriptions across `hero` and `aboutElmv` namespaces in `en.json` and `hi.json`, and prune `hero.verifyBtn`, `services.verify`, `tracker.viewCert`, and `nav.verifyCert`.
- **Rationale**:
  - Eliminates all confusing visual cues and duplicate verification CTAs from the public landing page, streamlining the landing page experience for consumers, traders, and citizens.
  - Dedicated verification remains intact at its designated public route (`/verify`) without polluting the main landing page with redundant buttons and QR imagery.
  - Maintains a balanced, highly functional 6-card Citizen & Commercial Metrology Services grid without any orphan routes or missing translation keys.

### ADR-043: Night Theme Deactivation & Pure Daylight Government Theme Enforcement
- **Decision**:
  1. Strictly enforce light mode on mount in `ConsumerLandingPage.tsx` via `useEffect` invoking `document.documentElement.classList.remove("dark")` and setting `localStorage.setItem("theme_mode", "light")`.
  2. Remove `isDark` state and the Dark / Light toggle button from the top utility bar, and prune unused `Sun` and `Moon` icon imports.
  3. Overhaul the Hero section from dark night colors (`bg-[#081830]` and `bg-[#0B1E3B]` with `bg-slate-900` black cards) into a clean, authoritative daylight Government banner (`bg-[#F8FAFC]` with white cards, dark slate typography `text-[#0B2545]`/`text-slate-900`, clean amber/navy CTAs, and subtle borders).
  4. Purge all 74 `dark:` classes across `ConsumerLandingPage.tsx` to make the public landing page 100% immune to dark mode.
- **Rationale**:
  - Official national portals (National Portal of India, MyGov, Department of Consumer Affairs) operate exclusively with high-contrast, authoritative daylight typography and backgrounds.
  - Night theme caused visual inconsistency and confusion on public-facing government pages.
  - Removing dark variants guarantees identical, accessible, and crystal-clear rendering across all browsers, operating systems, and user preferences.

### ADR-044: Citizen & Commercial Metrology Services Card Hover Motion Elimination
- **Decision**:
  1. Remove vertical translation lift classes (`hover:-translate-y-1.5`) across all 6 service cards in the Citizen & Commercial Metrology Services grid (`<section id="services">`) in `ConsumerLandingPage.tsx`.
  2. Replace exaggerated hover elevation (`hover:shadow-xl hover:-translate-y-1.5`) with stable, subtle shadow enhancement (`hover:shadow-md transition-all duration-300`).
  3. Retain stable, non-disruptive card micro-interactions (subtle border color highlights on hover e.g., `hover:border-blue-500/50`, `hover:border-emerald-500/50`).
- **Rationale**:
  - Unnecessary vertical card lifting ("floating card / lift on hover") creates visual turbulence and cognitive distraction, characteristic of playful marketing templates rather than grounded statutory portals.
  - Eliminating vertical card motion keeps the layout completely static and stable under cursor movement, improving accessibility and reading ease for users with vestibular sensitivities or motor tremors.

### ADR-045: Elimination of National & State Transparency Metrics Section
- **Decision**:
  1. Remove `<section id="transparency">` ("National & State Transparency Metrics") entirely from `ConsumerLandingPage.tsx`.
  2. Prune obsolete translation keys under the `consumerLanding.stats` namespace from both `client/src/i18n/locales/en.json` and `client/src/i18n/locales/hi.json`.
  3. Seamlessly connect the Statutory Fee Calculator (`#calculator`) to Section 24 Statutory Guidelines (`#act`), renumbering code structure section comments cleanly.
- **Rationale**:
  - The static indicators ("14,850+ Commercial Instruments Verified", "12,420+ Active Digital Certificates", "4.8 Days Average Processing TAT", "100% Statutory Audit Trail Compliance") represented redundant, placeholder-style telemetry on a citizen portal dedicated to actionable workflows.
  - Removing this section streamlines the landing page, keeps citizens focused on primary actions (apply, register, track, fee check, legal mandate), and eliminates unnecessary decorative grid elements.

### ADR-046: User App UI Harmonization with Government Landing Page Design System
- **Decision**:
  1. Architect a dedicated Government of India layout (`ConsumerLayout.tsx`) for the Consumer/Trader Portal (`/dashboard`, `/instruments`, `/applications`, `/verify`), replacing the generic sidebar `AppShell`.
  2. Implement the full National Design System:
     - National Tricolor top bar (`#FF9933` / `#FFFFFF` / `#138808`)
     - Top Utility bar (`bg-[#0B1E3B]`) with Indian Flag, "भारत सरकार | Government of India", and English/Hindi bilingual toggle
     - White branding header with State Emblem of India (`/emblem.jpeg`), ministry title, authenticated "Trader Portal" badge, and Sign Out action
     - Government Navy horizontal navigation bar (`#0B1E3B`) with active amber/gold indicators (`border-b-2 border-amber-400 text-amber-300`)
     - Official statutory Government footer (`bg-[#071326]`) with NCH Helpline (`1800-11-4000`), quick links, and GIGW compliance statement
  3. Harmonize `AuthLayout.tsx` (`/login`, `/register`) with the Tricolor strip, State Emblem header, daylight mode (`bg-[#F8FAFC]`), language switcher, and official footer.
  4. Modernize `LoginPage.tsx` and `RegisterPage.tsx` with clean white surfaces, Government Navy primary action buttons (`bg-[#0B2545] hover:bg-[#133966] text-white font-bold rounded-xl`), and crisp slate typography.
  5. Modernize dashboard and feature pages (`DashboardPage.tsx`, `InstrumentListPage.tsx`, `ApplicationListPage.tsx`) with white cards, tinted icon badge containers (`bg-blue-50 text-blue-700`, `bg-emerald-50 text-emerald-700`), and Government Navy primary CTAs.
  6. Enforce strict daylight mode on mount (`document.documentElement.classList.remove("dark")`, `localStorage.setItem("theme_mode", "light")`) and zero hover lift (`hover:shadow-md`, no `hover:-translate-y-*`).
- **Rationale**:
  - Previously, after logging in, users transitioned from an official Government of India portal aesthetic to a generic SaaS sidebar (`AppShell`), causing jarring visual dissonance and diminishing trust.
  - Harmonizing the user portal with the landing page design system provides a unified, continuous citizen & trader experience that feels authoritative, official, and trustworthy throughout the entire lifecycle.

### ADR-047: Auth Header Bilingual Separation & Strict Locale Enforcement
- **Decision**:
  1. Remove concatenated dual-language default titles (`"व्यापारी पंजीकरण • Trader Registration"` and `"व्यापारी लॉगिन • Trader Sign In"`) from `RegisterPage.tsx` and `LoginPage.tsx`.
  2. Add `auth.registerTitle` and `auth.loginHeading` keys with strict separation to locale dictionaries:
     - `en.json`: `"Trader Registration"` and `"Trader Sign In"`
     - `hi.json`: `"व्यापारी पंजीकरण"` and `"व्यापारी लॉगिन"`
  3. Wire `t("auth.registerTitle")` and `t("auth.loginHeading")` so the headers render purely in English when the user selects English, and purely in Hindi when the user selects Hindi.
- **Rationale**:
  - Displaying both languages simultaneously ("व्यापारी पंजीकरण • Trader Registration") clutters the UI and contradicts standard i18n conventions.
  - Users choosing Hindi should see clean Hindi text; users choosing English should see clean English text.

### ADR-048: Login Layout Branding Alignment with National Verification Portal
- **Decision**:
  1. Update `AuthLayout.tsx` header branding from `"e-Legal Metrology Verification (e-LMV)"` and ministry title to:
     - Title: `eLMV — National Verification & Stamping Portal` (Hindi: `eLMV — राष्ट्रीय ऑनलाइन सत्यापन एवं मुद्रांकन पोर्टल`)
     - Subtitle: `Statutory Portal under the Legal Metrology Act, 2009 (Act No. 1 of 2010)` (Hindi: `विधिक मापविज्ञान अधिनियम, 2009 (2010 का अधिनियम सं. 1) के अंतर्गत वैधानिक पोर्टल`)
  2. Connect to existing `consumerLanding.header.portalTitle` and `consumerLanding.header.portalSubtitle` localization keys.
- **Rationale**:
  - Provides exact 1:1 visual and statutory consistency between the public Government landing page and the user login/register authentication portal.

### ADR-049: Password Visibility Toggle ("View Password" Eye Icon) Integration
- **Decision**:
  1. Integrate password reveal/hide eye toggles across all authentication and provisioning password input fields:
     - `LoginPage.tsx`: Commercial Trader / User login form
     - `RegisterPage.tsx`: Commercial Trader / User registration form
     - `OfficerManagementPage.tsx`: Admin provision LMO officer modal
     - `GatcAgencyManagementPage.tsx`: Admin provision GATC agency modal
     - `GatcStaffPage.tsx`: GATC agency provision inspector modal
  2. Use `Eye` and `EyeOff` from `lucide-react` with absolute positioning inside relative input wrapper, proper right padding (`pr-10` / `pr-8`), and accessibility labels (`aria-label`, `title`).
- **Rationale**:
  - Improves user convenience, reduces authentication errors on mobile and desktop keyboards, and allows users to confirm complex passwords during registration and officer provisioning.

### ADR-050: Elimination of Footers in User App (Landing Page Only)
- **Decision**:
  1. Remove statutory footers from authenticated trader layout (`ConsumerLayout.tsx`) and authentication layout (`AuthLayout.tsx`).
  2. Retain the comprehensive official Government statutory footer (`bg-[#071326]`) strictly on the public citizen landing page (`ConsumerLandingPage.tsx`).
- **Rationale**:
  - Authenticated workspaces require maximum vertical screen real estate for data tables, inspection queues, fee calculators, and equipment rosters. Heavy multi-column statutory footers crowd the dashboard and add scroll fatigue.
  - Public citizen portals require statutory disclaimers, toll-free helplines, and ministry attributions to establish trust, whereas logged-in traders are already validated and require unobstructed operational space.

### ADR-051: Elimination of "Verify Certificate" from User App Navigation
- **Decision**:
  1. Remove the "Verify Certificate" (`/verify`) navigation tab and `ShieldCheck` icon from the authenticated Consumer portal layout (`ConsumerLayout.tsx`).
  2. Remove `/verify` and `/consumer/verify` route definitions from under authenticated `<ConsumerLayout />` in `ConsumerApp.tsx`.
  3. Retain standalone public `/verify` endpoint under `AuthLayout` for direct QR/link scanning and external verification.
- **Rationale**:
  - The authenticated Trader workspace is designed for managing commercial equipment rosters, tracking submitted stamping applications, and viewing issued certificates.
  - Having a generic public certificate verification search tab in the trader navigation bar was redundant and diluted focus from primary commercial trader operations.

### ADR-052: Dialog Synchronization & Granular Authentication Error Reporting Across Web & Mobile Apps
- **Decision**:
  1. Synchronize all modal dialogs in the Consumer / Trader portal (`RegisterInstrumentDialog.tsx`, `SubmitApplicationDialog.tsx`, `ScheduleInspectionDialog.tsx`) and underlying primitive (`dialog.tsx`) to adhere strictly to the Government daylight design system:
     - Pure white container (`bg-white border-slate-200 shadow-2xl rounded-2xl p-6 sm:p-7`), deep navy backdrop (`bg-[#0B2545]/40 backdrop-blur-xs`), Government Navy title (`text-[#0B2545] font-black text-lg`), and subtle divider footer (`border-t border-slate-100 mt-5 pt-4`).
     - Form inputs & selects styled with daylight borders (`rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]`).
     - Primary action buttons styled with Government Navy (`bg-[#0B2545] hover:bg-[#133966] text-white font-bold rounded-xl h-9 px-4 text-xs`).
     - Form submission errors surfaced with high-contrast alert banners (`bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-xs flex items-center space-x-2` with `AlertCircle`).
  2. Differentiate backend authentication error messages in `server/src/modules/auth/auth.service.ts`:
     - If user email not found: throw `AppError(401, UNAUTHORIZED, "No account found with this email address. Please check your email or register.")`.
     - If password does not match: throw `AppError(401, UNAUTHORIZED, "Invalid password. Please check your password and try again.")`.
     - If account deactivated: throw `AppError(403, FORBIDDEN, "This account has been deactivated. Please contact administration.")`.
  3. Propagate and extract server-provided error messages in both web client (`AuthContext.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`) and mobile client (`mobile/src/lib/auth.tsx`, `mobile/src/screens/LoginScreen.tsx`), surfacing the exact server error message rather than generic Axios or credential strings.
- **Rationale**:
  - Generic errors like "Invalid email or password" or Axios HTTP code strings cause friction, confusion, and support tickets when users misspell their password or enter an unregistered email.
  - Granular, precise feedback ("Invalid password. Please check your password and try again." or "No account found with this email address.") allows users to immediately self-correct without guessing.
  - Synchronizing dialog boxes with the daylight Government Navy theme preserves visual continuity across the entire application ecosystem.

### ADR-053: Smooth Animated Focus Halo on Input Fields Across Web App
- **Decision**:
  1. Suppress browser default focus outline (`outline: none !important`) across all `<input>`, `<textarea>`, and `<select>` controls globally in `client/src/index.css`.
  2. Introduce fluid 250ms–300ms ease-out transitions (`transition: border-color 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)`) globally and on the core `Input` component (`client/src/components/ui/input.tsx`).
  3. Replace harsh, instantaneous 2px border jumps with a soft, glowing Government Navy focus halo (`box-shadow: 0 0 0 3.5px rgba(11, 37, 69, 0.12)` / `focus:ring-4 focus:ring-[#0B2545]/15 focus:border-[#0B2545]`).
  4. Ensure destructive input error states animate smoothly into a rose halo (`box-shadow: 0 0 0 3.5px rgba(225, 29, 72, 0.15)`).
- **Rationale**:
  - Clicking on input fields previously triggered an abrupt, instant native browser focus outline or a 150ms default ring transition that felt jerky, distracting, and unpolished.
  - A gentle 300ms cubic-bezier transition that blooms a translucent halo creates an elegant, premium, modern user experience that matches high-standard government and enterprise interfaces.

### ADR-054: User App Header Branding Alignment with National Verification Portal
- **Decision**:
  1. Align branding title in `ConsumerLayout.tsx` header with the National Verification Portal:
     - English: `eLMV — National Verification & Stamping Portal`
     - Hindi: `eLMV — राष्ट्रीय ऑनलाइन सत्यापन एवं मुद्रांकन पोर्टल`
  2. Align branding subtitle in `ConsumerLayout.tsx` header with the statutory legal citation:
     - English: `Statutory Portal under the Legal Metrology Act, 2009 (Act No. 1 of 2010)`
     - Hindi: `विधिक मापविज्ञान अधिनियम, 2009 (2010 का अधिनियम सं. 1) के अंतर्गत वैधानिक पोर्टल`
  3. Connect to existing `consumerLanding.header.portalTitle` and `consumerLanding.header.portalSubtitle` localization keys with dynamic bilingual toggle support.
- **Rationale**:
  - Delivers complete 1:1 statutory and visual branding harmony between the public citizen landing page, authentication views, and authenticated commercial trader app header.

### ADR-055: Live Application Tracker Modernization & Quick Test Removal
- **Decision**:
  1. Completely remove the "Quick Test" button and sample application number (`LM-APP-2026-0000001`) from `ConsumerLandingPage.tsx`, initializing tracker input state as empty (`""`).
  2. Modernize the Search Box Terminal Card to daylight standards:
     - Pure white card (`bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6`).
     - Remove dated `shadow-inner` and scale bounce (`active:scale-95`).
     - Apply 300ms focus halo on input (`focus:bg-white focus:border-[#0B2545] focus:ring-4 focus:ring-[#0B2545]/15`).
     - Stationary Government Navy submit button (`h-12 px-7 font-semibold bg-[#0B2545] hover:bg-[#133966] text-white rounded-xl shadow-xs transition-colors`).
  3. Fix the Tracked Progression Result Card:
     - Introduce real connecting stepper lines: a slate background rail (`h-1 bg-slate-200 rounded-full`) with a dynamically-filled emerald progression line (`h-1 bg-emerald-600 rounded-full transition-all duration-500`) aligned with the vertical equator of the 4 step circles (`top-[18px]`).
     - High-contrast step circles: emerald checkmarks for completed, Government Navy badge with halo ring for current, clean slate outline for upcoming.
     - Replace murky `bg-muted/40` with daylight bento cards (`bg-slate-50/70 border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs`).
     - Add Rejection Notice alert banner for non-compliant applications.
     - High-contrast certificate issued callout with `FileCheck2` icon container.
- **Rationale**:
  - Quick test buttons belong in staging environments; in production government portals, sample buttons clutter UI and confuse traders who copy sample numbers rather than their own reference IDs.
  - The previous progression stepper had no line connecting the 4 milestones, leaving circles floating disconnectedly. Connecting tracks and high-contrast daylight bento cards deliver immediate visual clarity and trust.



