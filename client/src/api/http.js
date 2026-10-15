const BASE_URL = import.meta.env?.VITE_API_URL || '/api/v1';

/**
 * Standardized API client using fetch with credentials and error normalization.
 */
class HttpClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Internal request handler.
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    const headers = { ...options.headers };

    // Set JSON content-type if not already specified and body is not FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers,
      credentials: 'include', // Non-negotiable for httpOnly cookie sessions
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      let data = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else if (response.status !== 204) {
        data = await response.text();
      }

      if (!response.ok) {
        const errorInfo = data?.error || {};
        const error = new Error(
          errorInfo.message || `Request failed with status ${response.status}`
        );
        error.status = response.status;
        error.code = errorInfo.code || 'UNKNOWN_ERROR';
        error.details = errorInfo.details || [];
        error.requestId = errorInfo.requestId || response.headers.get('x-request-id');
        throw error;
      }

      return data;
    } catch (err) {
      if (!err.status) {
        // Network or fetch connection error
        err.code = 'NETWORK_ERROR';
        err.message = err.message || 'Network connection error';
      }
      throw err;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new HttpClient(BASE_URL);
export default api;
