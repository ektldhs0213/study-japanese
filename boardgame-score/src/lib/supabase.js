(function createSupabaseClient(global) {
  const config = global.APP_CONFIG || {};
  const baseUrl = String(config.SUPABASE_URL || "").replace(/\/+$/, "");
  const anonKey = String(config.SUPABASE_ANON_KEY || "");
  const sessionKey = "boardgameSupabaseSession";

  async function request(path, options = {}) {
    if (!baseUrl || !anonKey) throw new Error("Supabase environment variables are not configured.");
    const session = JSON.parse(localStorage.getItem(sessionKey) || "null");
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${session?.access_token || anonKey}`,
        "Content-Type": "application/json",
        ...options.headers
      }
    });
    const body = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.message || `Supabase request failed (${response.status})`);
    return body;
  }

  global.SupabaseClient = Object.freeze({
    isConfigured: () => Boolean(baseUrl && anonKey),
    getSession: () => JSON.parse(localStorage.getItem(sessionKey) || "null"),
    setSession(session) {
      if (session) localStorage.setItem(sessionKey, JSON.stringify(session));
      else localStorage.removeItem(sessionKey);
    },
    rest(table, queryOrOptions = "", maybeOptions = {}) {
      const query = typeof queryOrOptions === "string" ? queryOrOptions : "";
      const options = typeof queryOrOptions === "string" ? maybeOptions : queryOrOptions;
      return request(`/rest/v1/${table}${query}`, options);
    },
    auth: (path, options = {}) => request(`/auth/v1/${path}`, options)
  });
})(window);
