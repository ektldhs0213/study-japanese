(function createJapaneseService(global) {
  const jsonHeaders = { Prefer: "return=representation" };

  function encode(value) {
    return encodeURIComponent(value);
  }

  global.JapaneseService = Object.freeze({
    isRemoteReady: () => global.SupabaseClient.isConfigured(),
    listWords() {
      return global.SupabaseClient.rest("jp_words", "?select=*&order=created_at.desc");
    },
    saveWord(word) {
      const record = {
        japanese: word.jp || word.japanese,
        reading: word.reading,
        meaning: word.meaning,
        pos: word.pos || word.category,
        semantic_tags: word.semanticTags || word.semantic_tags || []
      };
      return global.SupabaseClient.rest("jp_words?on_conflict=user_id,japanese,pos", {
        method: "POST",
        headers: { ...jsonHeaders, Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(record)
      });
    },
    deleteWord(id) {
      return global.SupabaseClient.rest(`jp_words?id=eq.${encode(id)}`, {
        method: "DELETE",
        headers: jsonHeaders
      });
    },
    listSentences() {
      return global.SupabaseClient.rest("jp_sentences", "?select=*&order=created_at.desc");
    },
    saveSentence(sentence) {
      return global.SupabaseClient.rest("jp_sentences", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          japanese: sentence.jp || sentence.japanese,
          reading: sentence.reading,
          meaning: sentence.meaning,
          source: sentence.source || "local"
        })
      });
    },
    recordStudy(wordId, result = "studied") {
      return global.SupabaseClient.rest("jp_history", {
        method: "POST",
        body: JSON.stringify({ word_id: wordId, result })
      });
    },
    testConnection() {
      return global.SupabaseClient.rest("jp_words", "?select=id&limit=1");
    },
    async generateSentences(payload) {
      const config = global.APP_CONFIG || {};
      const session = global.SupabaseClient.getSession();
      const response = await fetch(`${String(config.SUPABASE_URL).replace(/\/+$/, "")}/functions/v1/generate-japanese-sentences`, {
        method: "POST",
        headers: {
          apikey: config.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session?.access_token || config.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error || body?.message || `AI function failed (${response.status})`);
      }
      return body;
    }
  });
})(window);
