# APP-001 Round Timer — RC15 TEST

**Version:** `v0.8.11-rc15` · 2026-11-12 · **not production**.

Base RC14 TEST commit: `a02e2e0736133a2eef7e096999dd23f7e162dae9`; initial code originated from source Draft PR #21.

Changes: preserve external music playback, without demanding ducking; avoid needless pause/seek on inactive HTML media; alternate two preloaded button samples; request countdown warning cues 250ms ahead of visual threshold only for HTML Audio (physical iPhone latency remains unverified); replace 10-second double recording playback with two user-approved single-hit samples separated by 115ms (five original MP3s unchanged). Slightly larger timer display and phase text; reduced portrait digit height; round number 3× word font; label moved closer to countdown. Responsive width clamp retained.

**TEST:** https://mastyukov-cyber.github.io/round-timer-pages-test/

**Rollback:** preceding TEST main `a02e2e0736133a2eef7e096999dd23f7e162dae9` (RC14). No change to production `mastyukov/round-timer`.
