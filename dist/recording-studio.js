import {drawBattleOverlay} from './battle-overlay.js?v=32';
export const RECORDING_PROFILES={fullhd:{width:1080,height:1920,fps:60,videoBitsPerSecond:12000000},compact:{width:540,height:960,fps:30,videoBitsPerSecond:4000000}};
import {trainerVisualScale} from './trainer-scale.js?v=32';
import {trainerSpriteRect} from './trainer-duel.js?v=32';
import {guardianSpriteRect,bossSpriteRect} from './guardian-presentation.js?v=32';
import {W, H} from './battle-view.js?v=32';
import {title} from './engine.js?v=32';

export class RecordingStudio {
  constructor(view, stage, onStatus = () => {}) {
    this.view = view;
    this.stage = stage;
    this.onStatus = onStatus;
    this.recording = false;this.quality='fullhd';
    this.autoRecord = false;
    this.chunks = [];
    this.framesRecorded = 0;
    this.highlights = [];
    this.recordStartedAt = 0;
    this.lastExportUrl = null;
    this.winnerSubtitle = 'THE DUST HAS SETTLED';
    this.canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    if (this.canvas) {
      this.canvas.width = W;
      this.canvas.height = H;
      this.ctx = this.canvas.getContext('2d');
    }
  }

  setQuality(value){if(this.recording||!RECORDING_PROFILES[value])return false;this.quality=value;return true;}

  renderCompositeFrame() {
    if (!this.ctx || !this.view) return;
    const c = this.ctx,scale=(this.canvas.width||W)/W;c.setTransform?.(scale,0,0,scale,0,0);c.imageSmoothingEnabled=false;
    c.clearRect(0, 0, W, H);if(this.view.trainerMode){c.fillStyle='#172532';c.fillRect(0,0,W,H);}
    c.save();
    const zoom=this.view._zoomNow||1;
    c.translate(W/2+(this.view.cameraShakeX||0)+(this.view._panXNow||0),H/2+(this.view._panNow||0)+(this.view.cameraShakeY||0));c.scale(zoom,zoom);c.translate(-W/2,-H/2);
    if (this.view.scenery) c.drawImage(this.view.scenery, 0, 0, W, H);
    if(this.view.entranceCanvas)c.drawImage(this.view.entranceCanvas,0,0,W,H);
    const active = [...(this.view.fighters || [])]
      .filter(p => p.el && !p.reserve && !p.benched && !p.entranceHidden)
      .sort((a, b) => (a.pos?.y || 0) - (b.pos?.y || 0));
    for (const p of active) {
      const spriteCanvas = p.el.querySelector('canvas');
      c.save();
      const alpha = p.retiredAt !== undefined ? Math.max(0, 0.4 * (1 - (this.view.clock - p.retiredAt) / 0.25)) : (p.hp <= 0 ? 0.5 : 1);
      c.globalAlpha = alpha*(p.reactionShot?.14:1)*(p.outroDimmed?.3:1);
      c.fillStyle = '#17182466';
      c.beginPath();
      c.ellipse(p.pos.x, p.pos.y + (p.trainerDuel?28*trainerVisualScale(p):18), p.isBoss ? 36 : p.trainerDuel?22*trainerVisualScale(p):22, p.isBoss ? 11 : p.trainerDuel?7*trainerVisualScale(p):7, 0, 0, Math.PI * 2);
      c.fill();
      if (spriteCanvas && spriteCanvas.width > 0) {
        const scale = p.isBoss ? 1.35 : p.id === 890 ? 1.2 : 1;
        const bw = 128 * scale, bh = 148 * scale;
        if(p.trainerDuel){const r=trainerSpriteRect(p);c.drawImage(spriteCanvas,r.x,r.y,r.width,r.height);}else if(p.isGuardian||p.isBoss||p.outroHero){const r=p.isBoss?bossSpriteRect(p):guardianSpriteRect(p);if(p.silhouette)c.filter='brightness(0)';else if(p.outroInjured)c.filter='saturate(.8) brightness(.93)';c.drawImage(spriteCanvas,r.x,r.y,r.width,r.height);}else c.drawImage(spriteCanvas, p.pos.x - bw / 2, p.pos.y - bh * 0.62, bw, bh);
      }
      c.restore();
    }
    if (this.view.canvas) c.drawImage(this.view.canvas, 0, 0, W, H);
    c.restore();
    c.save();c.globalAlpha=this.view.hudOpacity??1;
    const raidHud=this.stage?.classList.contains('raid-hud-edges');
    if(!this.view.trainerMode){this.drawCompositeHUD(c, 0, raidHud?30:82);this.drawCompositeHUD(c, 1, raidHud?884:790);}
    c.restore();
    if(scale>1&&typeof document!=='undefined'){
      this.exportOverlay??=document.createElement('canvas');if(this.exportOverlay.width!==this.canvas.width||this.exportOverlay.height!==this.canvas.height){this.exportOverlay.width=this.canvas.width;this.exportOverlay.height=this.canvas.height;}
      const overlay=this.exportOverlay.getContext('2d');overlay.setTransform(scale,0,0,scale,0,0);overlay.imageSmoothingEnabled=false;drawBattleOverlay(overlay,this.view);c.drawImage(this.exportOverlay,0,0,W,H);
    }else if(this.view.overlayCanvas)c.drawImage(this.view.overlayCanvas,0,0,W,H);
    const resultEl = this.stage?.querySelector('#result');
    if (resultEl && !resultEl.classList.contains('hidden')) {
      c.save();
      c.fillStyle = '#121724e8';
      c.fillRect(0, 310, W, 320);
      c.strokeStyle = '#e5c36a';
      c.lineWidth = 2;
      c.strokeRect(24, 326, W - 48, 288);
      c.textAlign = 'center';
      c.fillStyle = '#b6ed91';
      c.font = 'bold 12px monospace';
      c.fillText(this.winnerSubtitle || 'THE DUST HAS SETTLED', W / 2, 375);
      c.fillStyle = '#ffffff';
      c.font = 'bold 26px monospace';
      c.fillText(resultEl.querySelector('h2')?.textContent || 'VICTORY', W / 2, 430);
      c.fillStyle = '#d5e0ec';
      c.font = '14px monospace';
      c.fillText(resultEl.querySelector('p')?.textContent || '', W / 2, 480, W - 90);
      c.fillStyle = '#9fb0c4';
      c.font = '11px monospace';
      c.fillText(resultEl.querySelector('#result-stats')?.textContent || '', W / 2, 535);
      c.restore();
    }
    this.framesRecorded++;
  }

