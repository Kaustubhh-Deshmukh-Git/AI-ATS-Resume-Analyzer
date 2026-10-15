import * as pdfService from '../services/pdfService.js';

/**
 * Handle resume PDF upload and text extraction.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const parseResume = async (req, res, next) => {
  try {
    const result = await pdfService.extractTextFromPdfBuffer(req.file.buffer);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export default {
  parseResume,
};
