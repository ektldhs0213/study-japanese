(function createAuthProvider(global) {
  const listeners = new Set();

  function notify() {
    const session = global.SupabaseClient.getSession();
    listeners.forEach((listener) => listener(session));
  }

  global.AuthProvider = Object.freeze({
    getSession: () => global.SupabaseClient.getSession(),
    getUser: () => global.SupabaseClient.getSession()?.user || null,
    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async signIn(email, password) {
      const session = await global.SupabaseClient.auth("token?grant_type=password", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      global.SupabaseClient.setSession(session);
      notify();
      return session;
    },
    async signUp(email, password) {
      return global.SupabaseClient.auth("signup", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
    },
    async signOut() {
      const session = global.SupabaseClient.getSession();
      if (session) {
        await global.SupabaseClient.auth("logout", { method: "POST" }).catch(() => null);
      }
      global.SupabaseClient.setSession(null);
      notify();
    }
  });
})(window);
