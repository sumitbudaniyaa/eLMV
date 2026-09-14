import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  global.prismaGlobal ||
  new PrismaClient({
    log: [
      { emit: "event", level: "query" },
      { emit: "event", level: "error" },
      { emit: "event", level: "info" },
      { emit: "event", level: "warn" },
    ],
  });

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}

// Subscribe to database log events
prisma.$on("error" as never, (e: any) => {
  logger.error(e, "Prisma Error");
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info("Connected to PostgreSQL database successfully via Prisma");
  } catch (err) {
    logger.error({ err }, "Failed to connect to PostgreSQL database");
    throw err;
  }
}

