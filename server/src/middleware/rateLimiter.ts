import { Request, Response, NextFunction } from "express";
import { ApiResponse, ErrorCode } from "@sih/shared";

interface RateLimiterOptions {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum number of requests allowed per window per client IP */
  max: number;
  /** User-friendly error message when limit is reached */
  message?: string;
  /** Custom key generator (defaults to client IP) */
  keyGenerator?: (req: Request) => string;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

/**
 * Enterprise-grade in-memory sliding window rate limiter
 * Implements standard RFC rate limit headers:
 * - RateLimit-Limit
 * - RateLimit-Remaining
 * - RateLimit-Reset
 * - Retry-After
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const {
    windowMs,
    max,
    message = "Too many requests. Please try again later.",
    keyGenerator = (req: Request) => {
      const forwarded = req.headers["x-forwarded-for"];
      if (typeof forwarded === "string") {
        return forwarded.split(",")[0].trim();
      }
      return req.ip || req.socket.remoteAddress || "unknown-ip";
    },
  } = options;

  const store = new Map<string, ClientRecord>();

  // Cleanup expired entries every 60 seconds to prevent memory leaks
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 60000);

  // Unref the timer so it doesn't prevent Node process termination during tests
  if (interval.unref) {
    interval.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    let record = store.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      store.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    // Standard HTTP rate-limit headers
    res.setHeader("RateLimit-Limit", max);
    res.setHeader("RateLimit-Remaining", remaining);
    res.setHeader("RateLimit-Reset", resetSeconds);

    if (record.count > max) {
      res.setHeader("Retry-After", resetSeconds);

      const response: ApiResponse = {
        success: false,
        error: {
          code: ErrorCode.RATE_LIMIT_EXCEEDED,
          message,
        },
      };

      res.status(429).json(response);
      return;
    }

    next();
  };
}

/**
 * Pre-configured rate limiters for specific threat surfaces
 */

// Strict limiter for login: 5 attempts per 15 minutes per IP
export const authLoginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts from this IP. Please try again after 15 minutes.",
});

// Strict limiter for registration: 5 registrations per hour per IP
export const authRegisterLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many registration attempts from this IP. Please try again after 1 hour.",
});

// Refresh token limiter: 20 calls per 15 minutes per IP
export const authRefreshLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many token refresh requests. Please try again after a few minutes.",
});

// General API limiter: 300 requests per minute per IP
export const globalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 300,
  message: "Rate limit exceeded. Please throttle your requests.",
});

// File upload limiter: 15 uploads per 10 minutes per IP
export const uploadLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: "Too many photo uploads. Please wait before uploading more inspection photos.",
});

