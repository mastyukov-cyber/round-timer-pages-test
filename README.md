# APP-001 Round Timer — RC14 TEST

Current TEST version: `v0.8.10-mix-rc14`. This is **not** a production release.

Source: isolated Draft PR [#21](https://github.com/mastyukov/round-timer/pull/21), SHA `43fb3611e3ddf66c5f8ac59b2512eb75b3200528`.

Changes: HTML Audio keeps external music in transient mixing category during foreground RESET/PAUSE; Web Audio click and workout sounds are separated to avoid prematurely cutting off button sounds; Web Audio starts preparation during a user gesture; larger portrait and landscape timer digits, enlarged round label, preparation 0 seconds by default, rest 30 seconds by default. Explicit presets remain selectable. All five approved user-recorded studio MP3s are byte-identical to the previous TEST.

Independent candidate CI: **94/94 PASS**. Source: **139/139 JavaScript** and **23/23 Python**; SourceCraft **30/30 JavaScript** and **21/21 Python**. On-device iPhone sound latency, Web Audio music ducking and potential visual clipping require physical validation.

TEST site: https://mastyukov-cyber.github.io/round-timer-pages-test/
Previous TEST rollback: `1c288fc277c74b50e3c4fc0244dba36248aebb88` (RC13).
Production repo and main branch have not been modified.
