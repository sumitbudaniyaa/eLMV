import { prisma } from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import {
  CreateInspectionInput,
  ErrorCode,
  Role,
  InspectionResult,
  ApplicationStatus,
  AuditAction,
} from "@sih/shared";

export class InspectionsService {
  /**
   * Record physical on-site or laboratory inspection results
   */
  async recordInspection(officerId: string, role: Role, input: CreateInspectionInput) {
    const application = await prisma.application.findUnique({
      where: { id: input.applicationId },
      include: { instrument: true },
    });

    if (!application) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "Application not found.");
    }

    if (
      application.status !== ApplicationStatus.SCHEDULED &&
      application.status !== ApplicationStatus.SUBMITTED
    ) {
      throw new AppError(
        400,
        ErrorCode.INVALID_STATE_TRANSITION,
        `Cannot record inspection for application in status ${application.status}. Must be SCHEDULED or SUBMITTED.`
      );
    }

    // Authorization: only assigned officer or admin can record inspection
    if (
      role !== Role.ADMIN &&
      application.assignedOfficerId &&
      application.assignedOfficerId !== officerId
    ) {
      throw new AppError(
        403,
        ErrorCode.FORBIDDEN,
        "You are not the assigned verification officer for this application."
      );
    }

    // Regulatory validation: check observed error against MPE
    if (input.result === InspectionResult.PASSED && input.actualErrorObserved > input.maxPermissibleError) {
      throw new AppError(
        400,
        ErrorCode.VALIDATION_ERROR,
        `Regulatory Violation: Cannot mark inspection as PASSED when actual error observed (${input.actualErrorObserved}) exceeds Maximum Permissible Error (${input.maxPermissibleError}).`
      );
    }

    // Create inspection record
    const inspection = await prisma.inspectionRecord.create({
      data: {
        applicationId: input.applicationId,
        officerId,
        result: input.result,
        observations: input.observations,
        standardsUsed: input.standardsUsed,
        maxPermissibleError: input.maxPermissibleError,
        actualErrorObserved: input.actualErrorObserved,
        photoUrls: input.photoUrls,
        sealNumber: input.sealNumber,
        remarks: input.remarks,
      },
    });

    // Determine application state transition
    const nextStatus =
      input.result === InspectionResult.PASSED
        ? ApplicationStatus.INSPECTED
        : ApplicationStatus.REJECTED;

    await prisma.application.update({
      where: { id: input.applicationId },
      data: {
        status: nextStatus,
        assignedOfficerId: application.assignedOfficerId || officerId,
        rejectionReason:
          input.result === InspectionResult.FAILED
            ? input.remarks || `Failed verification: error ${input.actualErrorObserved} exceeds MPE ${input.maxPermissibleError}`
            : undefined,
        history: {
          create: {
            fromStatus: application.status,
            toStatus: nextStatus,
            actorId: officerId,
            notes: `Inspection completed: ${input.result}. Error observed: ${input.actualErrorObserved}.`,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: officerId,
        action: AuditAction.CREATE,
        entity: "InspectionRecord",
        entityId: inspection.id,
        changes: {
          result: input.result,
          applicationId: input.applicationId,
          actualErrorObserved: input.actualErrorObserved,
        },
      },
    });

    return inspection;
  }

  /**
   * Retrieve inspection record by ID
   */
  async getInspectionById(id: string, userId: string, role: Role) {
    const inspection = await prisma.inspectionRecord.findUnique({
      where: { id },
      include: {
        officer: {
          select: { id: true, name: true, email: true, phone: true, role: true },
        },
        application: {
          include: {
            instrument: true,
            applicant: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!inspection) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "Inspection record not found.");
    }

    if (
      role === Role.CONSUMER &&
      inspection.application.applicantId !== userId
    ) {
      throw new AppError(
        403,
        ErrorCode.FORBIDDEN,
        "You do not have permission to view this inspection report."
      );
    }

    return inspection;
  }
}

export const inspectionsService = new InspectionsService();

