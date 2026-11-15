# APP-001 — Round Timer v0.8.19 AUDIO FIX (TEST ONLY)

Production baseline: `mastyukov/round-timer` FINAL v0.8.18, SHA `9bb1dc12444bf846f72fcd425688387cbc57a5fb`.

TEST URL: https://mastyukov-cyber.github.io/round-timer-pages-test/

Changes: double wooden clacks 155ms in WebAudio and HTML fallback, button WebAudio gain 0.1944 (10% below 0.216), settings `미하일 0.8.19` without «ВЕРСИЯ». TEST-only watchdog detects `AudioContext.state='running'` with frozen `currentTime` for 1.6s; attempts one bounded `suspend()` then `resume()` per foreground epoch and verifies actual clock progress. Failure displays manual recovery; new context creation only on user tap. Missed signals are never replayed. Current layout, gong policy, MP3 hashes and offline cache behavior preserved. No additional network telemetry or personal data.

This is an experiment informed by iOS WebKit bug 263627. Only an actual iPhone can confirm audible output.

TEST rollback main: `021a17337f339e0a1b98f5cc90862a741aa01ad0`.
FINAL main remains `9bb1dc12444bf846f72fcd425688387cbc57a5fb`, with primary stable FINAL rollback v0.8.15 `bfa13c8aabb1fd49b042c58ce130d4abf0ed9499`.
