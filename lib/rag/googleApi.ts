const GOOGLE_LLM_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/interactions";

function extractTextFromResponse(
  payload: Record<string, unknown>,
): string | null {
  const steps = Array.isArray((payload as { steps?: unknown[] }).steps)
    ? ((payload as { steps?: unknown[] }).steps ?? [])
    : [];

  for (const step of steps) {
    if (!step || typeof step !== "object") continue;

    const content = (step as { content?: unknown }).content;
    if (Array.isArray(content)) {
      const text = content
        .map((part) => {
          if (part && typeof part === "object" && "text" in part) {
            const candidateText = (part as { text?: string }).text;
            return typeof candidateText === "string" ? candidateText : "";
          }
          return "";
        })
        .join("");

      if (text.trim()) return text.trim();
    }

    if (typeof content === "string" && content.trim()) {
      return content.trim();
    }
  }

  const candidates = payload.candidates;
  if (Array.isArray(candidates)) {
    const text = candidates
      .map((candidate) => {
        if (candidate && typeof candidate === "object") {
          const parts = (
            candidate as { content?: { parts?: Array<{ text?: string }> } }
          ).content?.parts;
          if (Array.isArray(parts)) {
            return parts.map((part) => part?.text ?? "").join("");
          }
        }
        return "";
      })
      .join("");

    if (text.trim()) return text.trim();
  }

  const directText = payload.response;
  if (typeof directText === "string" && directText.trim()) {
    return directText.trim();
  }

  if (payload.output && typeof payload.output === "object") {
    const outputText = (payload.output as { text?: string }).text;
    if (typeof outputText === "string" && outputText.trim())
      return outputText.trim();
  }

  return null;
}

export async function generateWithGoogleLlm(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Set GEMINI_API_KEY in your environment before using the RAG app.",
    );
  }

  const response = await fetch(`${GOOGLE_LLM_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gemini-3.5-flash",
      input: prompt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Google LLM API request failed: ${response.status} ${errorText}`,
    );
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const text = extractTextFromResponse(payload);

  if (!text) {
    throw new Error("The Google LLM API returned no usable text.");
  }

  return text;
}
