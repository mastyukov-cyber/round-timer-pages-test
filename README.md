# APP-001 RC10 — installed iPhone WebAudio background gong retirement

**TEST ONLY — DO NOT MERGE OR CHANGE PRODUCTION.**
Build `v0.8.6-retire-rc10`; source draft PR #16 https://github.com/mastyukov/round-timer/pull/16 at `e1a9854f5d5f278dc6fd75f1cee66f9dcef1c0db`.

Real iPhone RC9: HTML Audio with Music OFF interrupted music and clacks were delayed; WebAudio interrupted music and replayed a fraction of the first gong upon returning after 10s on Home Screen. Other music + HTML Audio ON was the best previously observed mode, not re-tested in that specific report.

RC10 aggressively closes the entire WebAudio context when the iPhone app blurs, hides or navigates away. It discards old decoded buffers and ignores pending decode operations from earlier generations. It mutes sources immediately rather than fading on blur. On return it never plays missed cues, while the timer's wall clock continues. Next WebAudio sounds after return might require pressing PAUSE then CONTINUE to unlock a fresh context. HTML Audio + music ON audio category and the native sound MP3s are unchanged.

For preparation 5s: WebAudio can miss the first 5s clack if its asset has not yet decoded; we intentionally avoid replaying it late, so it cannot collide with later ticks. Original woodclack asset is ~235ms, not >1s. Browser/BT onset may be delayed. Prefer testing HTML Audio + Music ON.

Preview https://mastyukov-cyber.github.io/round-timer-pages-test/
Version https://mastyukov-cyber.github.io/round-timer-pages-test/preview-build.json
Production https://mastyukov.github.io/round-timer/ remains unchanged.
Prior RC9 test SHA for rollback: `e90d86ffbb8987c8c631d10fd4b3e4f31792ec49`.
