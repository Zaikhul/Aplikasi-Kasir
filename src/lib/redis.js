import Redis from 'ioredis';

const getRedisUrl = () => {
if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
}
    throw new Error('REDIS_URL is not defined');
};

let redis;

if (process.env.NODE_ENV === 'production') {
    redis = new Redis(getRedisUrl(), {
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
        lazyConnect: true,
    });
} else {
    if (!global.redis) {
        global.redis = new Redis(getRedisUrl(), {
            maxRetriesPerRequest: 3,
            enableReadyCheck: false,
            lazyConnect: true,
        });
    }
    redis = global.redis;
}

// Cache helper functions
export const cache = {
async get(key) {
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Redis GET error:', error);
        return null;
    }
},

 async set(key, value, ttl = 3600) {
    try {
        await redis.setex(key, ttl, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Redis SET error:', error);
        return false;
    }
},

async del(key) {
    try {
        await redis.del(key);
        return true;
    } catch (error) {
        console.error('Redis DEL error:', error);
        return false;
    }
},

async invalidatePattern(pattern) {
    try {
        const keys = await redis.keys(pattern);
        
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    return true;
    } catch (error) {
        console.error('Redis invalidate error:', error);
        return false;
    }
}};

export default redis;