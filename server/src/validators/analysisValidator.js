import { z } from 'zod';

export const createAnalysisSchema = z.object({
  resumeText: z
    .string({ required_error: 'Resume text is required' })
    .trim()
    .min(200, 'Resume text must be at least 200 characters')
    .max(50000, 'Resume text cannot exceed 50,000 characters'),
  jobDescription: z
    .string({ required_error: 'Job description is required' })
    .trim()
    .min(50, 'Job description must be at least 50 characters')
    .max(10000, 'Job description cannot exceed 10,000 characters'),
  title: z
    .string()
    .trim()
    .max(120, 'Title cannot exceed 120 characters')
    .optional(),
});

export const queryAnalysesSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(50, 'Limit cannot exceed 50').default(10),
});

/**
 * Middleware factory to validate request query against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 */
export const validateQuery = (schema) => (req, _res, next) => {
  try {
    const parsed = schema.parse(req.query);
    req.validatedQuery = parsed;
    try {
      Object.assign(req.query, parsed);
    } catch {
      // Ignored if query properties cannot be overwritten
    }
    next();
  } catch (err) {
    next(err);
  }
};
