(function createJapaneseService(global) {
  const jsonHeaders = { Prefer: "return=representation" };

  function encode(value) {
    return encodeURIComponent(value);
  }

  function toAppWord(row) {
    return {
      id: row.id,
      jp: row.japanese,
      reading: row.reading,
      meaning: row.meaning,
      pos: row.pos,
      semanticTags: Array.isArray(row.semantic_tags) ? row.semantic_tags : [],
      createdAt: row.created_at,
      createdDate: String(row.created_at || "").slice(0, 10),
      syncStatus: "synced"
    };
  }

  function toAppSentence(row) {
    return {
      id: row.id,
      jp: row.japanese,
      reading: row.reading,
      meaning: row.meaning,
      createdAt: row.created_at
    };
  }

  global.JapaneseService = Object.freeze({
    isRemoteReady: () => global.SupabaseClient.isConfigured(),
    async listWords() {
      const rows = await global.SupabaseClient.rest("jp_words", "?select=*&order=created_at.desc");
      return rows.map(toAppWord);
    },
    async saveWord(word) {
      const record = {
        japanese: word.jp || word.japanese,
        reading: word.reading,
        meaning: word.meaning,
        pos: word.pos || word.category,
        semantic_tags: word.semanticTags || word.semantic_tags || [],
        created_at: word.createdAt || (word.createdDate ? `${word.createdDate}T00:00:00.000Z` : new Date().toISOString())
      };
      const japanese = encode(record.japanese);
      const pos = encode(record.pos);
      const existingRows = await global.SupabaseClient.rest(
        "jp_words",
        `?select=*&japanese=eq.${japanese}&pos=eq.${pos}&limit=1`
      );
      if (existingRows.length > 0) return toAppWord(existingRows[0]);

      const rows = await global.SupabaseClient.rest("jp_words", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(record)
      });
      return toAppWord(rows[0]);
    },
    deleteWord(id) {
      return global.SupabaseClient.rest(`jp_words?id=eq.${encode(id)}`, {
        method: "DELETE",
        headers: jsonHeaders
      });
    },
    deleteAllWords() {
      return global.SupabaseClient.rest("jp_words?id=not.is.null", {
        method: "DELETE",
        headers: jsonHeaders
      });
    },
    async listSentences() {
      const rows = await global.SupabaseClient.rest("jp_sentences", "?select=*&order=created_at.desc");
      return rows.map(toAppSentence);
    },
    async saveSentence(sentence) {
      const rows = await global.SupabaseClient.rest("jp_sentences", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          japanese: sentence.jp || sentence.japanese,
          reading: sentence.reading,
          meaning: sentence.meaning
        })
      });
      return toAppSentence(rows[0]);
    },
    recordStudy(japanese, action = "studied") {
      return global.SupabaseClient.rest("jp_history", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ japanese, action })
      });
    },
    testConnection() {
      return global.SupabaseClient.rest("jp_words", "?select=id&limit=1");
    },
    async generateSentences(payload) {
      const config = global.APP_CONFIG || {};
      const response = await fetch(`${String(config.SUPABASE_URL).replace(/\/+$/, "")}/functions/v1/generate-japanese-sentences`, {
        method: "POST",
        headers: {
          apikey: config.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${config.SUPABASE_ANON_KEY}`,
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
