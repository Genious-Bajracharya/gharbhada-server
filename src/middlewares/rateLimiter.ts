import rateLimit, {
  type RateLimitRequestHandler,
} from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redis from "../lib/redis";


const createRedisStore = () =>
  new RedisStore({
    sendCommand: (...args) => redis.sendCommand(args),
  });

export const globalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  store: createRedisStore(),

  message: {
    message: "Too many requests",
  },
});


export const authLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  store: createRedisStore(),

  message: {
    message: "Too many login attempts",
  },
});

export const refreshLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  store: createRedisStore(),

  message: {
    message: "Too many refresh attempts",
  },
});