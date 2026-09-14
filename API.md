# API Specification — /api/v1 (API.md)

## 1. Global Conventions & Standards

- **Base Path**: `/api/v1`
- **Transport**: JSON (`Content-Type: application/json`), HTTPS in production.
- **Authentication**:
  - Access Token: In-memory Bearer token passed via `Authorization: Bearer <access_token>` header (15m validity).
  - Refresh Token: Delivered via `httpOnly`, `Secure`, `SameSite=Strict` cookie (`refresh_token`) on web; stored in SecureStore on mobile. Rotated upon every refresh call.
- **Validation**: All request payloads, queries, and path parameters validated via shared Zod schemas before hitting controllers.
- **Error Handling**: Centralized error middleware returning uniform error envelopes with standard HTTP status codes.

### 1.1. Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### 1.2. Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The provided payload failed validation.",
    "details": [
      {
        "field": "serialNumber",
        "message": "Serial number is required and cannot be empty"
      }
    ]
  }
}
```

---

## 2. API Endpoints Overview

### 2.1. Authentication (`/api/v1/auth`)
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/register` | None | Public | Register new user (`CONSUMER`, `LMO`, `GATC`) |
| `POST` | `/api/v1/auth/login` | None | Public | Authenticate user; returns access + refresh tokens |
| `POST` | `/api/v1/auth/refresh` | None | Public | Exchange refresh token for new access token |
| `POST` | `/api/v1/auth/logout` | Required | All | Invalidate refresh token |
| `GET` | `/api/v1/auth/me` | Required | All | Return currently authenticated user profile |

### 2.2. Users & Profiles (`/api/v1/users`)
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/api/v1/users` | Required | `ADMIN` | List and search users with role, jurisdiction, and pagination |
| `GET` | `/api/v1/users/:id` | Required | `ADMIN`, Self | Fetch user profile, stakeholder info, officer profile, or GATC profile |
| `PUT` | `/api/v1/users/profile` | Required | All | Update user profile and address details |
| `POST` | `/api/v1/users/stakeholder-profile` | Required | `CONSUMER` | Create/update stakeholder business profile |
| `POST` | `/api/v1/users/officer-profile` | Required | `LMO`, `ADMIN` | Create/update LMO jurisdictional profile (badge, district, state, zone) |
| `POST` | `/api/v1/users/gatc-profile` | Required | `GATC`, `ADMIN` | Create/update GATC profile (gazette notification ref, accreditation, scope) |

### 2.3. Instrument Registry (`/api/v1/instruments`)
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| `POST` | `/api/v1/instruments` | Required | `CONSUMER` | Register new weighing/measuring instrument (commercial traders only) |
| `GET` | `/api/v1/instruments` | Required | All | List instruments (filtered by ownership for `CONSUMER`) |
| `GET` | `/api/v1/instruments/:id` | Required | All | Get detailed instrument profile and verification history |
| `PUT` | `/api/v1/instruments/:id` | Required | `CONSUMER` (Owner), `ADMIN` | Update instrument specifications or location |
| `GET` | `/api/v1/instruments/lookup/:serialNumber` | Required | All | Lookup instrument by unique serial number |

### 2.4. Applications & Scheduling (`/api/v1/applications`)
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| `POST` | `/api/v1/applications` | Required | `CONSUMER` | Submit verification application (commercial traders only); computes Rule 14 fee and provisions Treasury Receipt (`feeReceiptNumber`) |
| `GET` | `/api/v1/applications` | Required | All | List applications with `status` and `instrumentType` filters (owner filtered for `CONSUMER`, assigned for `LMO`, accredited scope constrained for `GATC`) |
| `GET` | `/api/v1/applications/:id` | Required | All | Get application details, assigned officer, inspection records (GATC restricted to accredited scope) |
| `PATCH` | `/api/v1/applications/:id/assign` | Required | `ADMIN` | Assign application to an LMO or GATC |
| `PATCH` | `/api/v1/applications/:id/schedule` | Required | `LMO`, `GATC`, `ADMIN` | Schedule physical verification date and time |
| `PATCH` | `/api/v1/applications/:id/reject` | Required | `LMO`, `GATC`, `ADMIN` | Reject application with documented reason |

### 2.5. Inspections & Observations (`/api/v1/inspections`)
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| `POST` | `/api/v1/inspections` | Required | `LMO`, `GATC` | Record on-site observation test data and result |
| `GET` | `/api/v1/inspections/:id` | Required | All | Get inspection observation details and photo records |
| `POST` | `/api/v1/inspections/upload-photo` | Required | `LMO`, `GATC` | Upload verification photo to Cloudinary |

### 2.6. Certificates & PKI Signing (`/api/v1/certificates`)
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| `POST` | `/api/v1/certificates/issue` | Required | `LMO`, `GATC`, `ADMIN` | Generate PKI signature, QR, and PDF certificate |
| `GET` | `/api/v1/certificates` | Required | All | List certificates with pagination and filters |
| `GET` | `/api/v1/certificates/:id` | Required | All | Retrieve certificate record, signature, and PDF URL |
| `GET` | `/api/v1/certificates/:id/pdf` | Required | All | Download or stream digitally signed certificate PDF |
| `POST` | `/api/v1/certificates/keys/rotate` | Required | `ADMIN` | Generate and activate new asymmetric signing keypair |

### 2.7. Public Verification Portal (`/api/v1/verification`) — **NO AUTH**
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/api/v1/verification/verify/:qrToken` | **None** | Public | Validate cryptographic signature and return verified data |
| `GET` | `/api/v1/verification/cert/:certificateNumber` | **None** | Public | Verify certificate by human-readable certificate number |
| `GET` | `/api/v1/verification/track/:applicationNumber` | **None** | Public | Public real-time 4-stage lifecycle tracker for citizens/traders |
| `GET` | `/api/v1/verification/pdf/:identifier` | **None** | Public | Stream official binary PDF verification certificate generated on-the-fly |
| `GET` | `/api/v1/verification/keys/active-public` | **None** | Public | Retrieve active public key for client-side audit |

