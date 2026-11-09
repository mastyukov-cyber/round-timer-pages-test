# APP-001 Round Timer HTML Audio RC4 — test only

Build: `v0.8.6-html-rc4`. Source draft PR https://github.com/mastyukov/round-timer/pull/10 , SHA `5b421478581ed3695fb23d6ae6a9ed54b641c7c2`.

Installed iPhone PWA AUDIO-02 investigation. Settings show HTML Audio experiment (default) and Web Audio (control). HTML Audio mutes and pauses on Home/blur. iOS may block automatic cues without a user gesture, so real iPhone testing is required.

Production timer https://mastyukov.github.io/round-timer/ unchanged; production Cloudflare telemetry disabled on preview. Music ducking 50% is a separate future experiment.

Preview https://mastyukov-cyber.github.io/round-timer-pages-test/
Build metadata https://mastyukov-cyber.github.io/round-timer-pages-test/preview-build.json
Previous test commit `074e66672d37a0020a8749b001b0c22feb5bbe83` for rollback.
