import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z
    .string()
    .min(1, 'MONGODB_URI is required')
    .default(process.env.NODE_ENV === 'test' ? 'mongodb://localhost:27017/test' : ''),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters')
    .default(
      process.env.NODE_ENV === 'test'
        ? 'test_jwt_secret_must_be_at_least_32_characters_long'
        : ''
    ),
  JWT_EXPIRES_IN: z.string().default('1h'),
  GEMINI_API_KEY: z
    .string()
    .default(process.env.NODE_ENV === 'test' ? 'test_gemini_api_key' : ''),
  GEMINI_MODEL: z.string().default('gemini-3.8-flash'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Environment validation failed:');
    for (const issue of result.error.issues) {
      console.error(`- ${issue.path.join('.')}: ${issue.message}`);
    }
    throw new Error('Invalid environment variables');
  }
  return result.data;
};

export const env = parseEnv();
