# APP-001 — RC9 installed-PWA audio mode selector fix

**TEST ONLY — no production changes.** Build: `v0.8.6-switch-rc9`. Draft source PR https://github.com/mastyukov/round-timer/pull/15 at `7cce265580edb8933dad1e34373d7755f7c29d30`.

**Bug in RC8 confirmed from source:** audio transport select stayed disabled for a restored or paused training session and the running change handler reverted the selection. The settings also auto-closed while running.

RC9 lets the user select HTML Audio or Web Audio in Settings at any time on the test origin. Switching while running first stops sound and auto-pauses the countdown while saving exact elapsed milliseconds. Settings remains visible. Training duration fields stay locked while session exists. Switching while paused or idle is immediate. Mix ON/OFF select remains specific to HTML Audio and supports the same safe pause behavior. Displayed help text explains auto-pause.

Existing HTML audio preload, first-clack timing diagnostic, and timer/sound assets remain unchanged. Best real-iPhone result to date: HTML Audio + joint music ON; other modes are diagnostic comparisons. Exact 50% external music attenuation is not supported by this PWA.

Preview URL: https://mastyukov-cyber.github.io/round-timer-pages-test/
Version manifest: https://mastyukov-cyber.github.io/round-timer-pages-test/preview-build.json
Previous test-site SHA (RC8) to revert to: `e5527711439f83883fcc4f2106ad2ada476661b4`.
Production https://mastyukov.github.io/round-timer/ is unchanged. Test origin cannot transmit to production Cloudflare endpoint.
