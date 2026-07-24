(function createSupabaseClient(global) {
  const config = global.APP_CONFIG || {};
  const baseUrl = String(config.SUPABASE_URL || "").replace(/\/+$/, "");
  const anonKey = String(config.SUPABASE_ANON_KEY || "");
  const sessionKey = "japaneseStudySupabaseSession";

  function isConfigured() {
    return Boolean(baseUrl && anonKey);
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(sessionKey)) || null;
    } catch {
      return null;
    }
  }

  function setSession(session) {
    if (session) localStorage.setItem(sessionKey, JSON.stringify(session));
    else localStorage.removeItem(sessionKey);
  }

  async function request(path, options = {}) {
    if (!isConfigured()) throw new Error("Supabase environment variables are not configured.");
    const session = getSession();
    const headers = {
      apikey: anonKey,
      Authorization: `Bearer ${session?.access_token || anonKey}`,
      "Content-Type": "application/json",
      ...options.headers
    };
    const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
    const body = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(body?.message || body?.error_description || `Supabase request failed (${response.status})`);
    }
    return body;
  }

  global.SupabaseClient = Object.freeze({
    isConfigured,
    getSession,
    setSession,
    rest(table, queryOrOptions = "", maybeOptions = {}) {
      const query = typeof queryOrOptions === "string" ? queryOrOptions : "";
      const options = typeof queryOrOptions === "string" ? maybeOptions : queryOrOptions;
      return request(`/rest/v1/${table}${query}`, options);
    },
    auth(path, options = {}) {
      return request(`/auth/v1/${path}`, options);
    }
  });
})(window);
