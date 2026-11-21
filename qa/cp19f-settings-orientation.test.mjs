import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('switch is Russian ВКЛ/ВЫКЛ and keeps green/red accessibility state',()=>{
 const app=read('app.mjs'),html=read('index.html');
 assert.match(app,/soundEnabled\?'ВКЛ':'ВЫКЛ'/);
 assert.match(app,/el\.soundToggle\.dataset\.sound=soundEnabled\?'on':'off'/);
 assert.match(html,/data-sound="on">ВКЛ<\/button>/);
 assert.match(read('styles.css'),/\.cp19f-audio-toggle\[data-sound="off"\]/);
});
test('OFF to ON plays button once and uses existing sound sample when no WAV is decoded',()=>{
 const app=read('app.mjs');
 assert.match(app,/if\(soundEnabled\)\{\s*cp19Gesture\(\);/);
 assert.match(app,/if\(audioMode==='web'&&!soundBuffers\.button\)/);
 assert.match(app,/if\(!htmlSounds\?\.playButton\(\)\)buttonSound\(\)/);
 assert.match(app,/\}else buttonSound\(\);/);
 assert.match(app,/if\(!next\)\{[\s\S]*?stopActiveAudio\(/);
});
test('idle workout settings persist separately from active session and restore on refresh',()=>{
 const app=read('app.mjs');
 assert.match(app,/round-timer-cp19f-settings-v1/);
 assert.match(app,/localStorage\.setItem\(SETTINGS_KEY,JSON\.stringify\(config\)\)/);
 assert.match(app,/localStorage\.getItem\(SETTINGS_KEY\)/);
 assert.match(app,/if\(!session\)\{config=readConfig\(\);save\(\);draw/);
 assert.match(app,/restoreSavedSettings\(\);updateInputs\(config\);restore\(\);draw/);
});
test('wheel reconciles changed row height to selectedIndex, never generates a user choice',()=>{
 const picker=read('cp19-wheel-picker.mjs');
 assert.match(picker,/lastRowHeight:NaN/);
 assert.match(picker,/Math\.abs\(rowHeight\(\)-entry\.lastRowHeight\)>\.5\)\{refresh\(\);return;/);
 assert.match(picker,/idx!==entry\.lastSynced\|\|Math\.abs\(entry\.lastRowHeight-h\)>\.5/);
 assert.match(picker,/scroll\.scrollTop=idx\*nextHeight/);
 assert.match(picker,/orientationchange',reflow/);
 assert.match(picker,/resize',reflow/);
});
