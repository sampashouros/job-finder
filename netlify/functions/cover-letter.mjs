// Cover letter helper backend.
// - Keeps the Claude API key server-side (env var ANTHROPIC_API_KEY).
// - Every request needs the password in env var COVER_LETTER_PASSWORD.
// - Stores her paragraph library in Netlify Blobs (private, not in the repo).
import { getStore } from "@netlify/blobs";
import { timingSafeEqual, createHash } from "node:crypto";

const ALLOWED_MODELS = ["claude-sonnet-5-5", "claude-haiku-5-5", "claude-opus-5-5"];
const MAX_TOKENS_CAP = 8000;
const STORE = "cover-letters";
const LIBRARY_KEY = "library";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

function passwordOk(given) {
  const expected = process.env.COVER_LETTER_PASSWORD || "";
  if (!expected || typeof given !== "string") return false;
  // Hash both so the comparison is constant-time regardless of length.
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export default async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!process.env.COVER_LETTER_PASSWORD || !process.env.ANTHROPIC_API_KEY) {
    return json({ error: "Server not set up: add ANTHROPIC_API_KEY and COVER_LETTER_PASSWORD in Netlify → Site configuration → Environment variables, then redeploy." }, 500);
  }

  let body;
  try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400); }

  if (!passwordOk(req.headers.get("x-app-password"))) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return json({ error: "Wrong password" }, 401);
  }

  const store = getStore(STORE);

  switch (body.action) {
    case "library-get": {
      const lib = await store.get(LIBRARY_KEY, { type: "json" });
      return json({ library: lib || null });
    }

    case "library-put": {
      const lib = body.library;
      if (!lib || !Array.isArray(lib.items)) return json({ error: "Invalid library" }, 400);
      lib.updated = Date.now();
      await store.setJSON(LIBRARY_KEY, lib);
      // Keep a dated backup of the previous few saves, just in case.
      await store.setJSON(`backup-${new Date().toISOString().slice(0, 10)}`, lib);
      return json({ ok: true, updated: lib.updated });
    }

    case "claude": {
      const p = body.payload || {};
      if (!ALLOWED_MODELS.includes(p.model)) return json({ error: "Model not allowed" }, 400);
      const upstream = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: p.model,
          max_tokens: Math.min(Number(p.max_tokens) || 4000, MAX_TOKENS_CAP),
          system: p.system,
          messages: p.messages,
          tools: p.tools,
          tool_choice: p.tool_choice,
          stream: true,
        }),
      });
      if (!upstream.ok) {
        const text = await upstream.text();
        let message = text;
        try { message = JSON.parse(text).error.message; } catch {}
        return json({ error: message, status: upstream.status }, upstream.status);
      }
      // Pass Claude's event stream straight through to the browser.
      return new Response(upstream.body, {
        headers: { "content-type": "text/event-stream", "cache-control": "no-store" },
      });
    }

    default:
      return json({ error: "Unknown action" }, 400);
  }
};
