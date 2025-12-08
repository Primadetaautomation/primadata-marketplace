const API_URL = import.meta.env.VITE_API_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY || '';

interface FetchOptions extends RequestInit {
  params?: Record<string, any>;
}

async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  const { params, ...fetchOptions } = options;

  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

// API Methods
export const api = {
  // Health check
  health: () => fetchAPI('/api/health'),

  // Candidates
  candidates: {
    list: (params?: any) => fetchAPI('/api/candidates', { params }),
    get: (id: string) => fetchAPI(`/api/candidates/${id}`),
    enrich: (id: string) => fetchAPI(`/api/candidates/${id}/enrich`, { method: 'POST' }),
    sendOutreach: (id: string, data: any) =>
      fetchAPI(`/api/candidates/${id}/manual-outreach`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Campaigns
  campaigns: {
    list: () => fetchAPI('/api/campaigns'),
    get: (id: string) => fetchAPI(`/api/campaigns/${id}`),
    create: (data: any) =>
      fetchAPI('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchAPI(`/api/campaigns/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => fetchAPI(`/api/campaigns/${id}`, { method: 'DELETE' }),
    activate: (id: string) => fetchAPI(`/api/campaigns/${id}/activate`, { method: 'POST' }),
  },
};

export default api;