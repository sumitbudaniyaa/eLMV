# Database Architecture & Schema Specification (DATABASE.md)

## 1. Overview & Engine Specification

The system uses **PostgreSQL 16** managed via **Prisma ORM**.
The database is configured via a single `DATABASE_URL` environment variable:
- **Development / Local**: Docker Compose container `postgres:16-alpine` or local PostgreSQL instance.
- **Staging / Production**: Swappable to AWS RDS, Supabase, Neon, or GCP Cloud SQL without application code modifications.

---

## 2. Enums

```prisma
enum Role {
  CONSUMER
  LMO
  GATC_ADMIN
  GATC_INSPECTOR
  ADMIN
}

enum StakeholderType {
  MANUFACTURER
  DEALER
  REPAIRER
  COMMERCIAL_USER
}

enum InstrumentType {
  NON_AUTOMATIC_WEIGHING_INSTRUMENT  // Electronic counter scales, platform scales, weighbridges
  AUTOMATIC_WEIGHING_INSTRUMENT      // Checkweighers, belt weighers, gravimetric filling
  FUEL_DISPENSER                     // Petrol/diesel dispensers
  STORAGE_TANK                       // Calibration tanks, flow meters
  LENGTH_MEASURE                     // Steel tapes, fabric meters
  CAPACITY_MEASURE                   // Conical measures, cylindrical measures
  OTHER
}

enum ApplicationType {
  NEW
  RE_VERIFICATION
}

enum ApplicationStatus {
  SUBMITTED
  SCHEDULED
  INSPECTED
  CERTIFIED
  REJECTED
  EXPIRED
}

enum InspectionResult {
  PASSED
  FAILED
}

enum NotificationChannel {
  EMAIL
  SMS
  PUSH
  IN_APP
}

enum NotificationType {
  APPLICATION_STATUS_CHANGED
  INSPECTION_SCHEDULED
  CERTIFICATE_ISSUED
  VERIFICATION_EXPIRING_SOON
  VERIFICATION_EXPIRED
  REJECTION_NOTICE
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  STATUS_CHANGE
  SIGN_CERTIFICATE
  ROTATE_KEY
}
```

---

## 3. Entity Relationship & Models

### 3.1. `User` & Authentication
```prisma
model User {
  id                   String              @id @default(uuid())
  email                String              @unique
  phone                String              @unique
  name                 String
  passwordHash         String
  role                 Role                @default(CONSUMER)
  isActive             Boolean             @default(true)
  isVerified           Boolean             @default(false)
  createdAt            DateTime            @default(now())
  updatedAt            DateTime            @updatedAt

  // Relationships
  stakeholderProfile   StakeholderProfile?
  gatcProfile          GATCProfile?
  officerProfile       OfficerProfile?
  refreshTokens        RefreshToken[]
  instruments          Instrument[]        @relation("InstrumentOwner")
  applications         Application[]       @relation("Applicant")
  assignedApplications Application[]       @relation("AssignedOfficer")
  inspections          InspectionRecord[]  @relation("InspectingOfficer")
  notifications        Notification[]
  auditLogs            AuditLog[]

  @@index([role])
  @@index([email])
  @@index([phone])
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  isRevoked Boolean  @default(false)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([token])
}
```

### 3.2. Profiles

#### `OfficerProfile` (LMO Jurisdictional Assignment)
```prisma
model OfficerProfile {
  id                   String   @id @default(uuid())
  userId               String   @unique
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  badgeNumber          String   @unique
  jurisdictionDistrict String
  jurisdictionState    String
  jurisdictionZone     String?
  officeAddress        String?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  @@index([jurisdictionDistrict, jurisdictionState])
}
```

#### `StakeholderProfile` (Commercial Traders & Manufacturers)
```prisma
model StakeholderProfile {
  id                   String          @id @default(uuid())
  userId               String          @unique
  user                 User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  type                 StakeholderType @default(COMMERCIAL_USER)
  businessName         String
  tradeLicenseNumber   String?
  gstin                String?
  district             String
  state                String
  address              String
  pincode              String
  createdAt            DateTime        @default(now())
  updatedAt            DateTime        @updatedAt

  @@index([type])
  @@index([district, state])
}
```

#### `GATCProfile` (Government Approved Test Centres)
```prisma
model GATCProfile {
  id                     String   @id @default(uuid())
  userId                 String   @unique
  user                   User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  accreditationNumber    String   @unique
  notificationRefNumber  String?  // Statutory Gazette Notification Reference Number
  authorizedScope        String[] // e.g. ["NAWI", "FUEL_DISPENSERS"]
  validUntil             DateTime
  district               String
  state                  String
  address                String
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  @@index([notificationRefNumber])
}
```

### 3.3. Instruments & Registry
```prisma
model Instrument {
  id                   String         @id @default(uuid())
  ownerId              String
  owner                User           @relation("InstrumentOwner", fields: [ownerId], references: [id], onDelete: Restrict)
  type                 InstrumentType
  category             String         // Specific legal metrology category code
  make                 String
  model                String
  serialNumber         String         @unique
  capacity             Float          // e.g. 50.0
  unit                 String         // e.g. "kg", "g", "L", "m"
  accuracyClass        String         // e.g. "Class I", "Class II", "Class III", "Class IIII"
  verificationInterval Int            // In months (typically 12 or 24 months per LM Act)
  lastVerifiedAt       DateTime?
  nextDueAt            DateTime?
  installationAddress  String
  district             String
  state                String
  pincode              String
  createdAt            DateTime       @default(now())
  updatedAt            DateTime       @updatedAt

  // Relationships
  applications         Application[]

  @@index([ownerId])
  @@index([serialNumber])
  @@index([nextDueAt])
  @@index([district, state])
}
```

