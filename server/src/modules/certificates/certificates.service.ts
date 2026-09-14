import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import crypto from "crypto";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../middleware/errorHandler";
import { getActiveSigningKey, canonicalizePayload, signPayload } from "../../keys/pki";
import { uploadToCloudinary } from "../../config/cloudinary";
import {
  IssueCertificateInput,
  CanonicalCertificatePayload,
  ErrorCode,
  Role,
  ApplicationStatus,
  InspectionResult,
  AuditAction,
} from "@sih/shared";

export class CertificatesService {
  /**
   * Generate signed PDF certificate using pdf-lib
   */
  private async generateCertificatePdf(
    payload: CanonicalCertificatePayload,
    qrBuffer: Buffer,
    signatureBase64: string
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait in points

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

    const qrImage = await pdfDoc.embedPng(qrBuffer);

    const { width, height } = page.getSize();

    // Outer double border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1.5,
    });
    page.drawRectangle({
      x: 25,
      y: 25,
      width: width - 50,
      height: height - 50,
      borderColor: rgb(0.2, 0.2, 0.2),
      borderWidth: 0.5,
    });

    // Header
    let currentY = height - 60;
    page.drawText("GOVERNMENT OF INDIA", {
      x: width / 2 - 85,
      y: currentY,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    currentY -= 16;
    page.drawText("DEPARTMENT OF CONSUMER AFFAIRS — LEGAL METROLOGY DIVISION", {
      x: width / 2 - 195,
      y: currentY,
      size: 9,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    currentY -= 20;
    page.drawText("CERTIFICATE OF VERIFICATION OF WEIGHING OR MEASURING INSTRUMENT", {
      x: width / 2 - 215,
      y: currentY,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    currentY -= 12;
    page.drawText("[Issued under Section 24 of the Legal Metrology Act, 2009 & Rule 14 of General Rules, 2011]", {
      x: width / 2 - 210,
      y: currentY,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Horizontal divider
    currentY -= 15;
    page.drawLine({
      start: { x: 40, y: currentY },
      end: { x: width - 40, y: currentY },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    // Certificate metadata
    currentY -= 22;
    page.drawText(`Certificate No: ${payload.certificateNumber}`, {
      x: 45,
      y: currentY,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Issued At: ${new Date(payload.issuedAt).toLocaleDateString("en-IN")}`, {
      x: width - 200,
      y: currentY,
      size: 9,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });

    currentY -= 15;
    page.drawText(`Application No: ${payload.applicationId}`, {
      x: 45,
      y: currentY,
      size: 9,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText(`Valid Until: ${new Date(payload.validUntil).toLocaleDateString("en-IN")}`, {
      x: width - 200,
      y: currentY,
      size: 9,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    // Instrument Details Box
    currentY -= 25;
    page.drawRectangle({
      x: 40,
      y: currentY - 140,
      width: width - 80,
      height: 150,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 0.8,
      color: rgb(0.98, 0.98, 0.98),
    });

    page.drawText("INSTRUMENT SPECIFICATIONS & STAKEHOLDER IDENTIFICATION", {
      x: 50,
      y: currentY - 5,
      size: 8.5,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    const labelX = 50;
    const valX = 180;
    let detailY = currentY - 22;

    const serialNumber = payload.instrumentSerialNumber || (payload as any).serialNumber || "N/A";
    const instrumentCategory = (payload.instrumentType || (payload as any).type || "NON_AUTOMATIC_WEIGHING_INSTRUMENT").replace(/_/g, " ");
    const owner = payload.applicantName || (payload as any).ownerName || "Registered Commercial Trader";
    const business = payload.applicantBusiness || (payload as any).businessName || "Commercial Establishment";

    const details = [
      ["Serial Number / UID:", serialNumber],
      ["Instrument Category:", instrumentCategory],
      ["Manufacturer / Model:", `${payload.make} — ${payload.model}`],
      ["Capacity & Unit:", `${payload.capacity} ${payload.unit}`],
      ["Accuracy Class:", payload.accuracyClass],
      ["Registered Owner:", owner],
      ["Commercial Establishment:", business],
    ];

    details.forEach(([lbl, val]) => {
      page.drawText(lbl, { x: labelX, y: detailY, size: 8, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
      page.drawText(val, { x: valX, y: detailY, size: 8, font: fontBold, color: rgb(0, 0, 0) });
      detailY -= 16;
    });

    // Statutory Test & Tolerance Results
    currentY = detailY - 30;
    page.drawRectangle({
      x: 40,
      y: currentY - 80,
      width: width - 80,
      height: 90,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 0.8,
      color: rgb(0.98, 0.98, 0.98),
    });

    page.drawText("STATUTORY VERIFICATION OBSERVATIONS & TOLERANCES", {
      x: 50,
      y: currentY - 5,
      size: 8.5,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    let testY = currentY - 22;
    page.drawText("Max Permissible Error (MPE):", { x: 50, y: testY, size: 8, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(`±${payload.maxPermissibleError} ${payload.unit}`, { x: 220, y: testY, size: 8, font: fontBold, color: rgb(0, 0, 0) });

    testY -= 16;
    page.drawText("Actual Max Error Observed:", { x: 50, y: testY, size: 8, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(`${payload.actualErrorObserved} ${payload.unit} [PASSED]`, { x: 220, y: testY, size: 8, font: fontBold, color: rgb(0, 0.5, 0) });

    testY -= 16;
    page.drawText("Affixed Verification Seal No:", { x: 50, y: testY, size: 8, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(payload.sealNumber || "N/A", { x: 220, y: testY, size: 8, font: fontBold, color: rgb(0, 0, 0) });

    testY -= 16;
    const officerName = payload.inspectingOfficerName || (payload as any).verifyingOfficer || "Statutory Inspector";
    page.drawText("Inspecting Legal Metrology Officer:", { x: 50, y: testY, size: 8, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(officerName, { x: 220, y: testY, size: 8, font: fontBold, color: rgb(0, 0, 0) });

    // Embedded QR Code & Digital Signature Stamp
    currentY = testY - 45;
    page.drawImage(qrImage, {
      x: 50,
      y: currentY - 100,
      width: 100,
      height: 100,
    });

    page.drawText("ASYMMETRIC CRYPTOGRAPHIC PKI STAMP", {
      x: 170,
      y: currentY - 10,
      size: 8.5,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    const keyVer = payload.signingKeyVersion || (payload as any).keyVersion || "v1-2026";
    page.drawText(`Signing Key Version: ${keyVer} (ECDSA NIST P-256 / SHA-256)`, {
      x: 170,
      y: currentY - 24,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText("Digital Signature (Base64):", {
      x: 170,
      y: currentY - 38,
      size: 7,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Draw signature across two lines
    page.drawText(signatureBase64.slice(0, 50), {
      x: 170,
      y: currentY - 50,
      size: 6.5,
      font: fontMono,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawText(signatureBase64.slice(50), {
      x: 170,
      y: currentY - 60,
      size: 6.5,
      font: fontMono,
      color: rgb(0.1, 0.1, 0.1),
    });

    page.drawText("Scan QR code or visit the public verification portal to authenticate this signature.", {
      x: 170,
      y: currentY - 76,
      size: 7,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Statutory declaration footer
    page.drawText(
      "Notice: Tampering with this certificate or obliterating the verification mark/seal is an offence under Section 25 & 26 of the Legal Metrology Act, 2009.",
      {
        x: 40,
        y: 40,
        size: 6.5,
        font: fontRegular,
        color: rgb(0.5, 0.5, 0.5),
      }
    );

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Issue signed certificate for an inspected application
   */
  async issueCertificate(officerId: string, role: Role, input: IssueCertificateInput) {
    const application = await prisma.application.findUnique({
      where: { id: input.applicationId },
      include: {
        instrument: true,
        applicant: {
          include: { stakeholderProfile: true },
        },
        inspectionRecord: {
          include: { officer: true },
        },
      },
    });

    if (!application) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "Application not found.");
    }

    if (!application.inspectionRecord) {
      throw new AppError(
        400,
        ErrorCode.INVALID_STATE_TRANSITION,
        "Cannot issue certificate without an inspection record."
      );
    }

    if (application.inspectionRecord.result !== InspectionResult.PASSED) {
      throw new AppError(
        400,
        ErrorCode.VALIDATION_ERROR,
        "Cannot issue certificate for an inspection that did not PASS."
      );
    }

    // Check if certificate already exists
    const existingCert = await prisma.certificate.findUnique({
      where: { applicationId: input.applicationId },
    });

    if (existingCert) {
      return existingCert;
    }

    // Generate unique Certificate Number
    const count = await prisma.certificate.count();
    const year = new Date().getFullYear();
    const stateCode = (application.instrument.state.slice(0, 2) || "IN").toUpperCase();
    const certificateNumber = `LM-${stateCode}-${year}-${String(count + 1).padStart(7, "0")}`;

    // Cryptographic QR Token
    const qrToken = crypto.randomBytes(24).toString("hex");

    // Load active PKI signing key
    const signingKey = await getActiveSigningKey();

    const issuedAt = new Date().toISOString();
    const validUntil = input.validUntil
      ? new Date(input.validUntil).toISOString()
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    // Canonical payload
    const canonicalPayloadObj: CanonicalCertificatePayload = {
      certificateNumber,
      applicationId: application.applicationNumber,
      instrumentSerialNumber: application.instrument.serialNumber,
      instrumentType: application.instrument.type,
      make: application.instrument.make,
      model: application.instrument.model,
      capacity: application.instrument.capacity,
      unit: application.instrument.unit,
      accuracyClass: application.instrument.accuracyClass,
      applicantName: application.applicant.name,
      applicantBusiness: application.applicant.stakeholderProfile?.businessName || application.applicant.name,
      inspectingOfficerId: application.inspectionRecord.officerId,
      inspectingOfficerName: application.inspectionRecord.officer.name,
      inspectionDate: application.inspectionRecord.inspectedAt.toISOString(),
      issuedAt,
      validUntil,
      maxPermissibleError: application.inspectionRecord.maxPermissibleError,
      actualErrorObserved: application.inspectionRecord.actualErrorObserved,
      sealNumber: application.inspectionRecord.sealNumber,
      signingKeyVersion: signingKey.keyVersion,
    };

    const canonicalJson = canonicalizePayload(canonicalPayloadObj as any);

    // Cryptographically sign with ECDSA private key
    const signature = signPayload(canonicalJson, signingKey.privateKeyPem);

    // Generate QR code buffer embedding verification URL
    const verificationUrl = `${env.PUBLIC_VERIFICATION_URL}?token=${qrToken}`;
    const qrBuffer = await QRCode.toBuffer(verificationUrl, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 240,
    });

    // Generate stamped PDF
    const pdfBuffer = await this.generateCertificatePdf(
      canonicalPayloadObj,
      qrBuffer,
      signature
    );

    // Upload PDF to Cloudinary as raw resource to ensure binary byte preservation
    let pdfUrl: string | undefined;
    try {
      pdfUrl = await uploadToCloudinary(
        pdfBuffer,
        "certificates",
        `cert-${certificateNumber}`,
        "raw"
      );
    } catch {
      // Fallback local data URI if Cloudinary is not configured in offline dev
      pdfUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
    }

    // Persist Certificate record
    const certificate = await prisma.certificate.create({
      data: {
        certificateNumber,
        applicationId: input.applicationId,
        signingKeyId: signingKey.id,
        signingKeyVersion: signingKey.keyVersion,
        canonicalPayload: canonicalJson,
        signature,
        qrToken,
        issuedAt: new Date(issuedAt),
        validUntil: new Date(validUntil),
        pdfUrl,
      },
    });

    // Update Application status to CERTIFIED
    await prisma.application.update({
      where: { id: input.applicationId },
      data: {
        status: ApplicationStatus.CERTIFIED,
        history: {
          create: {
            fromStatus: ApplicationStatus.INSPECTED,
            toStatus: ApplicationStatus.CERTIFIED,
            actorId: officerId,
            notes: `Certificate ${certificateNumber} issued with PKI signature (${signingKey.keyVersion}).`,
          },
        },
      },
    });

    // Update Instrument lastVerifiedAt and nextDueAt
    await prisma.instrument.update({
      where: { id: application.instrumentId },
      data: {
        lastVerifiedAt: new Date(issuedAt),
        nextDueAt: new Date(validUntil),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: officerId,
        action: AuditAction.SIGN_CERTIFICATE,
        entity: "Certificate",
        entityId: certificate.id,
        changes: { certificateNumber, signingKeyVersion: signingKey.keyVersion },
      },
    });

    return certificate;
  }

  /**
   * List certificates
   */
  async listCertificates(options: { page?: number; limit?: number }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const [total, certificates] = await Promise.all([
      prisma.certificate.count(),
      prisma.certificate.findMany({
        skip,
        take: limit,
        orderBy: { issuedAt: "desc" },
        include: {
          application: {
            include: {
              instrument: true,
              applicant: { select: { name: true, email: true } },
            },
          },
        },
      }),
    ]);

    return {
      certificates,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single certificate
   */
  async getCertificateById(id: string) {
    const cert = await prisma.certificate.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            instrument: true,
            applicant: true,
            inspectionRecord: { include: { officer: true } },
          },
        },
      },
    });

    if (!cert) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "Certificate not found.");
    }

    return cert;
  }

  /**
   * Retrieve and generate verified signed PDF certificate buffer
   */
  async getCertificatePdfBuffer(identifier: string): Promise<{ pdfBuffer: Buffer; certificateNumber: string }> {
    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [
          { certificateNumber: identifier },
          { qrToken: identifier },
          { id: identifier },
        ],
      },
    });

    if (!cert) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "Certificate not found.");
    }

    const payload: CanonicalCertificatePayload = JSON.parse(cert.canonicalPayload);
    const verificationUrl = `${process.env.PUBLIC_APP_URL || "http://localhost:5173"}/verify?cert=${cert.certificateNumber}`;
    const qrBuffer = await QRCode.toBuffer(verificationUrl, {
      type: "png",
      margin: 1,
      width: 256,
      errorCorrectionLevel: "H",
    });

    const pdfBuffer = await this.generateCertificatePdf(payload, qrBuffer, cert.signature);
    return { pdfBuffer, certificateNumber: cert.certificateNumber };
  }
}

export const certificatesService = new CertificatesService();

