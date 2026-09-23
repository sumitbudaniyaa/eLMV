import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import crypto from "crypto";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../middleware/errorHandler";
import { getActiveSigningKey, canonicalizePayload, signPayload } from "../../keys/pki";
import { uploadToCloudinary } from "../../config/cloudinary";
import { logger } from "../../config/logger";
import {
  IssueCertificateInput,
  CanonicalCertificatePayload,
  ErrorCode,
  Role,
  ApplicationStatus,
  InspectionResult,
  AuditAction,
} from "@sih/shared";

/**
 * Windows-1252 extended character codepoints supported by standard PDF Helvetica font
 */
const WIN1252_SPECIAL_SET = new Set([
  0x20AC, // €
  0x201A, // ‚
  0x0192, // ƒ
  0x201E, // „
  0x2026, // …
  0x2020, // †
  0x2021, // ‡
  0x02C6, // ˆ
  0x2030, // ‰
  0x0160, // Š
  0x2039, // ‹
  0x0152, // Œ
  0x017D, // Ž
  0x2018, // ‘
  0x2019, // ’
  0x201C, // “
  0x201D, // ”
  0x2022, // •
  0x2013, // –
  0x2014, // —
  0x02DC, // ˜
  0x2122, // ™
  0x0161, // š
  0x203A, // ›
  0x0153, // œ
  0x017E, // ž
  0x0178, // Ÿ
]);

/**
 * Phonetic Devanagari transliteration map to ensure Hindi trader/officer/business names
 * render legibly in standard WinAnsi Helvetica without pdf-lib encoding crashes.
 */
const DEVANAGARI_MAP: Record<string, string> = {
  "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "oo", "ऋ": "ri",
  "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "अं": "an", "अः": "ah",
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
  "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "ny",
  "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
  "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
  "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
  "य": "y", "र": "r", "ल": "l", "व": "v",
  "श": "sh", "ष": "sh", "स": "s", "ह": "h",
  "ा": "a", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo", "ृ": "ri",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ं": "n", "ः": "h", "्": "",
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
  "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
  "ऑ": "o", "ॉ": "o", "ॅ": "e", "ॐ": "Om", "।": "."
};

function isWinAnsi(codePoint: number): boolean {
  if (codePoint >= 0x20 && codePoint <= 0x7E) return true;
  if (codePoint >= 0xA0 && codePoint <= 0xFF) return true;
  if (WIN1252_SPECIAL_SET.has(codePoint)) return true;
  return false;
}

/**
 * Sanitize text for pdf-lib WinAnsi standard fonts (Helvetica, HelveticaBold, Courier).
 * Replaces currency symbols, non-ASCII characters, Hindi/Devanagari text, and special unicode
 * with safe equivalents to completely prevent "WinAnsi cannot encode" uncaught exceptions.
 */