  drawCompositeHUD(c, team, topY) {
    const teamFighters = (this.view.fighters || []).filter(p => p.team === team);
    if (!teamFighters.length) return;
    const totalHp = teamFighters.reduce((s, p) => s + Math.max(0, p.hp), 0);
    const totalMax = Math.max(1, teamFighters.reduce((s, p) => s + p.max, 0));
    const alive = teamFighters.filter(p => p.hp > 0).length;
    c.save();
    c.fillStyle = '#191b24eb';
    c.strokeStyle = team === 0 ? '#e35c4c' : '#e3b838';
    c.lineWidth = 2;
    c.fillRect(27, topY, W - 54, 62);
    c.strokeRect(27, topY, W - 54, 62);
    c.fillStyle = team === 0 ? '#ad352b' : '#a77e16';
    c.fillRect(36, topY - 16, 220, 16);
    c.fillStyle = '#ffffff';
    c.font = 'bold 10px monospace';
    c.textAlign = 'left';
    c.fillText(`${this.view.teamName(team)} (${alive}/${teamFighters.length})`, 42, topY - 4);
    c.fillStyle = '#111d22';
    c.fillRect(42, topY + 18, W - 84, 10);
    c.fillStyle = '#62cf76';
    c.fillRect(42, topY + 18, (W - 84) * Math.max(0, totalHp / totalMax), 10);
    c.fillStyle = '#dddce4';
    c.font = '10px monospace';
    c.fillText(teamFighters.slice(0, 4).map(p => title(p.name)).join(' · '), 42, topY + 46, W - 84);
    c.restore();
  }

