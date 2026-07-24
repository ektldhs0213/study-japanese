(function createAuthProvider(global) {
  global.AuthProvider = Object.freeze({
    getUser: () => global.SupabaseClient.getSession()?.user || null,
    async signIn(email, password) {
      const session = await global.SupabaseClient.auth("token?grant_type=password", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      global.SupabaseClient.setSession(session);
      return session;
    },
    async signOut() {
      await global.SupabaseClient.auth("logout", { method: "POST" }).catch(() => null);
      global.SupabaseClient.setSession(null);
    }
  });
})(window);
