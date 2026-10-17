import { useState, useCallback } from 'react';
import api from '../api/http.js';

/**
 * Custom hook to manage the lifecycle of an ATS resume analysis.
 * States: 'idle' | 'parsing' | 'analyzing' | 'done' | 'error'
 */
export function useAnalysis() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const analyze = useCallback(async ({ resumeText, jobDescription, title }) => {
    setStatus('analyzing');
    setError(null);

    try {
      const payload = {
        resumeText,
        jobDescription,
        ...(title ? { title } : {}),
      };

      const response = await api.post('/analyses', payload);
      setResult(response.analysis);
      setStatus('done');
      return response.analysis;
    } catch (err) {
      setError(err);
      setStatus('error');
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setResult(null);
  }, []);

  return {
    status,
    isLoading: status === 'parsing' || status === 'analyzing',
    error,
    result,
    analyze,
    setStatus,
    setError,
    reset,
  };
}

export default useAnalysis;
