# Round Timer — TEST RC13 (v0.8.9-recovery-rc13)

**TEST ONLY** — source draft [PR #20](https://github.com/mastyukov/round-timer/pull/20). The production v0.8.5 remains unchanged.

iPhone RC12 reported missing warning sounds, delayed clicks, and settings allowing taps through to hidden controls. RC13 restores the previously audible RC11 HTML warning controller and exact countdown thresholds (60, 30, 10, 5–1), initiates button clicks directly on pointerdown, and blocks touches beneath the settings dialog. Old preview transport choice is reset to HTML Audio; music mixing preferences are preserved but untested on the actual iPhone. The five approved user-recorded MP3 assets are byte-identical.

Independent regression on the exact TEST candidate commit `b285a052db811da31938a3ac4282e787afdbee5e`: **71/71 JavaScript PASS, 5/5 MP3 SHA-256 PASS**. Source RC13 regression: **128/128 JavaScript and 23/23 Python PASS**. Passing automated tests does not prove audible cues work on a real iPhone.

Rollback TEST SHA: `03b9c6332c07dddc6b3a34ec3a2ab5e5ee5465a3` (RC12). Main production repo not changed.
