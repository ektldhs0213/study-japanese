(function createJapaneseService(global) {
  const jsonHeaders = { Prefer: "return=representation" };
  const AI_TIMEOUT_MS = 60_000;

  function encode(value) {
    return encodeURIComponent(value);
  }

  function normalizeStudyDate(value) {
    const text = String(value || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return "";
    const [year, month, day] = text.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year
      && date.getUTCMonth() === month - 1
      && date.getUTCDate() === day
      ? text
      : "";
  }

  function toAppWord(row) {
    const studyDate = normalizeStudyDate(row.study_date);
    return {
      id: row.id,
      jp: row.japanese,
      reading: row.reading,
      meaning: row.meaning,
      pos: row.pos,
      semanticTags: Array.isArray(row.semantic_tags) ? row.semantic_tags : [],
      createdAt: row.created_at,
      studyDate,
      createdDate: studyDate,
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
      return rows
        .map(toAppWord)
        .sort((first, second) => String(second.studyDate).localeCompare(String(first.studyDate)));
    },
    async saveWord(word) {
      const studyDate = normalizeStudyDate(word.studyDate);
      if (!studyDate) throw new Error("study_date는 YYYY-MM-DD 형식의 유효한 날짜여야 합니다.");
      const record = {
        japanese: String(word.jp || word.japanese || "").normalize("NFKC").trim(),
        reading: word.reading,
        meaning: word.meaning,
        pos: String(word.pos || word.category || "").trim().toLowerCase(),
        semantic_tags: word.semanticTags || word.semantic_tags || [],
        created_at: `${studyDate}T00:00:00.000Z`,
        study_date: studyDate
      };
      const rows = await global.SupabaseClient.rest("jp_words", "?on_conflict=japanese,pos&select=*", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(record)
      });
      const savedWord = toAppWord(rows[0]);
      if (savedWord.studyDate !== record.study_date) {
        throw new Error(`입력 날짜 저장 불일치 (${record.study_date} → ${savedWord.studyDate || "없음"})`);
      }
      return savedWord;
    },
    async listSentences() {
      const rows = await global.SupabaseClient.rest("jp_sentences", "?select=*&order=created_at.desc");
      return rows.map(toAppSentence);
    },
    async saveSentence(sentence) {
      const japanese = encode(sentence.jp || sentence.japanese);
      const existingRows = await global.SupabaseClient.rest(
        "jp_sentences",
        `?select=*&japanese=eq.${japanese}&limit=1`
      );
      if (existingRows.length > 0) return toAppSentence(existingRows[0]);

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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

      try {
        const response = await fetch("/api/generate-japanese-sentences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        const body = await response.json().catch(() => null);
        if (!response.ok) {
          const responseError = new Error(body?.error || body?.message || `AI function failed (${response.status})`);
          responseError.status = response.status;
          throw responseError;
        }
        return body;
      } catch (error) {
        if (error.name === "AbortError") {
          const timeoutError = new Error("AI 요청이 1분을 초과하여 중단되었습니다.");
          timeoutError.code = "AI_TIMEOUT";
          throw timeoutError;
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    testAiConnection() {
      return this.generateSentences({
        prompt: [
          "연결 상태 확인용 요청입니다.",
          "반드시 다음 JSON만 반환하세요.",
          "{\"sentences\":[]}"
        ].join("\n")
      });
    }
  });
})(window);
