import { prisma } from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import {
  CreateInstrumentInput,
  UpdateInstrumentInput,
  ErrorCode,
  Role,
  InstrumentType,
  AuditAction,
} from "@sih/shared";

export class InstrumentsService {
  async createInstrument(ownerId: string, input: CreateInstrumentInput) {
    const existing = await prisma.instrument.findUnique({
      where: { serialNumber: input.serialNumber },
    });

    if (existing) {
      throw new AppError(
        409,
        ErrorCode.CONFLICT,
        `An instrument with serial number '${input.serialNumber}' is already registered in the system.`,
        [{ field: "serialNumber", message: "Serial number must be unique" }]
      );
    }

    const instrument = await prisma.instrument.create({
      data: {
        ownerId,
        type: input.type,
        category: input.category,
        make: input.make,
        model: input.model,
        serialNumber: input.serialNumber,
        capacity: input.capacity,
        unit: input.unit,
        accuracyClass: input.accuracyClass,
        verificationInterval: input.verificationInterval || 12,
        installationAddress: input.installationAddress,
        district: input.district,
        state: input.state,
        pincode: input.pincode,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: ownerId,
        action: AuditAction.CREATE,
        entity: "Instrument",
        entityId: instrument.id,
        changes: { serialNumber: instrument.serialNumber, make: instrument.make },
      },
    });

    return instrument;
  }

  async listInstruments(
    userId: string,
    role: Role,
    options: {
      search?: string;
      type?: InstrumentType;
      page?: number;
      limit?: number;
    }
  ) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const andClauses: any[] = [];

    // Enforcement: Consumers can ONLY see their own instruments
    if (role === Role.CONSUMER) {
      andClauses.push({ ownerId: userId });
    }

    if (options.type) {
      andClauses.push({ type: options.type });
    }

    if (options.search) {
      andClauses.push({
        OR: [
          { serialNumber: { contains: options.search, mode: "insensitive" } },
          { make: { contains: options.search, mode: "insensitive" } },
          { model: { contains: options.search, mode: "insensitive" } },
          { category: { contains: options.search, mode: "insensitive" } },
        ],
      });
    }

    const where = andClauses.length > 0 ? { AND: andClauses } : {};

    const [total, instruments] = await Promise.all([
      prisma.instrument.count({ where }),
      prisma.instrument.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      }),
    ]);

    return {
      instruments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getInstrumentById(id: string, userId: string, role: Role) {
    const instrument = await prisma.instrument.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            stakeholderProfile: true,
          },
        },
        applications: {
          orderBy: { submittedAt: "desc" },
          include: {
            certificate: {
              select: {
                id: true,
                certificateNumber: true,
                issuedAt: true,
                validUntil: true,
                pdfUrl: true,
              },
            },
            assignedOfficer: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!instrument) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "Instrument not found.");
    }

    // Ownership check for Consumers
    if (role === Role.CONSUMER && instrument.ownerId !== userId) {
      throw new AppError(
        403,
        ErrorCode.FORBIDDEN,
        "You do not have permission to view this instrument."
      );
    }

    return instrument;
  }

  async lookupBySerialNumber(serialNumber: string) {
    const instrument = await prisma.instrument.findUnique({
      where: { serialNumber },
      include: {
        owner: {
          select: { name: true, stakeholderProfile: { select: { businessName: true } } },
        },
      },
    });

    if (!instrument) {
      throw new AppError(
        404,
        ErrorCode.NOT_FOUND,
        `No instrument found with serial number '${serialNumber}'.`
      );
    }

    return instrument;
  }

  async updateInstrument(
    id: string,
    userId: string,
    role: Role,
    input: UpdateInstrumentInput
  ) {
    const instrument = await prisma.instrument.findUnique({ where: { id } });

    if (!instrument) {
      throw new AppError(404, ErrorCode.NOT_FOUND, "Instrument not found.");
    }

    if (role === Role.CONSUMER && instrument.ownerId !== userId) {
      throw new AppError(
        403,
        ErrorCode.FORBIDDEN,
        "You do not have permission to update this instrument."
      );
    }

    const updated = await prisma.instrument.update({
      where: { id },
      data: input,
    });

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: AuditAction.UPDATE,
        entity: "Instrument",
        entityId: id,
        changes: input,
      },
    });

    return updated;
  }
}

export const instrumentsService = new InstrumentsService();

