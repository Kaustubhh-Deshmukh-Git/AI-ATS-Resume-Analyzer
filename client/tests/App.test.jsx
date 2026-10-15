import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App.jsx';

describe('App component', () => {
  it('renders brand name and navigation successfully', () => {
    render(<App />);
    expect(screen.getByText('ResumeIQ')).toBeInTheDocument();
    expect(screen.getByText(/Optimize Your Resume/i)).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
