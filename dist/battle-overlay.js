import {drawFaintNotices} from './faint-notices.js?v=32';
import {drawClutchVignette,drawBroadcastExtras,drawTrainerCutIn} from './duel-showcase.js?v=32';
import {drawTrainerHUD,drawTrainerOutro} from './trainer-duel.js?v=32';
// Shared by the live HUD and the recording's native-resolution overlay.
export function drawBattleOverlay(c,view){
 drawFaintNotices(c,view);drawClutchVignette(c,view);drawTrainerHUD(c,view);
 drawBroadcastExtras(c,view);drawTrainerCutIn(c,view);drawTrainerOutro(c,view);
}
