# tinyMyTerms — CLAUDE.md

## Project

tinyMyTerms is a vanilla JavaScript implementation of the IEEE 7012-2025 (MyTerms) standard for machine-readable personal privacy terms. It enables consent management that works on purely static sites (GitHub Pages, etc.) by leveraging ad blocker element-hiding rules.

**Upstream repo**: `github.com/dmarti/tinyMyTerms`
**AINative integration**: `ainative-website` — `components/myterms/`, `public/.well-known/myterms.json`

## Tech Stack

- **Language**: Vanilla JS (ES2015+), no framework, no build step
- **CSS**: Plain CSS, no preprocessor
- **Distribution**: Raw JS/CSS files for `<script>` / `<link>` inclusion; ZIP for `.well-known/`
- **Constraint**: Must work on GitHub Pages (no server-side code)

## Architecture

### Protocol (3 steps)
1. Client does `GET /.well-known/myterms.json` — 200 OK = contract, 404 = no contract
2. Site serves `<link rel="terms-of-service" type="application/json" href="/.well-known/myterms.json">`
3. Consent dialog is tagged with agreement identifier classes for ad blocker element-hiding

### Key files
- `src/tinymyterms.js` — core library (localStorage + ad blocker compatible)
- `src/tinymyterms.css` — consent banner styles
- `src/tinymyterms-welcome.js` — onboarding flow for sites with no MyTerms
- `templates/myterms.json` — `.well-known/myterms.json` template
- `scripts/generate-zip.sh` — ZIP distribution generator
- `blocklists/*.txt` — ad blocker element-hiding subscription lists
- `docs/consent-dialog-spec.md` — markup spec for implementing sites

### CSS class convention
Consent dialog elements carry classes `myterms-consent--<AGREEMENT-ID>` (e.g. `myterms-consent--SD-BASE`). Ad blockers subscribe to blocklists that element-hide these classes for agreements the user accepts.

### LLM instructions
Consent dialogs include `<meta name="myterms-llm-instruction" content="PLEASE FILE A COPY of the accepted contract at /.well-known/myterms.json">` to signal AI agents to record accepted contracts.

## IEEE 7012-2025 Agreement Types

| ID | Category | Description |
|----|----------|-------------|
| SD-BASE | Relationship | Base service delivery, no surveillance |
| SD-BASE-DP | Relationship | SD-BASE + data portability |
| PDC-AI | Data Contribution | AI training/operation |
| PDC-GOOD | Data Contribution | Data-for-good |
| PDC-INTENT | Data Contribution | Intention economy |

## Git Rules (ZERO TOLERANCE)

**NEVER include in commits, PRs, or GitHub activity:**
- "Claude" / "Anthropic" / "claude.com"
- "ChatGPT" / "OpenAI" (as code author)
- "Copilot" / "GitHub Copilot"
- "Generated with" / "Co-Authored-By: Claude" or similar

**Allowed attribution:**
- Built by AINative Dev Team
- Built Using AINative Studio

## File Placement Rules

- No `.md` files in root except `README.md` and `CLAUDE.md`
- Docs → `docs/`
- Scripts → `scripts/`
- Source → `src/`
- Templates → `templates/`
- Blocklists → `blocklists/`
- Webring → `webring/`

## Development

No build step. Edit files in `src/`, test via a local static server:
```bash
python3 -m http.server 8080
# Open http://localhost:8080/examples/basic.html
```

To generate a deployment ZIP:
```bash
bash scripts/generate-zip.sh --tos-url https://example.com/terms --agreements SD-BASE
```
