import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { Analysis } from '../models/Analysis.js';
import { scoreResume } from './scoreService.js';
import * as geminiService from './geminiService.js';
import { AppError } from '../utils/AppError.js';

/**
 * Execute ATS scoring, query Gemini AI suggestions, and persist analysis report.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.resumeText
 * @param {string} params.jobDescription
 * @param {string} [params.title]
 * @returns {Promise<object>}
 */
export const createAnalysis = async ({ userId, resumeText, jobDescription, title }) => {
  // 1. Calculate deterministic ATS score
  const { score, breakdown, matched, missing } = scoreResume(resumeText, jobDescription);

  // 2. Query Gemini for AI enhancements (degrades gracefully to unavailable on error)
  const { aiStatus, ai } = await geminiService.generateAiSuggestions({
    resumeText,
    jobDescription,
    score,
    missing,
  });

  // 3. Compute SHA-256 hash of resume text for deduplication (privacy: raw text not persisted)
  const resumeHash = crypto.createHash('sha256').update(resumeText).digest('hex');
  const jdSnippet = jobDescription.slice(0, 200).trim();

  // 4. Persist analysis document
  const analysis = await Analysis.create({
    userId,
    title: title?.trim() || 'Resume Analysis',
    resumeHash,
    jdSnippet,
    score,
    breakdown,
    matched,
    missing,
    aiStatus,
    ai,
  });

  return analysis.toJSON();
};

/**
 * Get paginated history of analyses for the authenticated user.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {number} params.page
 * @param {number} params.limit
 * @returns {Promise<{ items: object[], page: number, limit: number, total: number, totalPages: number }>}
 */
export const getAnalyses = async ({ userId, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Analysis.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    Analysis.countDocuments({ userId }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items: items.map((item) => item.toJSON()),
    page,
    limit,
    total,
    totalPages,
  };
};

/**
 * Get single analysis by ID, strictly enforcing owner isolation.
 *
 * @param {object} params
 * @param {string} params.id
 * @param {string} params.userId
 * @returns {Promise<object>}
 */
export const getAnalysisById = async ({ id, userId }) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Analysis not found', 404, 'NOT_FOUND');
  }

  const analysis = await Analysis.findOne({ _id: id, userId });
  if (!analysis) {
    throw new AppError('Analysis not found', 404, 'NOT_FOUND');
  }

  return analysis.toJSON();
};

/**
 * Delete single analysis by ID, strictly enforcing owner isolation.
 *
 * @param {object} params
 * @param {string} params.id
 * @param {string} params.userId
 * @returns {Promise<boolean>}
 */
export const deleteAnalysisById = async ({ id, userId }) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Analysis not found', 404, 'NOT_FOUND');
  }

  const result = await Analysis.findOneAndDelete({ _id: id, userId });
  if (!result) {
    throw new AppError('Analysis not found', 404, 'NOT_FOUND');
  }

  return true;
};

export default {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
  deleteAnalysisById,
};
