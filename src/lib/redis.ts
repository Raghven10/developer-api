import { Redis } from "ioredis"

// Ensure REDIS_URL is provided in .env
// Fallback to localhost for development if not provided
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

// Initialize the Redis client as a singleton to avoid connection leaks in development
const globalForRedis = global as unknown as { redis: Redis }

export const redis = globalForRedis.redis || new Redis(redisUrl)

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis

/**
 * Pushes a notification to the admin dashboard.
 * 
 * @param message A string message describing the event (e.g. "New API Key requested")
 * @param metadata Additional JSON serializable context (e.g. { appId, keyId, userEmail })
 */
export async function notifyAdmin(message: string, metadata?: any) {
    try {
        const payload = JSON.stringify({
            id: Date.now().toString(),
            message,
            metadata,
            timestamp: new Date().toISOString()
        })

        // Push to a list 'admin:notifications'
        // Uses LPUSH so the newest items are at index 0
        await redis.lpush("admin:notifications", payload)

        // Keep only top 1000 notifications to prevent memory issues
        await redis.ltrim("admin:notifications", 0, 999)
    } catch (e) {
        console.error("Failed to push admin notification to Redis:", e)
    }
}

export async function notifyUser(userId: string, message: string, metadata?: any) {
    try {
        const payload = JSON.stringify({
            id: Date.now().toString(),
            message,
            metadata,
            timestamp: new Date().toISOString()
        })
        const key = `user:notifications:${userId}`
        await redis.lpush(key, payload)
        await redis.ltrim(key, 0, 99)
    } catch (e) {
        console.error("Failed to push user notification to Redis:", e)
    }
}
