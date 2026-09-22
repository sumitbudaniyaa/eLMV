"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditAction = exports.NotificationType = exports.NotificationChannel = exports.InspectionResult = exports.ApplicationStatus = exports.ApplicationType = exports.InstrumentType = exports.StakeholderType = exports.Role = void 0;
var Role;
(function (Role) {
    Role["CONSUMER"] = "CONSUMER";
    Role["LMO"] = "LMO";
    Role["GATC_ADMIN"] = "GATC_ADMIN";
    Role["GATC_INSPECTOR"] = "GATC_INSPECTOR";
    Role["ADMIN"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
var StakeholderType;
(function (StakeholderType) {
    StakeholderType["MANUFACTURER"] = "MANUFACTURER";
    StakeholderType["DEALER"] = "DEALER";
    StakeholderType["REPAIRER"] = "REPAIRER";
    StakeholderType["COMMERCIAL_USER"] = "COMMERCIAL_USER";
})(StakeholderType || (exports.StakeholderType = StakeholderType = {}));
var InstrumentType;
(function (InstrumentType) {
    InstrumentType["NON_AUTOMATIC_WEIGHING_INSTRUMENT"] = "NON_AUTOMATIC_WEIGHING_INSTRUMENT";
    InstrumentType["AUTOMATIC_WEIGHING_INSTRUMENT"] = "AUTOMATIC_WEIGHING_INSTRUMENT";
    InstrumentType["FUEL_DISPENSER"] = "FUEL_DISPENSER";
    InstrumentType["STORAGE_TANK"] = "STORAGE_TANK";
    InstrumentType["LENGTH_MEASURE"] = "LENGTH_MEASURE";
    InstrumentType["CAPACITY_MEASURE"] = "CAPACITY_MEASURE";
    InstrumentType["OTHER"] = "OTHER";
})(InstrumentType || (exports.InstrumentType = InstrumentType = {}));
var ApplicationType;
(function (ApplicationType) {
    ApplicationType["NEW"] = "NEW";
    ApplicationType["RE_VERIFICATION"] = "RE_VERIFICATION";
})(ApplicationType || (exports.ApplicationType = ApplicationType = {}));
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["SUBMITTED"] = "SUBMITTED";
    ApplicationStatus["SCHEDULED"] = "SCHEDULED";
    ApplicationStatus["INSPECTED"] = "INSPECTED";
    ApplicationStatus["CERTIFIED"] = "CERTIFIED";
    ApplicationStatus["REJECTED"] = "REJECTED";
    ApplicationStatus["EXPIRED"] = "EXPIRED";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
var InspectionResult;
(function (InspectionResult) {
    InspectionResult["PASSED"] = "PASSED";
    InspectionResult["FAILED"] = "FAILED";
})(InspectionResult || (exports.InspectionResult = InspectionResult = {}));
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["EMAIL"] = "EMAIL";
    NotificationChannel["SMS"] = "SMS";
    NotificationChannel["PUSH"] = "PUSH";
    NotificationChannel["IN_APP"] = "IN_APP";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["APPLICATION_STATUS_CHANGED"] = "APPLICATION_STATUS_CHANGED";
    NotificationType["INSPECTION_SCHEDULED"] = "INSPECTION_SCHEDULED";
    NotificationType["CERTIFICATE_ISSUED"] = "CERTIFICATE_ISSUED";
    NotificationType["VERIFICATION_EXPIRING_SOON"] = "VERIFICATION_EXPIRING_SOON";
    NotificationType["VERIFICATION_EXPIRED"] = "VERIFICATION_EXPIRED";
    NotificationType["REJECTION_NOTICE"] = "REJECTION_NOTICE";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var AuditAction;
(function (AuditAction) {
    AuditAction["CREATE"] = "CREATE";
    AuditAction["UPDATE"] = "UPDATE";
    AuditAction["DELETE"] = "DELETE";
    AuditAction["LOGIN"] = "LOGIN";
    AuditAction["LOGOUT"] = "LOGOUT";
    AuditAction["STATUS_CHANGE"] = "STATUS_CHANGE";
    AuditAction["SIGN_CERTIFICATE"] = "SIGN_CERTIFICATE";
    AuditAction["ROTATE_KEY"] = "ROTATE_KEY";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
//# sourceMappingURL=enums.js.map