### 2.8. Notifications (`/api/v1/notifications`)
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/api/v1/notifications` | Required | All | Get user's notifications (paged) |
| `PATCH` | `/api/v1/notifications/:id/read` | Required | All | Mark single notification as read |
| `PATCH` | `/api/v1/notifications/read-all` | Required | All | Mark all user notifications as read |

### 2.9. Operational Dashboards (`/api/v1/dashboard`)
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/api/v1/dashboard/summary` | Required | All | Retrieve role-tailored dashboard metrics and task queues |

### 2.10. Analytics & Business Intelligence (`/api/v1/analytics`)
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/api/v1/analytics/turnaround-time` | Required | `ADMIN`, `LMO` | Average turnaround time (days/hours) across stages |
| `GET` | `/api/v1/analytics/pendency-trends` | Required | `ADMIN`, `LMO` | Aging pendency breakdown (<7d, 7-15d, 15-30d, >30d) |
| `GET` | `/api/v1/analytics/officer-workload` | Required | `ADMIN` | Inspections performed, pending, and rejection ratios |
| `GET` | `/api/v1/analytics/regional` | Required | `ADMIN` | Geographic compliance statistics by district & state |

### 2.11. Audit Logs & Search (`/api/v1/audit`, `/api/v1/search`)
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/api/v1/audit` | Required | `ADMIN` | Paginated immutable audit trail with actor and entity filters |
| `GET` | `/api/v1/search` | Required | All | Global search across instruments, applications, certificates |

### 2.12. Hierarchical Provisioning & GATC Agency Management (`/api/v1/admin`, `/api/v1/gatc`)
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| `POST` | `/api/v1/admin/officers` | Required | `ADMIN` | Provision territorial Legal Metrology Officer with district/zone jurisdiction |
| `GET` | `/api/v1/admin/officers` | Required | `ADMIN` | List and search provisioned LMO enforcement officers |
| `POST` | `/api/v1/admin/gatc-agencies` | Required | `ADMIN` | Accredit institutional GATC laboratory with Gazette Notification reference |
| `GET` | `/api/v1/admin/gatc-agencies` | Required | `ADMIN` | List and search accredited GATC testing agencies |
| `PATCH` | `/api/v1/admin/gatc-agencies/:id` | Required | `ADMIN` | Update accredited statutory testing scopes and accreditation validity for GATC agency |
| `POST` | `/api/v1/gatc/inspectors` | Required | `GATC_ADMIN` | Provision in-house technical field inspector linked to parent laboratory |
| `GET` | `/api/v1/gatc/inspectors` | Required | `GATC_ADMIN` | List in-house technical inspectors for active agency |
| `GET` | `/api/v1/gatc/dashboard` | Required | `GATC_ADMIN` | Laboratory capacity, active calibration workload, and testing queue metrics |
