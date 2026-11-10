# Cover letters: how it's wired

- `letters.html`: the cover letter writer (Write / Library / Settings). It's linked from the header, and from **✍️ Write cover letter** on every job card.
- `netlify/functions/cover-letter.mjs`: a small password-checked backend. It holds the Claude API key and stores her paragraph library in Netlify Blobs. The library is never in this repo.
- `package.json`: adds `@netlify/blobs`. Netlify installs it automatically on deploy.

## One-time setup
1. In Netlify, go to **Site configuration → Environment variables** and add:
   - `ANTHROPIC_API_KEY`: the Claude API key (`sk-ant-…`)
   - `COVER_LETTER_PASSWORD`: the password she'll type to unlock the page. Use 4+ random words.
2. **Deploys → Trigger deploy → Deploy site**. Environment variables only take effect after a fresh deploy.
3. Open `/letters.html`, enter the password, and import `library.json` when it asks. Keep `library.json` out of the repo.
4. In the Claude Console (platform.claude.com), set a monthly spend limit, e.g. $5.

## Notes
- Library edits save straight to Netlify. A dated backup is kept automatically, and Settings → Download library backup gives you your own copy.
- Cost is about 3p per draft on Sonnet, and the exact figure shows under each draft.
- To change the password, change `COVER_LETTER_PASSWORD` and redeploy.
