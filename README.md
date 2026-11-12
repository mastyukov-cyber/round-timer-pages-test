# APP-001 Round Timer — RC19 TEST

**Build:** `v0.8.15-rc19` · 12 November 2026 · **TEST ONLY**.

Base TEST RC18 `7e80423fdfbf3d64068c8abcee0d413956980960`.

Changes from two physical iPhone screenshots and owner's review:
1. Web Audio and dormant HTML Audio: ten-second double stick interval **140 ms** (previously 135 ms). Original 5 MP3 files are unchanged.
2. Optically lift word **РАУНД** by 0.44 of its own font em, so its visible lower edge aligns with the numerals, preserving the large 1/3 and centered diagonal slash.
3. Wider countdown in portrait (horizontal scale 1.51 vs 1.38) and landscape (2.23 vs 1.79), fitting to 96.5% of available frame width while still restricting actual visual height. Do not touch vertical height, soundtrack, music coexistence, controls or approved layout elsewhere.

Must confirm visually on the physical iPhone that neither time digits nor controls clip in either orientation. Automated JS tests can establish only model invariants.

TEST URL: https://mastyukov-cyber.github.io/round-timer-pages-test/

**Rollback TEST** to `7e80423fdfbf3d64068c8abcee0d413956980960` (RC18). The production `mastyukov/round-timer` main and site are not modified.