export function sanitizePdfText(input: any): string {
  if (input === null || input === undefined) return "";
  let text = String(input);

  // Transliterate Devanagari characters
  let transliterated = "";
  for (const char of text) {
    if (DEVANAGARI_MAP[char] !== undefined) {
      transliterated += DEVANAGARI_MAP[char];
    } else {
      transliterated += char;
    }
  }
  text = transliterated;

  // Replace common symbols, quotes, and dashes
  text = text
    .replace(/₹/g, "Rs. ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[—–]/g, "-")
    .replace(/…/g, "...")
    .replace(/[•·]/g, "*")
    .replace(/[✓✔]/g, "[PASS]")
    .replace(/[✗✘❌]/g, "[FAIL]")
    .replace(/[⚠️]/g, "!")
    .replace(/\u00A0/g, " ");

  // Filter to strict WinAnsi characters
  let clean = "";
  for (let i = 0; i < text.length; i++) {
    const cp = text.codePointAt(i);
    if (!cp) continue;
    if (isWinAnsi(cp) || cp === 0x0A || cp === 0x0D || cp === 0x09) {
      clean += text[i];
    } else {
      clean += " ";
    }
    if (cp > 0xFFFF) {
      i++;
    }
  }

  return clean.replace(/\s+/g, " ").trim();
}

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

    // Safe helper that guarantees no un-encodable characters reach pdf-lib
    const drawSafeText = (text: string, options: Parameters<typeof page.drawText>[1]) => {
      page.drawText(sanitizePdfText(text), options);
    };


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
    drawSafeText("GOVERNMENT OF INDIA", {
      x: width / 2 - 85,
      y: currentY,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    currentY -= 16;
    drawSafeText("DEPARTMENT OF CONSUMER AFFAIRS — LEGAL METROLOGY DIVISION", {
      x: width / 2 - 195,
      y: currentY,
      size: 9,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    currentY -= 20;
    drawSafeText("CERTIFICATE OF VERIFICATION OF WEIGHING OR MEASURING INSTRUMENT", {
      x: width / 2 - 215,
      y: currentY,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    currentY -= 12;
    drawSafeText("[Issued under Section 24 of the Legal Metrology Act, 2009 & Rule 14 of General Rules, 2011]", {
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
    drawSafeText(`Certificate No: ${payload.certificateNumber}`, {
      x: 45,
      y: currentY,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    drawSafeText(`Issued At: ${new Date(payload.issuedAt).toLocaleDateString("en-IN")}`, {
      x: width - 200,
      y: currentY,
      size: 9,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });

    currentY -= 15;
    drawSafeText(`Application No: ${payload.applicationId}`, {
      x: 45,
      y: currentY,
      size: 9,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    drawSafeText(`Valid Until: ${new Date(payload.validUntil).toLocaleDateString("en-IN")}`, {
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

    drawSafeText("INSTRUMENT SPECIFICATIONS & STAKEHOLDER IDENTIFICATION", {
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
      ["Manufacturer / Model:", `${payload.make || "Standard"} - ${payload.model || "Standard"}`],
      ["Capacity & Unit:", `${payload.capacity} ${payload.unit}`],
      ["Accuracy Class:", payload.accuracyClass || "CLASS_III"],
      ["Registered Owner:", owner],
      ["Commercial Establishment:", business],
    ];

    details.forEach(([lbl, val]) => {
      drawSafeText(lbl, { x: labelX, y: detailY, size: 8, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
      drawSafeText(val, { x: valX, y: detailY, size: 8, font: fontBold, color: rgb(0, 0, 0) });
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

    drawSafeText("STATUTORY VERIFICATION OBSERVATIONS & TOLERANCES", {
      x: 50,
      y: currentY - 5,
      size: 8.5,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    let testY = currentY - 22;
    drawSafeText("Max Permissible Error (MPE):", { x: 50, y: testY, size: 8, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
    drawSafeText(`±${payload.maxPermissibleError} ${payload.unit}`, { x: 220, y: testY, size: 8, font: fontBold, color: rgb(0, 0, 0) });

    testY -= 16;
    drawSafeText("Actual Max Error Observed:", { x: 50, y: testY, size: 8, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
    drawSafeText(`${payload.actualErrorObserved} ${payload.unit} [PASSED]`, { x: 220, y: testY, size: 8, font: fontBold, color: rgb(0, 0.5, 0) });

    testY -= 16;
    drawSafeText("Affixed Verification Seal No:", { x: 50, y: testY, size: 8, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
    drawSafeText(payload.sealNumber || "N/A", { x: 220, y: testY, size: 8, font: fontBold, color: rgb(0, 0, 0) });

    testY -= 16;
    const officerName = payload.inspectingOfficerName || (payload as any).verifyingOfficer || "Statutory Inspector";
    drawSafeText("Inspecting Legal Metrology Officer:", { x: 50, y: testY, size: 8, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
    drawSafeText(officerName, { x: 220, y: testY, size: 8, font: fontBold, color: rgb(0, 0, 0) });

    // Embedded QR Code & Digital Signature Stamp
    currentY = testY - 45;
    page.drawImage(qrImage, {
      x: 50,
      y: currentY - 100,
      width: 100,
      height: 100,
    });

    drawSafeText("STATUTORY DIGITAL VERIFICATION STAMP", {
      x: 170,
      y: currentY - 10,
      size: 8.5,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    drawSafeText("Digitally Verified & Issued by Directorate of Legal Metrology", {
      x: 170,
      y: currentY - 24,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    drawSafeText("Digital Signature (Base64):", {
      x: 170,
      y: currentY - 38,
      size: 7,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Draw signature across two lines
    drawSafeText(signatureBase64.slice(0, 50), {
      x: 170,
      y: currentY - 50,
      size: 6.5,
      font: fontMono,
      color: rgb(0.1, 0.1, 0.1),
    });
    drawSafeText(signatureBase64.slice(50), {
      x: 170,
      y: currentY - 60,
      size: 6.5,
      font: fontMono,
      color: rgb(0.1, 0.1, 0.1),
    });

    drawSafeText("Scan QR code or visit the public verification portal to authenticate this signature.", {
      x: 170,
      y: currentY - 76,
      size: 7,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Statutory declaration footer
    drawSafeText(
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

    if (!application.instrument) {
      throw new AppError(
        400,
        ErrorCode.VALIDATION_ERROR,
        "Cannot issue certificate: Instrument record is missing from application."
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
    const rawState = (application.instrument?.state || "IN").trim();
    const stateCode = (rawState.length >= 2 ? rawState.slice(0, 2) : rawState.padEnd(2, "X")).toUpperCase();
    const certificateNumber = `LM-${stateCode}-${year}-${String(count + 1).padStart(7, "0")}`;

    // Cryptographic QR Token
    const qrToken = crypto.randomBytes(24).toString("hex");

    // Load active PKI signing key
    const signingKey = await getActiveSigningKey();

    const issuedAt = new Date().toISOString();
    const validUntil = input.validUntil
      ? new Date(input.validUntil).toISOString()
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const applicantName = application.applicant?.name || "Registered Commercial Trader";
    const applicantBusiness =
      application.applicant?.stakeholderProfile?.businessName || applicantName;
    const inspectingOfficerName =
      application.inspectionRecord.officer?.name || "Legal Metrology Officer";
    const inspectionDate = application.inspectionRecord.inspectedAt
      ? application.inspectionRecord.inspectedAt.toISOString()
      : issuedAt;

    // Canonical payload
    const canonicalPayloadObj: CanonicalCertificatePayload = {
      certificateNumber,
      applicationId: application.applicationNumber,
      instrumentSerialNumber: application.instrument.serialNumber || "N/A",
      instrumentType: application.instrument.type || "NON_AUTOMATIC_WEIGHING_INSTRUMENT",
      make: application.instrument.make || "Standard",
      model: application.instrument.model || "Standard",
      capacity: Number(application.instrument.capacity) || 0,
      unit: application.instrument.unit || "kg",
      accuracyClass: application.instrument.accuracyClass || "CLASS_III",
      applicantName,
      applicantBusiness,
      inspectingOfficerId: application.inspectionRecord.officerId || officerId,
      inspectingOfficerName,
      inspectionDate,
      issuedAt,
      validUntil,
      maxPermissibleError: Number(application.inspectionRecord.maxPermissibleError) || 0,
      actualErrorObserved: Number(application.inspectionRecord.actualErrorObserved) || 0,
      sealNumber: application.inspectionRecord.sealNumber || null,
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
    } catch (uploadErr: any) {
      // Fallback local data URI if Cloudinary is not configured or fails
      logger.warn(
        { err: uploadErr?.message || uploadErr },
        "Cloudinary upload failed or unconfigured; falling back to base64 data URI for certificate PDF."
      );
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

