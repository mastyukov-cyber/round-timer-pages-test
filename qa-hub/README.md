# APP-001 Round Timer · PAE-00 QA HUB v1 / CP-QA-HUB-06

**PREPARED ONLY — NO QA EXECUTED; NO WORKFLOW, NO CODESPACE.**

Source: `mastyukov-cyber/round-timer-pages-test` exact `main` SHA `04c84099db737cd90c8f447a8bba188b38f02441`.
Proposed isolated branch: `pilot/app001-qa-hub-browser-v1-20261121`.

## What is new
- Chromium and Linux WebKit each open **five** existing CP19 query modes. Verify exact mode banner, button-driven start → pause → resume → reset and absence of unhandled JavaScript errors.
- **Chromium only:** actual registered Service Worker, Cache Storage shell including JS and WAV, reload while browser context is offline, then control buttons offline.
- **WebKit Service Worker/Cache offline NOT RUN** because this Playwright workflow cannot establish equivalent Service Worker interception guarantees. Linux WebKit ≠ physical iPhone Safari.
- Physical iPhone first-tap sound, gong, audible 478 ms rhythm, competing music, silent mode, background audio and latency: **NOT RUN / NOT MEASURED**. No microphone, simulated tones, telemetry delivery, or sound-quality claim.
- Existing Node.js 58/58 test suite and audio SHA tests **NOT REPEATED**.

## Exact safety boundaries
- **Only five new files** in the isolated TEST branch; no existing source, audio, `sw.js`, workflows, `main`, Pages, published TEST or FINAL changes.
- Source is pinned by **36 Git blob SHA-1 fingerprints**, including every live Service Worker precache asset. No dynamic application source fetch, no external preview.
- Future test HTTP origin is **`http://127.0.0.1:8769`** bound only to loopback in an approved temporary GitHub Actions Docker container, with network disabled. Only allowlisted pinned public static files may be served. No `/qa-hub/`, `/tests/`, `/.github/` paths or real data.
- The original diagnostics sender is byte-pinned and allows error uploads only for the existing FINAL origin; localhost cannot send telemetry. Future runner network `--network none` adds defense in depth.
- `npm ci` and `node` are NOT executed by adding this branch. `.run/` and `node_modules/` stay ignored. A future report is written only if `qa` explicitly runs in an authorized ephemeral test environment.
- There is **no workflow file** in this pilot and no automatic trigger. No Docker container, server, Codespaces, PR, deploy or cloud service is created.

## Next explicit permission gate
1. Independent HEAD SHA and one-file workflow-diff preflight; verify no pre-existing Actions run on the pilot branch.
2. One new SHA-guarded scoped workflow may be separately approved, using host `actions/checkout` with `set-safe-directory:false`, `permissions:contents:read`, and isolated Docker `--network none`, read-only source mount plus pre-created gitignored `qa-hub/.run` mount.
3. At most one fail-fast `npm ci --ignore-scripts --no-audit --no-fund`, `npm run verify`, `npm run qa` (Chromium then WebKit). Stop on first FAIL and retain the original failed run. No retry or release.
4. Only GitHub job logs provide the future readback; no upload artifacts and no automatic write to Dropbox.

**Status:** STATIC PREP ONLY / RUNTIME NOT RUN / FINAL RELEASE NO-GO.
