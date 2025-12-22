/**
 * Rate Limiter Utility
 * 
 * Simple in-memory rate limiter for Netlify Functions.
 * Tracks request counts per IP address to prevent abuse.
 * 
 * Note: In-memory storage means limits reset on function cold start.
 * For production, consider using Redis or Netlify Edge Functions.
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store (resets on cold start)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: number;
}

/**
 * Check if request is within rate limit
 * 
 * @param identifier - Unique identifier (e.g., IP address)
 * @param config - Rate limit configuration
 * @returns RateLimitResult
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    // No entry or expired window
    if (!entry || now > entry.resetTime) {
        const resetTime = now + config.windowMs;
        rateLimitStore.set(identifier, { count: 1, resetTime });
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetTime,
        };
    }

    // Within window
    if (entry.count < config.maxRequests) {
        entry.count++;
        return {
            allowed: true,
            remaining: config.maxRequests - entry.count,
            resetTime: entry.resetTime,
        };
    }

    // Rate limit exceeded
    return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
    };
}

/**
 * Get client IP address from Netlify event
 */
export function getClientIP(headers: { [key: string]: string | undefined }): string {
    // Netlify provides client IP in x-nf-client-connection-ip header
    return headers['x-nf-client-connection-ip']
        || headers['x-forwarded-for']?.split(',')[0].trim()
        || headers['x-real-ip']
        || 'unknown';
}
