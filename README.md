# APP-001 Round Timer RC6 — music coexistence / installed iPhone PWA

**Preview only.** Build `v0.8.6-mix-rc6`; source draft PR https://github.com/mastyukov/round-timer/pull/12, commit `835eb0ca19816e6d16bb517b19f80bf40ae40ae1`.

Observed RC5 on real iPhone:
- Home Screen minimize buzz: **not reproduced** (device check of RC5 only).
- HTML Audio + transient enabled: other music continues at its original volume (no precise ducking).
- HTML Audio with mode off: other music is interrupted when timer sounds.
- Web Audio: music continues regardless of switch.

RC6 changes: labels accurately say 'music plays together', defaults reset on preview to HTML Audio + coexistence ON, mixing switch hidden for Web Audio, Web Audio's ambient mix is not modified. Signals/audio sources and timer engine unchanged. **No promise of precise 50% other-app volume**.

Preview: https://mastyukov-cyber.github.io/round-timer-pages-test/
Version: https://mastyukov-cyber.github.io/round-timer-pages-test/preview-build.json

Production timer remains https://mastyukov.github.io/round-timer/; no Cloudflare telemetry on preview. Prior test SHA for rollback: `74b126fcd470cf62f6fe7b90f01606b94a70f766`. iPhone RC6 verification PENDING.
