import {
  generateEcdsaKeypair,
  encryptPrivateKey,
  decryptPrivateKey,
  canonicalizePayload,
  signPayload,
  verifySignature,
} from "./pki";

describe("Asymmetric PKI Cryptographic Engine (ECDSA P-256 / SHA-256)", () => {
  it("should generate a valid ECDSA P-256 keypair in PEM format", () => {
    const { publicKeyPem, privateKeyPem } = generateEcdsaKeypair();

    expect(publicKeyPem).toContain("-----BEGIN PUBLIC KEY-----");
    expect(publicKeyPem).toContain("-----END PUBLIC KEY-----");
    expect(privateKeyPem).toContain("-----BEGIN PRIVATE KEY-----");
    expect(privateKeyPem).toContain("-----END PRIVATE KEY-----");
  });

  it("should securely encrypt and decrypt the private key with AES-256-GCM", () => {
    const { privateKeyPem } = generateEcdsaKeypair();
    const encrypted = encryptPrivateKey(privateKeyPem);

    expect(encrypted).not.toEqual(privateKeyPem);
    expect(encrypted.split(":")).toHaveLength(3); // iv:authTag:ciphertext

    const decrypted = decryptPrivateKey(encrypted);
    expect(decrypted).toEqual(privateKeyPem);
  });

  it("should canonicalize objects deterministically regardless of key order", () => {
    const payload1 = {
      certificateNumber: "LM-KA-2026-0001",
      capacity: 50.0,
      accuracyClass: "Class III",
      timestamp: "2026-09-07T10:00:00.000Z",
    };

    const payload2 = {
      timestamp: "2026-09-07T10:00:00.000Z",
      accuracyClass: "Class III",
      certificateNumber: "LM-KA-2026-0001",
      capacity: 50.0,
    };

    const canonical1 = canonicalizePayload(payload1);
    const canonical2 = canonicalizePayload(payload2);

    expect(canonical1).toEqual(canonical2);
  });

  it("should successfully sign and verify a certificate payload", () => {
    const { publicKeyPem, privateKeyPem } = generateEcdsaKeypair();

    const certificateData = {
      certificateNumber: "LM-KA-2026-0008492",
      applicationId: "app-uuid-12345",
      instrumentSerialNumber: "ESSAE-DS-2025-00892",
      maxPermissibleError: 5.0,
      actualErrorObserved: 1.2,
      issuedAt: "2026-09-07T10:00:00.000Z",
      validUntil: "2027-09-06T23:59:59.000Z",
    };

    const canonical = canonicalizePayload(certificateData);
    const signature = signPayload(canonical, privateKeyPem);

    expect(typeof signature).toBe("string");
    expect(signature.length).toBeGreaterThan(60);

    const isValid = verifySignature(canonical, signature, publicKeyPem);
    expect(isValid).toBe(true);
  });

  it("should FAIL verification if payload is tampered with (tamper-detection)", () => {
    const { publicKeyPem, privateKeyPem } = generateEcdsaKeypair();

    const originalData = {
      certificateNumber: "LM-KA-2026-0008492",
      maxPermissibleError: 5.0,
      actualErrorObserved: 1.2,
    };

    const canonicalOriginal = canonicalizePayload(originalData);
    const signature = signPayload(canonicalOriginal, privateKeyPem);

    // Tampered payload: altering actualErrorObserved from 1.2 to 9.9
    const tamperedData = {
      certificateNumber: "LM-KA-2026-0008492",
      maxPermissibleError: 5.0,
      actualErrorObserved: 9.9,
    };

    const canonicalTampered = canonicalizePayload(tamperedData);
    const isValid = verifySignature(canonicalTampered, signature, publicKeyPem);

    expect(isValid).toBe(false);
  });

  it("should FAIL verification if signed by a different private key", () => {
    const keypairA = generateEcdsaKeypair();
    const keypairB = generateEcdsaKeypair();

    const payload = canonicalizePayload({ cert: "TEST-01" });
    const signatureA = signPayload(payload, keypairA.privateKeyPem);

    // Attempting to verify with Keypair B's public key
    const isValid = verifySignature(payload, signatureA, keypairB.publicKeyPem);
    expect(isValid).toBe(false);
  });
});

