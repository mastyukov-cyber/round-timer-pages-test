# APP-001 — ROUND TIMER | RC16 TEST

**Build:** `v0.8.12-rc16` · 12 November 2026 · not production.

Base: TEST RC15 commit `244435d682161386bd3a064fc1dc8a683a0a77ef`.

User's physical iPhone feedback: Web Audio gong and clack sound timing is excellent. Music from another iPhone music app may make the button tap sample slightly harsh.

RC16: **keep Web Audio cue timing unchanged**. Change Web Audio button only: reduce volume from 0.90 to 0.72, soften attack over 4 ms and release over the last 12 ms. Do not edit any MP3. Enlarge countdown digits slightly in portrait and landscape with responsive sizing; move round heading down; enlarge only `1/3` from 3× to 4.5× the word “РАУНД”, retaining width fitting for long round counts.

No changes to production `mastyukov/round-timer`; no music ducking request. TEST deployment only after isolated CI passes.

TEST: https://mastyukov-cyber.github.io/round-timer-pages-test/

Rollback SHA for TEST: `244435d682161386bd3a064fc1dc8a683a0a77ef`.

Physical iPhone QA still required: button sound with background music, portrait and landscape readability, clipping and settings modal.
