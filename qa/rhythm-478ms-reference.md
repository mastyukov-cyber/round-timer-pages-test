# APP-001 TEST — 10-second clack reference rhythm (15 Nov 2026)

**User's requested alternative:** keep the existing approved wooden clack audio, but extend the interval between two clacks on the **10-second** warning to match the user-supplied `03_ten_seconds(1).mp3`. Do not copy the uploaded audio into the app.

**Waveform evidence:** the reference MP3 is a 0.840-second, 48 kHz, mono recording. Major acoustic groups peak at about 34/92 ms and 512/569 ms. Envelope cross-correlation between groups peaks at **478 ms** (unit: 1 millisecond). Each group also has a roughly 58–60 ms secondary peak, interpreted as part of the hit/short echo, not as a separate scheduled clack.

**TEST change:** Web Audio `ten-double` start offsets [0, 0.478] seconds; HTML fallback schedules the second `ten-double` clack after 478 ms. Leave `slow-double` at 250 ms, generic `double` Web Audio at 155 ms and HTML at 145 ms; no changes to the gong, 5-second countdown, any MP3, button gain 0.1944, visual layout or background recovery.

**Offline:** change only Service Worker cache key to `round-timer-shell-v0.8.19-test-r478`, retain all shell files. Settings should still read `미하일 0.8.19`.

**Known unresolved iPhone observation:** after opening TEST, first two button taps may be silent while sound assets/context unlock; on the third tap sound plays. Normal app switches kept audio, but force-quit while workout runs required manual `ВКЛЮЧИТЬ ЗВУК` after reopening. This PR does not claim to fix either behavior. The existing TEST frozen-clock recovery remains unchanged.

**Rollback:** TEST base main `901f5754beb1ddfdbf0cf282db170d9e01abbf92`. FINAL `mastyukov/round-timer` v0.8.18 SHA `9bb1dc12444bf846f72fcd425688387cbc57a5fb` and stable FINAL v0.8.15 SHA `bfa13c8aabb1fd49b042c58ce130d4abf0ed9499` must remain unchanged.
