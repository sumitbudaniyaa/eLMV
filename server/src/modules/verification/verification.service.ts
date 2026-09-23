import { prisma } from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { verifySignature } from "../../keys/pki";
import { ErrorCode } from "@sih/shared";

export class VerificationService {
  /**
   * Publicly verify certificate authenticity by QR Token or Certificate Number
   * Cryptographically validates the digital signature against the stored public key
   */
  async verifyCertificate(identifier: string) {
    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [{ qrToken: identifier }, { certificateNumber: identifier }],
      },
      include: {
        signingKey: true,
        application: {
          include: {
            instrument: true,
            applicant: {
              select: {
                name: true,
                stakeholderProfile: {
                  select: { businessName: true, district: true, state: true, address: true },
                },
              },
            },
            inspectionRecord: {
              include: {
                officer: {
                  select: { name: true, role: true, email: true },
                },
              },
            },
          },
        },
      },
    });

    if (!certificate) {
      throw new AppError(
        404,
        ErrorCode.NOT_FOUND,
        `No certificate found matching identifier '${identifier}'. Please check the QR code or certificate number.`
      );
    }

    // Cryptographic validation of the digital signature
    const isSignatureValid = verifySignature(
      certificate.canonicalPayload,
      certificate.signature,
      certificate.signingKey.publicKey
    );

    const now = new Date();
    const isExpired = now > certificate.validUntil;

    let payloadParsed: any = {};
    try {
      payloadParsed = JSON.parse(certificate.canonicalPayload);
    } catch {
      payloadParsed = {};
    }

    return {
      isSignatureValid,
      verificationStatus: !isSignatureValid
        ? "SIGNATURE_FORGED_OR_ALTERED"
        : isExpired
        ? "EXPIRED"
        : "VALID_AND_ACTIVE",
      cryptographicDetails: {
        algorithm: certificate.signingKey.algorithm,
        keyVersion: certificate.signingKeyVersion,
        signature: certificate.signature,
      },
      certificate: {
        certificateNumber: certificate.certificateNumber,
        issuedAt: certificate.issuedAt,
        validUntil: certificate.validUntil,
        pdfUrl: certificate.pdfUrl,
        qrToken: certificate.qrToken,
      },
      instrument: certificate.application.instrument,
      applicant: certificate.application.applicant,
      inspection: certificate.application.inspectionRecord,
      verifiedPayload: payloadParsed,
    };
  }

  /**
   * Get active public key for external auditing
   */
  async getActivePublicKey() {
    const activeKey = await prisma.signingKey.findFirst({
      where: { isActive: true },
      select: {
        keyVersion: true,
        algorithm: true,
        publicKey: true,
        validFrom: true,
        validUntil: true,
      },
    });

    if (!activeKey) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "Active signing key not found.");
    }

    return activeKey;
  }

  /**
   * Publicly track application status by application number
   */
  async trackApplication(applicationNumber: string) {
    const app = await prisma.application.findUnique({
      where: { applicationNumber },
      include: {
        instrument: {
          select: {
            category: true,
            make: true,
            model: true,
            serialNumber: true,
            capacity: true,
            unit: true,
            accuracyClass: true,
          },
        },
        certificate: {
          select: {
            certificateNumber: true,
            issuedAt: true,
            validUntil: true,
            qrToken: true,
          },
        },
        inspectionRecord: {
          select: {
            inspectedAt: true,
            result: true,
            sealNumber: true,
          },
        },
        assignedOfficer: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    if (!app) {
      throw new AppError(
        404,
        ErrorCode.NOT_FOUND,
        `No application found with application number '${applicationNumber}'.`
      );
    }

    return {
      applicationNumber: app.applicationNumber,
      status: app.status,
      type: app.type,
      submittedAt: app.submittedAt,
      scheduledDate: app.scheduledDate,
      feeAmount: app.feeAmount,
      feePaid: app.feePaid,
      rejectionReason: app.rejectionReason,
      instrument: app.instrument,
      certificate: app.certificate,
      inspectionRecord: app.inspectionRecord,
      assignedOfficer: app.assignedOfficer ? { name: app.assignedOfficer.name, role: app.assignedOfficer.role } : null,
    };
  }
}

export const verificationService = new VerificationService();

