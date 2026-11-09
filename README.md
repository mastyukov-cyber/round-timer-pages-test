# APP-001 Round Timer RC7 — hold music coexistence across a round

**Test only:** `v0.8.6-hold-rc7`, cumulative source draft PR #13: https://github.com/mastyukov/round-timer/pull/13, SHA `e32d91a42365904c9812123c723d95a061fd237f`.

Real iPhone RC6 feedback: HTML Audio with mixing ON played music through gong but music stopped immediately after; with mixing OFF it stopped at first clacks and did not return; Web Audio kept music playing without attenuation.

**RC7 hypothesis:** avoid switching the HTML Audio session category immediately after each cue. The transient category is held while the timer is running, then restored when the user pauses/resets or closes/switches apps. This can still fail on iOS; physical iPhone validation required. No promise of exact ~50% volume reduction. HTML Audio + mixing remains default in test settings; Web Audio is a comparison option.

Preview URL https://mastyukov-cyber.github.io/round-timer-pages-test/
Version https://mastyukov-cyber.github.io/round-timer-pages-test/preview-build.json
Production https://mastyukov.github.io/round-timer/ **unchanged**.
Previous test SHA `a9959fc938bfdf983f2d3f9d9e58385546b22ca0` retained for rollback. Production Cloudflare telemetry disabled for test origin.
