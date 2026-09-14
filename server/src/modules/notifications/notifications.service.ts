import cron from "node-cron";
import { prisma } from "../../config/database";
import { logger } from "../../config/logger";
import {
  NotificationType,
  NotificationChannel,
  ApplicationStatus,
} from "@sih/shared";

export class NotificationsService {
  /**
   * Run statutory verification expiry checks and transition expired certificates
   */
  async checkExpiriesAndNotify() {
    logger.info("Running statutory verification expiry cron job...");
    const now = new Date();
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);

    // 1. Find instruments expiring within 30 days
    const expiringInstruments = await prisma.instrument.findMany({
      where: {
        nextDueAt: { lte: thirtyDaysAhead, gte: now },
      },
      include: { owner: true },
    });

    for (const inst of expiringInstruments) {
      // Avoid duplicate alert if already sent in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentAlert = await prisma.notification.findFirst({
        where: {
          userId: inst.ownerId,
          type: NotificationType.VERIFICATION_EXPIRING_SOON,
          sentAt: { gte: sevenDaysAgo },
        },
      });

      if (!recentAlert) {
        await prisma.notification.create({
          data: {
            userId: inst.ownerId,
            type: NotificationType.VERIFICATION_EXPIRING_SOON,
            channel: NotificationChannel.IN_APP,
            title: "Verification Renewal Due Soon",
            message: `Statutory verification for your instrument '${inst.make} (${inst.serialNumber})' is due on ${inst.nextDueAt?.toLocaleDateString("en-IN")}. Please submit re-verification to avoid non-compliance penalties.`,
          },
        });
      }
    }

    // 2. Find and auto-transition past-due applications to EXPIRED
    const expiredCertificates = await prisma.certificate.findMany({
      where: {
        validUntil: { lt: now },
        application: { status: ApplicationStatus.CERTIFIED },
      },
      include: { application: true },
    });

    for (const cert of expiredCertificates) {
      await prisma.application.update({
        where: { id: cert.applicationId },
        data: {
          status: ApplicationStatus.EXPIRED,
          history: {
            create: {
              fromStatus: ApplicationStatus.CERTIFIED,
              toStatus: ApplicationStatus.EXPIRED,
              actorId: cert.application.applicantId,
              notes: `Statutory certificate ${cert.certificateNumber} expired on ${cert.validUntil.toLocaleDateString("en-IN")}.`,
            },
          },
        },
      });

      await prisma.notification.create({
        data: {
          userId: cert.application.applicantId,
          type: NotificationType.VERIFICATION_EXPIRED,
          channel: NotificationChannel.IN_APP,
          title: "Instrument Verification Expired",
          message: `The verification certificate for ${cert.application.instrumentId} has expired. Operating unverified instruments is prohibited under Section 24 of the Legal Metrology Act.`,
        },
      });
    }

    logger.info(
      `Expiry check completed: ${expiringInstruments.length} alerts checked, ${expiredCertificates.length} certificates expired.`
    );
  }

  /**
   * Initialize cron job (Runs daily at midnight)
   */
  startCron() {
    cron.schedule("0 0 * * *", () => {
      this.checkExpiriesAndNotify().catch((err) => {
        logger.error({ err }, "Error running expiry cron job");
      });
    });
    logger.info("Background statutory notification cron initialized (daily at 00:00).");
  }

  async getNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, notifications] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { sentAt: "desc" },
      }),
    ]);

    return {
      notifications,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

export const notificationsService = new NotificationsService();

