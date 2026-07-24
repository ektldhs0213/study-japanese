(function createSupabaseClient(global) {
  const config = global.APP_CONFIG || {};
  const baseUrl = String(config.SUPABASE_URL || "").replace(/\/+$/, "");
  const anonKey = String(config.SUPABASE_ANON_KEY || "");
  function isConfigured() {
    return Boolean(baseUrl && anonKey);
  }

  async function request(path, options = {}) {
    if (!isConfigured()) throw new Error("Supabase environment variables are not configured.");
    const headers = {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      ...options.headers
    };
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
      cache: "no-store"
    });
    const body = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(body?.message || body?.error_description || `Supabase request failed (${response.status})`);
      error.status = response.status;
      error.details = body;
      throw error;
    }
    return body;
  }

  global.SupabaseClient = Object.freeze({
    isConfigured,
    rest(table, queryOrOptions = "", maybeOptions = {}) {
      const query = typeof queryOrOptions === "string" ? queryOrOptions : "";
      const options = typeof queryOrOptions === "string" ? maybeOptions : queryOrOptions;
      return request(`/rest/v1/${table}${query}`, options);
    }
  });
})(window);
