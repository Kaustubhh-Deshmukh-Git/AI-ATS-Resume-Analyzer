import * as analysisService from '../services/analysisService.js';

/**
 * Handle creation of a new resume ATS analysis.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const create = async (req, res, next) => {
  try {
    const analysis = await analysisService.createAnalysis({
      userId: req.user.id,
      resumeText: req.body.resumeText,
      jobDescription: req.body.jobDescription,
      title: req.body.title,
    });

    res.status(201).json({ analysis });
  } catch (err) {
    next(err);
  }
};

/**
 * Handle listing of paginated analyses for current user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const list = async (req, res, next) => {
  try {
    const { page, limit } = req.validatedQuery || req.query;
    const result = await analysisService.getAnalyses({
      userId: req.user.id,
      page,
      limit,
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Handle retrieval of single analysis by ID with owner scoping.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const getById = async (req, res, next) => {
  try {
    const analysis = await analysisService.getAnalysisById({
      id: req.params.id,
      userId: req.user.id,
    });

    res.status(200).json({ analysis });
  } catch (err) {
    next(err);
  }
};

/**
 * Handle deletion of single analysis by ID with owner scoping.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const deleteById = async (req, res, next) => {
  try {
    await analysisService.deleteAnalysisById({
      id: req.params.id,
      userId: req.user.id,
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export default {
  create,
  list,
  getById,
  deleteById,
};