  startRecording(audioEngine) {
    if (this.recording) return true;
    if(!this.canvas?.captureStream||typeof MediaRecorder==='undefined'){this.onStatus('Video recording is unavailable in this browser.');return false;}
    const profile=RECORDING_PROFILES[this.quality]||RECORDING_PROFILES.fullhd;this.captureProfile={...profile};
    if(this.canvas){this.canvas.width=profile.width;this.canvas.height=profile.height;this.ctx=this.canvas.getContext('2d');}
    this.recording = true;
    this.chunks = [];
    this.framesRecorded = 0;
    this.highlights = [];
    this.recordStartedAt = Date.now();
    this.renderCompositeFrame();
    try {
      if (this.canvas?.captureStream && typeof MediaRecorder !== 'undefined') {
        const stream = this.canvas.captureStream(profile.fps);this.captureStream=stream;
        const mixedAudio=audioEngine?.getRecordingStream?.();
        if(mixedAudio){for(const track of mixedAudio.getAudioTracks())stream.addTrack(track.clone?.()||track);}
        else if (audioEngine?.music?.captureStream) {
          try {
            const audioTracks = audioEngine.music.captureStream().getAudioTracks();
            audioTracks.forEach(t => stream.addTrack(t));
          } catch {}
        }
        const mime = MediaRecorder.isTypeSupported?.('video/webm;codecs=vp9,opus')
          ? 'video/webm;codecs=vp9,opus'
          : 'video/webm';
        this.recorder = new MediaRecorder(stream, {mimeType:mime,videoBitsPerSecond:profile.videoBitsPerSecond,audioBitsPerSecond:192000});
        this.recorder.ondataavailable = e => {
          if (e.data && e.data.size > 0) this.chunks.push(e.data);
        };
        this.recorder.onstop = () => this.finishExport();
        this.recorder.start(200);
        this.onStatus(`Recording ${profile.width}×${profile.height} · ${profile.fps} fps + audio…`);
        return true;
      }
    } catch {}
    this.recording=false;for(const track of this.captureStream?.getTracks?.()||[])track.stop?.();this.captureStream=null;this.onStatus('Recording could not start. Try the smaller video quality option.');
    return false;
  }

  tick() {
    if (this.recording) this.renderCompositeFrame();
  }

  stopRecording() {
    if (!this.recording) return null;
    this.recording = false;
    if (this.recorder && this.recorder.state !== 'inactive') {
      try {
        this.recorder.stop();
        return this.lastExportUrl;
      } catch {}
    }
    return this.finishExport();
  }

  markHighlight(label, kind = 'moment') {
    const sec = this.recordStartedAt ? Math.max(0, (Date.now() - this.recordStartedAt) / 1000) : (this.view?.presentationTime || 0);
    const mm = Math.floor(sec / 60), ss = String(Math.floor(sec % 60)).padStart(2, '0');
    this.highlights.push({time: sec, stamp: `${mm}:${ss}`, frame: this.framesRecorded, label, kind});
  }

  highlightSummary() {
    if (!this.highlights.length) return '';
    return this.highlights.slice(0, 6).map(h => `${h.stamp} ${h.label}`).join(' · ');
  }

  finishExport() {
    for(const track of this.captureStream?.getTracks?.()||[])track.stop?.();this.captureStream=null;
    if(!this.chunks.length){this.onStatus('No video was captured. Start recording and let the battle play before exporting.');return null;}
    let url = null;
    try {
      if (this.chunks.length && typeof Blob !== 'undefined' && typeof URL?.createObjectURL === 'function') {
        const blob = new Blob(this.chunks, {type: 'video/webm'});
        url = URL.createObjectURL(blob);
      }
      if (url&&typeof document !== 'undefined') {
        const a = document.createElement('a');
        a.href = url;
        a.download = `pokemon-battle-theater-9x16-${Date.now()}.webm`;
        a.click?.();
      }
    } catch {}
    if(!url){this.onStatus('Video export is unavailable in this browser.');return null;}
    this.lastExportUrl = url;
    const summary = this.highlightSummary();
    this.onStatus(`Exported 9:16 video (${this.framesRecorded} frames)${summary ? ' · Clips: ' + summary : ''}`);
    return url;
  }
}
