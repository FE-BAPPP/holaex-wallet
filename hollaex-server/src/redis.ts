import { createClient } from 'redis';
import { config } from './index';

export const redis = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password
};

// Create Redis client instance
export const redisClient = createClient({
  socket: {
    host: redis.host,
    port: redis.port
  },
  password: redis.password
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Connect to Redis
export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
};