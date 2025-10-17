// DEPRECATED: useAuth / useApi in this file kept for backward compatibility.
// New code should import from AuthContext (useAuth) and useOpenTrades where appropriate.
import { useAuth as useAuthCtx } from '@/lib/AuthContext';

export function useAuth() {
  const ctx = useAuthCtx();
  // Provide the same shape legacy callers expect (token, user, updateUser, isAuthenticated etc.)
  return ctx;
}

export function useApi() {
  const { token, refreshSession } = useAuth();

  const apiCall = async (endpoint, options = {}) => {
    // Fallback to localStorage token if context hasn't hydrated yet
    const stored = (typeof window !== 'undefined') ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null;
    const rt = token || stored;
    const runtimeToken = (rt && rt !== 'undefined' && rt !== 'null') ? rt : null;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(runtimeToken && { Authorization: `Bearer ${runtimeToken}` }),
        ...options.headers
      },
      cache: 'no-store',
      credentials: 'include',
      ...options
    };

    try {
      let response = await fetch(endpoint, config);
      let data;
      try { data = await response.json(); } catch { data = null; }

      if (!response.ok) {
        // Auto-recover from invalid/expired tokens: clear tokens and notify app to open login
        if (response.status === 401 && typeof window !== 'undefined') {
          // Try one silent session refresh (cookie-based) before forcing login
          try {
            const refreshed = await (refreshSession?.() || Promise.resolve({ ok: false }));
            if (refreshed?.ok) {
              // Retry once with possibly new token
              const newStored = localStorage.getItem('auth_token') || localStorage.getItem('token');
              const retryCfg = {
                ...config,
                headers: {
                  ...config.headers,
                  ...(newStored ? { Authorization: `Bearer ${newStored}` } : {}),
                },
              };
              response = await fetch(endpoint, retryCfg);
              try { data = await response.json(); } catch { data = null; }
              if (response.ok) return data || {};
            }
          } catch {}
          // If still 401, clear tokens and prompt login
          try { localStorage.removeItem('auth_token'); localStorage.removeItem('token'); } catch {}
          try { window.dispatchEvent(new CustomEvent('auth:login-required')); } catch {}
        }
        const message = (data && (data.error || data.message)) || `API request failed (${response.status})`;
        throw new Error(message);
      }

      return data || {};
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  return { apiCall };
}
