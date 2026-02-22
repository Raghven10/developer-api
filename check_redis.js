const { Redis } = require("ioredis");
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(redisUrl);
redis.lrange("admin:notifications", 0, 10).then(console.log).finally(() => redis.quit());
