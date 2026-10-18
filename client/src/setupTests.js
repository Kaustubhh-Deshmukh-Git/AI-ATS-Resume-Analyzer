import '@testing-library/jest-dom';

// Ensure navigator.clipboard is available in jsdom test environments
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: async () => {},
      readText: async () => '',
    },
    writable: true,
    configurable: true,
  });
}
