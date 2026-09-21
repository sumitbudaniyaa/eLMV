# Changelog (CHANGELOG.md)

All notable changes to the **Online Verification System for Weighing & Measuring Instruments** will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), adhering strictly to zero-omission rules.

## [1.9.65] - Random QR Scanner Vulnerability Fix & Certificate Modal Hardening — 2026-09-20

- **QR Scanner Identifier Hardening ([`VerifyScreen.tsx`](file:///Users/Sumit/Desktop/sih/mobile/src/screens/VerifyScreen.tsx))**:
  - Rewrote `extractIdentifier` to strictly match Legal Metrology verification parameters: JSON payloads with `token`/`certNumber`, URLs containing `?token=`, `?cert=`, or `/verify/:token`, standard certificate numbers (`LM-XX-YYYY-ZZZZZZZ`), and 32/64-char hex tokens.
  - Arbitrary non-metrology QR codes (Wi-Fi credentials, payment UPI links, general URLs, random strings) now immediately evaluate to empty string.
  - Updated `handleBarcodeScanned` to reject non-metrology QR codes with an explicit Alert ("Invalid or Unrecognized QR Code").
  - Routed valid scanned identifiers through `handleVerify(identifier)` to perform cryptographic backend verification before rendering results.
- **Elimination of Mock Certificate Fallbacks ([`CertificateModal.tsx`](file:///Users/Sumit/Desktop/sih/mobile/src/components/officer/CertificateModal.tsx))**:
  - Removed all hardcoded demo fallbacks (`"LM-KA-2026-0000001"`, fake ECDSA signatures, default valid status).
  - Added `fetchError` state and an explicit "Statutory Certificate Not Found" error card when a certificate lookup fails or is not found in the database.
- **Verification**:
  - Mobile TypeScript check: 0 errors (`npm run typecheck --workspace=@sih/mobile`).
  - Client production build: 0 errors (`npm run build --workspace=@sih/client`).

## [1.9.64] - Mobile Reactive Automatic Logout on User Deletion — 2026-09-19

- **Reactive 401 Interceptor & Auth Context Synchronization ([`api.ts`](file:///Users/Sumit/Desktop/sih/mobile/src/lib/api.ts), [`auth.tsx`](file:///Users/Sumit/Desktop/sih/mobile/src/lib/auth.tsx))**:
  - Implemented `setOnUnauthorized` callback in `mobile/src/lib/api.ts`.
  - When the backend returns a 401 (e.g. user was deleted from the database) and refresh fails, the interceptor clears SecureStore tokens and immediately fires `unauthorizedListener()`.
  - In `mobile/src/lib/auth.tsx`, registered the listener to reset `user = null` in React state.
  - The mobile app now immediately and reactively kicks deleted/invalidated users back to `LoginScreen` in real time without needing an app restart.
- **Verification**:
  - Mobile TypeScript check: 0 errors (`npm run typecheck --workspace=@sih/mobile`).

## [1.9.63] - Citizen Services Contact Us Link & Legal Metrology Instruments Guide — 2026-09-19

- **Citizen Services Helpline Card Link ([`ConsumerLandingPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/pages/ConsumerLandingPage.tsx))**:
  - Replaced `<a href="#contact">` (which previously scrolled to the page footer) with `<Link to="/contact">` on the "Consumer Helpline & Grievances" Citizen Services card.
  - Clicking "Contact Helpdesk" now directly opens the dedicated Contact Us page (`/contact`) with the official electronic mail desks and 1915 toll-free helpline information.
- **Legal Metrology Instruments & Statutory Compliance Manual ([`LEGAL_METROLOGY_INSTRUMENTS_GUIDE.md`](file:///Users/Sumit/Desktop/sih/LEGAL_METROLOGY_INSTRUMENTS_GUIDE.md))**:
  - Researched and compiled an exhaustive metrological manual based on the **Legal Metrology Act, 2009**, the **Legal Metrology (General) Rules, 2011**, and international **OIML** recommendations.
  - Formulated full breakdown of NAWI (OIML R 76, Seventh Schedule Heading A) vs. AWI (OIML R 50/51/61/106/107/134, Seventh Schedule Heading C).
  - Defined all 4 Accuracy Classes (Class I, II, III, IIII), verification scale intervals \(e\), and Maximum Permissible Error (MPE) thresholds.
  - Documented category codes and verification intervals for all 7 regulated instrument families: `NON_AUTOMATIC_WEIGHING_INSTRUMENT`, `AUTOMATIC_WEIGHING_INSTRUMENT`, `FUEL_DISPENSER`, `STORAGE_TANK`, `LENGTH_MEASURE`, `CAPACITY_MEASURE`, and `OTHER`.
  - Detailed the distinction between Central Model Approval under Section 22 (`IND/XX/YY/ZZZ`) and State Verification under Section 24.
- **Verification**:
  - Client production build: 0 errors (`npm run build --workspace=@sih/client`).

## [1.9.62] - Admin LMO Officers Navigation Logout Bug Fix & Role Priority Hardening — 2026-09-19

- **LMO Officers Navigation Logout Bug Fix ([`App.tsx`](file:///Users/Sumit/Desktop/sih/client/src/App.tsx), [`subdomain.ts`](file:///Users/Sumit/Desktop/sih/client/src/lib/subdomain.ts))**:
  - Identified root cause: `subdomain.ts` had `lowerPath.startsWith("/officer")` categorized as `"field"`. When clicking the "LMO Officers" tab (`/officers`), `App.tsx` erroneously switched to `<FieldApp />`, where `FieldRoot` saw an `ADMIN` role and called `logout()`.
  - In `App.tsx`, gave authenticated user roles absolute priority (`user.role === ADMIN` always renders `AdminApp`), completely bypassing URL path heuristics when authenticated.
  - Corrected `subdomain.ts` to categorize `/officers`, `/agencies`, `/agency`, and `/inspectors` under `"admin"`.
- **Elimination of Destructive Automatic Logout ([`FieldApp.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/field/FieldApp.tsx), [`AdminApp.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/admin/AdminApp.tsx))**:
  - Removed `logout()` calls in `FieldRoot` and `AdminRoot`, replacing them with safe navigation redirects to `/dashboard` or `/roster`.
- **Verification**:
  - Client production build passed with 0 errors (`npm run build --workspace=@sih/client`).

## [1.9.61] - Cross-Portal Path Routing & Mobile Fallback Mock Data Elimination — 2026-09-19

- **Unified Web Cross-Portal Path Routing ([`subdomain.ts`](file:///Users/Sumit/Desktop/sih/client/src/lib/subdomain.ts), [`AdminApp.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/admin/AdminApp.tsx), [`FieldApp.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/field/FieldApp.tsx))**:
  - Reordered `getActivePortal()` to evaluate path prefixes (`/admin/*`, `/field/*`) before port matching, allowing `http://localhost:5173/admin/login` and `http://localhost:5173/admin/*` to render the Admin Portal without port redirection.
  - Registered `/admin/login` and `/admin` routes in `AdminApp.tsx`.
  - Registered `/field/login` and `/field` routes in `FieldApp.tsx`.
- **Mobile Fallback Mock Data Elimination ([`RosterScreen.tsx`](file:///Users/Sumit/Desktop/sih/mobile/src/screens/RosterScreen.tsx), [`RegistryScreen.tsx`](file:///Users/Sumit/Desktop/sih/mobile/src/screens/RegistryScreen.tsx))**:
  - Deleted `FALLBACK_APPLICATIONS` and `FALLBACK_INSTRUMENTS` mock constants that were causing the mobile app to display fake demo applications and instruments when the database returned 0 items.
  - Updated `fetchApplications` and `fetchInstruments` to set empty arrays `[]` when the database has 0 items.

## [1.9.60] - Database Purge & Admin-Only Seed Hardening — 2026-09-19

- **Database Seed Data Purge**:
  - Executed complete database cleanup: deleted 7 certificates, 7 inspection records, 21 application histories, 8 applications, 3 instruments, 144 audit logs, 186 refresh tokens, and all non-admin profiles.
  - Purged all non-admin user accounts from the database (`lmo.jaipur@metrology.gov.in`, `gatc.lead@precisionlab.org`, `inspector.rahul@precisionlab.org`, `trader.rajesh@shreestores.com`), preserving exclusively `admin@metrology.gov.in`.
  - Retained the active ECDSA NIST P-256 root PKI signing key for digital certification.
- **Admin-Only Seed Hardening ([`seed.ts`](file:///Users/Sumit/Desktop/sih/server/prisma/seed.ts))**:
  - Rewrote seed script to exclusively create the `admin@metrology.gov.in` administrator account and initialize the root PKI signing key if absent.
  - Stripped all hardcoded seed accounts, instruments, and applications from future seed executions.
- **Documentation Updated ([`FORM_INPUT_GUIDE.md`](file:///Users/Sumit/Desktop/sih/FORM_INPUT_GUIDE.md))**:
  - Updated Section 2 to clarify that only the Central Admin is pre-seeded, with instructions on how to provision other roles.

## [1.9.59] - Form Input Hardening, Pre-Filled Data Cleanup & Form Input Guide — 2026-09-19

- **Form Input Hardening & Zero Pre-Filled Defaults**:
  - Reset `RegisterInstrumentDialog.tsx` `defaultValues` to empty strings and added placeholder options for unit and accuracy class selects.
  - Reset `RecordInspectionDialog.tsx` `defaultValues` to empty strings, removed hardcoded standard weight `defaultValue`, and added input placeholders.
  - Reset `ScheduleInspectionDialog.tsx` `defaultValues` to empty strings and added instructions placeholder.
  - Reset `OfficerManagementPage.tsx` `formData` to empty strings for jurisdiction fields with proper placeholders.
  - Reset `GatcAgencyManagementPage.tsx` `formData` and `editFormData` to empty strings/arrays for scopes, dates, and jurisdictions.
  - Reset `GatcStaffPage.tsx` `formData` to empty strings for technical designation and qualification reference.
  - Reset mobile `InspectionModal.tsx` initial state and `useEffect` reset values to empty strings for MPE, standard serial, and seal number.
  - Removed "Use Demo Officer Account" quick-fill button from mobile `LoginScreen.tsx` to eliminate all hardcoded credentials from the mobile UI.
- **Comprehensive Form Input Guide ([`FORM_INPUT_GUIDE.md`](file:///Users/Sumit/Desktop/sih/FORM_INPUT_GUIDE.md))**:
  - Authored a comprehensive reference guide documenting field specifications, regex patterns, constraints, and copy-pasteable dummy data for all 10 forms across Citizen, Admin, Field Officer, and Mobile platforms.
- **Verification**:
  - Full monorepo build and typecheck passed with 0 errors across `@sih/shared`, `@sih/server`, `@sih/client`, and `@sih/mobile`.

## [1.9.58] - Mobile Network Diagnostics & Personal ngrok Restoration — 2026-09-18

- **Personal ngrok Domain Restoration**:
  - Saved user's personal ngrok authtoken to system config (`~/.ngrok/ngrok.yml`), resolving `ERR_NGROK_320` account mismatch.
  - Successfully bound backend API port 5001 to static domain: `https://vapouringly-nonallegoric-teodora.ngrok-free.dev`.
  - Restored `scripts/start-tunnel.js` to automatically spawn ngrok with the verified personal static domain.
- **Mobile Network Diagnostics & Configuration Alignment ([`api.ts`](file:///Users/Sumit/Desktop/sih/mobile/src/lib/api.ts), [`config.ts`](file:///Users/Sumit/Desktop/sih/mobile/src/lib/config.ts))**:
  - Added request/response logging in `mobile/src/lib/api.ts` to diagnose AP Client Isolation vs public tunnel reachability.
  - Enhanced timeout error messages to report the exact destination URL (`Connection timed out (15s) reaching: ...`).
  - Fixed `scripts/start-mobile.js` and `mobile/src/lib/config.ts` to route all mobile traffic through the live authenticated ngrok endpoint.
- **Auth Initialization Stabilization ([`auth.tsx`](file:///Users/Sumit/Desktop/sih/mobile/src/lib/auth.tsx))**:
  - Silently caught 401 and 404 response codes during initial profile bootstrap, clearing outdated tokens and returning to sign-in screen without noisy warning toasts or console crashes.
- **Verification**:
  - Mobile TypeScript build: 0 errors (`tsc --noEmit`).
  - Monorepo compilation (`shared`, `server`, `client`): 0 errors.
  - Live ngrok endpoint `GET /api/v1/` and `POST /api/v1/auth/login` verified returning 200 OK payloads.

## [1.9.57] - Comprehensive Enterprise Security Hardening & Zero-Vulnerability Architecture — 2026-09-17

- **Sliding-Window Rate Limiting Engine ([`rateLimiter.ts`](file:///Users/Sumit/Desktop/sih/server/src/middleware/rateLimiter.ts))**:
  - Implemented high-performance, in-memory sliding-window rate limiter with RFC headers (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, `Retry-After`).
  - Added dedicated limiters across all threat surfaces:
    - `/auth/login`: 5 attempts / 15 minutes per IP (`authLoginLimiter`)
    - `/auth/register`: 5 attempts / 1 hour per IP (`authRegisterLimiter`)
    - `/auth/refresh`: 20 calls / 15 minutes per IP (`authRefreshLimiter`)
    - `/inspections/upload-photo`: 15 uploads / 10 minutes per IP (`uploadLimiter`)
    - Global API `/api/v1/*`: 300 requests / 1 minute per IP (`globalApiLimiter`)
  - Added `ErrorCode.RATE_LIMIT_EXCEEDED` to `@sih/shared`.
- **Production Environment Secrets Enforcement ([`env.ts`](file:///Users/Sumit/Desktop/sih/server/src/config/env.ts))**:
  - Added Zod `.superRefine()` refusing to start in production if fallback test secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `PKI_KEY_ENCRYPTION_SECRET`, `DATABASE_URL`, or `CLOUDINARY_API_SECRET`) are detected.
  - Enforced minimum 32-character high-entropy secrets for cryptographic signing and key encryption in production environments.
- **Account Enumeration & Timing Attack Elimination ([`auth.service.ts`](file:///Users/Sumit/Desktop/sih/server/src/modules/auth/auth.service.ts))**:
  - Unified failed login error messages to `"Invalid email or password. Please check your credentials and try again."` for both non-existent users and bad passwords.
  - Executed precomputed bcrypt cost 12 dummy comparison (`DUMMY_HASH`) when the user email does not exist, equalizing execution latency (~100ms) to foil side-channel timing analysis.
- **IDOR Lockdown on User Endpoints ([`users.controller.ts`](file:///Users/Sumit/Desktop/sih/server/src/modules/users/users.controller.ts))**:
  - Restricted `GET /users/:id` strictly to the authenticated user's own profile (`targetId === req.user.id`) or administrators (`Role.ADMIN`), rejecting cross-tenant user scraping with 403 Forbidden.
- **File Upload Bounds & Binary Magic-Byte Verification ([`inspections.controller.ts`](file:///Users/Sumit/Desktop/sih/server/src/modules/inspections/inspections.controller.ts))**:
  - Enforced a hard 5MB limit on decoded base64 inspection photo uploads.
  - Verified binary magic-byte signatures for JPEG (`FF D8 FF`), PNG (`89 50 4E 47`), and WebP (`RIFF...WEBP`).
  - Strictly rejected vector SVGs, HTML, and script payloads to eliminate Stored XSS threat vectors.
  - Sanitized file identifiers against alphanumeric characters (`/^[a-zA-Z0-9_-]+$/`).
- **Cryptographic Hashing of Refresh Tokens at Rest ([`auth.service.ts`](file:///Users/Sumit/Desktop/sih/server/src/modules/auth/auth.service.ts))**:
  - Stored only SHA-256 digests (`hashToken()`) in the database `RefreshToken` table.
  - Query lookups, rotations, and revocations compare SHA-256 hashes, ensuring database disclosures cannot lead to valid JWT refresh tokens.
- **Role Information Leakage Elimination ([`roles.ts`](file:///Users/Sumit/Desktop/sih/server/src/middleware/roles.ts))**:
  - Replaced verbose role mismatch responses with generic `"Access denied. You do not have permission to perform this action."`.
  - Retained detailed role telemetry on internal server logs (`logger.warn`) for security audits.
- **Verification**:
  - `npm run build --workspace=@sih/client`: passed with 0 errors (clean build in 2.32s).
  - `npm run build --workspace=@sih/server`: passed with 0 errors.
  - `npm run typecheck --workspace=@sih/mobile`: passed with 0 errors.

## [1.9.56] - Hero Image Hover Clean & Removal of Blue Badges from Footer Pages — 2026-09-14

- **Landing Page Hero Visual Asset Clean-up**:
  - In [`ConsumerLandingPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/pages/ConsumerLandingPage.tsx): Removed the overlay status badge pill (*"Legal Metrology Verified"* / *"विधिक मापविज्ञान सत्यापन"*).
  - Removed all scale animations, ambient glow transitions, and hover zoom effects from the hero image container to keep it completely static, clean, and unobtrusive.
- **Removal of Blue Text Badges across all Footer Pages**:
  - In [`PublicPageLayout.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/PublicPageLayout.tsx): Removed the `badge` prop rendering (`bg-blue-50 text-blue-700 border-blue-200`) adjacent to the page title.
  - In [`WebsitePoliciesPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/WebsitePoliciesPage.tsx): Removed the *"DPDP Act, 2023 & GIGW Compliant"* blue badge and harmonized icons with the theme.
  - In [`TermsConditionsPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/TermsConditionsPage.tsx): Removed the *"Act No. 1 of 2010"* blue badge.
  - In [`HelpFaqPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/HelpFaqPage.tsx): Removed the *"Citizen & Trader Knowledge Base"* blue badge.
  - In [`ContactUsPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/ContactUsPage.tsx): Removed the *"Official Directory"* blue badge and harmonized icon containers to slate.
- **Verification**:
  - `npm run build --workspace=@sih/client`: passed with 0 errors (clean build in 2.27s).
  - `npm run build --workspace=@sih/server`: passed with 0 errors.
  - `npm run typecheck --workspace=@sih/mobile`: passed with 0 errors.

## [1.9.55] - Remove New Application Option from Admin/GATC & Simplify Contact Us Email — 2026-09-14

- **Remove New Application Option from Admin & GATC**:
  - In [`ApplicationListPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/applications/ApplicationListPage.tsx): Restricted top "New Application" button, empty-state "Submit New Application" button, and `<SubmitApplicationDialog />` strictly to commercial traders (`Role.CONSUMER`). Admin, GATC Admin, and Inspectors can no longer initiate new applications.
  - In [`GlobalSearchDialog.tsx`](file:///Users/Sumit/Desktop/sih/client/src/components/layout/GlobalSearchDialog.tsx): Restricted "Register New Instrument" and "Submit Verification Application" quick actions in Omnisearch command palette exclusively to `Role.CONSUMER`.
  - In [`applications.routes.ts`](file:///Users/Sumit/Desktop/sih/server/src/modules/applications/applications.routes.ts): Locked down `POST /applications` API endpoint with `requireRole([Role.CONSUMER])`.
- **Contact Us Email Support Simplification**:
  - In [`ContactUsPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/ContactUsPage.tsx): Simplified the email section by removing the multi-desk selector, subject pre-fill dropdowns, textarea notes, and SLA notes.
  - Replaced with a clean, official support box displaying `support-elmv@gov.in`, a copy button, and a prominent, direct **"Email Us"** (`mailto:support-elmv@gov.in`) action button.
- **Verification**:
  - `npm run build --workspace=@sih/client`: passed with 0 errors (clean build in 2.70s).
  - `npm run build --workspace=@sih/server`: passed with 0 errors.
  - `npm run typecheck --workspace=@sih/mobile`: passed with 0 errors.

## [1.9.54] - Legal Metrology Verification Service Visual Asset in Hero Section — 2026-09-14

- **Hero Section Whitespace Enhancement**:
  - In [`ConsumerLandingPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/pages/ConsumerLandingPage.tsx), utilized the previously empty right-hand space in the hero section (`lg:col-span-5`) without altering any existing headings, descriptions, pillars, or statutory features.
  - Placed an official 3D legal metrology service visual asset depicting:
    - High-precision analytical laboratory scale with digital verification readout ("LEGAL METROLOGY VERIFIED 25.000 g").
    - Standard brass calibration weights with precision tweezers.
    - Digital tablet displaying the official Certificate of Verification with QR code validation badge.
    - Official green-and-silver verification shield badge ("LEGAL METROLOGY VERIFIED & CERTIFIED").
    - Bilingual reactive status badge (*विधिक मापविज्ञान सत्यापन* / *Legal Metrology Verified*) with pulsing status indicator.
- **Verification**:
  - `npm run build --workspace=@sih/client`: passed with 0 errors (clean build in 2.38s).
  - `npm run typecheck --workspace=@sih/mobile`: passed with 0 errors.

## [1.9.53] - Full Bilingual Hindi Support Across All Public Statutory Pages — 2026-09-14

- **Complete Hindi Translation across Public Statutory Knowledge Base**:
  - Implemented comprehensive bilingual rendering across all 4 public portal pages and shared layouts when the language is toggled to Hindi:
    - **Shared Public Layout ([`PublicPageLayout.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/PublicPageLayout.tsx))**:
      - Bilingual sub-navigation bar (*वेबसाइट नीतियां, नियम एवं शर्तें, सहायता व अक्सर पूछे जाने वाले प्रश्न, संपर्क करें*).
      - Bilingual breadcrumb indicators and header titles.
      - Statutory footer support & helpline labels (*सहायता एवं हेल्पलाइन*, *राष्ट्रीय उपभोक्ता टोल-फ्री हेल्पलाइन: 1915*, *कार्य समय: प्रातः 09:30 से सायं 05:30*).
    - **Website Policies ([`WebsitePoliciesPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/WebsitePoliciesPage.tsx))**:
      - Fully translated 4 policy tabs into official legal terminology: *गोपनीयता नीति* (Privacy Policy under DPDP Act 2023), *हाइपरलिंकिंग नीति* (Hyperlinking Policy), *कॉपीराइट नीति* (Copyright Policy), and *सुरक्षा व क्रिप्टोग्राफी* (Security & Cryptography).
    - **Terms & Conditions ([`TermsConditionsPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/TermsConditionsPage.tsx))**:
      - Complete Hindi statutory text covering preamble notices, Section 24(1) verification mandate, commercial trader obligations, Schedule XI fees, Section 30/31 penal provisions, and judicial jurisdiction.
    - **Help & FAQs ([`HelpFaqPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/HelpFaqPage.tsx))**:
      - Bilingual search bar placeholder and category filter chips (*सभी विषय, सामान्य मुद्रांकन, व्यापारी एवं प्रतिष्ठान, अधिकारी निरीक्षण व MPE, जीएटीसी प्रयोगशालाएं, क्यूआर कोड व प्रमाण पत्र*).
      - All 8 comprehensive FAQs with questions and in-depth answers rendered in Hindi.
    - **Contact Us & Directory ([`ContactUsPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/ContactUsPage.tsx))**:
      - Bilingual headquarters coordinates, State Metrology Enforcement Cells, departmental email desks (*eLMV तकनीकी हेल्पडेस्क, विधिक मापविज्ञान केंद्रीय प्रकोष्ठ, निदेशालय शिकायत निवारण*), subject selectors, and direct mail dispatch actions.
    - **Consumer Landing Footer ([`ConsumerLandingPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/pages/ConsumerLandingPage.tsx))**:
      - Aligned helpline labels and working hours to render dynamically in Hindi.
- **Verification**:
  - `npm run build --workspace=@sih/client`: passed with 0 errors (clean build in 2.27s).
  - `npm run typecheck --workspace=@sih/mobile`: passed with 0 errors.

## [1.9.52] - Remove Feedback Section, Routes & Navigation — 2026-09-14

- **Feedback Section Removal**:
  - Removed the **Feedback** link from the statutory footers in [`ConsumerLandingPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/pages/ConsumerLandingPage.tsx) and [`PublicPageLayout.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/PublicPageLayout.tsx).
  - Removed `Feedback` from the official public sub-navigation tabs in [`PublicPageLayout.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/PublicPageLayout.tsx).
  - Removed `/feedback` routes and component imports from [`ConsumerApp.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/ConsumerApp.tsx), [`AdminApp.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/admin/AdminApp.tsx), and [`FieldApp.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/field/FieldApp.tsx).
  - Deleted `FeedbackPage.tsx`.
- **Verification**:
  - `npm run build --workspace=@sih/client`: passed with 0 errors.
  - `npm run typecheck --workspace=@sih/mobile`: passed with 0 errors.

## [1.9.51] - Official Email Desks & Direct Send Email Actions on Contact Us Page — 2026-09-14

- **Contact Us Electronic Mail Redesign**:
  - In [`ContactUsPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/ContactUsPage.tsx), removed the generic "Send an Official Inquiry" form (fields for Name, Email, Mobile Number, Subject / Department, and Inquiry Details).
  - Replaced it with an interactive **Official Electronic Mail Support** center:
    - **Departmental Email Desks**: Choice between `support-elmv@gov.in` (Helpdesk & Scheduling), `legal-metrology@nic.in` (Statutory Policy & Directorate), and `dir-lm@nic.in` (Grievance Redressal Officer).
    - **Topic / Subject Pre-fill**: Dropdown of pre-configured subject lines (e.g. Verification scheduling, QR validation, model approval) plus custom subject input.
    - **Inquiry Brief**: Optional query details / application number pre-filled in message body.
    - **Direct Email Dispatch**: One-click **Send Email (Default Mail App)** via `mailto:`, **Open in Gmail** for webmail users, and **Copy Address** with visual copied confirmation.
    - Statutory SLA guarantees per desk under Citizen's Charter guidelines.
- **Verification**:
  - `npm run build --workspace=@sih/client`: passed with 0 errors.
  - `npm run typecheck --workspace=@sih/mobile`: passed with 0 errors.

## [1.9.50] - Single-Line Layout for National Consumer Toll-Free Helpline (1915) — 2026-09-14

- **Footer Helpline Alignment**:
  - Enforced strict single-line horizontal alignment for the National Consumer Helpline in both [`ConsumerLandingPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/pages/ConsumerLandingPage.tsx) and [`PublicPageLayout.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/PublicPageLayout.tsx).
  - Replaced `flex-wrap` with `whitespace-nowrap flex items-center md:justify-end gap-2 text-xs` and added `shrink-0` to the amber `1915` badge so "National Consumer Toll-Free Helpline:" and "1915" never wrap onto separate rows.
- **Verification**:
  - `npm run build --workspace=@sih/client`: passed with 0 errors.
  - `npm run typecheck --workspace=@sih/mobile`: passed with 0 errors.

## [1.9.49] - Relocating Digital India Emblem to Right Side of Statutory Footer — 2026-09-14

- **Footer Layout & Branding Realignment**:
  - Relocated the official **Digital India** brand emblem (`/digi-india.png`) to the right-hand column of the official statutory footers in [`ConsumerLandingPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/pages/ConsumerLandingPage.tsx) and [`PublicPageLayout.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/PublicPageLayout.tsx).
  - Left column preserves the official State Emblem of India (`/emblem.jpeg`) with ministry titles and statutory disclaimer.
  - Right column now houses the Digital India emblem badge alongside the National Consumer Toll-Free Helpline (1915).
- **Verification**:
  - `npm run build --workspace=@sih/client`: passed with 0 errors.
  - `npm run build --workspace=@sih/server`: passed with 0 errors.

## [1.9.48] - Dynamic Chrome Browser Tab Title (Admin, Field, User) — 2026-09-14

- **Browser Document Title Dynamic Personalization**:
  - Implemented automatic Chrome browser tab title customization across all portals, user roles, and routes:
    - **Admin & GATC (`Role.ADMIN`, `Role.GATC_ADMIN`, port 5174, `admin.*` subdomain, or `/admin/*`, `/agency/*`, `/gatc/*`)**: `eLMV | admin`
    - **Inspector & Field (`Role.LMO`, `Role.GATC_INSPECTOR`, port 5175, `field.*` subdomain, or `/field/*`, `/roster/*`, `/inspectors/*`, `/officer/*`)**: `eLMV | field`
    - **User / Citizen / Trader (`Role.CONSUMER`, port 5173, `consumer.*` subdomain, or public landing/dashboard)**: `eLMV`
  - Added pre-hydration script in [`client/index.html`](file:///Users/Sumit/Desktop/sih/client/index.html) to set the tab title immediately on page load prior to bundle execution, preventing any title flicker.
  - Added reactive title observer in [`client/src/App.tsx`](file:///Users/Sumit/Desktop/sih/client/src/App.tsx) that continuously syncs `document.title` on route changes and authentication state updates.
- **Verification**:
  - `npm run typecheck --workspace=@sih/mobile`: passed with 0 errors.
  - `npm run build --workspace=@sih/client`: passed with 0 errors.
  - `npm run build --workspace=@sih/server`: passed with 0 errors.

## [1.9.47] - Inline Icon Alignment on Certified & Stamped Badges and Action Controls — 2026-09-14

- **Badge & Button Flex Centering and Inline Icon Alignment**:
  - **Core Web Badge Component ([`client/src/components/ui/badge.tsx`](file:///Users/Sumit/Desktop/sih/client/src/components/ui/badge.tsx))**:
    - Removed the nested non-flex `<span>{children}</span>` wrapper so all children are direct flex items of the `inline-flex items-center gap-1.5` container. This eliminates the CSS baseline offset that caused SVG icons to sit higher or misaligned with adjacent text.
  - **Core Web Button Component ([`client/src/components/ui/button.tsx`](file:///Users/Sumit/Desktop/sih/client/src/components/ui/button.tsx))**:
    - Added `gap-1.5` to `buttonVariants` to ensure icons and text inside buttons automatically maintain vertical and horizontal centering.
  - **Field Inspection Roster ([`client/src/portals/field/pages/FieldRosterPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/field/pages/FieldRosterPage.tsx))**:
    - Refactored **"Certified & Stamped"** badge with `<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />`, `whitespace-nowrap`, and `gap-1.5`.
    - Aligned **"Rejected (Exceeds MPE)"** badge with `<XCircle>`, "View Certificate" with `<QrCode>`, and "Start MPE Test" with `<Play>`.
    - Added `shrink-0` and `gap-1.5` to all metadata icons (`<Scale>`, `<Building>`, `<MapPin>`, `<Phone>`, `<Calendar>`).
  - **Applications, Instruments, Consumer & Admin Portals**:
    - Aligned filter pills and action buttons across [`ApplicationListPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/applications/ApplicationListPage.tsx), [`InstrumentListPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/instruments/InstrumentListPage.tsx), [`ConsumerLandingPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/pages/ConsumerLandingPage.tsx), [`ConsumerDashboardPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/pages/ConsumerDashboardPage.tsx), [`AuditLogPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/audit/AuditLogPage.tsx), and [`GatcDashboardPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/admin/pages/GatcDashboardPage.tsx).
  - **Mobile React Native Workstation ([`mobile/src/components/`](file:///Users/Sumit/Desktop/sih/mobile/src/components/))**:
    - Configured `iconContainer` centering with `includeFontPadding: false` and `textAlignVertical: "center"` in [`mobile/src/components/ui/badge.tsx`](file:///Users/Sumit/Desktop/sih/mobile/src/components/ui/badge.tsx).
    - Integrated clean inline status icons into [`RosterCard.tsx`](file:///Users/Sumit/Desktop/sih/mobile/src/components/officer/RosterCard.tsx) and [`ApplicationDrawer.tsx`](file:///Users/Sumit/Desktop/sih/mobile/src/components/officer/ApplicationDrawer.tsx).
- **Verification**:
  - `npm run typecheck --workspace=@sih/mobile`: passed with 0 errors.
  - `npm run build --workspace=@sih/client`: passed with 0 errors.
  - `npm run build --workspace=@sih/server`: passed with 0 errors.

## [1.9.46] - Mobile App Registry Multi-Criteria Statutory Filtering — 2026-09-14

- **Mobile Officer Workstation Equipment Registry Multi-Criteria Filters**:
  - Enhanced [`mobile/src/screens/RegistryScreen.tsx`](file:///Users/Sumit/Desktop/sih/mobile/src/screens/RegistryScreen.tsx) with multi-criteria statutory filtering:
    - **Instrument Type Filter Row**: Horizontal `ScrollView` of pill chips across all Rule 14 classes (`All Types`, `NAWI`, `AWI`, `Fuel`, `Tanks`, `Length`, `Capacity`, `Specialized`) with live dynamic counts computed against active criteria.
    - **Accuracy Class Filter Panel**: Expandable panel toggled via `Icons.Sliders` with active amber indicator dot, supporting `All Classes`, `Class I`, `Class II`, `Class III`, and `Class IV` with live counts.
    - **Active Filter Badges**: Compact summary bar showing match count (e.g. "Showing 4 of 6 equipment"), dismissible chips with tap-to-remove `✕` for active types/classes/search strings, and a "Clear all" button.
    - **Equipment Cards & Inspection Details Modal**: Added statutory instrument type badge alongside the accuracy class badge on every card. Tapping any card opens an inspection detail modal with full technical specs, verification interval, trader establishment coordinates, and legal compliance seal.
    - **Offline Fallback Resilience**: Added rich statutory fallback instruments for uninterrupted offline demonstrations.
  - Added bilingual translations in [`mobile/src/i18n/locales/en.json`](file:///Users/Sumit/Desktop/sih/mobile/src/i18n/locales/en.json) and [`mobile/src/i18n/locales/hi.json`](file:///Users/Sumit/Desktop/sih/mobile/src/i18n/locales/hi.json).
- **Verification**:
  - `npm run typecheck --workspace=@sih/mobile`: passed with 0 errors.
  - `npm run build --workspace=@sih/client`: passed with 0 errors.
  - `npm run build --workspace=@sih/server`: passed with 0 errors.

## [1.9.45] - Restricting Instrument Registration to Commercial Consumers/Traders Only — 2026-09-14

- **Enforcement of Legal Metrology Asset Registry Boundaries**:
  - Removed "Register Instrument" option from Admin and GATC roles across frontend views and backend endpoints:
    - [`client/src/features/instruments/InstrumentListPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/instruments/InstrumentListPage.tsx):
      - Header "Register Instrument" button restricted strictly to `user?.role === Role.CONSUMER`. Admin viewing "State Registry" and GATC viewing instruments no longer see a registration trigger.
      - Empty state action updated: only Consumers see "Register your first instrument"; Admin/GATC roles see "Reset filters" when filters are applied, and no registration button when no records exist.
      - `<RegisterInstrumentDialog>` conditionally mounted only for `Role.CONSUMER`.
    - [`server/src/modules/instruments/instruments.routes.ts`](file:///Users/Sumit/Desktop/sih/server/src/modules/instruments/instruments.routes.ts):
      - Added `requireRole([Role.CONSUMER])` to `POST /api/v1/instruments` to reject unauthorized instrument creation attempts by Admin or GATC roles with 403 Forbidden.
- **Verification**:
  - `npm run build --workspace=@sih/client`: passed with 0 errors.
  - `npm run build --workspace=@sih/server`: passed with 0 errors.

## [1.9.44] - Dedicated Statutory & Citizen Public Information Pages — 2026-09-14

- **Dedicated Public Pages & Routing Architecture**:
  - Implemented the official Government of India public layout [`PublicPageLayout.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/PublicPageLayout.tsx) featuring national tricolor header band, Government of India utility bar with Hindi/English language toggle, state emblem header, active page navigation strip, breadcrumbs, and official statutory footer with toll-free 1915 helpline and copyright notice.
  - Built 5 dedicated, rich statutory and citizen services pages under `client/src/features/public/`:
    1. **Website Policies** ([`WebsitePoliciesPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/WebsitePoliciesPage.tsx) at `/policies`, `/website-policies`, `/privacy`): Privacy Policy under DPDP Act 2023, Hyperlinking Policy, Copyright Policy, and Security/ECDSA Cryptography Standards.
    2. **Terms & Conditions** ([`TermsConditionsPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/TermsConditionsPage.tsx) at `/terms`, `/terms-and-conditions`): Legal framework under Legal Metrology Act 2009, Section 24 mandatory stamping, user obligations, fee payment terms, and Section 30/31 strict penal liabilities.
    3. **Help & FAQs** ([`HelpFaqPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/HelpFaqPage.tsx) at `/help`, `/faq`, `/faqs`): Interactive accordion FAQ knowledge base with keyword search, category filters (General, Traders, LMO Inspections, GATC Labs, QR Certificates), and toll-free helpline banner.
    4. **Feedback** ([`FeedbackPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/FeedbackPage.tsx) at `/feedback`): Citizen & Trader experience feedback form with interactive 1-5 star ratings, feedback categories, stakeholder persona selector, and confirmation receipt with simulated reference ticket number.
    5. **Contact Us** ([`ContactUsPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/public/ContactUsPage.tsx) at `/contact`, `/contact-us`): Directorate of Legal Metrology central coordinates (Krishi Bhawan, New Delhi), 1915 Helpline, state enforcement cells directory, and official inquiry dispatch form.
  - Mounted routes across all portal routers (`ConsumerApp.tsx`, `AdminApp.tsx`, and `FieldApp.tsx`).
  - Linked all footer items in [`ConsumerLandingPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/pages/ConsumerLandingPage.tsx) using React Router `<Link>` to the respective pages.
  - Relocated `digi-india.png` into static directory [`client/public/digi-india.png`](file:///Users/Sumit/Desktop/sih/client/public/digi-india.png) and integrated the official Digital India brand mark in the footers of both the Consumer Landing Page and Public Page Layout alongside the State Emblem of India.
- **Verification**:
  - `npm run build --workspace=@sih/client`: passed with 0 errors.
  - `npm run build --workspace=@sih/server`: passed with 0 errors.

## [1.9.43] - Persona-Specific Button Color Discrimination (Admin Black vs. Consumer Bluish) — 2026-09-14

- **Differentiated Button Color Theme by Persona (Admin vs. User / Consumer App)**:
  - Ensured that buttons in the User / Consumer App ("Applications", "My Instruments", and "Dashboard") strictly use the official consumer bluish theme (`bg-[#0B2545] hover:bg-[#0B2545]/90 text-white shadow-xs`).
  - Ensured that buttons in the Admin Portal ("All Applications", "State Registry", "Officers", "Agencies") strictly use the regulatory pure black theme (`bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900`).
  - Updated shared view components:
    - [`client/src/features/applications/ApplicationListPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/applications/ApplicationListPage.tsx):
      - Header "New Application" button conditionally styles for `Role.CONSUMER` (`bg-[#0B2545]`) vs. `Role.ADMIN` (`bg-slate-900`).
      - Empty state "Submit New" button conditionally styles for `Role.CONSUMER` (`bg-[#0B2545]`) vs. `Role.ADMIN` (`bg-slate-900`).
    - [`client/src/features/instruments/InstrumentListPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/instruments/InstrumentListPage.tsx):
      - Header "Register Instrument" button conditionally styles for `Role.CONSUMER` (`bg-[#0B2545]`) vs. `Role.ADMIN` (`bg-slate-900`).
      - Empty state action button conditionally styles for `Role.CONSUMER` (`bg-[#0B2545]`) vs. `Role.ADMIN` (`bg-slate-900`).
    - [`client/src/portals/consumer/pages/ConsumerDashboardPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/pages/ConsumerDashboardPage.tsx):
      - "Apply for Stamping" action button styled with `bg-[#0B2545] hover:bg-[#0B2545]/90 text-white shadow-xs`.
    - [`client/src/features/dashboard/DashboardPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/dashboard/DashboardPage.tsx):
      - "Apply Renewal" action button in the consumer dashboard expiring devices table styled with `bg-[#0B2545] hover:bg-[#133966] text-white shadow-xs`.
- **Verification**:
  - `npm run build --workspace=@sih/client`: passed with 0 errors.
  - `npm run build --workspace=@sih/server`: passed with 0 errors.

## [1.9.42] - Statutory Scope Multi-Select Provisioning & Strict GATC Scope-Isolated Testing Queues — 2026-09-14

- **GATC Institutional Statutory Scopes Provisioning & Management**:
  - Upgraded the Provision GATC Agency and Edit GATC Agency modals to wide layout (`max-w-3xl sm:max-w-4xl max-h-[92vh] overflow-y-auto p-6 sm:p-7`), eliminating vertical crowding and giving fields ample breathing room.
  - Redesigned the statutory scope selector into rich, responsive **Selectable Cards** (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5`) across all 7 statutory instrument scopes under Rule 14:
    1. `NON_AUTOMATIC_WEIGHING_INSTRUMENT` (Non-Automatic Weighing Instruments - NAWI) with `Scale` icon
    2. `AUTOMATIC_WEIGHING_INSTRUMENT` (Automatic Weighing Instruments - AWI) with `Gauge` icon
    3. `FUEL_DISPENSER` (Fuel & Flow Dispensers) with `Fuel` icon
    4. `STORAGE_TANK` (Storage Tanks & Vats) with `Building2` bulk storage icon
    5. `LENGTH_MEASURE` (Length & Linear Measures) with `Ruler` icon
    6. `CAPACITY_MEASURE` (Capacity Measures) with `FlaskConical` liquid volume icon
    7. `OTHER` (Other Specialized Measures) with `Compass` specialized measures icon
  - Each card displays interactive checkmark indicators, category tags, bold statutory titles, and descriptive instrument examples.
  - Organized form fields into 3 clean, structured sections (Laboratory Identity & Accreditation, Authorized Statutory Testing Scopes, and Administrative Credentials).
  - Added an "Edit" action button and modal with the identical wide layout and card selector allowing administrators to update statutory scopes, accreditation validity dates, lab address, and gazette notification references on existing agencies.
- **Backend Agency Scope Updates**:
  - Added `updateGatcAgencySchema` and `UpdateGatcAgencyInput` in [`shared/src/schemas/user.schema.ts`](file:///Users/Sumit/Desktop/sih/shared/src/schemas/user.schema.ts).
  - Added `PATCH /api/v1/admin/gatc-agencies/:id` endpoint in [`server/src/modules/admin/admin.routes.ts`](file:///Users/Sumit/Desktop/sih/server/src/modules/admin/admin.routes.ts), [`admin.controller.ts`](file:///Users/Sumit/Desktop/sih/server/src/modules/admin/admin.controller.ts), and [`admin.service.ts`](file:///Users/Sumit/Desktop/sih/server/src/modules/admin/admin.service.ts) with audit logging.
- **Strict Scope-Based Application & Pipeline Isolation**:
  - Updated [`applications.service.ts`](file:///Users/Sumit/Desktop/sih/server/src/modules/applications/applications.service.ts):
    - `listApplications`: GATC Administrators and GATC Field Inspectors are strictly constrained to applications whose `instrument.type` is within their agency's or personal authorized scopes (`{ instrument: { type: { in: scopes } } }`).
    - `getApplicationById`: Implemented 403 Forbidden statutory enforcement preventing unauthorized GATC inspection of applications outside authorized scopes.
  - Updated [`dashboard.service.ts`](file:///Users/Sumit/Desktop/sih/server/src/modules/dashboard/dashboard.service.ts):
    - Scoped `pendingInspections`, `completedInspections`, `certifiedCount`, and `upcomingSchedule` queries for both `Role.GATC_ADMIN` and `Role.GATC_INSPECTOR` to their authorized scopes.
  - Updated [`gatc.service.ts`](file:///Users/Sumit/Desktop/sih/server/src/modules/gatc/gatc.service.ts):
    - `delegateApplication`: Verifies that the application instrument type is within the GATC agency's authorized scope and within the assigned inspector's scope before delegation.
  - Updated [`auth.service.ts`](file:///Users/Sumit/Desktop/sih/server/src/modules/auth/auth.service.ts):
    - Included `authorizedScope: true` in `gatcAgency` selection under `getMe` for seamless client-side role synchronization.
- **Frontend GATC Pipeline & Queue Visualization**:
  - In [`GatcDashboardPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/admin/pages/GatcDashboardPage.tsx): Displays live authorized scopes dynamically with statutory badges and shows instrument type tags on upcoming test bench pipeline rows.
  - In [`ApplicationListPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/applications/ApplicationListPage.tsx): Added a prominent "Statutory Scope Restricted Testing Queue" notice for GATC roles displaying their active testing scopes and added instrument type badges to the application table.
- **Header & Sidebar Chrome Streamlining**:
  - Removed the settings icon button from the header navigation bar ([`TopBar.tsx`](file:///Users/Sumit/Desktop/sih/client/src/components/layout/TopBar.tsx)).
  - Removed the redundant settings icon button from both the desktop sidebar bottom user card and the mobile navigation drawer footer ([`Sidebar.tsx`](file:///Users/Sumit/Desktop/sih/client/src/components/layout/Sidebar.tsx)), leaving a single, focused logout action while maintaining the main navigation link.
- **Cross-Platform Instrument Type Filtering for Applications (Web & Mobile)**:
  - **Backend API**: Added `instrumentType` query parameter support in `GET /applications` via [`applications.controller.ts`](file:///Users/Sumit/Desktop/sih/server/src/modules/applications/applications.controller.ts) and [`applications.service.ts`](file:///Users/Sumit/Desktop/sih/server/src/modules/applications/applications.service.ts), querying `{ instrument: { type: options.instrumentType } }` with seamless composition alongside status, search, and GATC scope restrictions.
  - **Web Client ([`ApplicationListPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/applications/ApplicationListPage.tsx))**:
    - Integrated an **Instrument Type** filter dropdown alongside the Status filter, supporting all 7 statutory classes under Rule 14 (NAWI, AWI, Fuel Dispensers, Storage Tanks, Length Measures, Capacity Measures, Specialized Measures).
    - Added dynamic active filter badges with individual dismiss controls and a "Reset all" quick action.
    - Added instrument type to query cache keys and query params for reactive instant filtering across Consumer, LMO, GATC, and Admin portals.
  - **Mobile App ([`RosterScreen.tsx`](file:///Users/Sumit/Desktop/sih/mobile/src/screens/RosterScreen.tsx) & [`RosterCard.tsx`](file:///Users/Sumit/Desktop/sih/mobile/src/components/officer/RosterCard.tsx))**:
    - Added an ergonomic, horizontally scrollable **Instrument Type Chips Bar** with live counter badges for each statutory instrument class.
    - Integrated multi-dimensional filtering across status tabs, text search, and instrument types with client-side fallback and server query param sync.
    - Added instrument type badges (e.g. `NAWI`, `Fuel`, `AWI`, `Tank`) directly onto `RosterCard` headers next to the status badge for instant visual recognition.
- **Sidebar Chrome Navigation Refinement**:
  - Renamed the admin sidebar navigation item from "Command Center" to "Dashboard" via `t("nav.dashboard")`, maintaining naming parity across all roles.
- **Verification**:
  - Monorepo compilation, client production build (`npm run build --workspace=@sih/client`), server build (`npm run build --workspace=@sih/server`), and mobile typecheck (`npm run typecheck --workspace=@sih/mobile`) pass cleanly with 0 errors.

---

## [1.9.41] - Universal In-Page Statutory Certificate Modal Dialog Across All Web Apps — 2026-09-14

- **Zero External Tabs / Popups for Certificate Viewing**:
  - Eliminated all occurrences of `window.open(..., "_blank")`, `target="_blank"`, and `<Link to="/verify?cert=...">` when clicking or inspecting certificates throughout the entire web application ecosystem.
  - Users remain strictly anchored to their current working view (Applications queue, Roster, Dashboard, or Landing page) with zero navigation interruptions.
- **Enhanced `Dialog` Primitive with Custom Container Overrides**:
  - Updated [`client/src/components/ui/dialog.tsx`](file:///Users/Sumit/Desktop/sih/client/src/components/ui/dialog.tsx) to accept an optional `className?: string` prop on the dialog wrapper.
  - Enabled wide, document-grade layouts (`max-w-3xl sm:max-w-4xl max-h-[92vh] overflow-y-auto`) while preserving standard `max-w-lg` styling for all existing system modals.
- **In-Page Download & Print Architecture**:
  - Implemented [`client/src/lib/certificateUtils.ts`](file:///Users/Sumit/Desktop/sih/client/src/lib/certificateUtils.ts) with two self-contained utility functions:
    - `downloadCertificatePdf(certificateNumber)`: streams the digitally signed PDF binary buffer via Axios `responseType: "blob"` and triggers a clean browser file save dialog in-page (`Certificate-${certNumber}.pdf`) without opening a blank browser tab.
    - `printCertificateElement(target)`: copies printable styles and the certificate card markup into an off-screen, invisible iframe and triggers `iframe.contentWindow.print()` silently in-page.
- **Statutory Schedule XI `CertificateDialog` Component**:
  - Created [`client/src/components/common/CertificateDialog.tsx`](file:///Users/Sumit/Desktop/sih/client/src/components/common/CertificateDialog.tsx) (and re-exported via [`client/src/features/verification/CertificateDialog.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/verification/CertificateDialog.tsx)).
  - Queries live certificate verification data from `/api/v1/verification/verify/:identifier` using React Query with automatic loading skeletons and error recovery.
  - Formatted strictly according to Schedule XI of the Legal Metrology Rules, 2011:
    - Government of India & Department of Consumer Affairs header with official National Emblem (`/emblem.jpeg`).
    - Prominent cryptographic validity badge (VALID & ACTIVE, EXPIRED, or SIGNATURE INVALID) with NIST P-256 badge.
    - Interactive Level-H SVG QR code (`QRCodeSVG`) with "Scan to Verify" badge.
    - Summary metadata grid (Certificate No., Stamping Date, Validity Date, Affixed Seal No.).
    - Verified instrument specifications: serial number, category/type, make/model, capacity, accuracy class, installed district and state.
    - Physical observation and Maximum Permissible Error (MPE) evaluation gauge (Observed error vs Permissible MPE limit with statutory PASS indicator).
    - Verification officer endorsement, registered commercial trader details, and ECDSA NIST P-256 signature block.
    - Legal Metrology Act Section 24 statutory tamper warning notice.
    - In-page "Download PDF", "Print", and "Close" controls.
- **Cross-Portal Integration**:
  - **Applications Management ([`ApplicationListPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/applications/ApplicationListPage.tsx))**: Clicking the "Certificate" button opens `CertificateDialog` in-page (benefits Consumer, Field Officer, and State Admin portals).
  - **Field Officer Daily Roster ([`FieldRosterPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/field/pages/FieldRosterPage.tsx))**: Replaced route navigation with in-page `CertificateDialog` so officers never lose their daily inspection roster context.
  - **Consumer Live Application Tracker ([`ConsumerLandingPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/pages/ConsumerLandingPage.tsx))**: Added "View Certificate" button to the certified tracking card.
  - **Commercial Trader Dashboard ([`ConsumerDashboardPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/pages/ConsumerDashboardPage.tsx))**: Added "Certificate" button to the recent filings table.
  - **Hero Certificate Search ([`LandingPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/home/LandingPage.tsx))**: Quick search on the main portal hero opens `CertificateDialog` directly on the homepage.
  - **Global Portal Search ([`TopBar.tsx`](file:///Users/Sumit/Desktop/sih/client/src/components/layout/TopBar.tsx) & [`GlobalSearchDialog.tsx`](file:///Users/Sumit/Desktop/sih/client/src/components/layout/GlobalSearchDialog.tsx))**: Clicking the direct certificate verification shortcut opens `CertificateDialog` without page reload.
  - **Public Verification Page ([`PublicVerificationPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/verification/PublicVerificationPage.tsx))**: Replaced `window.open` with in-page blob download for PDF exports.
- **Verification**:
  - Zero compile or type errors across the monorepo (`npm run typecheck` and `npm run build --workspace=@sih/client` exited with code 0).

---

## [1.9.40] - Admin/Inspector Minimalist Login Cards, Leadership Media Update & Mobile Safe Area Layout Engine — 2026-09-14

- **Admin & Field Officer Login Portal Modernization**:
  - Overhauled [`AdminLoginPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/admin/pages/AdminLoginPage.tsx) and [`FieldLoginPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/field/pages/FieldLoginPage.tsx) into focused, minimalist authentication cards.
  - Stripped away extraneous banners, headers, footers, demo quick-fill buttons, and distracting helper copy.
  - Added official National Emblem logo and crisp `eLMV` portal typography.
  - Aligned floating, decoupled language and theme switchers with equal height (`h-8`).
  - Replaced disruptive "Access Restricted" warning screen with an immediate session clear and inline "Invalid credentials. Please try again." notification directly on the login card.
- **Consumer Landing Page Media Update**:
  - Replaced Minister Shri Pralhad Joshi portrait in [`ConsumerLandingPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/pages/ConsumerLandingPage.tsx) with user-uploaded `pj.jpeg`.
  - Enlarged dimensions (`w-48 h-56 sm:w-52 sm:h-60`) and configured a crisp white background (`bg-white` / `#ffffff`).
- **Mobile Safe Area & Inset Engineering on Android**:
  - Resolved status bar collisions by integrating dynamic top safe area insets across [`App.tsx`](file:///Users/Sumit/Desktop/sih/mobile/App.tsx), [`LoginScreen.tsx`](file:///Users/Sumit/Desktop/sih/mobile/src/screens/LoginScreen.tsx), and all modal views.
  - Resolved bottom navigation collisions by elevating the navigation tab bar (`paddingBottom: Math.max(insets.bottom, 24)`) to clear Android 3-button hardware and gesture navigation bars.
  - Increased scroll content padding (`64px`) across Roster, Verify, Registry, and Settings lists to ensure bottom action buttons ("Inspect" / "View Certificate") never collide with the navigation tab bar.
- **Migration from Deprecated `SafeAreaView` to `react-native-safe-area-context`**:
  - Installed `react-native-safe-area-context` (`^5.9.1`).
  - Wrapped app root in [`App.tsx`](file:///Users/Sumit/Desktop/sih/mobile/App.tsx) with `<SafeAreaProvider>`.
  - Replaced all 8 instances of React Native's deprecated `SafeAreaView` with standard `<View>` containers utilizing `useSafeAreaInsets()`.
  - Added `LogBox.ignoreLogs(["SafeAreaView has been deprecated"])` guard to prevent any third-party dependencies from triggering runtime warnings.
- **Zero-Flicker Instant Tab Switching**:
  - Eliminated artificial 70ms fade-out animation (`tabFadeAnim`) that caused aggressive screen blinking on Android.
  - Implemented persistent tab containers using `display: "none"` / `display: "flex"` to preserve component state, scroll position, and search terms while delivering instant, native-speed tab navigation.
- **Zero Build Regressions**:
  - Full monorepo builds and typechecks cleanly (`exit code 0` across all workspaces).

---

## [1.9.39] - Mobile Settings Navigation Gestures, Header Cleanup & Password Modal — 2026-09-14

- **Horizontal Slide Navigation & Native Swipe-Right Dismissal Across Content & Header**:
  - Replaced native vertical slide-up modal with horizontal right-to-left push animation in [`SettingsScreen.tsx`](file:///Users/Sumit/Desktop/sih/mobile/src/screens/SettingsScreen.tsx) and [`App.tsx`](file:///Users/Sumit/Desktop/sih/mobile/App.tsx).
  - Implemented direct touch event tracking (`onTouchStart`, `onTouchMove`, `onTouchEnd`, `onTouchCancel`) wired directly onto `<ScrollView>` and `topHeader` with dynamic `scrollEnabled` locking, completely bypassing native `ScrollView` gesture consumption on the main content.
  - Added an absolute left-edge swipe zone overlay (`width: 36, elevation: 20, zIndex: 999`) rendered in front of the ScrollView for instant, zero-latency swipe-to-dismiss.
- **Header & Status Bar Color Synchronization**:
  - Integrated `<StatusBar barStyle="dark-content" backgroundColor="#ffffff" animated={true} />` and wrapped the header in `headerSafeArea` with Android `StatusBar.currentHeight` top inset, unifying the phone status bar area (clock, battery, Wi-Fi icons) with the white `#ffffff` header surface.
- **Top Navigation Bar Header ("Profile" / "प्रोफ़ाइल")**:
  - Positioned clean, high-contrast statutory title text ("Profile" in English / "प्रोफ़ाइल" in Hindi) immediately adjacent to the circular back chevron button in [`SettingsScreen.tsx`](file:///Users/Sumit/Desktop/sih/mobile/src/screens/SettingsScreen.tsx).
  - Maintained the removal of the cross (`×`) icon button for a clean, cohesive mobile header layout.
- **Single "Edit Details" Button**:
  - Removed duplicate "Edit Details" button from the card header in the Officer Details card, leaving a single, high-contrast action button at the bottom of the card.
- **Dialog-Based Password Management**:
  - Converted inline password inputs into an encrypted status row (`••••••••••••` with a green "Protected" badge) and a "Change Password" button.
  - Clicking "Change Password" opens an interactive dialog modal (`RNModal`) with separate fields for Current Password, New Password, and Confirm Password, complete with show/hide eye toggle icons and full validation.
- **Ngrok v3 Binary Disambiguation & Process Resiliency**:
  - Updated [`scripts/start-tunnel.js`](file:///Users/Sumit/Desktop/sih/scripts/start-tunnel.js) to prioritize Homebrew's global ngrok v3 binary (`/opt/homebrew/bin/ngrok`) over legacy v2 wrappers in `node_modules/.bin`.
  - Added port freeing for ngrok inspection ports (`4041`, `4042`) and configured `--kill-others-on-fail` in `package.json` to prevent process termination on clean events.
- **Zero Build Regressions**:
  - All monorepo workspaces pass build and typecheck cleanly (`exit code 0` across `@sih/shared`, `@sih/server`, `@sih/client`, `@sih/mobile`).

---

## [1.9.38] - Multi-Network Tunnel Architecture & Single-Command (`npm run dev`) Developer Experience — 2026-09-14

- **Native Expo Tunnel Integration (`@expo/ngrok`)**:
  - Integrated `@expo/ngrok` in `@sih/mobile` dev dependencies.
  - Updated [`scripts/start-mobile.js`](file:///Users/Sumit/Desktop/sih/scripts/start-mobile.js) to start Expo in `--tunnel` mode by default, generating an internet-accessible `exp://...` QR code readable by Expo Go on physical phones regardless of whether the device is on cellular data (4G/5G) or a remote Wi-Fi network.
- **Unified Public API Gateway & Ngrok Warning Bypass**:
  - Configured [`mobile/src/lib/config.ts`](file:///Users/Sumit/Desktop/sih/mobile/src/lib/config.ts) with `PUBLIC_TUNNEL_URL` fallback (`https://vapouringly-nonallegoric-teodora.ngrok-free.dev/api/v1`) and dynamic `process.env.EXPO_PUBLIC_API_URL` precedence.
  - Configured [`mobile/src/lib/api.ts`](file:///Users/Sumit/Desktop/sih/mobile/src/lib/api.ts) with `ngrok-skip-browser-warning: "true"` headers across Axios client instance and request interceptors to prevent HTML splash screens from intercepting JSON API responses.
- **Server CORS Whitelist Upgrade**:
  - In [`server/src/app.ts`](file:///Users/Sumit/Desktop/sih/server/src/app.ts), expanded CORS regex to accept modern ngrok and tunnel domains (`.ngrok-free.dev`, `.ngrok-free.app`, `.ngrok.app`, `.ngrok.io`, `.loca.lt`).
- **Single-Command Full-Stack Execution (`npm run dev`)**:
  - Port freeing, shared schema compilation, Express backend (`5001`), three React Vite web applications (`5173`, `5174`, `5175`), public Ngrok proxy, and mobile Expo bundler now execute concurrently under one terminal process with clean log prefixes.
- **Zero Build Regressions**:
  - Full monorepo builds and typechecks cleanly (`exit code 0` across `@sih/shared`, `@sih/server`, `@sih/client`, `@sih/mobile`).

---

## [1.9.37] - Landing Header Alignment, Password Defaults Cleaning & Vercel SPA Routing — 2026-09-14

- **Consumer Portal Header Alignment**:
  - In [`client/src/portals/consumer/ConsumerLayout.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/ConsumerLayout.tsx), replaced the dark citizen bar with the exact landing page top strip: saffron, white, and green national tricolor ribbon (`h-1 shadow-xs`) followed by the light Government attribution strip (`bg-slate-100/90 border-b border-border/80`) with bilingual title attribution and rounded pill language toggle.
- **Form Password Security Defaults**:
  - Removed pre-filled `"Password@123"` strings in administrative officer and staff creation modals:
    - `OfficerManagementPage.tsx`: Initial & reset state cleared (`password: ""`), field renamed to `Password *` with helper placeholder.
    - `GatcStaffPage.tsx`: Initial & reset state cleared (`password: ""`), field renamed to `Password *` with helper placeholder.
    - `GatcAgencyManagementPage.tsx`: Initial & reset state cleared (`adminPassword: ""`), field renamed to `Admin Password *` with helper placeholder.
- **Vercel Client-Side SPA Routing**:
  - Created [`client/vercel.json`](file:///Users/Sumit/Desktop/sih/client/vercel.json) with catch-all rewrite (`{"source": "/(.*)", "destination": "/index.html"}`) so direct navigation and refreshes resolve without 404 errors on Vercel.
- **Git Security & Repository Push**:
  - Configured comprehensive root `.gitignore` blocking environment secrets and build artifacts while preserving `.env.example`.
  - Pushed codebase to remote GitHub repository (`https://github.com/sumitbudaniyaa/sih26.git`).
- **Zero Build Regressions**:
  - Monorepo compiles cleanly with exit code 0.

---

## [1.9.36] - Mobile Settings Clean-Up (Server URL & Language Removal) — 2026-09-14

- **Server URL & Backend Exposure Removed**:
  - Removed the Backend Server Endpoint configuration card, preset buttons (LAN Wi-Fi, iOS Simulator, Android Emulator), and manual URL input from [`SettingsScreen.tsx`](file:///Users/Sumit/Desktop/sih/mobile/src/screens/SettingsScreen.tsx). Backend connection endpoints are now handled entirely internally without exposing URLs or configuration in the user-facing UI.
- **Language Switcher Removed from Mobile Settings**:
  - Removed the Language Switcher card from [`SettingsScreen.tsx`](file:///Users/Sumit/Desktop/sih/mobile/src/screens/SettingsScreen.tsx) to streamline officer settings down strictly to profile credentials and security management.
- **Zero Build Regressions**:
  - All workspaces passed build and typecheck cleanly (`exit code 0` across `@sih/shared`, `@sih/server`, `@sih/client`, `@sih/mobile`).

---

## [1.9.35] - Landing Hero CTAs Removal & Registration Password Simplification — 2026-09-14

- **Landing Hero Clean-Up**:
  - Removed action CTA buttons (`"Apply for Verification"` / `"Track Verification Status"` / `"Go to Dashboard"`) from the hero banner section in [`ConsumerLandingPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/pages/ConsumerLandingPage.tsx), highlighting the statutory title and descriptive core pillars cleanly.
- **Registration Password Requirement Simplification**:
  - In [`shared/src/schemas/auth.schema.ts`](file:///Users/Sumit/Desktop/sih/shared/src/schemas/auth.schema.ts), updated `registerSchema` to require only a minimum length of 8 characters (`.min(8, "Password must be at least 8 characters")`), removing complex regex conditions (no mandatory uppercase, lowercase, or numeric digits required).
  - Updated [`RegisterPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/auth/RegisterPage.tsx) placeholder text to `"Minimum 8 characters"`.
- **Zero Build Regressions**:
  - Full monorepo build passes cleanly (`exit code 0` across `@sih/shared`, `@sih/server`, `@sih/client`).

---

## [1.9.34] - Consumer Navigation & Settings Modal Dialog Overhaul — 2026-09-14

- **Tab Scroller Sizing Stability**:
  - Fixed tab size increase bug when selecting categories/tabs in `ConsumerLayout.tsx` and `ConsumerLandingPage.tsx`: standardized font-weight to `font-medium` across both active and inactive states so active tabs never jump in width or dimensions on click.
  - Removed `scale-105` enlargement on the tracker progress milestone steps in `ConsumerLandingPage.tsx`.
- **Hamburger Menu Removal**:
  - Removed redundant mobile hamburger menu toggle button and mobile dropdown from `ConsumerLayout.tsx`: all navigation tabs are already accessible in the scrollable tab bar directly below the header.
- **Trader Portal Branding Removal**:
  - Removed `"Trader Portal"` / `"व्यापारी कार्यक्षेत्र"` badge from the header in `ConsumerLayout.tsx` and workspace greeting in `ConsumerDashboardPage.tsx`.
- **Settings Page Clean Header & Modal Edit Dialogs**:
  - Removed `"Statutory Account"` (`वैधानिक खाता`) badge from `SettingsPage.tsx` header.
  - Refactored Personal Credentials & Profile into an elegant view mode showing registered details with a dedicated `"Edit Details"` button.
  - Implemented responsive modal `<Dialog>` box (`Edit Account Credentials`) for editing Full Name and Contact Mobile Number with strict read-only lock for the registered email address and instant `refreshProfile()` synchronization.
  - Implemented responsive modal `<Dialog>` box (`Change Password`) for security credentials management with eye visibility toggles.
- **Zero Build Regressions**:
  - Full monorepo build and all workspaces passed cleanly (`exit code 0`).

---

## [1.9.33] - Universal User Settings & Credentials Management Across Web and Mobile Apps — 2026-09-14

- **Backend Endpoints & Immutability Enforcement**:
  - Implemented `updateCredentialsSchema` and `changePasswordSchema` in `@sih/shared`.
  - Added `PATCH /api/v1/users/credentials` in `server`: updates full name and phone number; strictly validates that email cannot be changed (`400 Bad Request: Email address is statutory and cannot be modified`); validates phone uniqueness (`409 Conflict`).
  - Added `POST /api/v1/users/change-password` in `server`: verifies existing password with `bcryptjs`, enforces security complexity, hashes new password with cost factor 12, and creates structured audit trail logs.
- **Web Client Settings Page (`SettingsPage.tsx`)**:
  - Built a daylight Government of India settings page in `client/src/features/settings/SettingsPage.tsx`.
  - **Credentials Card**: Displays registered email ID in read-only / disabled state with a lock icon and statutory explanation; allows editing full name and contact phone with inline validation and dynamic `refreshProfile()` synchronization.
  - **Password Management Card**: Secure password change form with current password, new password, and confirmation password inputs, each featuring password reveal eye toggles (`Eye` / `EyeOff`).
- **Web Navigation Integration Across All 3 Portals**:
  - **Consumer Portal**: Added `/settings` route to `ConsumerApp.tsx`, added `Settings` to primary navigation bar in `ConsumerLayout.tsx`, and wrapped trader profile header pill with a link to `/settings`.
  - **Admin Portal**: Added `/settings` and `/admin/settings` routes to `AdminApp.tsx`.
  - **Field Portal**: Added `/settings` and `/field/settings` routes to `FieldApp.tsx`.
  - **Shared Navigation**: Added Settings nav item in `Sidebar.tsx` (desktop and mobile drawer), linked bottom profile footer card with a Settings button, added Settings button in `TopBar.tsx`, and indexed Settings in `GlobalSearchDialog.tsx` (`⌘K`).
- **Mobile Workstation Overhaul (`mobile`)**:
  - Added `Settings` and `Lock` vector icons in `mobile/src/components/ui/icons.tsx`.
  - Enhanced `SettingsScreen.tsx`: Added personal credentials card with locked read-only email, editable name, and editable phone; added password change card with eye visibility toggles for all fields.
  - Added 4th bottom navigation tab (**Settings** / **सेटिंग्स**) in `mobile/App.tsx` with smooth spring scale animations.
  - Added "Account Settings & Credentials" action in `OfficerHeader.tsx` profile sheet for 1-tap navigation.
- **Dynamic Bilingual Support**:
  - Added full English and Hindi translations across web and mobile locale files (`en.json`, `hi.json`).
- **Zero Build Regressions**:
  - Full monorepo build passes cleanly (`npm run build --workspaces --if-present` exit code 0) and mobile typecheck passes (`npm run typecheck --workspace=@sih/mobile` exit code 0).

---

## [1.9.32] - Live Application Tracker Clean Layout, Height Synchronization & Icon Centering — 2026-09-13

- **Clean Daylight Layout Restored**:
  - Reverted rejected heavy navy banner headers and 4-stage workflow preview grids from the Live Application Tracker section in [`ConsumerLandingPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/pages/ConsumerLandingPage.tsx), restoring the clean, uncluttered card structure.
- **Input & Button Height Synchronization**:
  - Removed conflicting responsive `sm:h-8` constraint from the base [`Input`](file:///Users/Sumit/Desktop/sih/client/src/components/ui/input.tsx) component, eliminating the root cause of the height mismatch where desktop viewports were shrinking the input to 32px.
  - Aligned both the application number input and the search submit button to identical height (`h-11 sm:h-11`, 44px) with `items-stretch sm:items-center` in [`ConsumerLandingPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/pages/ConsumerLandingPage.tsx).
- **Search Icon Centering Fix**:
  - Wrapped the `<Search>` icon inside `<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 z-10">` with `pl-10` on the input, locking the icon strictly to the vertical center of the input field and preventing it from overflowing or sticking out.
- **Quick Test Option Completely Removed**:
  - Completely removed the sample reference numbers and "Quick Test" button from [`ConsumerLandingPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/pages/ConsumerLandingPage.tsx).
  - Initialized `trackInput` state to empty string (`""`) so placeholder hints render cleanly without pre-filled mock test strings.
- **Tracked Application Card Preserved**:
  - Maintained clean 4-stage progression stepper with connecting background rails and dynamic emerald progress fill line when an application reference is submitted, alongside bento detail cards for instrument specifications and inspection parameters.
- **Zero Build Regressions**:
  - Full monorepo build passes cleanly (`npm run build --workspaces --if-present` exit code 0).

---

## [1.9.31] - User App Header Branding Alignment with National Verification Portal — 2026-09-13

- **Header Branding Alignment**:
  - Updated the branding title in [`ConsumerLayout.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/ConsumerLayout.tsx) to `"eLMV — National Verification & Stamping Portal"` (Hindi: `"eLMV — राष्ट्रीय ऑनलाइन सत्यापन एवं मुद्रांकन पोर्टल"` via `consumerLanding.header.portalTitle`).
  - Updated the statutory legal subtitle in [`ConsumerLayout.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/ConsumerLayout.tsx) to `"Statutory Portal under the Legal Metrology Act, 2009 (Act No. 1 of 2010)"` (Hindi: `"विधिक मापविज्ञान अधिनियम, 2009 (2010 का अधिनियम सं. 1) के अंतर्गत वैधानिक पोर्टल"` via `consumerLanding.header.portalSubtitle`).
  - Preserved the prominent Trader Portal badge (`व्यापारी कार्यक्षेत्र` / `Trader Portal`) next to the national portal title.
- **Dynamic Bilingual Support**:
  - Confirmed seamless instant bilingual updates across language toggles (`English` / `हिन्दी`).
- **Zero Build Regressions**:
  - Full monorepo build passes cleanly (`npm run build --workspaces --if-present` exit code 0).

---

## [1.9.30] - Smooth Animated Focus Halo on Input Fields Across Web App — 2026-09-13

- **Fluid Focus Halo & Ring Transitions**:
  - Suppressed default instant browser focus outlines (`outline: none !important`) across all `<input>`, `<textarea>`, and `<select>` controls globally in [`client/src/index.css`](file:///Users/Sumit/Desktop/sih/client/src/index.css).
  - Introduced fluid 250ms–300ms ease-out transitions (`transition: border-color 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)`) globally.
  - Upgraded core [`Input`](file:///Users/Sumit/Desktop/sih/client/src/components/ui/input.tsx) component with `outline-none transition-all duration-300 ease-out focus:ring-4 focus:ring-[#0B2545]/15 focus:border-[#0B2545] rounded-xl`.
  - Harmonized inputs across all login, registration, and dialog modal views.
- **Zero Build Regressions**:
  - Full monorepo build passes cleanly (`npm run build --workspaces --if-present` exit code 0).

---

## [1.9.29] - User App Dialog Synchronization & Granular Auth Error Reporting Across Web and Mobile Apps — 2026-09-13

- **Modal Dialog Modernization & Synchronization**:
  - Upgraded core [`dialog.tsx`](file:///Users/Sumit/Desktop/sih/client/src/components/ui/dialog.tsx) container with crisp Government daylight styling: pure white card (`bg-white border-slate-200 shadow-2xl rounded-2xl p-6 sm:p-7`), deep navy backdrop (`bg-[#0B2545]/40 backdrop-blur-xs`), Government Navy title (`text-[#0B2545] font-black text-lg`), and subtle divider footer (`border-t border-slate-100 mt-5 pt-4`).
  - Harmonized [`RegisterInstrumentDialog.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/instruments/RegisterInstrumentDialog.tsx) with rounded-xl inputs, clear form labels (`text-slate-800 font-semibold text-xs`), Government Navy primary CTA button (`bg-[#0B2545] hover:bg-[#133966] text-white font-bold rounded-xl h-9 px-4 text-xs`), and an alert error banner with `AlertCircle`.
  - Harmonized [`SubmitApplicationDialog.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/applications/SubmitApplicationDialog.tsx) with rounded-xl selects and inputs, dynamic fee breakdown container (`bg-slate-50 border border-slate-200 rounded-xl p-3.5`), Government Navy primary CTA, and alert error banner with `AlertCircle`.
  - Harmonized [`ScheduleInspectionDialog.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/applications/ScheduleInspectionDialog.tsx) with matching daylight input styles and error alert banners.
- **Granular Server-Side Authentication Error Messaging**:
  - In [`server/src/modules/auth/auth.service.ts`](file:///Users/Sumit/Desktop/sih/server/src/modules/auth/auth.service.ts), differentiated authentication failures:
    - If email is not registered: throws `"No account found with this email address. Please check your email or register."`
    - If password does not match: throws `"Invalid password. Please check your password and try again."`
    - If account is inactive: throws `"This account has been deactivated. Please contact administration."`
- **Web & Mobile Error Surfacing**:
  - In [`client/src/context/AuthContext.tsx`](file:///Users/Sumit/Desktop/sih/client/src/context/AuthContext.tsx), [`LoginPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/auth/LoginPage.tsx), and [`RegisterPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/auth/RegisterPage.tsx), extracted and rendered backend error messages (`err.response?.data?.error?.message || err.message`) directly in user-facing error banners.
  - In [`mobile/src/lib/auth.tsx`](file:///Users/Sumit/Desktop/sih/mobile/src/lib/auth.tsx) and [`mobile/src/screens/LoginScreen.tsx`](file:///Users/Sumit/Desktop/sih/mobile/src/screens/LoginScreen.tsx), extracted and surfaced the exact backend error message directly in native `Alert.alert("Sign In Failed", msg)`.
- **Zero Build Regressions**:
  - Full monorepo build passes cleanly (`npm run build --workspaces --if-present` exit code 0).

---

## [1.9.28] - Elimination of "Verify Certificate" from User App Navigation — 2026-09-13

- **Navigation & Routing Streamlining**:
  - Removed the "Verify Certificate" (`/verify`) navigation link and `ShieldCheck` icon from [`ConsumerLayout.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/ConsumerLayout.tsx).
  - Pruned unused `ShieldCheck` import from `lucide-react`.
  - Removed `/verify` and `/consumer/verify` route definitions from under authenticated `<ConsumerLayout />` in [`ConsumerApp.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/ConsumerApp.tsx).
  - Trader portal navigation now focuses exclusively on operational features: **Portal Home**, **Overview / Dashboard** (`/dashboard`), **My Instruments** (`/instruments`), and **My Applications** (`/applications`).
- **Zero Build Regressions**:
  - Full monorepo build passes cleanly (`npm run build --workspaces --if-present` exit code 0).

---

## [1.9.27] - Elimination of Footers in User App (Landing Page Only) — 2026-09-13

- **User App Footer Elimination**:
  - Removed the statutory Government footer from [`ConsumerLayout.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/ConsumerLayout.tsx), leaving full viewport vertical space dedicated to trader workflows (Dashboard, Instruments, Applications, Verify).
  - Removed the statutory Government footer from [`AuthLayout.tsx`](file:///Users/Sumit/Desktop/sih/client/src/components/layout/AuthLayout.tsx), streamlining the login and registration views.
- **Exclusivity to Landing Page**:
  - Preserved the full official statutory Government footer exclusively on [`ConsumerLandingPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/consumer/pages/ConsumerLandingPage.tsx).
- **Zero Build Regressions**:
  - Full monorepo build passes cleanly (`npm run build --workspaces --if-present` exit code 0).

---

## [1.9.26] - Password Visibility Toggle ("View Password" Eye Icon) Integration — 2026-09-13

- **Interactive Password Visibility Toggles**:
  - Integrated show/hide password buttons with dynamic `Eye` and `EyeOff` icons from `lucide-react` across all web app password inputs:
    - [`LoginPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/auth/LoginPage.tsx): Consumer/Trader login form.
    - [`RegisterPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/auth/RegisterPage.tsx): Consumer/Trader registration form.
    - [`OfficerManagementPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/admin/pages/OfficerManagementPage.tsx): Admin LMO provisioning modal.
    - [`GatcAgencyManagementPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/admin/pages/GatcAgencyManagementPage.tsx): Admin GATC agency provisioning modal.
    - [`GatcStaffPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/portals/admin/pages/GatcStaffPage.tsx): GATC inspector staff provisioning modal.
  - Implemented accessibility labels (`aria-label`, `title`) and smooth focus/hover transitions.
- **Zero Build Regressions**:
  - Full monorepo build passes cleanly (`npm run build --workspaces --if-present` exit code 0).

---

## [1.9.25] - Login Layout Branding Alignment with National Verification Portal — 2026-09-13

- **Authentication Header Strict Localization (`RegisterPage.tsx`, `LoginPage.tsx`)**:
  - Eliminated mixed dual-language text `"व्यापारी पंजीकरण • Trader Registration"` from the registration page header.
  - Eliminated mixed dual-language text `"व्यापारी लॉगिन • Trader Sign In"` from the sign-in page header.
  - Configured `t("auth.registerTitle")` and `t("auth.loginHeading")` to dynamically render purely Hindi or purely English based on the user's active locale selection.
- **Locale Dictionary Updates (`en.json` & `hi.json`)**:
  - Added `"registerTitle": "Trader Registration"` and `"loginHeading": "Trader Sign In"` to `en.json`.
  - Added `"registerTitle": "व्यापारी पंजीकरण"` and `"loginHeading": "व्यापारी लॉगिन"` to `hi.json`.
- **Zero Build Regressions**:
  - Full monorepo build passes cleanly (`npm run build --workspaces --if-present` exit code 0).

---

## [1.9.23] - User App UI Harmonization with Government Landing Page Design System — 2026-09-13

- **Dedicated Government Consumer Layout (`ConsumerLayout.tsx`)**:
  - Re-architected authenticated consumer portal shell (`/dashboard`, `/instruments`, `/applications`, `/verify`) with official Government of India visual hierarchy.
  - Implemented top National Tricolor saffron-white-green strip (`#FF9933` / `#FFFFFF` / `#138808`).
  - Added Government Navy top utility bar (`bg-[#0B1E3B]`) with Indian Flag, "भारत सरकार | Government of India", and English/Hindi bilingual language toggle.
  - Added State Emblem of India (`/emblem.jpeg`) white branding header with official ministry typography, "National Verification Portal For Measuring Instruments", and authenticated "Trader Portal" badge with Sign Out action.
  - Replaced generic SaaS sidebar with horizontal Government Navy navigation bar (`#0B1E3B`) featuring active amber/gold indicators (`border-b-2 border-amber-400 text-amber-300`).
  - Integrated official statutory Government footer (`bg-[#071326]`) with NCH Helpline (`1800-11-4000`), quick links, and GIGW compliance statement.
- **Portal Routing Migration (`ConsumerApp.tsx`)**:
  - Replaced generic `<AppShell />` with `<ConsumerLayout />` across all authenticated consumer routes.
- **Auth Shell Harmonization (`AuthLayout.tsx`)**:
  - Aligned `/login` and `/register` views with the Government of India design system: Tricolor bar, State Emblem header, daylight mode (`bg-[#F8FAFC]`), language toggle, and statutory copyright footer.
- **Login & Registration Pages Modernization (`LoginPage.tsx`, `RegisterPage.tsx`)**:
  - Modernized card styling with clean white surfaces (`bg-white border border-slate-200 shadow-sm`), Government Navy primary action buttons (`bg-[#0B2545] hover:bg-[#133966] text-white font-bold rounded-xl`), and crisp slate typography.
- **Dashboard & Feature Pages Harmonization (`DashboardPage.tsx`, `InstrumentListPage.tsx`, `ApplicationListPage.tsx`)**:
  - Updated KPI metric cards to clean white surfaces with tinted icon badge containers (`bg-blue-50 text-blue-700`, `bg-emerald-50 text-emerald-700`, `bg-amber-50 text-amber-700`).
  - Standardized all primary CTAs ("New Application", "Register Instrument") to Government Navy buttons.
  - Enforced zero hover lift (`hover:shadow-md`, no `hover:-translate-y-*`).
- **Strict Daylight Theme Enforcement**:
  - Configured mount hook to remove `dark` class from `<html>` and set `localStorage.setItem("theme_mode", "light")`.
- **Zero Build Regressions**:
  - Full monorepo build passes cleanly (`npm run build --workspaces --if-present` exit code 0).

---

## [1.9.22] - Elimination of National & State Transparency Metrics Section — 2026-09-13

- **Removed Transparency Metrics Section (`ConsumerLandingPage.tsx`)**:
  - Removed `<section id="transparency">` ("National & State Transparency Metrics") entirely from the consumer landing page.
  - Streamlined page flow directly from Statutory Fee Calculator (`#calculator`) to Section 24 Statutory Guidelines (`#act`).
  - Renumbered succeeding section comments to maintain clean code architecture.
- **Locale Dictionary Harmonization (`en.json` & `hi.json`)**:
  - Pruned unused `consumerLanding.stats` object from both English and Hindi localization files.
  - Maintained 100% key synchronization (142/142 keys with 0 missing).
- **Zero Build Regressions**:
  - Full monorepo build passes cleanly (`npm run build --workspaces --if-present` exit code 0).

---

## [1.9.21] - Citizen & Commercial Metrology Services Card Hover Motion Elimination — 2026-09-13

- **Card Hover Elevation & Lift Elimination (`ConsumerLandingPage.tsx`)**:
  - Removed `hover:-translate-y-1.5` across all 6 service cards in `<section id="services">` (Track Status, Helpline, Apply for Stamping, Registry, Statutory Fee Calculator, and Section 24 Guide).
  - Replaced `hover:shadow-xl hover:-translate-y-1.5` with grounded, non-lifting `hover:shadow-md` while preserving smooth border highlighting.
  - Keeps cards completely static and stable under cursor movement, adhering to official Government of India portal design standards.
- **Zero Build Regressions**:
  - Full monorepo build passes cleanly (`npm run build --workspaces --if-present` exit code 0).

---

## [1.9.20] - Night Theme Deactivation & Pure Daylight Government Theme Enforcement — 2026-09-13

- **Enforced Light Mode & Deactivated Night Mode (`ConsumerLandingPage.tsx`)**:
  - Configured `useEffect` on mount to strictly remove `"dark"` from `document.documentElement.classList` and enforce `"light"` in `localStorage.setItem("theme_mode", "light")`.
  - Removed `isDark` state and the Dark / Light toggle button from the top utility bar.
  - Pruned unused `Sun` and `Moon` icon imports from `lucide-react`.
- **Daylight Government Hero Banner Overhaul (`ConsumerLandingPage.tsx`)**:
  - Replaced the dark navy `#081830` and `#0B1E3B` hero container and `bg-slate-900` black cards with an authoritative light theme banner (`bg-[#F8FAFC]` with white cards, dark slate typography `text-[#0B2545]`/`text-slate-900`, clean amber/navy CTAs, and subtle borders).
- **Stripped All 74 `dark:` Classes (`ConsumerLandingPage.tsx`)**:
  - Completely purged all `dark:` tailwind variants across the entire component, making the public landing page 100% immune to dark mode.
- **Zero Build Regressions**:
  - Full monorepo build passes cleanly (`npm run build --workspaces --if-present` exit code 0).

---

## [1.9.19] - Landing Page Cleanse: Elimination of View Certificate & QR Code Mentions — 2026-09-13

- **Elimination of View / Verify Certificate CTAs (`ConsumerLandingPage.tsx`)**:
  - Removed the "Verify Certificate / QR Code" button from the Hero banner, establishing clear focus on primary trader applications and application tracking.
  - Replaced Card 2 in Citizen Services ("Verify Certificate & QR Seal") with "Consumer Helpline & Grievances" (`services.helpdesk`), linking directly to the `#contact` helpline section with `PhoneCall` icon.
  - Removed the "View Stamped Certificate" button containing `<QrCode>` from the Live Application Tracker result card, preserving clean certificate metadata (certificate number, validity date).
- **Purge of All QR Code References (`ConsumerLandingPage.tsx`, `en.json`, `hi.json`)**:
  - Replaced "ISO/IEC 18004 Tamper-Proof QR Seals" in the hero footnote bar with "Legal Metrology (General) Rules, 2011".
  - Updated Statewide Transparency Metrics subtitle from "PKI Signed & QR Sealed" to "PKI Signed & Digitally Verified".
  - Removed unused `QrCode` icon import from `lucide-react`.
  - Updated narrative descriptions across `hero` and `aboutElmv` namespaces in English and Hindi to remove all mentions of QR seals.
- **Locale Dictionary Harmonization (`en.json` & `hi.json`)**:
  - Removed `verifyBtn` from `hero`, `viewCert` from `tracker`, `nav.verifyCert`, and replaced `services.verify` with `services.helpdesk`.
  - 100% key parity verified: 117/117 unique translation keys matched across both languages with 0 missing keys.
- **Zero Build Regressions**:
  - Full monorepo build passes cleanly (`npm run build --workspaces --if-present` exit code 0).

---

## [1.9.18] - Statutory Advisory Continuous Running Ticker Marquee — 2026-09-13

- **Continuous Running Statutory Marquee (`ConsumerLandingPage.tsx`, `index.css`)**:
  - Replaced the static truncated paragraph in the statutory advisory banner with a hardware-accelerated continuous running marquee (`.animate-ticker`).
  - Added `@keyframes ticker-marquee` with `translate3d(0, 0, 0)` to `translate3d(-50%, 0, 0)` in `client/src/index.css`.
  - Rendered dual synchronized text spans with separator bullets (`•`) for an infinite seamless loop with zero blanks or stutter.
  - Implemented pause-on-hover interaction (`hover:[animation-play-state:paused]`), allowing readers to pause the advisory by hovering over the text.
  - Retained strict Government of India high-contrast advisory styling (`bg-amber-50`, red statutory alert badge, high-contrast typography).
- **Zero Build Regressions**:
  - Monorepo build passes cleanly (`npm run build --workspaces --if-present` exit code 0).

---

## [1.9.17] - Consumer Hero Section Slideshow Elimination & Focused Value Banner — 2026-09-13

- **Eliminated Hero Announcement Slideshow (`ConsumerLandingPage.tsx`)**:
  - Removed carousel rotation timers, state (`currentSlide`, `isCarouselPaused`, `carouselTimerRef`), previous/play/next toolbar buttons, slide indicators, and slide counter.
  - Pruned unused React hooks (`useRef`) and Lucide icon imports (`ChevronLeft`, `Pause`, `Play`).
- **Single High-Impact Government Value Proposition Banner (`ConsumerLandingPage.tsx`)**:
  - Installed a static, authoritative Government of India hero banner in solid `#0B1E3B` and `#081830` with high-contrast typography and zero gradients.
  - Banner prominently informs users and traders on:
    - **How easy it is to get certified**: 3-step digital process (paperless application, scheduled site inspection, instant digital certificate issuance).
    - **How easily instruments are verified**: 1-click smartphone QR scanning, zero-login requirement, real-time cryptographic audit (ECDSA NIST P-256).
  - High-visibility action buttons for applying online, public QR verification (`/verify`), and live application tracking (`#track`).
- **Locale Dictionary Harmonization (`en.json` & `hi.json`)**:
  - Consolidated `hero` namespace across both English and Hindi, pruned obsolete `carousel` namespace, and resolved duplicate keys.
  - Verified 119/119 translation keys in `ConsumerLandingPage.tsx` with 0 missing keys.
- **Zero Build Regressions**:
  - Full monorepo build passes cleanly (`npm run build --workspaces --if-present` exit code 0).

---

## [1.9.16] - Consumer Landing Page Polish (Navbar Decoupling & Pre-Section Badges Purge) — 2026-09-13

- **Removed 'Act No. 1 of 2010 • Central Portal' Badge (`ConsumerLandingPage.tsx`)**:
  - Removed the pulsing green indicator badge from the top sticky navigation bar to give the menu links clean, focused breathing room.
- **Removed 'Verify Certificate' Nav Link & Duplicate Section (`ConsumerLandingPage.tsx`)**:
  - Removed `<Link to="/verify">Verify Certificate</Link>` from the primary navigation bar, aligning the navbar strictly to on-page smooth scroll anchors (`#hero`, `#about`, `#services`, `#track`, `#calculator`, `#act`).
  - Removed the duplicate Quick Certificate / QR Verification spotlight section (`<section id="verify">`), eliminating clutter and redirecting certificate verification to dedicated service cards and the `/verify` portal.
  - Cleaned up unused `certInput`, `handleCertSubmit`, and `useNavigate` imports/declarations.
- **Purged All Pre-Section Promotional Badges (`ConsumerLandingPage.tsx`)**:
  - Removed artificial sentence badges before sections (`ONLINE STATUTORY SERVICES`, `Instant Public Service`, `Legal Metrology (General) Rules, 2011 • Rule 14`, `National Metrology Dashboard`, `STATUTORY APPARATUS • LEGAL METROLOGY ACT, 2009`, `MANDATORY STATUTORY OBLIGATION`).
  - Sections now lead directly with authentic, authoritative government headings.
- **Locale Dictionary Synchronization (`en.json` & `hi.json`)**:
  - Pruned unused `services.sectionBadge` keys across both languages; all 112 active translation keys verified with 0 missing keys.
- **Zero Build Regressions**:
  - Full monorepo build (`npm run build --workspaces --if-present`) passes cleanly with exit code 0.

---

## [1.9.15] - Consumer Landing Page Content Reversion & De-Gradienting Refactor — 2026-09-13

- **Extraneous Content Sections Reverted (`ConsumerLandingPage.tsx`)**:
  - Reverted the 4 heavy legal text sections (`#mandate`, `#rules`, `#packaged-commodities`, `#rrsl`) that bloated the landing page per user request.
  - Cleaned up top navigation bar links back to the streamlined list (`#hero`, `#about`, `#services`, `#track`, `/verify`, `#calculator`, `#act`), allowing immediate, friction-free access to public verification tools.
- **De-Gradienting & Elimination of AI Look (`ConsumerLandingPage.tsx`)**:
  - Purged 100% of gradients (`bg-gradient-to-*`) and gradient-clipped typography (`bg-clip-text text-transparent`) across the entire consumer landing page.
  - Replaced hero carousel slide gradients with solid, high-contrast statutory navy and dark tones (`#0B1E3B`, `#08221B`, `#101B2B`).
  - Rendered hero headlines in bold, authoritative solid white typography (`text-white font-black`).
  - Replaced gradient CTA buttons with solid high-visibility amber (`bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold`).
  - Removed all `radial-gradient` dot matrix background textures.
  - Replaced Minister profile gradient card with solid `bg-white dark:bg-slate-900 border border-border shadow-sm`, and removed neon glowing blur rings and floating award badges.
  - Replaced gradient icon wrappers across all 6 Citizen & Trader Services cards with crisp solid tinted badges (`bg-blue-50 text-blue-700`, `bg-emerald-50 text-emerald-700`, etc.).
  - Replaced Fee Calculator summary and Certificate Verification gradients with solid statutory surfaces (`#0B1E3B`, `bg-slate-50`).
- **Locale Dictionary Synchronization (`en.json` & `hi.json`)**:
  - Pruned unused translation keys and verified 100% synchronization across both languages with zero missing keys (116/116 keys verified via automated script).
- **Zero Build Regressions**:
  - Full monorepo build (`npm run build --workspaces --if-present`) passes with exit code 0.

---

## [1.9.14] - Consumer Landing Hero & Header Streamlining — 2026-09-13

- **Bilingual i18n Translation Dictionary Completeness (`en.json` & `hi.json`)**:
  - Populated all missing `consumerLanding` keys (`carousel.slide*.badge`, `desc`, `action`, `nav.aboutUs`, `leadership.ministerDesignation`, `leadership.ministry`, `leadership.govt`, and `aboutElmv.pillar*` / `badge` / `learnMore`) in both English and Hindi dictionaries.
  - Eliminated raw fallback key strings (such as `consumerLanding.carousel.slide2.desc`) from appearing on the screen when viewing carousel slides and content sections.
- **Sticky Header Scroll Glitch Fix (`ConsumerLandingPage.tsx`)**:
  - Removed `sticky -top-12 z-40` from the branding `<header>`, allowing it and the top tricolor utility ribbon to scroll out of view smoothly with normal document flow.
  - Elevated the primary government navigation bar to `sticky top-0 z-40` with solid backdrop blur, ensuring the sticky navy nav pins cleanly to the top without partial header visibility or clipping artifacts.
- **Reverted Hero Section to Edge-to-Edge Full-Bleed Layout (`ConsumerLandingPage.tsx`)**:
  - Reverted the hero announcement carousel container from the floating rounded island back to edge-to-edge full-bleed presentation, matching the contiguous national portal style.
  - Restored the full-width advisory ticker directly beneath the hero section with a clean bottom border (`border-b`).
- **Header Government Attribution Removal (`ConsumerLandingPage.tsx`)**:
  - Removed the uppercase *"GOVERNMENT OF INDIA"* / *"भारत सरकार | GOVT. OF INDIA"* attribution line from the main branding header, focusing the header strictly on the official State Emblem and portal titles.
- **Header Statutory Badge Removal (`ConsumerLandingPage.tsx`)**:
  - Removed the green `"Statutory"` pill badge located in the official branding header, delivering a clean and uncluttered typography hierarchy.
- **Hero Glass Showcase Card Removal (`ConsumerLandingPage.tsx`)**:
  - Removed the right-column statutory showcase card containing *"Legal Metrology / Legal Metrology Act, 2009 / Section 24 Mandatory / Public SLA 5-14 Days / Scan QR Seal"* from the floating hero carousel banner.
  - Adjusted the carousel slide content container to a spacious, well-proportioned `max-w-4xl` layout, allowing headlines, descriptions, action buttons, and statutory compliance pills to breathe naturally across all viewport sizes.
  - Preserved all interactive buttons (tracking jump, QR verify portal navigation, citizen services anchor, and trader login/dashboard) and carousel navigation controls.

---

## [1.9.13] - Consumer Web Portal Landing Page Modernization (Government of India Architecture) — 2026-09-12

### Added & Redesigned
- **Premier Government of India Portal Header Architecture (`ConsumerLandingPage.tsx`)**:
  - Incorporated authentic Ashok Stambh State Emblem of India (`/emblem.jpeg`) with dual ministry attribution (`भारत सरकार | Government of India`).
  - Streamlined header layout by removing the global search bar, Swachh Bharat logo, and Digital India logo, keeping the top branding uncluttered, balanced, and focused on official identity, helpline (`1915`), and trader access.
- **Top Utility Strip**:
  - Maintained instant English/Hindi bilingual toggle (`Globe`) and theme switcher (Dark/Light), removing the font resize controls ($A^-$, $A$, $A^+$) for a minimal, clean top strip.
- **Primary Government Horizontal Navigation Bar**:
  - Deep statutory navy background (`#0B1E3B`) with active underline indicators (`amber-400` / `sky-400`), smooth anchor jumping across `#hero`, `#about`, `#services`, `#track`, `/verify`, `#calculator`, `#act`, and `#transparency`.
  - Re-architected hero banner as a floating rounded island card (`rounded-2xl sm:rounded-3xl`, `shadow-2xl`, with side margins) rather than edge-to-edge full-bleed, providing a clean contemporary look with comfortable breathing room.
  - Built an automated hero slider (6.5s timer) inspired by official NIC portal layouts, featuring slide badges, high-impact headlines, regulatory descriptions, CTA action buttons, and a Government of India metrology seal showcase card.
  - Provided complete control toolbar with previous (`<`), pause/play toggle, next (`>`), and interactive slide indicator dots.
- **Leadership & "About Legal Metrology Division (eLMV)" Section**:
  - Designed leadership profile card for Hon'ble Minister Shri Pralhad Joshi (Ministry of Consumer Affairs, Food and Public Distribution) with portrait, portfolio, and consumer protection mission statement.
  - Crafted "About Legal Metrology Division" overview with signature deep-indigo horizontal accent bar and 3 statutory strategic pillars (Legal Metrology Act 2009, Mandatory Section 24 Verification, and Tamper-Proof Digital Seals).
- **Modern Visual Polish & Interactive Aesthetics**:
  - Implemented sleek glassmorphic overlays (`backdrop-blur-xl`, `bg-white/10`, `border-white/20`), ambient lighting with radial dot textures, and high-contrast typography.
  - Enhanced the hero showcase with a floating 3D-styled glass card, verified golden metrology badge, and live SLA window.
  - Redesigned the 6-card citizen services section with colorful gradient icon backdrops, hover lift interactions (`hover:-translate-y-1.5`), and animated arrow transitions.
  - Upgraded the Minister leadership card with an elevated double-border gradient glow, official award checkmark badge, and elegant quote styling.
  - Upgraded the Application Tracker and Fee Calculator cards into sleek high-tech interactive terminals with connected progression lines and glowing active steps.
- **Preserved Core Interactive Features**:
  - Retained live application tracker with direct backend API verification (`/verification/track/:num`), 4-stage visual progression stepper, and certificate download shortcuts.
  - Retained statutory Schedule XII / Rule 14 fee calculator across all 6 equipment categories.
  - Verified 100% build compatibility (`npm run build --workspaces`).

---

## [1.9.12] - Green Button Label Simplification to "Verify" — 2026-09-12

### Changed
- **Simplified Green Inspection Action Button (`InspectionModal.tsx`)**:
  - Replaced the verbose label `"Verify, Sign & Issue Certificate"` on the primary green button with concise `"Verify"` (*"सत्यापित करें"*).
  - Updated submitting progress label to `"Verifying..."` (*"सत्यापित हो रहा है..."*).
- **Synchronized Locale Dictionaries (`en.json` & `hi.json`)**:
  - Updated `inspection.submitPassed` and `inspection.submittingPassed` across `@sih/mobile` and `@sih/client`.
- **Public Verification Screen Alignment (`VerifyScreen.tsx`)**:
  - Updated primary search action button from `"Verify Authenticity"` to `"Verify"` (*"सत्यापित करें"*).

---

## [1.9.11] - Mobile Inspection Modal Photo Proof Upload & Button Height Polish — 2026-09-12

### Added & Changed
- **Interactive Photo Proof Uploader (`mobile/src/components/officer/InspectionModal.tsx`)**:
  - Replaced the image URL text input with an interactive photo proof upload option.
  - When no photo is selected, presents a clean dashed upload target card with camera icon, title, and bilingual subtitle (*"Tap to capture on-site verification photo"*).
  - Tapping directly opens the native camera (with automated permission checks), completely removing the artificial sample evidence option.
  - Built-in fullscreen on-site `CameraView` capture submodal with corner framing guides, torch switcher, and shutter trigger button.
  - When a photo is captured, displays an official preview card with image thumbnail, evidence filename (`evidence_<appNumber>.jpg`), verified green status badge, and one-tap remove button.
- **Enhanced Footer Button Touch Ergonomics (`mobile/src/components/officer/InspectionModal.tsx`)**:
  - Increased bottom modal button height to 44px (up from 32px `size="sm"`), meeting standard mobile touch ergonomics guidelines.
  - Preserved color hierarchy: clean neutral outline for "Cancel", bold green solid for "Verify, Sign & Issue Certificate" when passed, and red solid for rejection.

---

## [1.9.10] - Mobile Verification Screen Cleanup — 2026-09-12

### Changed & Removed
- **Scan Statutory QR Code Card Cleanup (`mobile/src/screens/VerifyScreen.tsx`)**:
  - Removed the green `"CAMERA"` / `"कैमरा"` pill badge (`scanPill`) alongside the camera icon from the Scan Statutory QR Code card header, keeping the card title clean and minimal.
- **Input Field Icon Cleanup (`mobile/src/screens/VerifyScreen.tsx`)**:
  - Removed the inline scan QR logo (`Icons.QrCode` button) from the right side of the certificate/token input field wrapper, preventing visual redundancy with the dedicated scanner card above.
- **Pruned Unused Styles (`mobile/src/screens/VerifyScreen.tsx`)**:
  - Removed orphaned styles `scanQrTitleRow`, `scanPill`, `scanPillText`, and `inlineQrBtn`.

---

## [1.9.9] - Removal of Redundant "Awaiting Sign" Stage & Auto-Sign Workflow Consolidation — 2026-09-12

### Changed & Removed
- **Eliminated "To Sign" / "Awaiting Sign" Category on Mobile (`@sih/mobile`)**:
  - `mobile/src/screens/RosterScreen.tsx`:
    - Removed the `"To Sign"` filter tab (`tabItems`), reducing tabs to four clear categories: **All**, **Scheduled**, **Certified**, and **Rejected**.
    - Updated `FALLBACK_APPLICATIONS` demo record `demo-app-3` from `ApplicationStatus.INSPECTED` to `ApplicationStatus.CERTIFIED` with an official certificate (`LM-RJ-2026-0000003`), eliminating stranded unsigned records.
  - `mobile/src/components/officer/MetricCounters.tsx`:
    - Replaced the middle `"To Sign"` counter column with **Total Pipeline** (`totalCount`), providing a balanced 3-column metric card (`Due Today`, `Certified`, `Total`).
  - `mobile/src/components/officer/RosterCard.tsx`:
    - Removed the redundant `status === ApplicationStatus.INSPECTED` (`"Sign & Issue"`) button and confirmation alert.
  - `mobile/src/components/officer/ApplicationDrawer.tsx`:
    - Removed the manual `"Digitally Sign & Issue"` primary CTA button and simplified the badge mapper.
- **Eliminated "Awaiting Signature" Category on Web (`@sih/client`)**:
  - `client/src/portals/field/pages/FieldRosterPage.tsx`:
    - Removed the `"Awaiting Signature"` KPI card, consolidating the grid into 3 clean, responsive cards (**Today's Visits**, **Certified**, **Total Pipeline**).
    - Removed the `"Awaiting Signature"` filter tab, simplifying roster tabs to **Pending Visits**, **Certified & Stamped**, and **All**.
    - Removed the manual `"Digitally Sign & Issue Certificate"` card action button and pruned unused mutation hooks (`issueCertMutation`, `issuingId`) and icons (`ShieldCheck`, `Loader2`).
- **Seamless 1-Step Verification Alignment**:
  - Fully aligns the frontend presentation with the automated signing flow (`RecordInspectionDialog.tsx` and `InspectionModal.tsx`), where completing a passing inspection automatically issues and cryptographically signs the certificate immediately.

---

## [1.9.8] - Web Navigation Streamlining & Public Verification Decoupling — 2026-09-12

### Changed & Removed
- **Removed Verify Links from Web Navigation Menus**:
  - `client/src/components/layout/Sidebar.tsx`:
    - Removed the desktop "Public Trust" navigation section containing `t("nav.publicPortal")` and `t("nav.verify")`.
    - Removed the mobile drawer link for `t("nav.publicVerification")`.
    - Removed unused `ShieldCheck` icon import.
  - `client/src/portals/consumer/ConsumerLayout.tsx`:
    - Removed the `"Verify Certificate"` navigation item from top navigation bar `navItems`.
    - Cleaned up unused `ShieldCheck` icon import.
  - `client/src/portals/field/FieldLayout.tsx`:
    - Removed the `"Public Verification"` navigation item from top navigation bar `navItems`.
    - Cleaned up unused `ShieldCheck` icon import.
- **Preserved Public Verification Route & Direct QR/URL Resolution**:
  - The standalone `/verify` and `/verification/verify/:id` routes remain fully operational for QR code scans on physical equipment, printed Schedule XI certificates, and citizen URL resolutions.
  - Retained verified clean builds across all workspaces (`npm run build`) and mobile typecheck with 0 errors.

---

## [1.9.7] - Mobile Camera QR Code Scanner, Button Hierarchy Discipline & Direct Certificate Drawer — 2026-09-12

### Added & Changed
- **Statutory Camera QR Code Scanner (`VerifyScreen.tsx`)**:
  - Integrated `CameraView` and `useCameraPermissions` from `expo-camera` to deliver real-time statutory QR code scanning.
  - Designed an authentic HUD viewfinder overlay with corner reticles, laser scanning line animation, dedicated flashlight torch toggle icon (`Flashlight` / `FlashlightOff`), and dynamic hint banner.
  - Engineered `extractIdentifier` to parse raw tokens, JSON payloads, URLs with parameters (`?token=...`, `?cert=...`), and REST paths (`/verify/:id`).
- **Direct-to-Drawer QR Verification Workflow**:
  - Refactored QR barcode scan handling so scanned certificates immediately open the official Schedule XI Certificate bottom sheet drawer (`CertificateModal.tsx`) directly without polluting or populating the manual search text input.
  - Added dedicated `drawerCertNumber` state ensuring instant, clean certificate fetching and zero state collision with manual searches.
- **Button Visual Hierarchy & Clean Light Card Redesign**:
  - Enforced strict button styling discipline: solid black (`#09090b`) is reserved exclusively for the primary "Verify Authenticity" action button.
  - Redesigned the Scan QR trigger from a heavy black block into a sleek light-themed card (`#ffffff` background, `1.5px` border `#e4e4e7`, soft emerald `#ecfdf5` icon badge, `#059669` icon, dark title, clean streamlined layout without redundant camera pills, and subtle `#f4f4f5` chevron button).
  - Redesigned the secondary **"View Official Schedule XI Certificate"** button into a clean white/bordered button (`#ffffff` background, `#e4e4e7` border, `#18181b` typography and icon).
- **Elimination of Dummy/Demo Scan Buttons**:
  - Completely removed all artificial simulator buttons ("Simulate Demo QR Scan" / "Scan Demo Certificate") from both the camera viewfinder modal and the permission fallback screen for clean, production-grade scanning.
- **Complete Hindi Bilingual Localization (`VerifyScreen.tsx` & `CertificateModal.tsx`)**:
  - Localized main header ("Public Verification" → `"सार्वजनिक सत्यापन"`, statutory subtitle → `"विधिक मापविज्ञान मुहर व सत्यापन प्रमाणपत्रों की वैधानिक जांच"`).
  - Localized search input placeholder (`"उदा. LM-RJ-2026-0000001 या टोकन"`), divider (`"या नंबर द्वारा खोजें"`), camera card badge, and error alerts.
  - Localized cryptographic authenticity banner (`"क्रिप्टोग्राफिक हस्ताक्षर प्रमाणित एवं वैध"`, `"वैध एवं सक्रिय"`, `"अमान्य"`).
  - Localized Schedule XI certificate card headers, summary grid labels (`"प्रमाणपत्र संख्या"`, `"सत्यापन तिथि"`, `"वैधता समाप्ति"`, `"लगाई गई मुहर संख्या"`), and equipment specification keys.
  - Localized MPE physical test evaluation cards, Section 24 statutory notices, digital stamping seals, and drawer action buttons.

---

## [1.9.6] - Unified eLMV Branding, Emblem Relocation & Mobile Login Integration — 2026-09-12

### Added & Changed
- **Unified Monorepo Branding to eLMV**:
  - Replaced legacy application titles and placeholder icons across the web client, mobile app, and shared configurations with clean, standardized **eLMV** (Legal Metrology Verification System) branding.
- **Relocated State Emblem of India Asset**:
  - Relocated user-provided authentic State Emblem (`images.jpeg`) from the project root into canonical asset directories:
    - `client/public/emblem.jpeg` & `client/public/favicon.jpeg`: linked as the HTML favicon in `client/index.html`.
    - `mobile/assets/emblem.jpeg`: rendered in the mobile authentication screen.
- **Mobile Authentication Screen (`LoginScreen.tsx`)**:
  - Integrated the authentic State Emblem with a responsive aspect ratio alongside clean typography for **eLMV**, **GOVERNMENT OF INDIA**, and **Legal Metrology Division**.
  - Updated footer attribution to `"eLMV • Govt. of India"` (English) / `"eLMV • भारत सरकार"` (Hindi).
- **Web Layouts & Landing Pages**:
  - `Sidebar.tsx`: Replaced icons with bold **eLMV** brand mark and statutory subtext in desktop navigation and mobile drawer.
  - `TopBar.tsx`: Updated breadcrumb link to **eLMV**.
  - `LoginPage.tsx` & `RegisterPage.tsx`: Standardized brand headers with 3xl bold **eLMV** wordmark.
  - `ConsumerLandingPage.tsx`: Replaced vector emblem with sleek **eLMV** badge in both the top ministry header and the statutory GIGW footer.
  - `ConsumerLayout.tsx` & `FieldLayout.tsx`: Updated brand headers with **eLMV** and corresponding role badges.
- **Officer Mobile Header (`OfficerHeader.tsx`)**:
  - Replaced the scale icon badge with a prominent 18px bold **eLMV** wordmark accompanied by a certified live status indicator and territorial jurisdiction.
- **Mobile Configuration & Internationalization**:
  - `mobile/app.json`: Updated app name to `"eLMV"`, slug to `"elmv"`, and customized camera permission strings.
  - `mobile/App.tsx`: Updated initial workstation loading status to `"Initializing eLMV Station..."`.
  - `mobile/src/i18n/locales/en.json` & `hi.json`: Standardized `"appName"`, `"auth.footer"`, and `"header.brand"` on `"eLMV"`.

---

## [1.9.5] - Monorepo-Wide Hindi/English Bilingual Localization & Dynamic Re-rendering — 2026-09-12

### Added & Changed
- **Web Portal Field Roster Localization (`FieldRosterPage.tsx`)**:
  - Integrated `useTranslation()` hook from `react-i18next` with comprehensive translation dictionaries in `client/src/i18n/locales/en.json` and `client/src/i18n/locales/hi.json`.
  - Localized summary KPI cards (*Today's Visits*, *Awaiting Digital Sign*, *Certified Today*, *In Jurisdiction Total*), filter tabs, search placeholders, empty states, and dynamic status badges.
  - Localized primary actions (*"Start MPE Test"*, *"Digitally Sign & Issue"*, *"View Certificate / QR"*).
- **Mobile Dynamic Language Re-Mounting (`mobile/App.tsx`)**:
  - Implemented `key={lang}` and `currentLanguage={lang}` bindings on screen viewports, guaranteeing instant reactivity and clean screen re-renders upon language change.
  - Dynamically bound bottom navigation tab labels using `i18n.t("nav.*", { lng: lang })`.
- **Mobile Screens & Drawers Localization**:
  - **Officer Header (`OfficerHeader.tsx`)**: Localized brand title, officer roles, jurisdiction badge, profile sheet labels, and sign-out button.
  - **Roster Screen (`RosterScreen.tsx`)**: Localized tab pills, search input, loading states, and offline sync banner.
  - **Roster Card (`RosterCard.tsx`)**: Localized statutory status badges (`जमा किया गया`, `निर्धारित`, `हस्ताक्षर प्रतीक्षित`, `प्रमाणित`, `अस्वीकृत`), MPE test triggers, and confirmation alerts.
  - **Application Drawer (`ApplicationDrawer.tsx`)**: Localized application headings, specifications, fee breakdown rows, and primary CTA buttons.
  - **Registry & Verify Screens (`RegistryScreen.tsx`, `VerifyScreen.tsx`)**: Localized search bars, loading spinners, empty states, equipment badges, and verification buttons.
  - **Mobile Login Screen (`LoginScreen.tsx`)**: Added a dedicated top-right language toggle pill (`English` / `हिन्दी`) and localized all input labels, buttons, and demo account helper.

---

## [1.9.4] - Mobile Application Roster Visibility & Reliability Resolution — 2026-09-12

### Fixed
- **Search Filter TypeError Crash (`RosterScreen.tsx`)**:
  - Guarded search filter evaluation against missing or undefined `district` fields on `instrument` (`app.instrument?.district?.toLowerCase().includes(q)`), preventing uncaught `TypeError` crashes during search or tab filtering.
- **Backend Query Scoping (`applications.service.ts`)**:
  - Added `district: true`, `state: true`, `category: true`, and `accuracyClass: true` to `instrument.select`.
  - Enforced correct jurisdictional filtering for LMOs (matched by jurisdiction district) and GATC inspectors (matched by assigned agency or unassigned queue).
- **Automated 401 Token Refresh Interceptor (`mobile/src/lib/api.ts`)**:
  - Integrated an automatic 401 response interceptor in Axios `mobileApi` using refresh tokens from `expo-secure-store`, preventing silent API failures after token expiration.
- **Balanced Multi-Status Seed Data (`prisma/seed.ts`)**:
  - Seeded and updated test applications across all lifecycle states (`SCHEDULED`, `INSPECTED`, `CERTIFIED`, `SUBMITTED`) and assigned across both LMO and GATC inspectors.
- **Offline Fallback Queue (`RosterScreen.tsx`)**:
  - Implemented `FALLBACK_APPLICATIONS` queue ensuring the mobile field roster remains interactive with simulated offline items and a 1-tap retry banner if network connectivity drops.

---

## [1.9.3] - Mobile Native UX Redesign & 60FPS Fluid Spring Physics — 2026-09-12

### Added & Changed
- **Minimalist Enterprise Login Screen (`LoginScreen.tsx`)**:
  - Eliminated cluttered cards and heavy decorative text.
  - Implemented sleek modern layout with brand scale spring entrance, clean email and password inputs, password visibility toggle, primary action button, and 1-tap "Use Demo Officer Account" helper.
- **Streamlined 3-Tab Bottom Navigation (`App.tsx`)**:
  - Removed bulky borders, excessive text labels, and the redundant "Settings" tab.
  - Standardized on 3 high-contrast operational tabs: **Roster**, **Verify**, **Registry**.
  - Added subtle scale-spring micro-interactions on active tab selection.
- **Application Details Drawer (`ApplicationDrawer.tsx`)**:
  - Developed full-featured bottom sheet with native spring slide-up (`tension: 65, friction: 11`), backdrop fade, and downward drag-to-dismiss gesture via `PanResponder`.
  - Structured application metadata, applicant establishment info, equipment specifications, fee details, and direct statutory workflow action triggers.
- **Official Schedule XI Certificate Modal (`CertificateModal.tsx`)**:
  - Re-engineered certificate viewer to match the official Government of Rajasthan Schedule XI Verification Certificate from the web portal.
  - Resolved all text overflowing, truncation, and layout breaks with responsive `flexShrink`, high-contrast typography, cryptographic PKI authenticity banner, and full verification seal details.
- **Tactile Micro-Interactions**:
  - Added spring scale press effects across roster cards (`RosterCard.tsx`), filter chips (`tabs.tsx`), and login buttons.

---

## [1.9.2] - Comprehensive Bug Audit & Workflow Hardening — 2026-09-11

### Fixed
- **Field Inspection Roster Post-Inspection Actions (`FieldRosterPage.tsx`)**:
  - Added dedicated status handlers on each card: applications in `INSPECTED` status now feature a prominent **"Digitally Sign & Issue"** button with a loading spinner, enabling officers to sign at a later time.
  - Completed applications in `CERTIFIED` status now display a green badge with a direct link to view the QR code and certificate.
  - Failed applications in `REJECTED` status now correctly render a red alert badge instead of the green "Inspection Complete" badge.
- **Search Query Overwriting Role Boundaries in Backend (`applications.service.ts` & `instruments.service.ts`)**:
  - Fixed query builder collision where searching applications or instruments was directly overwriting `where.OR`, which broke officer jurisdictional scoping. Refactored queries to use explicit `AND: andClauses`.
- **Application Submission Form Preselection Re-sync (`SubmitApplicationDialog.tsx`)**:
  - Added `useEffect` listening to `[open, preselectedInstrumentId]` to ensure clicking "Apply for Verification" across different instruments in the table correctly updates the form field.
- **Datetime Picker Local Timezone Offset (`ScheduleInspectionDialog.tsx`)**:
  - Replaced `new Date().toISOString().slice(0, 16)` with local date/time string formatting (`YYYY-MM-DDTHH:mm`), resolving the 5.5 hour backward shift in Indian Standard Time (IST).

---

## [1.9.1] - Digital Signing Opt-In Isolation in Inspection Dialog — 2026-09-11

### Fixed
- **Inspection Dialog Digital Signing Default**:
  - In `RecordInspectionDialog.tsx`, the checkbox *"Digitally sign and issue statutory certificate immediately upon passing"* was previously defaulted to `true` (`useState(true)`).
  - Changed default state to `false` (`useState(false)`) so digital signing is strictly **opt-in**.
  - Added state reset logic on dialog close/open so it never persists across consecutive inspections.
  - Submitting an inspection without checking the box now strictly transitions the application to `INSPECTED` status without issuing an ECDSA P-256 certificate until explicitly triggered.

---

## [1.9.0] - Official Government Portal Landing Page cum Citizen Web App (Consumer Portal) — 2026-09-11

### Added & Changed
- **Authoritative Government Portal Landing Page (`ConsumerLandingPage.tsx`)**:
  - Transformed the Consumer App (`http://localhost:5173` / `consumer.domain.com`) from a login-walled dashboard into an authentic, authoritative Indian Government public portal inspired by *Parivahan Sewa*, *e-Upbhokta*, and *incometax.gov.in*.
  - Root path `/` now serves the public landing page with citizen tools, statutory tickers, and official Government of India branding.
- **Official State Emblem of India (`StateEmblem.tsx`)**:
  - Built a crisp SVG component representing the Lion Capital of Ashoka with the Dharma Chakra and *सत्यमेव जयते* inscription.
- **National Tricolor Top Ribbon & Accessibility Toolbar**:
  - National tricolor stripe (Saffron, White, Green) with "भारत सरकार | Government of India" and Ministry branding.
  - Accessibility font size controls (`A-`, `A`, `A+`), theme toggle, and bilingual language toggle.
- **Context-Aware Institutional Header**:
  - Ministry of Consumer Affairs, Food & Public Distribution and Legal Metrology Division banners.
  - National Consumer Helpline `1915` (Toll Free).
  - Contextual authentication CTA: Displays "व्यापारी लॉगिन / Trader Login" and "पंजीकरण / Register" when unauthenticated; greets authenticated traders with their name and a direct "Go to My Dashboard (मेरा डैशबोर्ड)" CTA.
- **Live Application Tracker Widget (`#track`)**:
  - Public tracking tool enabling citizens to query any application reference number (e.g. `LM-APP-2026-0000001`) without logging in.
  - Displays a 4-stage visual progression stepper (`SUBMITTED → SCHEDULED → INSPECTED → CERTIFIED`), equipment specs, assigned officer, scheduled inspection date, and direct certificate verification link.
  - Added public backend API endpoint `GET /api/v1/verification/track/:applicationNumber`.
- **Statutory Fee Calculator Widget (Rule 14 / Schedule XII) (`#calculator`)**:
  - Interactive selector for equipment categories (NAWI Class II, Class III retail counter scale, platform scale, electronic weighbridge, fuel dispensers, storage tanks) and capacities.
  - Displays official government stamping fee, mandatory verification frequency, and statutory SLA.
- **PKI Certificate & QR Seal Spotlight (`#verify`)**:
  - Quick certificate lookup form with direct link to launch the camera QR scanner suite.
- **Statewide Transparency Metrics (`#transparency`)**:
  - Real-time indicator cards for verified commercial instruments, active digital certificates, average SLA turnaround time, and 100% cryptographic audit trail compliance.
- **Section 24 & Section 30 Compliance Guide (`#act`)**:
  - Legal Metrology Act, 2009 statutory excerpt on mandatory verification and penalties for non-compliance.
- **Official Government Statutory Footer (`#contact`)**:
  - GIGW 3.0 / NIC technical compliance statements, Digital India badges, and official Ministry contact links.
- **100% Bilingual Internationalization (English & Hindi)**:
  - Added complete, matching translation dictionaries under `consumerLanding` in both `en.json` and `hi.json` with instant language switching.
- **Seamless Workspace Navigation (`ConsumerApp.tsx`)**:
  - Integrated `ConsumerLandingPage` as the public home view while retaining the full enterprise `AppShell` for authenticated workspaces (`/dashboard`, `/instruments`, `/applications`).

---

## [1.8.1] - Subdomain Architecture & Multi-Port Local Development — 2026-09-11

### Added & Changed
- **Subdomain Routing & 3 Distinct Applications**:
  - Engineered dedicated application routers for each regulatory domain:
    1. **Consumer App (`ConsumerApp.tsx`)**: Bound to `consumer.domain.com` (Port `5173`).
    2. **Regulatory & Agency Admin App (`AdminApp.tsx`)**: Bound to `admin.domain.com` (Port `5174`).
    3. **Field Inspection Suite (`FieldApp.tsx`)**: Bound to `field.domain.com` (Port `5175`).
  - Removed path prefix requirements (`/admin/*`, `/field/*`, `/consumer/*`). Each application operates with clean top-level routes (`/dashboard`, `/officers`, `/roster`, `/verify`).
- **Dynamic Portal Resolution (`subdomain.ts`)**:
  - Automatically identifies portal mode using port number (`5173`, `5174`, `5175`), subdomain prefix (`consumer.*`, `admin.*`, `field.*`), or build-time environment variable (`VITE_APP_PORTAL`).
- **Institutional Cross-Portal Security (`WrongPortalNotice.tsx`)**:
  - If a user authenticates on the incorrect subdomain/port (e.g. an Admin signing in on the Consumer App), the app displays a clear institutional redirect notice with a 1-click button to switch to their designated workplace.
- **Multi-Port Concurrent Development**:
  - Updated root `npm run dev` to launch:
    - Backend Express API on port `5001`
    - Consumer App on port `5173`
    - Regulatory Admin App on port `5174`
    - Field Inspection Suite on port `5175`
    - Public Live Tunnel on port `5173`
  - Enhanced `scripts/free-ports.js` to automatically clean ports `5001`, `5173`, `5174`, `5175`, `4040` on startup.
- **Backend CORS Multi-Origin Handler**:
  - Updated `server/src/app.ts` to allow cross-origin requests from ports `5173`, `5174`, `5175`, local `*.localhost`, and production wildcard subdomains.

---

## [1.8.0] - 3-Portal Architecture & Hierarchical Regulatory Provisioning — 2026-09-11

### Added & Changed
- **3-Portal Ecosystem Architecture**:
  - Restructured the entire web platform into three distinct, purpose-built portals reflecting the Legal Metrology Act, 2009:
    1. **Consumer Portal (`/consumer/*`)**: Citizen and commercial trader portal for equipment owners with inventory management, verification applications, fee tracking, certificate downloads, and Section 24 expiry monitoring.
    2. **Regulatory & Agency Admin Portal (`/admin/*`)**: Desktop governance portal for the State Controller (`ADMIN`) and institutional test laboratory directors (`GATC_ADMIN`) for statewide command oversight, territorial officer provisioning, agency accreditation, and technical testing staff management.
    3. **Field Inspection Suite (`/field/*`)**: High-contrast, touch-optimized web inspection station for on-ground officers (`LMO` and `GATC_INSPECTOR`) featuring daily inspection rosters, geolocation badges, and MPE test recording.
- **Hierarchical Regulatory RBAC & Provisioning Engine**:
  - Refactored `Role` enum to: `CONSUMER`, `LMO`, `GATC_ADMIN`, `GATC_INSPECTOR`, `ADMIN`.
  - Enforced strict security & provisioning boundaries:
    - Self-registration is strictly restricted to `CONSUMER` (any attempt to register privileged roles fails with HTTP 403).
    - Only `ADMIN` can provision `LMO` officers (`POST /api/v1/admin/officers`) and `GATC_ADMIN` accredited agencies (`POST /api/v1/admin/gatc-agencies`).
    - Only `GATC_ADMIN` can provision in-house `GATC_INSPECTOR` testing staff (`POST /api/v1/gatc/inspectors`).
  - Added `GATCInspectorProfile` model linking technical field inspectors directly to their parent institutional `GATCProfile`.
  - Added agency delegation and queue management (`GET /api/v1/gatc/dashboard`, `POST /api/v1/gatc/delegate`).
- **Integration Test Suite**:
  - Created comprehensive Supertest suites in `admin.test.ts` and `gatc.test.ts` verifying RBAC barriers, bcrypt credential creation, duplicate prevention, and agency tenant isolation.
  - All 24 backend integration tests passing (`24/24 passing`).
- **Client Build & Routing**:
  - Wired intelligent `RoleBasedRedirect` at root `/` and `/dashboard` directing users automatically to their designated portal.
  - Fully compiled Vite bundle (`npm run build --workspace=@sih/client`) with zero errors.

---

## [1.7.4] - Unified Dev Command with Integrated ngrok Tunnel — 2026-09-08

### Added & Changed
- **Automated ngrok Tunnel in `npm run dev`**:
  - Enhanced root `npm run dev` to launch `SERVER`, `CLIENT`, and `TUNNEL` concurrently using clean multi-color streams (`cyan,magenta,green`).
  - Added `scripts/start-tunnel.js` with intelligent logging: prints a prominent banner with the static ngrok URL (`https://vapouringly-nonallegoric-teodora.ngrok-free.dev`), strips repetitive connection join spam, and safely isolates tunnel errors from terminating the local dev servers.
  - Added `npm run dev:local` for offline development without opening a public tunnel.
  - Updated `scripts/free-ports.js` to automatically clean up any orphaned ngrok processes and release port 4040 on startup.

---

## [1.7.3] - Mobile Placeholder Typography Refinement & Proportional Sizing — 2026-09-08

### Fixed & Changed
- **Crisp, Proportional Placeholder Typography on Mobile & Desktop**:
  - Root Cause: Forcing `font-size: 16px !important` on `input, select, textarea` to prevent iOS Safari auto-zoom caused the `::placeholder` pseudo-element to inherit the 16px font size on mobile viewports (`<= 768px`), resulting in visibly oversized and bloated placeholder text.
  - Added dedicated placeholder styling rules in `client/src/index.css` forcing `font-size: 12px !important; line-height: normal;` across `input::placeholder`, `textarea::placeholder`, and vendor-prefixed selectors (`::-webkit-input-placeholder`, `::-moz-placeholder`).
  - Added `placeholder:text-xs` to `client/src/components/ui/input.tsx` and `client/src/components/layout/GlobalSearchDialog.tsx`.
  - While the underlying input element computes to 16px on mobile (completely eliminating iOS focus auto-zoom), all placeholder hint text remains crisp, compact, and perfectly proportioned at 12px (`text-xs`).
- **Persistent ngrok Domain & Tunnel Script**:
  - Bound the static domain `vapouringly-nonallegoric-teodora.ngrok-free.dev` permanently to root `package.json` under `npm run tunnel`.
  - Confirmed persistent URL binding across restarts via user's ngrok static domain reservation.

---

## [1.7.2] - Mobile Input Auto-Zoom Prevention & ngrok Tunnel Integration — 2026-09-08

### Fixed & Changed
- **Mobile Input Auto-Zoom Prevention**:
  - Root Cause: Mobile WebKit (iOS Safari) and mobile browsers enforce an automatic zoom-in whenever an `<input>`, `<textarea>`, or `<select>` with `font-size < 16px` (such as `12px` / `text-xs`) receives focus.
  - Added global base CSS rule in `client/src/index.css` forcing `font-size: 16px !important` on `input, select, textarea` for viewports `<= 768px`, while retaining crisp `text-xs` typography on desktop screens.
  - Updated `client/index.html` with hardened viewport constraint: `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`.
  - Updated `client/src/components/ui/input.tsx` to `text-base sm:text-xs` and `h-9 sm:h-8` for improved mobile touch target accessibility.
  - Tapping input fields on smartphones now keeps the viewport stably scaled at 1.0 with zero jarring zoom shifts.

- **Official `ngrok` Tunnel Integration**:
  - Configured user authtoken in `/Users/Sumit/Library/Application Support/ngrok/ngrok.yml`.
  - Configured Vite dev server with `host: true`, `cors: true`, and `allowedHosts: true` to seamlessly accept external tunnel hosts.
  - Launched ngrok daemon on port 5173 providing live public HTTPS access at: `https://vapouringly-nonallegoric-teodora.ngrok-free.dev`.

---

## [1.7.1] - Mobile Verification Lifecycle Stepper Overhaul — 2026-09-08

### Changed
- **Mobile Lifecycle Stepper Layout**:
  - Replaced the awkward vertical stack of centered blocks on mobile in `ApplicationListPage.tsx` with a responsive **2x2 compact grid**.
  - On mobile screens (`< md`), steps are styled as compact cards (`p-2.5 rounded-lg border border-border/70 bg-muted/20`) with circular accent badges (`h-5 w-5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[11px]`), left-aligned bold titles, and concise subtitles.
  - Reduced vertical footprint from ~250px to ~70px on mobile viewports while preserving the desktop horizontal connected workflow with chevron/arrow connectors.

---

## [1.7.0] - Role-Scoped Analytics & Persona-Specific Business Intelligence — 2026-09-08

### Added & Changed
- **Server-Side Role Scoping for Analytics Endpoints**:
  - `getTurnaroundTime`: Scoped query to `applicantId = userId` for Consumers, `assignedOfficerId = userId` for LMO/GATC, and statewide aggregation for Administrators.
  - `getPendencyTrends`: Scoped active pending SLA buckets to the user's personal applications (Consumer) or assigned inspection roster (LMO/GATC), while preserving statewide oversight for Admin.
  - `getOfficerWorkload`: Allowed all authenticated staff roles to query workload metrics. Admin receives the full multi-officer matrix; LMO and GATC receive strictly their personal completed inspections, pass/rejection counts, and active assigned pipeline.
  - `getRegionalBreakdown`: Dynamically adapts dimensions:
    - **Admin**: Statewide breakdown by operational district.
    - **LMO**: Stamping compliance by equipment category within the officer's territorial jurisdiction (e.g. Jaipur).
    - **GATC**: Accuracy calibration compliance by authorized laboratory equipment scope.
    - **Consumer**: Stamping compliance breakdown across the trader's registered commercial instruments.

- **Role-Tailored Client Experience (`AnalyticsPage.tsx`)**:
  - **Dynamic Page Metadata**: Dedicated badges, headers, and descriptions for each persona (e.g., "State Controller Command Overview" for Admin, "Inspector Station • Jaipur" for LMO, "Apex Metrology GATC" for Labs, "Commercial Establishment" for Traders).
  - **Context-Aware KPI Cards**: Metrics reflect personal turnaround times, personal overdue queues, and relevant jurisdiction/category coverage.
  - **Role-Adapted Lower Sections**:
    - **Admin**: Statewide Officer & Lab Workload Matrix table.
    - **LMO / GATC**: Personal Inspection & Quality Record summary grid highlighting total throughput, passed/stamped count, rejection rate, and active inspection queue.
    - **Consumer**: Commercial Equipment Stamping Registry table tracking live certificate status, serial numbers, last verified dates, and active/expired status badges.

---

## [1.6.0] - Certificate PDF Download, Consumer-Only Registration & Jaipur Seed Data — 2026-09-08

### Changed
- **Certificate Bottom Bar Consolidation**:
  - Removed Print button from the top control bar in `PublicVerificationPage.tsx` — top bar now only shows "← Back to Search".
  - Added working **"Download PDF"** button to the bottom action bar that opens `/api/v1/verification/pdf/:certNumber` in a new tab, which generates and serves the PDF binary on-the-fly via the server-side endpoint.
  - Bottom bar now contains both **"Download PDF"** and **"Print Certificate"** buttons, the only two certificate action controls.

- **Consumer-Only Self-Registration**:
  - Server (`auth.service.ts`): Self-registration now rejects any role other than `CONSUMER` with HTTP 403 FORBIDDEN. ADMIN, LMO, and GATC accounts must be created by an existing admin.
  - Client (`RegisterPage.tsx`): Removed the role selector dropdown from the registration form — role is hardcoded to CONSUMER in form defaults and enforced server-side.

- **Seed Data Relocated to Jaipur, Rajasthan**:
  - Database force-reset and re-seeded with all data now in Jaipur, Rajasthan instead of Bengaluru, Karnataka.
  - Updated: LMO email (`lmo.jaipur@metrology.gov.in`), badge (`RJ-LMO-2024-089`), jurisdiction (Jaipur, Rajasthan, North Zone), office address (Tonk Road, Jaipur - 302015).
  - Updated: GATC accreditation (`NABL-LM-RJ-2024-041`), address (Sitapura Industrial Area, Jaipur), district/state.
  - Updated: Consumer GSTIN state code (08 — Rajasthan), trade license prefix (JMC), address (Johari Bazaar, Pink City, 302003).
  - Updated: Instruments installation addresses to Johari Bazaar, Jaipur.
  - Updated: Certificate number `LM-RJ-2026-0000001`, seal number `STAMP-RJ-2026-9812`, fee receipts (REC-JMC-...).
  - Updated test files (`auth.test.ts`, `certificates.test.ts`) to match new seed data.

### Test Results
- 17/17 server tests pass. Client build succeeds.

---

## [1.5.2] - Continuous Grid Alignment for Sidebar & Shell Headers/Footers - 2026-09-07

### Added & Resolved
- **Continuous Horizontal Divider Alignment Across Sidebar & Page Shell**:
  - Aligned the line under the sidebar brand header with the line under the main page top bar:
    - Standardized both `Sidebar.tsx` brand header and `TopBar.tsx` header to exact `h-14` (56px) height with identical `border-b border-border` and `bg-card`.
    - Both bottom border lines now meet at identical vertical coordinates ($Y = 56\text{px}$), forming an unbroken horizontal grid divider across the entire viewport width.
  - Aligned the line above the sidebar profile footer with the line above the statutory page footer:
    - Standardized both `Sidebar.tsx` user profile footer and `AppShell.tsx` statutory footer to exact `h-14` (56px) height with identical `border-t border-border` and `bg-card`.
    - Both top border lines now meet at identical vertical coordinates from the bottom edge ($Y = \text{height} - 56\text{px}$), forming an unbroken horizontal grid divider.
  - Restructured `AppShell.tsx` into a viewport-locked application shell (`h-screen overflow-hidden` with `<main className="flex-1 overflow-y-auto ...">`), ensuring the header and footer horizontal lines stay locked and aligned at all times regardless of page content height or scrolling.

---

## [1.5.1] - Certificate Action Controls Responsive Layout & Pure Statutory Print Isolation - 2026-09-07

- **Removal of Redundant "Download Verified Certificate" Button**:
  - Removed the download PDF action button completely from both the top control bar and bottom action bar in [`PublicVerificationPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/verification/PublicVerificationPage.tsx).
  - Retained exclusively the clean **"Print Certificate"** button (which natively enables saving as PDF via browser print or printing directly to physical paper), simplifying certificate viewing and eliminating redundant action buttons.
- **Pure Statutory Certificate Print Isolation**:
  - Moved the bottom action bar completely outside `#certificate-print-card` in [`PublicVerificationPage.tsx`](file:///Users/Sumit/Desktop/sih/client/src/features/verification/PublicVerificationPage.tsx), ensuring `#certificate-print-card` contains strictly the statutory legal certificate without interactive controls.
  - Hardened `@media print` CSS rules in [`index.css`](file:///Users/Sumit/Desktop/sih/client/src/index.css) to force `display: none !important; visibility: hidden !important;` on all buttons, `.no-print` elements, and nested descendants, preventing CSS selector specificity overrides from exposing buttons inside print preview.
  - Formatted the printed output to display exclusively the official Government of India header, statutory QR code, specifications table, MPE observations, and legal endorsement.
- **Certificate Action Button Overflow Resolution**:
  - Eliminated horizontal button overflow across mobile, tablet, and desktop viewports on `/verify`.
  - Implemented responsive flex wrapping (`flex flex-wrap items-center`) with `flex-col sm:flex-row items-stretch sm:items-center` in the top control bar and bottom action bar.
  - Added `flex-1 sm:flex-initial justify-center` and `w-full sm:w-auto` to action buttons (`Print Certificate` and `Download PDF`), ensuring clean adaptation without clipping or viewport horizontal scrollbars.
  - Added text truncation protection and `min-w-0 flex-1` to the certificate header container to prevent long titles from pushing statutory QR seals off-screen on compact devices.
  - Shortened verbose multilingual button labels (`"सत्यापित प्रमाणपत्र डाउनलोड करें (PDF)"` → `"PDF डाउनलोड"`, `"Download Verified Certificate (PDF)"` → `"Download PDF"`) across `en.json` and `hi.json` to conserve layout space while preserving statutory clarity.

---

## [1.5.0] - Universal In-App Omnisearch (Command Palette ⌘K) - 2026-09-07

### Added & Resolved
- **Universal In-App Omnisearch Engine**:
  - Replaced the static `/verify` portal link in the `TopBar` header with an active in-app search button (`⌘K` / `Ctrl+K`).
  - Created `GlobalSearchDialog.tsx` supporting cross-application search across:
    - **Live Instruments**: real-time API queries by serial number, make, model, capacity, and category.
    - **Live Applications**: real-time API queries by application number, status, and instrument metadata.
    - **Navigation & Pages**: fast keyword-indexed access to Dashboard, Instruments Registry, Applications, Analytics, Audit Log, and Public Verification.
    - **Quick Actions**: direct triggers to register new instruments, submit applications, toggle bilingual languages (English / हिन्दी), and toggle color themes.
    - **Direct Certificate Lookup**: automatically recognizes certificate identifiers (e.g., `LM-KA-...`) and routes directly to certificate verification.
  - Added global keyboard shortcut handling (`⌘K` / `Ctrl+K` and `ESC` to close).
  - Added responsive mobile search trigger button in the `TopBar` for instant mobile access.

---

## [1.4.0] - Certificate Workflow Completion, Clean One-Page Print & Statutory QR Seal - 2026-09-07

### Added & Resolved
- **Inspection-to-Certification Workflow Transition**:
  - Added an explicit **"Issue Certificate"** action button in `ApplicationListPage.tsx` for `LMO`, `GATC`, and `ADMIN` roles when an application is in `INSPECTED` status.
  - Added an optional 1-click auto-issuance toggle in `RecordInspectionDialog.tsx` ("Digitally sign and issue statutory certificate immediately upon passing"), enabling officers to complete physical inspection and PKI certificate signing in a single unified step.
  - Made `validUntil` optional in `issueCertificateSchema`, automatically defaulting to 1 year from the date of verification per Section 24 and General Rules if not explicitly specified.
- **Streamlined Certificate View**:
  - Removed the search bar and camera QR scanner when viewing a verified certificate (`?cert=` or direct lookup), eliminating clutter in the Consumer app.
  - Added a clean `← Verify Another Certificate` action to smoothly return to search/scan mode without page refreshes.
  - Removed technical debug string: `"Digitally signed using asymmetric PKI key v1-2026 (ECDSA_P256). Certificate digest verified against Government Public Key."`
  - Removed raw debug Base64 cryptographic signature block (`"CRYPTOGRAPHIC DIGITAL SIGNATURE (ECDSA NIST P-256) Copy Signature ..."`).
- **Embedded Statutory QR Code**:
  - Rendered a high-resolution statutory verification QR code (`QRCodeSVG` from `qrcode.react`) on the top-right of the Certificate card, encoding the official verification URL (`/verify?cert=...`) with Level H error correction and a "Scan to Verify" caption.
- **Clean Single-Page Print Formatting**:
  - Implemented dedicated `@media print` rules in `index.css` isolating `#certificate-print-card`.
  - Automatically hides all navigation bars, sidebars, buttons, alerts, and browser chrome during printing or PDF export.
  - Formatted certificate layout, typography, and borders to strictly fit onto **one single A4 page** with zero overflow.

---

## [1.3.0] - Architecture Hardening, LMO Jurisdictions & Cryptographic Finalization - 2026-09-07

### Added & Resolved
- **LMO Jurisdictional Profiles (`OfficerProfile`)**:
  - Implemented `OfficerProfile` model with statutory `badgeNumber`, territorial `jurisdictionDistrict`, `jurisdictionState`, and `jurisdictionZone`.
  - Added relation to `User` and seeded Inspector Ananya Rao with badge `KA-LMO-2024-089` for Bengaluru Urban.
  - Exposed via `/api/v1/users/officer-profile` and integrated into user retrieval pipelines.
- **Statutory Government Gazette Notification for GATCs**:
  - Added `notificationRefNumber` to `GATCProfile` and seeded `GOI-DOCA-LM/2023/GATC-041` for Apex Metrology GATC per the statutory Problem Statement mandate.
- **Documented Statutory Fees & Treasury Receipts Subsystem**:
  - Formalized Section 8 in `ARCHITECTURE.md` and updated `API.md` for Rule 14 / Schedule XII fee calculation, automatic treasury receipt generation (`REC-YYYY-XXXXXX`), and real-time reconciliation with Admin revenue KPI (`_sum: { feeAmount: true }`).
- **Definitive Cryptographic Standard: ECDSA NIST P-256 (`prime256v1`)**:
  - Formally locked curve choice to **ECDSA NIST P-256 (`prime256v1`) with SHA-256 digest** across all architecture specifications, matching FIPS 186-4 government standards and the active implementation in `server/src/keys/pki.ts`.
  - Removed outdated placeholder mentions of `secp256k1` and `RSA-PSS`.
- **Definitive JWT Token Delivery & Refresh Token Rotation (RTR)**:
  - Clarified strict token segregation: short-lived access tokens (15m) held in-memory and sent as Bearer headers; long-lived refresh tokens (7d) strictly delivered via `httpOnly`, `Secure`, `SameSite=Strict` cookies on web (Expo SecureStore on mobile).
  - Explicitly documented single-use Refresh Token Rotation with automatic revocation of all sessions upon detected reuse.
- **Removed Hardcoded Unsplash Photo Link & Added Real Photo Uploader (`RecordInspectionDialog.tsx`)**:
  - Replaced the hardcoded Unsplash image link with an authentic photo upload zone (`image/*`) supporting direct device/camera uploads, file name/size indicators, image thumbnail previews, and instant removal.
  - Provided an optional manual URL input with official government asset placeholder (`https://assets.metrology.gov.in/inspections/...`), completely empty by default.
  - Updated shared `createInspectionSchema` to gracefully accept data URLs, file paths, and empty arrays.
- **Strict Role-Gating of "+ New Application" and "+ Register Instrument" Triggers**:
  - Removed "+ New Application" and "+ Register Instrument" from LMO Officers and GATC Laboratories, preventing regulatory conflicts of interest. Only Commercial Traders (`Role.CONSUMER`) and Department Admins (`Role.ADMIN`) can initiate applications or register instruments.
  - Enhanced Instrument and Application tables to display the responsible Owner / Trader establishment to officers and admins with a dedicated "Applications" history action.

---

## [1.2.0] - Bilingual Hindi Dashboard, Light Theme Default, & Camera QR Overhaul - 2026-09-07

### Added & Refined
- **Full Bilingual Hindi Internationalization Across All Internal Views**:
  - Comprehensive English and Hindi translation dictionaries expanded with zero missing keys.
  - Toggling language dynamically updates all 4 role dashboards (Trader, LMO Officer, GATC Lab, Controller Admin), navigation elements, breadcrumbs, search placeholders, role badges, and statutory footers.
  - Fully translated all statutory action dialogs: **Register Instrument Dialog**, **Submit Application Dialog**, **Schedule Visit Dialog**, and **Record Inspection Dialog** with MPE tolerance indicators.
- **Default Theme Set to Light**:
  - Removed aggressive OS-level dark-mode auto-detection that forced dark mode on Mac users.
  - System explicitly initializes in clean light mode by default.
  - State persisted via `theme_mode` in `localStorage` to preserve user-initiated toggles.
- **Refined Sidebar Active Selection**:
  - Replaced high-contrast stark solid black (in light mode) and solid bright white (in dark mode) pills with subtle, elegant greyish highlights (`bg-zinc-100` with `border-zinc-200` in light mode; `dark:bg-zinc-800` with `border-zinc-700` in dark mode).
- **Stat Card Spacing & Border Fix**:
  - Corrected `CardContent` in `card.tsx` to remove `sm:pt-0` breakpoint conflicts that forced $0\text{px}$ top padding on viewports $\ge 640\text{px}$.
  - Updated all KPI cards across Dashboard, Instrument Registry, and Analytics pages to use balanced `p-5 space-y-3` padding with `shrink-0` icon containers.
- **Headless Camera QR Scanner Overhaul (`PublicVerificationPage.tsx`)**:
  - Replaced legacy `Html5QrcodeScanner` with direct `Html5Qrcode` headless control, fixing React 18 StrictMode double-mounting crashes.
  - Added smart camera fallback: detects back/environment camera on mobile devices and automatically switches to the front FaceTime webcam on MacBooks and laptops.
  - Added live viewfinder reticle overlay with corner alignment markers and scanning status badge.
  - Integrated direct "Upload QR Image" file decoder using `scanFile()`, allowing instant verification even when camera access is not permitted or unavailable.
  - Implemented clean video track stopping on tab switch or unmount to immediately power off webcam hardware indicators.

---

## [1.1.0] - Industry-Standard Enterprise UI/UX Overhaul - 2026-09-07

### Added & Upgraded — World-Class Enterprise User Experience
- **Modern Responsive AppShell & Standalone AuthLayout**:
  - Unified desktop and mobile application shell (`AppShell.tsx`) strictly locked down behind `<ProtectedRoute>`: unauthenticated users are immediately redirected to `/login` and can never view internal dashboards or the sidebar shell.
  - Dedicated standalone `AuthLayout.tsx` for `/login`, `/register`, and `/verify`: completely decoupled from the operational dashboard, featuring official branding, back to portal button, language toggle, and theme switch.
  - **Dynamic Persona Selection on Login**: Login page features role selector tabs (Commercial Trader, LMO Officer, GATC Laboratory, Controller/Admin) that pre-populate credentials and describe the target operational station.
  - **Strictly Role-Tailored Dashboards & Navbars**:
    - **Commercial Trader (`Role.CONSUMER`)**: Trader overview, My Registered Instruments, Active Stamped Certificates, Pending Applications, and urgent Section 24 re-verification table. Sidebar only displays commercial operations.
    - **Legal Metrology Officer (`Role.LMO`)**: Officer station, assigned physical inspection queue, scheduled site visit table with direct MPE test CTA.
    - **GATC Laboratory (`Role.GATC`)**: Lab calibration station, testing queue, accuracy evaluations, and NABL accreditation scope.
    - **Department Controller (`Role.ADMIN`)**: State-wide instrument registry, all applications, statutory fee revenue receipts, application pipeline distribution, and officer productivity matrix.
- **Top Navigation Bar (`TopBar.tsx`)**:
  - Live breadcrumb trails dynamically tracking route paths.
  - Global quick verification command trigger (`⌘K` shortcut) with search placeholder.
  - Bilingual switcher pill (`English` / `हिन्दी`) and smooth dark/light mode toggle.
- **Public Verification Portal (`PublicVerificationPage.tsx`)**:
  - Redesigned as a national statutory verification portal with official seal branding.
  - Tabbed interface switching seamlessly between manual certificate search and live camera QR code scanner with target frame guides.
  - Official statutory certificate card featuring double guilloche borders (`guilloche-border`), Government of India header, structured instrument specs grid, comparative MPE vs observed error tolerance gauge, cryptographic signature metadata with copy action, and one-click signed PDF download.
- **Operational Command Center (`DashboardPage.tsx`)**:
  - Modern metric KPI cards with trend indicators and status icons.
  - Statutory Re-Verification Action Required table highlighting instruments expiring within 30 days with direct renewal CTA.
  - Upcoming scheduled physical verification queue for officers with direct inspection triggers.
- **Instrument Registry (`InstrumentListPage.tsx`)**:
  - Compliance metric cards (Total Registry Assets, Verification Compliance %, Re-Verification Due count).
  - Search and category filter toolbar with instant query refinement and clear buttons.
  - Polished table with accuracy class tags, capacity indicators, and direct renewal triggers.
- **Applications Workflow (`ApplicationListPage.tsx`)**:
  - Visual 4-step statutory lifecycle progress pipeline banner (`1. Filing & Submission → 2. Site Scheduling → 3. Physical Inspection → 4. PKI Certification`).
  - Elevated status pill badges with dot indicators and role-specific action buttons (`Schedule`, `Inspect`, `Certificate`).
- **Analytics & BI (`AnalyticsPage.tsx`)**:
  - Responsive Recharts bar visualizations with rounded bar tops (`radius={[4, 4, 0, 0]}`), custom tooltips, and regional compliance rankings.
- **Statutory Audit Ledger (`AuditLogPage.tsx`)**:
  - Filterable regulatory event table with clean pre blocks for change digests and pagination controls.
- **Authentication Pages (`LoginPage.tsx` & `RegisterPage.tsx`)**:
  - Centered cards with official emblem scale icon and Evaluator Quick-Fill Account selector chips for instant demo authentication.
- **Design Primitives & Tokens (`index.css` & `components/ui/`)**:
  - Upgraded border radius to `--radius: 0.5rem` (8px).
  - Refined neutral palette (`zinc-50` to `zinc-950`), custom enterprise scrollbars, active scale-down press states (`active:scale-[0.98]`), and status pill badges.

---

## [1.0.0] - Complete System Delivery - 2026-09-07

### Delivered — All 13 Phases Operational & Verified

#### Phase 0: Monorepo Scaffolding & Setup
- Root npm workspace architecture linking `@sih/shared`, `@sih/server`, `@sih/client`, and `@sih/mobile`.
- PostgreSQL 16 schema with 10 models and enums pushed and synchronized to local PostgreSQL (`legal_metrology`).
- Database seed script populating Admin, LMO Officer, GATC Laboratory, Trader/Consumer, Root PKI Key (`v1-2026`), and instruments.

#### Phase 1: Authentication & Role-Based Access Control (RBAC)
- Custom dual-token JWT architecture (access tokens 15m, refresh tokens 7d with cryptographic `jti` uniqueness and automatic rotation).
- Passwords hashed using `bcryptjs` (cost factor 12).
- RBAC middleware (`requireAuth`, `requireRole`) enforcing permissions for `CONSUMER`, `LMO`, `GATC`, and `ADMIN`.
- Web and mobile AuthContext, Login, and Registration interfaces with Zod validation.

#### Phase 2: Stakeholder & Instrument Registry
- Prisma models for `StakeholderProfile`, `GATCProfile`, and `Instrument`.
- Strict ownership rules: Commercial consumers can only view and submit applications for instruments they own.
- Web Client Instrument Registry with search, category filtering, loading skeletons, explicit empty states, and registration modal.

#### Phase 3: Application Submission & Workflow Engine
- Application status state machine: `SUBMITTED → SCHEDULED → INSPECTED → CERTIFIED / REJECTED → EXPIRED`.
- Statutory fee calculation engine per Rule 14 of Legal Metrology General Rules, 2011.
- Officer visit scheduling and administrative assignment workflows.

#### Phase 4: Inspection & Observation Recording
- Structured observation recording for physical field tests (repeatability, eccentricity, linearity).
- Automated Maximum Permissible Error (MPE) evaluation: rejects applications where observed error exceeds statutory tolerance.
- Cloudinary photo upload integration for verification site plates and inspection seals.

#### Phase 5: Asymmetric PKI Digital Certificate Generation
- Asymmetric PKI engine: ECDSA NIST P-256 (`prime256v1`) key generation and AES-256-GCM encrypted private key storage.
- Deterministic canonical JSON payload hashing and digital signing.
- High-density QR code generation (`qrcode`) embedding verification URL.
- Official certificate PDF generation using `pdf-lib` embedding Government header, statutory declaration, test observations, QR code, and digital stamp.

#### Phase 6: Public Verification Portal (No-Auth)
- Public unauthenticated verification endpoint `/api/v1/verification/verify/:identifier`.
- Live cryptographic signature validation against active/historical public keys.
- Web Public Verification Portal (`/verify`) with HTML5 camera QR scanner, manual input, cryptographic authenticity badges, and PDF download.
- Automated tamper-detection verification: byte alteration in database causes signature verification to fail immediately with `SIGNATURE_FORGED_OR_ALTERED`.

#### Phase 7: Automated Notifications & Expiry Engine
- Multi-channel notification model (`IN_APP`, `EMAIL`, `SMS`, `PUSH`).
- Background cron engine (`node-cron`) running daily at 00:00 to alert owners 30 days before expiration and auto-transition overdue certificates to `EXPIRED`.

#### Phase 8: Role-Specific Operational Dashboards
- Tailored operational metrics for Consumer, LMO, GATC, and Admin roles.
- Live database query backing with zero hardcoded or mock data.

#### Phase 9: Analytics & Business Intelligence (BI)
- Real SQL aggregations for:
  - Statutory Turnaround Time (TAT) in days.
  - Aging pendency trends (<7d, 7-15d, 15-30d, >30d).
  - Officer inspection productivity and rejection rate matrix.
  - Regional compliance distribution by district and state.
- Interactive Recharts visualizations strictly adhering to high-contrast monochrome design system with light solid semantic accents.

#### Phase 10: Search & Audit Trail
- Global serial number and certificate lookup.
- Immutable `AuditLog` records tracking all creation, login, status changes, and certificate signings.

#### Phase 11: Internationalization (i18n)
- Full bilingual translation across English (`en`) and Hindi (`hi`) on Web (`react-i18next`) and Mobile (`i18next`).
- Formatted dates (`en-IN`) and currency (₹).

#### Phase 12: Testing, Security & Verification
- 17/17 backend integration and unit tests passing via Jest + Supertest.
- Full monorepo TypeScript compilation passing with zero errors across all workspaces.
