const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}

export async function onRequestPost({ request, env }) {
  try {
    const geminiKey = String(env.GEMINI_API_KEY || "").trim();
    const geminiModel = String(env.GEMINI_MODEL || "gemini-2.5-flash").trim();

    if (!geminiKey) {
      return json({ error: "Cloudflare Pages에 GEMINI_API_KEY가 설정되지 않았습니다." }, 503);
    }

    const payload = await request.json();
    const prompt = String(payload?.prompt || "").trim();
    if (!prompt) return json({ error: "AI 문장 생성 요청 내용이 없습니다." }, 400);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiKey
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.55
          }
        })
      }
    );

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      return json(
        { error: result?.error?.message || `Gemini API 요청에 실패했습니다. (${response.status})` },
        response.status
      );
    }

    const text = result?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();
    if (!text) return json({ error: "Gemini가 빈 응답을 반환했습니다." }, 502);

    const parsed = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ""));
    return json({ sentences: Array.isArray(parsed) ? parsed : parsed.sentences || [] });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "AI 처리 중 알 수 없는 오류가 발생했습니다." },
      500
    );
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS
  });
}
