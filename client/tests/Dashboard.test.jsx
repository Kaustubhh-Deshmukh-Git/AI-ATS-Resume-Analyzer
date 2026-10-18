import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../src/pages/Dashboard.jsx';
import api from '../src/api/http.js';

vi.mock('../src/api/http.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Milestone 5 - Dashboard & Analysis Flow (UI-1, UI-2, UI-3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validJdText =
    'We are seeking a skilled Full Stack Engineer proficient in React, Node.js, TypeScript, PostgreSQL, and AWS cloud architecture. Must have 3+ years experience building scalable systems.';

  it('UI-1 & UI-2: enforces JD length limits, updates live counter, and disables Analyze button', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /Analyze Resume ATS Match/i });
    expect(submitBtn).toBeDisabled();

    const jdTextarea = screen.getByPlaceholderText(/Paste the target job description here/i);
    expect(screen.getByText(/0 \/ 10,000 characters/i)).toBeInTheDocument();

    // Type text under 50 characters
    fireEvent.change(jdTextarea, { target: { value: 'Short JD' } });
    expect(screen.getByText(/8 \/ 10,000 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/42 more needed/i)).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();

    // Type valid JD text >= 50 chars
    fireEvent.change(jdTextarea, { target: { value: validJdText } });
    expect(screen.queryByText(/more needed/i)).not.toBeInTheDocument();
    // Still disabled because resume PDF is not parsed yet
    expect(submitBtn).toBeDisabled();
  });

  it('UI-2: enables submit when resume is parsed and JD is valid, shows loading spinner during submission', async () => {
    // Mock resume parse API response
    api.post.mockImplementation(async (endpoint) => {
      if (endpoint === '/resumes/parse') {
        return {
          text: 'Experienced Software Engineer with strong background in React, Node.js, and Cloud services.',
          pages: 1,
          charCount: 220,
        };
      }
      if (endpoint === '/analyses') {
        return {
          analysis: {
            id: 'mock-analysis-123',
            title: 'Full Stack Engineer Role',
            score: 85,
            breakdown: { keyword: 52, sections: 18, readability: 8, impact: 7 },
            matched: ['React', 'Node.js'],
            missing: ['AWS', 'TypeScript'],
            aiStatus: 'ok',
            ai: {
              missingSkills: ['AWS', 'TypeScript'],
              tips: ['Add quantifiable impact metrics to your recent role.'],
              bulletRewrites: [
                {
                  original: 'Built APIs with Node',
                  optimized: 'Architected RESTful microservices with Node.js supporting 10k DAU.',
                },
              ],
            },
          },
        };
      }
      throw new Error(`Unexpected endpoint: ${endpoint}`);
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // 1. Upload mock PDF
    const fileInput = screen.getByTestId('resume-file-input');
    const validPdf = new File(['%PDF-1.4 mock content'], 'my-resume.pdf', {
      type: 'application/pdf',
    });
    fireEvent.change(fileInput, { target: { files: [validPdf] } });

    expect(await screen.findByText(/Resume Successfully Parsed/i)).toBeInTheDocument();

    // 2. Type valid job description
    const jdTextarea = screen.getByPlaceholderText(/Paste the target job description here/i);
    fireEvent.change(jdTextarea, { target: { value: validJdText } });

    // 3. Optional title input
    const titleInput = screen.getByPlaceholderText(/e\.g\. Senior Full Stack Engineer/i);
    fireEvent.change(titleInput, { target: { value: 'Full Stack Engineer Role' } });

    // Analyze button should now be enabled
    const submitBtn = screen.getByRole('button', { name: /Analyze Resume ATS Match/i });
    expect(submitBtn).not.toBeDisabled();

    // 4. Click Analyze button
    fireEvent.click(submitBtn);

    // Check loading indicator during submission
    expect(screen.getByText(/Analyzing ATS Compatibility\.\.\./i)).toBeInTheDocument();

    // Verify successful transition to Results View
    expect(await screen.findByText(/Analysis Complete/i)).toBeInTheDocument();
    expect(screen.getByText('Full Stack Engineer Role')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText(/Strong Match/i)).toBeInTheDocument();
  });

  it('UI-3: renders error alert banner when analyze API fails', async () => {
    api.post.mockImplementation(async (endpoint) => {
      if (endpoint === '/resumes/parse') {
        return {
          text: 'Valid resume content with sufficient length for testing.',
          pages: 1,
          charCount: 210,
        };
      }
      if (endpoint === '/analyses') {
        const error = new Error('Rate limit exceeded: Maximum 10 resume analyses per hour per user.');
        error.status = 429;
        throw error;
      }
      throw new Error(`Unexpected endpoint: ${endpoint}`);
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Upload PDF
    const fileInput = screen.getByTestId('resume-file-input');
    const validPdf = new File(['%PDF-1.4 mock content'], 'my-resume.pdf', {
      type: 'application/pdf',
    });
    fireEvent.change(fileInput, { target: { files: [validPdf] } });
    await screen.findByText(/Resume Successfully Parsed/i);

    // Fill valid JD
    const jdTextarea = screen.getByPlaceholderText(/Paste the target job description here/i);
    fireEvent.change(jdTextarea, { target: { value: validJdText } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Analyze Resume ATS Match/i });
    fireEvent.click(submitBtn);

    // Verify error banner is visible
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Rate limit exceeded: Maximum 10 resume analyses per hour/i)).toBeInTheDocument();
  });
});
