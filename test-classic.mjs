import assert from 'node:assert/strict';
import {spriteCandidates} from './dist/classic-sprites.js';
assert.match(spriteCandidates(6,false,'charizard')[0],/generation-iii\/firered-leafgreen\/6.png$/);
assert.match(spriteCandidates(6,true,'charizard')[0],/firered-leafgreen\/back\/6.png$/);
assert.match(spriteCandidates(483,true,'dialga')[0],/generation-v\/black-white\/back\/483.png$/);
assert.match(spriteCandidates(658,true,'greninja')[0],/gen5-back\/greninja.png$/);
for(const id of [6,384,483,658,1025])for(const url of spriteCandidates(id,true,'test'))assert(url.includes('/back/')||url.includes('gen5-back/'),'A back-facing fighter must never fall back to a front sprite');
console.log('PASS: authentic GBA source selection, full-body later-generation backs, and facing-preserving fallback chains.');
