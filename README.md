# APP-001 Round Timer — RC17 TEST

**Version:** `v0.8.13-rc17` — 12 November 2026. **Not a production release.**

Base TEST RC16: `649144d04336ff0be54cde180e1c90dee2801b9b`.

Physical iPhone feedback: Web Audio cue timing is excellent; keep all RC16 typography, sound gains and original five MP3 intact.

RC17 changes:
- Retire audio/mixing/latency controls from user settings and force Web Audio in TEST, ignoring old HTML Audio selections.
- Ten-second double single-hit separation set to **130ms** in both Web Audio and dormant HTML fallback (between 115ms RC16 and 145ms older).
- Replace the font '/' that hangs below digits with a centered CSS diagonal stroke between separate numeric spans; preserve width clamping and accessible round label.
- Restore small-viewport height and redo clock fit when returning from the iPhone Home screen or reopening the PWA. Keep all main controls inside display bounds.

All QA uses synthetic tests and exact hash verification. Physical iPhone validation still required for reopening several times and footer visibility.

Test URL: https://mastyukov-cyber.github.io/round-timer-pages-test/

Rollback TEST to RC16: `649144d04336ff0be54cde180e1c90dee2801b9b`. Never touch production `mastyukov/round-timer`.
