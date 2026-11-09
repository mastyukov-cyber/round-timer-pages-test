# Round Timer — iPhone audio lifecycle preview

**TEST ONLY, not production.** Source: mastyukov/round-timer, draft PR #8, commit `d509d3cc9d6c2dc7f23664d586df287e072ae5ba`.

Build: `v0.8.6-audio-rc2`. A separate GitHub Pages test for PAUSE/active gong and HOME/background-audio transition. No production Cloudflare telemetry: sender permits only the approved production GitHub Pages origin/path.

Working production site is **not modified**: https://mastyukov.github.io/round-timer/

Preview: https://mastyukov-cyber.github.io/round-timer-pages-test/

Build manifest: https://mastyukov-cyber.github.io/round-timer-pages-test/preview-build.json

Source tests on draft PR #8: 71/71 JS, 23/23 Python PASS. Actual iPhone/WebKit result still PENDING.

**Rollback (only test repo):** main previously at `29ae4714f579e79f2d1685a57d515fda3b0bd28c`. Do not force-update without reviewing current branch; restore via new commit/revert with explicit permission if necessary.
