# APP-001 Round Timer — RC18 TEST

**Version** `v0.8.14-rc18` (12 November 2026, not production).

Base: RC17 TEST SHA `12aeecc200124e3a67d76a85ea9545850c94c9e0`.

Requested final fixes:
1. Ten-second double hit: **135 ms** between two approved stick samples, identical in Web Audio and dormant HTML fallback.
2. Align **РАУНД** with bottom edge of large `1/3`, not vertically centered.
3. Landscape countdown: maximize visual clock size within actual free height and viewport width, with compact round header and explicit safe fitting. No overflow/cropping and retain control buttons.

Preserved: portrait clock layout, Web Audio, source MP3 5/5, working/background timer, music coexistence and simplified settings.

TEST URL: https://mastyukov-cyber.github.io/round-timer-pages-test/

Rollback TEST to RC17: `12aeecc200124e3a67d76a85ea9545850c94c9e0`. Production `mastyukov/round-timer` untouched. Physical iPhone verification still required.
