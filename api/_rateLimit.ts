// Simple in-memory rate limiting for Vercel serverless
// Note: This resets on each deployment. For production, use Redis or Upstash.

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const limits = new Map<string, RateLimitEntry>();

export function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = limits.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    limits.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }
  
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }
  
  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
}

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of limits.entries()) {
    if (now > entry.resetTime) {
      limits.delete(key);
    }
  }
}, 300000);
