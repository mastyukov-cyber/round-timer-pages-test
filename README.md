# APP-001 Round Timer — experimental music ducking (test-only)

Build `v0.8.6-duck-rc5`. Source draft PR #11 https://github.com/mastyukov/round-timer/pull/11 at `65701f1f0fa599d9e826c2863fbf1fb3f1c40a9c`.

In training settings: music ducking ON (default, target approximately 50%, system-controlled) or OFF. iOS must support `navigator.audioSession.type='transient'`. Only active briefly while cue plays, then restores previous type. If unsupported, the switch is disabled. Do not claim actual precise volume control. Changing audio type may fail to produce gong audio on some versions of iOS and when silent switch is on.

Two playback transports (HTML Audio and Web Audio) remain available in preview settings. Test Bluetooth speaker, gong/pause/Home and music restoration. This is *not* approval to merge PRs.

Production https://mastyukov.github.io/round-timer/ unchanged; production telemetry/Cloudflare disabled on preview.

Preview https://mastyukov-cyber.github.io/round-timer-pages-test/
Build check https://mastyukov-cyber.github.io/round-timer-pages-test/preview-build.json
Previous preview commit for rollback `c09d9520d82bead1c52c19f3a2b03e2ba55e5377`.
