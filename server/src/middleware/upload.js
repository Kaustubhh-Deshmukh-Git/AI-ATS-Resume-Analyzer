import multer from 'multer';
import path from 'node:path';
import { AppError } from '../utils/AppError.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Filter to ensure uploaded file is a PDF based on MIME type and file extension.
 */
const fileFilter = (_req, file, cb) => {
  const isMimePdf = file.mimetype === 'application/pdf';
  const isExtPdf = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (!isMimePdf || !isExtPdf) {
    return cb(
      new AppError('Only PDF files are allowed', 400, 'VALIDATION_ERROR', [
        { path: 'resume', message: 'Uploaded file must be a PDF' },
      ]),
      false
    );
  }

  cb(null, true);
};

const multerInstance = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

/**
 * Middleware handling single resume PDF file upload with memory storage.
 * Standardizes Multer errors into AppError instances (e.g. 413 for size limit, 400 for missing file).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const uploadSingleResume = (req, res, next) => {
  multerInstance.single('resume')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError || err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new AppError('File size exceeds the 5MB limit', 413, 'PAYLOAD_TOO_LARGE', [
              { path: 'resume', message: 'File exceeds 5MB size limit' },
            ])
          );
        }
        return next(
          new AppError(err.message, 400, 'VALIDATION_ERROR', [
            { path: 'resume', message: err.message },
          ])
        );
      }
      return next(err);
    }

    if (!req.file) {
      return next(
        new AppError('Resume file is required (field: resume)', 400, 'VALIDATION_ERROR', [
          { path: 'resume', message: 'Please select a PDF file to upload' },
        ])
      );
    }

    next();
  });
};

export default uploadSingleResume;
