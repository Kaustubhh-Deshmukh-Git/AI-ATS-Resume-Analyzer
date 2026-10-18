import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FileDropzone from '../src/components/FileDropzone.jsx';
import Dashboard from '../src/pages/Dashboard.jsx';
import api from '../src/api/http.js';

vi.mock('../src/api/http.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Milestone 2 - Client File Upload & Parse Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('FileDropzone Client Validation', () => {
    it('renders dropzone trigger and guidance text', () => {
      render(<FileDropzone />);

      expect(screen.getByText(/Drop your resume PDF here/i)).toBeInTheDocument();
      expect(screen.getByText(/Supports PDF files up to 5MB/i)).toBeInTheDocument();
    });

    it('rejects non-PDF files client-side without calling API', async () => {
      render(<FileDropzone />);

      const fileInput = screen.getByTestId('resume-file-input');
      const textFile = new File(['Some plain text'], 'document.txt', { type: 'text/plain' });

      fireEvent.change(fileInput, { target: { files: [textFile] } });

      expect(
        await screen.findByText(/Invalid file type. Only PDF documents \(\.pdf\) are supported/i)
      ).toBeInTheDocument();
      expect(api.post).not.toHaveBeenCalled();
    });

    it('rejects files exceeding 5MB client-side without calling API', async () => {
      render(<FileDropzone />);

      const fileInput = screen.getByTestId('resume-file-input');
      // Create fake 6MB file
      const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large-resume.pdf', {
        type: 'application/pdf',
      });

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      expect(
        await screen.findByText(/exceeds the maximum allowed limit of 5MB/i)
      ).toBeInTheDocument();
      expect(api.post).not.toHaveBeenCalled();
    });
  });

  describe('Upload & Parsing Flow', () => {
    it('uploads valid PDF and calls onParsed callback with result', async () => {
      const onParsed = vi.fn();
      api.post.mockResolvedValueOnce({
        text: 'Alex Morgan Senior Software Engineer Work Experience...',
        pages: 1,
        charCount: 450,
      });

      render(<FileDropzone onParsed={onParsed} />);

      const fileInput = screen.getByTestId('resume-file-input');
      const validPdf = new File(['%PDF-1.4 mock content'], 'alex-resume.pdf', {
        type: 'application/pdf',
      });

      fireEvent.change(fileInput, { target: { files: [validPdf] } });

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledTimes(1);
        expect(api.post).toHaveBeenCalledWith('/resumes/parse', expect.any(FormData));
      });

      expect(await screen.findByText('alex-resume.pdf')).toBeInTheDocument();
      expect(await screen.findByText(/1 page · 450 chars/i)).toBeInTheDocument();
      expect(onParsed).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.any(String),
          pages: 1,
          charCount: 450,
          filename: 'alex-resume.pdf',
        })
      );
    });

    it('displays error alert when server parsing fails', async () => {
      api.post.mockRejectedValueOnce({
        status: 422,
        message: 'Resume contains insufficient readable text (fewer than 200 characters). Scanned or image-only PDFs are not supported.',
      });

      render(<FileDropzone />);

      const fileInput = screen.getByTestId('resume-file-input');
      const scannedPdf = new File(['%PDF-1.4 scanned content'], 'scanned.pdf', {
        type: 'application/pdf',
      });

      fireEvent.change(fileInput, { target: { files: [scannedPdf] } });

      expect(await screen.findByRole('alert')).toHaveTextContent(/Scanned or image-only PDFs/i);
    });

    it('allows changing/removing selected file', async () => {
      api.post.mockResolvedValueOnce({
        text: 'Some extracted text',
        pages: 1,
        charCount: 300,
      });

      render(<FileDropzone />);

      const fileInput = screen.getByTestId('resume-file-input');
      const validPdf = new File(['%PDF-1.4 mock content'], 'alex-resume.pdf', {
        type: 'application/pdf',
      });

      fireEvent.change(fileInput, { target: { files: [validPdf] } });

      const removeBtn = await screen.findByRole('button', { name: /Change File/i });
      fireEvent.click(removeBtn);

      expect(screen.queryByText('alex-resume.pdf')).not.toBeInTheDocument();
      expect(screen.getByText(/Drop your resume PDF here/i)).toBeInTheDocument();
    });
  });

  describe('Dashboard Integration', () => {
    it('renders FileDropzone inside Dashboard and toggles text preview on parse', async () => {
      api.post.mockResolvedValueOnce({
        text: 'Extracted resume content for verification and testing.',
        pages: 1,
        charCount: 280,
      });

      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /Resume Analyzer/i })).toBeInTheDocument();

      const fileInput = screen.getByTestId('resume-file-input');
      const validPdf = new File(['%PDF-1.4 mock content'], 'my-resume.pdf', {
        type: 'application/pdf',
      });

      fireEvent.change(fileInput, { target: { files: [validPdf] } });

      expect(await screen.findByText(/Resume Successfully Parsed/i)).toBeInTheDocument();

      // Toggle text preview
      const previewBtn = screen.getByRole('button', { name: /View Extracted Text/i });
      fireEvent.click(previewBtn);

      expect(
        screen.getByText('Extracted resume content for verification and testing.')
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Hide Extracted Text/i }));
      expect(
        screen.queryByText('Extracted resume content for verification and testing.')
      ).not.toBeInTheDocument();
    });
  });
});
