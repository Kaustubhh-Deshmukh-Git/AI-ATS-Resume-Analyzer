import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AnalysisReport from '../src/pages/AnalysisReport.jsx';
import api from '../src/api/http.js';

vi.mock('../src/api/http.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Milestone 5 - Analysis Report & AI Suggestions (UI-4, UI-5, UI-6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAnalysisData = {
    id: 'report-abc-123',
    title: 'Lead Frontend Architect',
    jdSnippet: 'Looking for an experienced React architect with Next.js and cloud delivery...',
    score: 88,
    breakdown: {
      keyword: 54,
      sections: 18,
      readability: 8,
      impact: 8,
    },
    matched: ['React', 'JavaScript', 'CSS Modules', 'Vitest'],
    missing: ['GraphQL', 'Kubernetes'],
    aiStatus: 'ok',
    ai: {
      missingSkills: ['GraphQL', 'Kubernetes'],
      tips: [
        'Mention GraphQL schema design in your summary.',
        'Quantify bundle size reductions in your architectural work.',
      ],
      bulletRewrites: [
        {
          original: 'Developed responsive user interfaces with React.',
          optimized: 'Architected responsive component library in React, cutting load time by 35%.',
        },
      ],
    },
    createdAt: new Date().toISOString(),
  };

  it('UI-4 & UI-5: renders score gauge, breakdown bars, and keyword chips accurately', async () => {
    api.get.mockResolvedValueOnce({ analysis: mockAnalysisData });

    render(
      <MemoryRouter initialEntries={['/analyses/report-abc-123']}>
        <Routes>
          <Route path="/analyses/:id" element={<AnalysisReport />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify loading state
    expect(screen.getByText(/Loading analysis report/i)).toBeInTheDocument();

    // Verify title and snippet
    expect(await screen.findByText('Lead Frontend Architect')).toBeInTheDocument();
    expect(screen.getByText(/Looking for an experienced React architect/i)).toBeInTheDocument();

    // UI-4: Score Gauge
    const gauge = screen.getByRole('meter');
    expect(gauge).toHaveAttribute('aria-valuenow', '88');
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText(/Strong Match/i)).toBeInTheDocument();

    // Breakdown Bars
    expect(screen.getByText(/Score Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Keyword Match/i)).toBeInTheDocument();
    expect(screen.getByText(/Section Structure/i)).toBeInTheDocument();

    // UI-5: Keyword Chips
    expect(screen.getByText(/Matched Skills & Technologies \(4\)/i)).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vitest')).toBeInTheDocument();
    expect(screen.getByText(/Missing Job Requirements \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText('GraphQL')).toBeInTheDocument();
  });

  it('UI-6: renders AI suggestions and copies rewritten bullets with live feedback', async () => {
    // Mock navigator.clipboard
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    api.get.mockResolvedValueOnce({ analysis: mockAnalysisData });

    render(
      <MemoryRouter initialEntries={['/analyses/report-abc-123']}>
        <Routes>
          <Route path="/analyses/:id" element={<AnalysisReport />} />
        </Routes>
      </MemoryRouter>
    );

    // AI Suggestions
    expect(await screen.findByText(/Gemini AI Optimization Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Mention GraphQL schema design in your summary/i)).toBeInTheDocument();

    // Bullet Compare
    expect(screen.getByText(/Developed responsive user interfaces with React\./i)).toBeInTheDocument();
    expect(
      screen.getByText(/Architected responsive component library in React, cutting load time by 35%\./i)
    ).toBeInTheDocument();

    // Click Copy button
    const copyBtn = screen.getByRole('button', { name: /Copy optimized bullet 1 to clipboard/i });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(
        'Architected responsive component library in React, cutting load time by 35%.'
      );
    });

    // Visual confirmation
    expect(await screen.findByText(/Copied!/i)).toBeInTheDocument();
  });

  it('renders Degraded AI Banner when aiStatus is unavailable', async () => {
    const degradedAnalysis = {
      ...mockAnalysisData,
      aiStatus: 'unavailable',
      ai: null,
    };

    api.get.mockResolvedValueOnce({ analysis: degradedAnalysis });

    render(
      <MemoryRouter initialEntries={['/analyses/report-abc-123']}>
        <Routes>
          <Route path="/analyses/:id" element={<AnalysisReport />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/AI suggestions unavailable — score still valid/i)).toBeInTheDocument();
    expect(screen.queryByText(/Gemini AI Optimization Analysis/i)).not.toBeInTheDocument();
    // Deterministic score and breakdown still render
    expect(screen.getByText('88')).toBeInTheDocument();
  });

  it('renders Report Not Found error card when ID is invalid or not found', async () => {
    const error = new Error('Analysis report not found');
    error.status = 404;
    api.get.mockRejectedValueOnce(error);

    render(
      <MemoryRouter initialEntries={['/analyses/invalid-id']}>
        <Routes>
          <Route path="/analyses/:id" element={<AnalysisReport />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: /Report Not Found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Go to Dashboard/i })).toBeInTheDocument();
  });
});
