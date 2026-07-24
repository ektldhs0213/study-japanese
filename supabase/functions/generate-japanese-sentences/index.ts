const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const geminiModel = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";
    if (!geminiKey) return json({ error: "Gemini API secret is not configured." }, 503);

    const payload = await request.json();
    const prompt = String(payload.prompt || "").trim();
    if (!prompt) return json({ error: "Prompt is required." }, 400);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.55 }
        })
      }
    );

    const result = await response.json();
    if (!response.ok) return json({ error: result?.error?.message || "Gemini request failed." }, response.status);

    const text = result?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("") || "";
    const parsed = JSON.parse(text);
    return json({ sentences: Array.isArray(parsed) ? parsed : parsed.sentences || [] });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected function error." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
