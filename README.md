# Round Timer · TEST RC12

Current preview: `v0.8.8-audio-rc12` — **TEST ONLY**, not a production release.
Source draft [PR #19](https://github.com/mastyukov/round-timer/pull/19), commit `686ec5d3c7590258bc4c08ba3d4d4bcd54a41c87`.

Changes from RC11: limit HTML media stop/seek to active sounds to reduce lag; skip the separate button sound when START already triggers a gong or preparation signal; foreground HTML work countdown cues requested 700 ms earlier (experimental), portrait digits about 5% shorter, slightly larger labels and landscape digits. All five user-recorded studio MP3s remain byte-identical, work/rest colors and zero-default rest retained.

RC12 passed 62/62 staged tests and 65/65 independent preview-branch tests before publication. Automatic CI is not evidence of precise audible timing on iPhone or Bluetooth. Background music was not tested in RC11/RC12 by the user.

TEST link: https://mastyukov-cyber.github.io/round-timer-pages-test/
Production `mastyukov/round-timer/main` was not changed. Immediate TEST rollback reference: `6df2c34ec4091caf35d913a1e658cd2acb0d9de6` (RC11).
