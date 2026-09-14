import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectDatabase } from "./config/database";
import { notificationsService } from "./modules/notifications/notifications.service";

async function bootstrap() {
  try {
    logger.info("Initializing Legal Metrology System Server...");

    // Connect Database
    await connectDatabase();

    // Start background statutory expiry and notification engine
    notificationsService.startCron();
    notificationsService.checkExpiriesAndNotify().catch(() => {});

    const server = app.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      logger.info(`API Endpoint: http://localhost:${env.PORT}/api/v1`);
      logger.info(`Health Check: http://localhost:${env.PORT}/health`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Gracefully shutting down...`);
      server.close(() => {
        logger.info("HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.fatal({ error }, "Failed to start server application");
    process.exit(1);
  }
}

bootstrap();

