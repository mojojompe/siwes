interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Basic in-memory rate limiter
 * @param identifier The unique identifier for the request (e.g. userId or IP)
 * @param limit Max number of requests allowed within the window
 * @param windowMs Window duration in milliseconds
 * @returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export async function rateLimit(
  identifier: string,
  limit: number = 100, // Default 100 requests
  windowMs: number = 60000 // Default 1 minute
) {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  // Active window
  if (record.count >= limit) {
    return { success: false, limit, remaining: 0, reset: record.resetTime };
  }

  record.count += 1;
  return { success: true, limit, remaining: limit - record.count, reset: record.resetTime };
}
