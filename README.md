# APP-001 Round Timer RC8 — HTMLAudio preparation cue startup timing
**Preview only, not production.** Version `v0.8.6-timing-rc8`.
Source draft PR: https://github.com/mastyukov/round-timer/pull/14, source SHA `ba6092bfe860265b84c0ea716f2b4d6a417bd4c5`.

Confirmed on the user's real iPhone for RC7:
- HTML Audio + mixing ON kept background music playing for the entire timer;
- HTML OFF muted/faded other music and Web Audio stopped other music;
- Some preparation clacks seemed to arrive at 3–4 seconds instead of immediately at 5.

Original audio file `woodclack.mp3` is approximately 235ms long (9 MPEG1 L3 frames at 44.1 kHz, confirmed from original repository bytes). The perceived >1s duration is not file length.

RC8 adds optional `audio.load()` calls for HTML sound assets to encourage timely loading. In Training Settings, `Первый щелчок` reports the browser's time from invoking `HTMLMediaElement.play()` to play promise resolution. **Bluetooth hardware and routing latency are not measurable by this method.** No user data or telemetry sent.

Best observed mode remains **HTML Audio + joint music playback ON**. WebAudio/OFF remain comparisons, not recommended. Production, sound assets, UI of actual countdown and timer core unchanged. No 50% music-volume claim.

Preview URL: https://mastyukov-cyber.github.io/round-timer-pages-test/
Version manifest: https://mastyukov-cyber.github.io/round-timer-pages-test/preview-build.json
Previous preview commit for rollback: `b402ec13f34d02a428a5df5792e0dcc2a0f308a4`.
