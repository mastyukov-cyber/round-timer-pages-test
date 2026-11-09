# Round Timer — isolated audio RC3 iPhone regression
**PREVIEW ONLY — not production**
- Build: `v0.8.6-audio-rc3`
- Draft PR: https://github.com/mastyukov/round-timer/pull/9
- Source SHA: `342391c392dd36eb8596651c13f26ebec95b23b2`
- Preview URL: https://mastyukov-cyber.github.io/round-timer-pages-test/
- Version check: https://mastyukov-cyber.github.io/round-timer-pages-test/preview-build.json
- Objective: verify AUDIO-01 pause remains fixed and AUDIO-02 iPhone buzzing on minimize is gone. WebKit/real iPhone is unverified at deploy time.
- Browser `blur` handling precedes `visibilitychange` when the browser delivers events in that order; no guarantee iOS exposes blur before sound interruption.
- External music ducking 50% is requested as a **separate future experiment**, not enabled in RC3.
- Production Cloudflare error transport is disabled on this preview by origin/path gating.

Production timer remains: https://mastyukov.github.io/round-timer/ (unchanged).

Only test repo `main` advanced. Test-site rollback SHA before RC3: `d8c4c1d31b0f1471727902a38181e365b7e3ae42`. Restore by a new revert commit if explicitly requested.
