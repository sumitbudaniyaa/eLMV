# 📋 Legal Metrology Verification System — Complete Form Input Guide

This document provides a comprehensive reference for **every input form** across the entire Legal Metrology ecosystem (Citizen Web Portal, Admin Portal, Field Officer Portal, and Mobile App).

For each form, you will find:
1. **Location & Role**: Who uses it and where it is found.
2. **Field Specifications & Validation Rules**: Expected types, regex constraints, and required/optional flags.
3. **Copy-Paste Dummy Data**: Tested, realistic sample values adhering to the Legal Metrology Act, 2009.

---

## Table of Contents

1. [Trader / Commercial User Registration](#1-trader--commercial-user-registration)
2. [User Sign In (Web & Mobile)](#2-user-sign-in-web--mobile)
3. [Instrument Registration Form](#3-instrument-registration-form)
4. [Verification Application Submission Form](#4-verification-application-submission-form)
5. [Field Officer Inspection Scheduling Dialog](#5-field-officer-inspection-scheduling-dialog)
6. [Field Officer Inspection Record Form (Web & Mobile)](#6-field-officer-inspection-record-form-web--mobile)
7. [Admin: Provision Legal Metrology Officer (LMO)](#7-admin-provision-legal-metrology-officer-lmo)
8. [Admin: Provision GATC Calibration Agency](#8-admin-provision-gatc-calibration-agency)
9. [GATC Admin: Add In-House Testing Inspector](#9-gatc-admin-add-in-house-testing-inspector)
10. [Profile Settings & Change Password](#10-profile-settings--change-password)

---

## 1. Trader / Commercial User Registration

* **Portal**: Citizen Web Portal
* **Route**: `/register`
* **Role**: `CONSUMER` (Trader, Manufacturer, Repairer, Dealer)

### Field Specifications

| Field | Label | Type | Required? | Validation / Constraints |
|---|---|---|:---:|---|
| `name` | Full Name | `string` | **Yes** | Min 2 chars |
| `email` | Email Address | `string` | **Yes** | Valid RFC 5322 email format |
| `phone` | Mobile Number | `string` | **Yes** | 10-digit Indian mobile number (`^[6-9]\d{9}$`) |
| `password` | Password | `string` | **Yes** | Min 8 characters |

### Sample Dummy Data
```json
{
  "name": "Rajesh Kumar Sharma",
  "email": "rajesh.sharma@shreestores.in",
  "phone": "9876543210",
  "password": "Password@123"
}
```

---

## 2. User Sign In (Web & Mobile)

* **Portals**:
  * Citizen: `/login`
  * Admin: `/admin/login`
  * Field: `/field/login`
  * Mobile: Main Launch Screen
* **Roles**: All (`CONSUMER`, `ADMIN`, `LMO`, `GATC_ADMIN`, `GATC_INSPECTOR`)

### Field Specifications

| Field | Label | Type | Required? | Validation / Constraints |
|---|---|---|:---:|---|
| `email` | Email Address | `string` | **Yes** | Valid email format |
| `password` | Password | `string` | **Yes** | Min 8 characters |

### Active Pre-Seeded Administrator Account

Only the central administrator is pre-seeded in the clean database. All other accounts (Officers, Agencies, Inspectors, Traders) are created on-demand through their respective registration forms below.

| Role | Email | Password | Access / Notes |
|---|---|---|---|
| **Central Admin** | `admin@metrology.gov.in` | `Password@123` | Active. Full admin portal access to provision Officers & GATC Agencies. |

> **Note**: To test Officer or Agency logins, log into the Admin portal (`/admin/login`) with the admin account above and provision them using the forms detailed in [Section 7](#7-admin-provision-legal-metrology-officer-lmo) and [Section 8](#8-admin-provision-gatc-calibration-agency). To test Trader login, register directly via `/register`.

---

## 3. Instrument Registration Form

* **Portal**: Citizen Web Portal
* **Location**: Dashboard $\rightarrow$ Click **"Register Instrument"** button
* **Role**: `CONSUMER`

### Field Specifications

| Field | Label | Type | Required? | Validation / Constraints |
|---|---|---|:---:|---|
| `type` | Instrument Type | `enum` | **Yes** | `NON_AUTOMATIC_WEIGHING_INSTRUMENT`<br>`AUTOMATIC_WEIGHING_INSTRUMENT`<br>`FUEL_DISPENSER`<br>`STORAGE_TANK`<br>`FLOW_METER`<br>`TAXIMETER` |
| `category` | Category Code | `string` | **Yes** | Min 2 chars (e.g., `NAWI-ClassIII`, `FUEL-PETROL-DISP`) |
| `make` | Manufacturer / Make | `string` | **Yes** | Min 2 chars (e.g., `Essae-Teraoka`, `Mettler Toledo`) |
| `model` | Model Number | `string` | **Yes** | Min 1 char (e.g., `DS-252`, `XP-205`) |
| `serialNumber` | Serial Number | `string` | **Yes** | Min 2 chars (Unique hardware serial) |
| `capacity` | Maximum Capacity | `number` | **Yes** | Positive number $> 0$ |
| `unit` | Unit of Measurement | `string` | **Yes** | `kg`, `g`, `mg`, `t`, `L`, `mL`, `m`, `mm` |
| `accuracyClass` | Accuracy Class | `string` | **Yes** | `Class I`, `Class II`, `Class III`, `Class IIII` |
| `verificationInterval` | Statutory Interval (Months) | `number` | **Yes** | Integer $\ge 1$ (Default: `12` months under Act) |
| `installationAddress` | Physical Installation Site | `string` | **Yes** | Min 5 chars |
| `district` | District | `string` | **Yes** | Min 2 chars |
| `state` | State | `string` | **Yes** | Min 2 chars |
| `pincode` | PIN Code | `string` | **Yes** | 6-digit Indian PIN code (`^[1-9][0-9]{5}$`) |

### Sample Dummy Data (Grocery Scale)
```json
{
  "type": "NON_AUTOMATIC_WEIGHING_INSTRUMENT",
  "category": "NAWI-ClassIII",
  "make": "Essae-Teraoka",
  "model": "DS-252",
  "serialNumber": "SN-ES-2026-9812",
  "capacity": 30,
  "unit": "kg",
  "accuracyClass": "Class III",
  "verificationInterval": 12,
  "installationAddress": "Shop No. 4, Bapu Bazaar, Near Sanganeri Gate",
  "district": "Jaipur",
  "state": "Rajasthan",
  "pincode": "302003"
}
```

### Sample Dummy Data (Fuel Dispenser)
```json
{
  "type": "FUEL_DISPENSER",
  "category": "FUEL-MPD-04",
  "make": "Tokheim India",
  "model": "Quantium 510",
  "serialNumber": "TK-MPD-88419",
  "capacity": 80,
  "unit": "L",
  "accuracyClass": "Class II",
  "verificationInterval": 12,
  "installationAddress": "IOCL Retail Outlet, NH-48, Behror",
  "district": "Kotputli-Behror",
  "state": "Rajasthan",
  "pincode": "301701"
}
```

---

## 4. Verification Application Submission Form

* **Portal**: Citizen Web Portal
* **Location**: Dashboard $\rightarrow$ Click **"Apply for Verification"** on any registered instrument
* **Role**: `CONSUMER`

### Field Specifications

| Field | Label | Type | Required? | Validation / Constraints |
|---|---|---|:---:|---|
| `instrumentId` | Selected Instrument | `string (UUID)` | **Yes** | Selected from trader's registered instruments |
| `type` | Application Type | `enum` | **Yes** | `NEW` (First time)<br>`RE_VERIFICATION` (Periodic renewal)<br>`REPAIR_REVERIFICATION` (Post-repair) |
| `remarks` | Special Notes / Instructions | `string` | *Optional* | Additional notes for the inspecting officer |

### Sample Dummy Data
```json
{
  "type": "RE_VERIFICATION",
  "remarks": "Annual periodic re-verification required before expiry of existing certificate."
}
```

---

## 5. Field Officer Inspection Scheduling Dialog

* **Portal**: Field Officer Web Suite (`/field` or `/roster`)
* **Location**: Action menu on pending application $\rightarrow$ **"Schedule Inspection"**
* **Role**: `LMO`, `GATC_INSPECTOR`

### Field Specifications

| Field | Label | Type | Required? | Validation / Constraints |
|---|---|---|:---:|---|
| `scheduledDate` | Scheduled Date & Time | `datetime` | **Yes** | Valid future ISO / local datetime string |
| `remarks` | Scheduling Instructions | `string` | *Optional* | Instructions for trader regarding site readiness |

### Sample Dummy Data
```json
{
  "scheduledDate": "2026-09-25T10:30",
  "remarks": "Site inspection scheduled. Please ensure the scale platform is leveled and clean prior to officer arrival."
}
```

---

## 6. Field Officer Inspection Record Form (Web & Mobile)

* **Platforms**:
  * Web: Field Officer Portal $\rightarrow$ **"Record Inspection"** dialog
  * Mobile: Officer Roster Screen $\rightarrow$ Tap Application $\rightarrow$ **"Conduct Verification"** modal
* **Role**: `LMO`, `GATC_INSPECTOR`

### Field Specifications

| Field | Label | Type | Required? | Validation / Constraints |
|---|---|---|:---:|---|
| `maxPermissibleError` | Max Permissible Error (MPE) | `number` | **Yes** | Positive number $> 0$ (Statutory tolerance limit) |
| `actualErrorObserved` | Actual Error Observed | `number` | **Yes** | Non-negative number $\ge 0$ |
| `sealNumber` | Verification Seal Number | `string` | *Optional* | Official lead/wire or barcode seal affixed (e.g. `LM-SEAL-894210`) |
| `standardsUsed` | Standard Weight / Measures | `string[]` | **Yes** | Serial numbers of working standard weights used |
| `remarks` | Inspection Observations | `string` | *Optional* | Calibration notes, zero point test, eccentricity test |
| `photoUrls` | Verification Site Photo | `string[]` | *Optional* | Camera capture (mobile) or Cloudinary URL (web) |

> **Automated Decision Rule**:
> * If `actualErrorObserved <= maxPermissibleError` $\rightarrow$ Result is **PASSED**. Submitting automatically generates an **ECDSA NIST P-256 digitally signed verification certificate** and QR code.
> * If `actualErrorObserved > maxPermissibleError` $\rightarrow$ Result is **FAILED / REJECTED**. The application is marked rejected for mandatory re-calibration.

### Sample Dummy Data (Pass Outcome)
```json
{
  "maxPermissibleError": 1.5,
  "actualErrorObserved": 0.35,
  "sealNumber": "LM-SEAL-981240",
  "standardsUsed": ["STD-WT-E2-0041", "STD-WT-M1-0089"],
  "remarks": "Passed zero, half, and maximum capacity tests. Repeatability < 0.2 division. Verification seal affixed."
}
```

### Sample Dummy Data (Fail Outcome — Excessive Error)
```json
{
  "maxPermissibleError": 1.0,
  "actualErrorObserved": 2.45,
  "sealNumber": "",
  "standardsUsed": ["STD-WT-F1-0102"],
  "remarks": "Excessive positive corner-load error observed during eccentricity test. Instrument rejected for recalibration."
}
```

---

## 7. Admin: Provision Legal Metrology Officer (LMO)

* **Portal**: Central Admin Portal
* **Route**: `/admin/officers` $\rightarrow$ Click **"Provision Officer"**
* **Role**: `ADMIN`

### Field Specifications

| Field | Label | Type | Required? | Validation / Constraints |
|---|---|---|:---:|---|
| `name` | Officer Full Name | `string` | **Yes** | Min 2 chars |
| `email` | Official Gov Email | `string` | **Yes** | Valid RFC 5322 email |
| `phone` | Mobile Number | `string` | **Yes** | 10-digit Indian mobile number (`^[6-9]\d{9}$`) |
| `password` | Initial Password | `string` | **Yes** | Min 8 characters |
| `badgeNumber` | Statutory Badge Number | `string` | **Yes** | Min 3 chars (e.g., `RJ-LMO-2026-092`) |
| `jurisdictionDistrict`| Jurisdiction District | `string` | **Yes** | Min 2 chars |
| `jurisdictionState` | Jurisdiction State | `string` | **Yes** | Min 2 chars |
| `jurisdictionZone` | Administrative Zone | `string` | *Optional* | e.g. `North Zone`, `Jaipur Division` |
| `officeAddress` | Sub-Divisional Office | `string` | *Optional* | Physical office address |

### Sample Dummy Data
```json
{
  "name": "Devendra Singh Rathore",
  "email": "lmo.jodhpur@metrology.gov.in",
  "phone": "9829012345",
  "password": "Password@123",
  "badgeNumber": "RJ-LMO-2026-104",
  "jurisdictionDistrict": "Jodhpur",
  "jurisdictionState": "Rajasthan",
  "jurisdictionZone": "Marwar Division",
  "officeAddress": "Legal Metrology Bhavan, Mandore Road, Jodhpur - 342007"
}
```

---

## 8. Admin: Provision GATC Calibration Agency

* **Portal**: Central Admin Portal
* **Route**: `/admin/agencies` $\rightarrow$ Click **"Provision GATC Agency"**
* **Role**: `ADMIN`

### Field Specifications

| Field | Label | Type | Required? | Validation / Constraints |
|---|---|---|:---:|---|
| `agencyName` | Laboratory / Agency Name | `string` | **Yes** | Min 2 chars |
| `accreditationNumber` | NABL Accreditation # | `string` | **Yes** | Min 3 chars (e.g., `NABL-CAL-RJ-2026-004`) |
| `notificationRefNumber`| Gazette Notification Ref | `string` | *Optional* | Official Gazette notification reference |
| `authorizedScope` | Authorized Instrument Scope | `string[]` | **Yes** | Multi-select: `NON_AUTOMATIC_WEIGHING_INSTRUMENT`, `AUTOMATIC_WEIGHING_INSTRUMENT`, `FUEL_DISPENSER`, `STORAGE_TANK`, `FLOW_METER` |
| `validUntil` | Accreditation Expiry Date | `date` | **Yes** | Valid date (`YYYY-MM-DD`) |
| `district` | District | `string` | **Yes** | Min 2 chars |
| `state` | State | `string` | **Yes** | Min 2 chars |
| `address` | Laboratory Premises Address | `string` | **Yes** | Min 5 chars |
| `adminName` | Agency Lead / In-Charge Name | `string` | **Yes** | Min 2 chars |
| `adminEmail` | Admin Account Email | `string` | **Yes** | Valid RFC 5322 email |
| `adminPhone` | Contact Mobile Number | `string` | **Yes** | 10-digit Indian mobile number (`^[6-9]\d{9}$`) |
| `adminPassword` | Initial Account Password | `string` | **Yes** | Min 8 characters |

### Sample Dummy Data
```json
{
  "agencyName": "Apex Metrology & Precision Testing Laboratories Pvt. Ltd.",
  "accreditationNumber": "NABL-CAL-RJ-2026-081",
  "notificationRefNumber": "GOI-DOCA-LM/2026/GATC-44",
  "authorizedScope": [
    "NON_AUTOMATIC_WEIGHING_INSTRUMENT",
    "AUTOMATIC_WEIGHING_INSTRUMENT",
    "FUEL_DISPENSER"
  ],
  "validUntil": "2028-12-31",
  "district": "Jaipur",
  "state": "Rajasthan",
  "address": "Plot 45-B, Sitapura Industrial Area, Phase III, Jaipur",
  "adminName": "Dr. Sunita Deshmukh",
  "adminEmail": "sunita.deshmukh@apexmetrology.org",
  "adminPhone": "9811223344",
  "adminPassword": "Password@123"
}
```

---

## 9. GATC Admin: Add In-House Testing Inspector

* **Portal**: GATC Agency Admin Portal
* **Route**: `/agency/staff` $\rightarrow$ Click **"Add Field Inspector"**
* **Role**: `GATC_ADMIN`

### Field Specifications

| Field | Label | Type | Required? | Validation / Constraints |
|---|---|---|:---:|---|
| `name` | Inspector Full Name | `string` | **Yes** | Min 2 chars |
| `email` | Inspector Email | `string` | **Yes** | Valid RFC 5322 email |
| `phone` | Mobile Number | `string` | **Yes** | 10-digit Indian mobile number (`^[6-9]\d{9}$`) |
| `password` | Initial Password | `string` | **Yes** | Min 8 characters |
| `employeeId` | Staff / Employee ID | `string` | **Yes** | Min 2 chars (e.g., `APEX-EMP-042`) |
| `designation` | Technical Designation | `string` | *Optional* | e.g., `Senior Calibration Engineer` |
| `qualificationRef` | NABL Qualification Ref | `string` | *Optional* | e.g., `NABL-CERT-MET-8891` |

### Sample Dummy Data
```json
{
  "name": "Manish Verma",
  "email": "manish.verma@apexmetrology.org",
  "phone": "9788112233",
  "password": "Password@123",
  "employeeId": "APEX-ENG-089",
  "designation": "Senior Calibration & Testing Engineer",
  "qualificationRef": "NABL-CAL-MET-2024-912"
}
```

---

## 10. Profile Settings & Change Password

* **Platforms**:
  * Web: Settings page in all portals (`/settings`, `/admin/settings`, `/field/settings`)
  * Mobile: Settings Screen (gear tab)
* **Roles**: All authenticated users

### Field Specifications

#### Profile Update
| Field | Label | Type | Required? | Validation / Constraints |
|---|---|---|:---:|---|
| `name` | Full Name | `string` | *Optional* | Min 2 chars, max 100 |
| `phone` | Mobile Number | `string` | *Optional* | 10-digit Indian mobile (`^[6-9]\d{9}$`) |

#### Password Change
| Field | Label | Type | Required? | Validation / Constraints |
|---|---|---|:---:|---|
| `currentPassword` | Current Password | `string` | **Yes** | Existing user password |
| `newPassword` | New Password | `string` | **Yes** | Min 8 characters |
| `confirmPassword` | Confirm New Password | `string` | **Yes** | Must match `newPassword` |

### Sample Dummy Data
```json
{
  "currentPassword": "Password@123",
  "newPassword": "SecurePass@2026#",
  "confirmPassword": "SecurePass@2026#"
}
```

