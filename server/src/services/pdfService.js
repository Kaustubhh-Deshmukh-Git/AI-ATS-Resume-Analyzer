import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { AppError } from '../utils/AppError.js';

const MAX_PAGES = 10;
const MIN_CHAR_COUNT = 200;
const PARSE_TIMEOUT_MS = 10000; // 10s parsing timeout to mitigate PDF bomb / DoS

/**
 * Validate that a buffer begins with the standard %PDF- magic bytes header.
 *
 * @param {Buffer} buffer
 */
export const validatePdfMagicBytes = (buffer) => {
  if (!buffer || buffer.length < 5) {
    throw new AppError('Invalid PDF file: Missing %PDF- magic bytes header', 400, 'VALIDATION_ERROR', [
      { path: 'resume', message: 'File is not a valid PDF document' },
    ]);
  }

  const magic = buffer.subarray(0, 5).toString('ascii');
  if (magic !== '%PDF-') {
    throw new AppError('Invalid PDF file: Missing %PDF- magic bytes header', 400, 'VALIDATION_ERROR', [
      { path: 'resume', message: 'File header does not match PDF specification' },
    ]);
  }
};

/**
 * Extract clean text, page count, and character count from a PDF buffer.
 *
 * @param {Buffer} buffer
 * @returns {Promise<{ text: string, pages: number, charCount: number }>}
 */
export const extractTextFromPdfBuffer = async (buffer) => {
  validatePdfMagicBytes(buffer);

  // Safely slice the buffer into a typed Uint8Array copying exact bounds
  const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  let loadingTask;
  let pdfDoc;

  try {
    loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      disableFontFace: true,
      useSystemFonts: true,
      verbosity: 0,
    });

    const parsePromise = loadingTask.promise;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new AppError('PDF parsing timed out after 10 seconds', 422, 'UNPROCESSABLE', [
              { path: 'resume', message: 'PDF parsing operation timed out' },
            ])
          ),
        PARSE_TIMEOUT_MS
      )
    );

    pdfDoc = await Promise.race([parsePromise, timeoutPromise]);
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError('Malformed or corrupt PDF file', 400, 'VALIDATION_ERROR', [
      { path: 'resume', message: err.message || 'Unable to open PDF document' },
    ]);
  }

  const numPages = pdfDoc.numPages;

  if (numPages > MAX_PAGES) {
    throw new AppError(
      `PDF exceeds maximum allowed page limit (10 pages). Got ${numPages} pages.`,
      422,
      'UNPROCESSABLE',
      [{ path: 'resume', message: `Resume exceeds maximum page limit of 10 pages (got ${numPages})` }]
    );
  }

  if (numPages === 0) {
    throw new AppError('PDF document contains no pages', 422, 'UNPROCESSABLE', [
      { path: 'resume', message: 'Document has 0 pages' },
    ]);
  }

  const pageTexts = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => (item.str ? item.str : ''))
      .join(' ');
    pageTexts.push(pageText);
  }

  let fullText = pageTexts.join('\n\n');

  // Normalize whitespace: collapse consecutive spaces/tabs, trim lines, collapse empty lines
  fullText = fullText
    .replace(/[^\S\r\n]+/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const charCount = fullText.length;

  if (charCount < MIN_CHAR_COUNT) {
    throw new AppError(
      'Resume contains insufficient readable text (fewer than 200 characters). Scanned or image-only PDFs are not supported. Please upload a text-based PDF.',
      422,
      'UNPROCESSABLE',
      [{ path: 'resume', message: 'Scanned or image-only PDF detected (fewer than 200 characters)' }]
    );
  }

  return {
    text: fullText,
    pages: numPages,
    charCount,
  };
};

export default {
  validatePdfMagicBytes,
  extractTextFromPdfBuffer,
};
