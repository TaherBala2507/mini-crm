import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  API_PREFIX: z.string().default('/api'),
  
  MONGODB_URI: z.string(),
  MONGODB_TEST_URI: z.string().optional(),
  
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  
  PASSWORD_RESET_EXPIRY: z.string().default('1h'),
  EMAIL_VERIFY_EXPIRY: z.string().default('24h'),
  
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  AUTH_RATE_LIMIT_MAX: z.string().default('5'),
  
  MAX_FILE_SIZE: z.string().default('5242880'),
  UPLOAD_DIR: z.string().default('./uploads'),
  
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const env = parseEnv();

export const config = {
  env: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  apiPrefix: env.API_PREFIX,
  
  db: {
    uri: env.NODE_ENV === 'test' && env.MONGODB_TEST_URI 
      ? env.MONGODB_TEST_URI 
      : env.MONGODB_URI,
  },
  
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiry: env.JWT_ACCESS_EXPIRY,
    refreshExpiry: env.JWT_REFRESH_EXPIRY,
  },
  
  token: {
    passwordResetExpiry: env.PASSWORD_RESET_EXPIRY,
    emailVerifyExpiry: env.EMAIL_VERIFY_EXPIRY,
  },
  
  cors: {
    origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
  },
  
  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
    authMax: parseInt(env.AUTH_RATE_LIMIT_MAX, 10),
  },
  
  upload: {
    maxFileSize: parseInt(env.MAX_FILE_SIZE, 10),
    uploadDir: env.UPLOAD_DIR,
  },
  
  log: {
    level: env.LOG_LEVEL,
  },
};