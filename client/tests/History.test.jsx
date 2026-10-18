import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import History from '../src/pages/History.jsx';
import api from '../src/api/http.js';

vi.mock('../src/api/http.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Milestone 5 - History & Deletion Flow (UI-7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAnalysesList = [
    {
      id: 'analysis-1',
      title: 'Senior Frontend Engineer - Acme Corp',
      jdSnippet: 'Building design systems and microfrontends with React and TypeScript...',
      score: 92,
      matched: ['React', 'TypeScript', 'CSS Modules', 'Next.js'],
      missing: ['GraphQL'],
      createdAt: '2026-10-16T12:00:00.000Z',
    },
    {
      id: 'analysis-2',
      title: 'Backend Developer - Stark Industries',
      jdSnippet: 'Developing high-throughput Node.js services and distributed caches...',
      score: 65,
      matched: ['Node.js', 'Express', 'MongoDB'],
      missing: ['Redis', 'Kafka', 'Docker'],
      createdAt: '2026-10-15T09:30:00.000Z',
    },
  ];

  it('renders history list with score badges, titles, and matched counts', async () => {
    api.get.mockResolvedValueOnce({
      analyses: mockAnalysesList,
      total: 2,
      page: 1,
      totalPages: 1,
    });

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading your saved analyses/i)).toBeInTheDocument();

    expect(await screen.findByText('Senior Frontend Engineer - Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Backend Developer - Stark Industries')).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument();
    expect(screen.getByText('65')).toBeInTheDocument();
    expect(screen.getByText(/4 matched/i)).toBeInTheDocument();
    expect(screen.getByText(/3 matched/i)).toBeInTheDocument();
  });

  it('UI-7: opens confirmation modal and deletes analysis from the list upon confirmation', async () => {
    api.get.mockResolvedValueOnce({
      analyses: mockAnalysesList,
      total: 2,
      page: 1,
      totalPages: 1,
    });
    api.delete.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>
    );

    expect(await screen.findByText('Senior Frontend Engineer - Acme Corp')).toBeInTheDocument();

    // Click Delete button on first item
    const deleteBtn = screen.getByRole('button', {
      name: /Delete analysis Senior Frontend Engineer - Acme Corp/i,
    });
    fireEvent.click(deleteBtn);

    // Verify accessible confirmation modal appears
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Delete Analysis Record\?/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete "Senior Frontend Engineer - Acme Corp"\?/i)
    ).toBeInTheDocument();

    // Click confirm in modal
    const confirmDeleteBtn = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/analyses/analysis-1');
    });

    // Item should now be removed from the DOM
    await waitFor(() => {
      expect(screen.queryByText('Senior Frontend Engineer - Acme Corp')).not.toBeInTheDocument();
    });

    // The other item should still remain
    expect(screen.getByText('Backend Developer - Stark Industries')).toBeInTheDocument();
  });

  it('renders empty state when no analyses exist', async () => {
    api.get.mockResolvedValueOnce({
      analyses: [],
      total: 0,
      page: 1,
      totalPages: 1,
    });

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>
    );

    expect(await screen.findByText(/No Analyses Saved Yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Analyze Resume Now/i })).toBeInTheDocument();
  });

  it('displays error banner and does not render empty state when api.get fails', async () => {
    api.get.mockRejectedValueOnce(new Error('Network error loading history'));

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>
    );

    const alertBanner = await screen.findByRole('alert');
    expect(alertBanner).toBeInTheDocument();
    expect(screen.getByText('Network error loading history')).toBeInTheDocument();
    expect(screen.queryByText(/No Analyses Saved Yet/i)).not.toBeInTheDocument();
  });

  it('displays error banner and keeps item in list when api.delete fails', async () => {
    api.get.mockResolvedValueOnce({
      analyses: mockAnalysesList,
      total: 2,
      page: 1,
      totalPages: 1,
    });
    api.delete.mockRejectedValueOnce(new Error('Failed to delete on server'));

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>
    );

    expect(await screen.findByText('Senior Frontend Engineer - Acme Corp')).toBeInTheDocument();

    const deleteBtn = screen.getByRole('button', {
      name: /Delete analysis Senior Frontend Engineer - Acme Corp/i,
    });
    fireEvent.click(deleteBtn);

    const confirmDeleteBtn = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmDeleteBtn);

    const alertBanner = await screen.findByRole('alert');
    expect(alertBanner).toBeInTheDocument();
    expect(screen.getByText('Failed to delete on server')).toBeInTheDocument();

    // Item should remain in the list
    expect(screen.getByText('Senior Frontend Engineer - Acme Corp')).toBeInTheDocument();
  });
});