### 3.4. Workflow & Applications
```prisma
model Application {
  id                   String            @id @default(uuid())
  applicationNumber    String            @unique
  instrumentId         String
  instrument           Instrument        @relation(fields: [instrumentId], references: [id], onDelete: Restrict)
  applicantId          String
  applicant            User              @relation("Applicant", fields: [applicantId], references: [id], onDelete: Restrict)
  assignedOfficerId    String?
  assignedOfficer      User?             @relation("AssignedOfficer", fields: [assignedOfficerId], references: [id], onDelete: SetNull)
  type                 ApplicationType   @default(NEW)
  status               ApplicationStatus @default(SUBMITTED)
  scheduledDate        DateTime?
  rejectionReason      String?
  remarks              String?
  feeAmount            Float             @default(0.0)
  feeReceiptNumber     String?
  feePaid              Boolean           @default(false)
  submittedAt          DateTime          @default(now())
  updatedAt            DateTime          @updatedAt

  // Relationships
  inspectionRecord     InspectionRecord?
  certificate          Certificate?
  history              ApplicationHistory[]

  @@index([status])
  @@index([applicantId])
  @@index([assignedOfficerId])
  @@index([submittedAt])
}

model ApplicationHistory {
  id            String            @id @default(uuid())
  applicationId String
  application   Application       @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  fromStatus    ApplicationStatus
  toStatus      ApplicationStatus
  actorId       String
  notes         String?
  createdAt     DateTime          @default(now())

  @@index([applicationId])
}
```

### 3.5. Inspections & Observations
```prisma
model InspectionRecord {
  id                   String           @id @default(uuid())
  applicationId        String           @unique
  application          Application      @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  officerId            String
  officer              User             @relation("InspectingOfficer", fields: [officerId], references: [id], onDelete: Restrict)
  result               InspectionResult
  observations         Json             // Structured tests: repeatability, eccentricity, linearity, errors observed
  standardsUsed        String[]         // Standard weights/measures serial numbers applied
  maxPermissibleError  Float            // MPE permissible under Legal Metrology Rules
  actualErrorObserved  Float            // Actual max error recorded during verification
  photoUrls            String[]         // Verification site, instrument seal, and plate photos on Cloudinary
  sealNumber           String?          // Lead/tamper-evident seal applied by officer
  remarks              String?
  inspectedAt          DateTime         @default(now())
  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt

  @@index([officerId])
  @@index([result])
}
```

### 3.6. Asymmetric PKI Keys & Certificates
```prisma
model SigningKey {
  id                   String        @id @default(uuid())
  keyVersion           String        @unique // e.g., "v1-2026", "v2-2027"
  algorithm            String        @default("ECDSA_P256")
  publicKey            String        // PEM formatted public key
  privateKeyEncrypted  String        // AES-256-GCM encrypted private key or ref to KMS
  isActive             Boolean       @default(true)
  validFrom            DateTime      @default(now())
  validUntil           DateTime
  createdAt            DateTime      @default(now())

  // Relationships
  certificates         Certificate[]

  @@index([isActive])
  @@index([keyVersion])
}

model Certificate {
  id                   String        @id @default(uuid())
  certificateNumber    String        @unique // e.g. "LM-KA-2026-0008492"
  applicationId        String        @unique
  application          Application   @relation(fields: [applicationId], references: [id], onDelete: Restrict)
  signingKeyId         String
  signingKey           SigningKey    @relation(fields: [signingKeyId], references: [id], onDelete: Restrict)
  signingKeyVersion    String
  canonicalPayload     String        // Deterministic JSON string that was signed
  signature            String        // Base64 digital signature
  qrToken              String        @unique // Cryptographic lookup token
  issuedAt             DateTime      @default(now())
  validUntil           DateTime
  pdfUrl               String?       // Cloudinary URL for signed PDF (raw resource)
  createdAt            DateTime      @default(now())

  @@index([certificateNumber])
  @@index([qrToken])
  @@index([validUntil])
}
```

### 3.7. Notifications & Audit Logs
```prisma
model Notification {
  id                   String              @id @default(uuid())
  userId               String
  user                 User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  type                 NotificationType
  channel              NotificationChannel @default(IN_APP)
  title                String
  message              String
  isRead               Boolean             @default(false)
  sentAt               DateTime            @default(now())

  @@index([userId])
  @@index([isRead])
}

model AuditLog {
  id                   String      @id @default(uuid())
  actorId              String?
  actor                User?       @relation(fields: [actorId], references: [id], onDelete: SetNull)
  action               AuditAction
  entity               String      // e.g., "Application", "Certificate", "User"
  entityId             String?
  ipAddress            String?
  userAgent            String?
  changes              Json?       // Diff of old vs new values
  timestamp            DateTime    @default(now())

  @@index([actorId])
  @@index([entity, entityId])
  @@index([timestamp])
}
```

---

## 4. Migration & Seeding Strategy
- Migrations are managed via `npx prisma migrate dev --name <migration_name>` during development and `npx prisma migrate deploy` in production.
- Database seeds (`prisma/seed.ts`) populate initial administrative users, standard legal metrology instrument types, signing key v1, and test fixtures without hardcoding mock state into production code.

