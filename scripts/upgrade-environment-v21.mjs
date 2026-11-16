import fs from 'node:fs';
let s=fs.readFileSync('dist/battle-view.js','utf8');
s="import {drawEnvironmentLife,queueArenaReaction} from './environment-life.js?v=20';\n"+s;
s=s.replace('mount(fighters){','mount(fighters){this.arenaReactions=[];');
s=s.replace('impact(p,color,strength=.3){','impact(p,color,strength=.3){queueArenaReaction(this,p.pos,color,strength);');
s=s.replace('this.vortexSuppression||0);if(this._dimNow',`this.vortexSuppression||0);this.arenaReactions=(this.arenaReactions||[]).filter(e=>this.clock-e.start<4.5);drawEnvironmentLife(back,arenaCatalog[this.arena]?.mood,this.clock,this.cinematic,this.arenaReactions);if(this._dimNow`);
fs.writeFileSync('dist/battle-view.js',s);
