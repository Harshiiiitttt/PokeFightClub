const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function safeCameraPose(zoom,x,y,shakeX=0,shakeY=0){
 const z=Number(Math.max(1,zoom||1).toFixed(4)),limitX=Math.max(0,(z-1)*270-1),limitY=Math.max(0,(z-1)*480-1);
 const panX=clamp(x||0,-limitX,limitX),panY=clamp(y||0,-limitY,limitY);
 return{zoom:z,panX,panY,shakeX:clamp(panX+shakeX,-limitX,limitX)-panX,shakeY:clamp(panY+shakeY,-limitY,limitY)-panY};
}
export function constrainTrainerCamera(view){
 if(!view.trainerMode)return;
 const p=safeCameraPose(view._zoomNow,view._panXNow,view._panNow,view.cameraShakeX,view.cameraShakeY);
 view._zoomNow=p.zoom;view._panXNow=p.panX;view._panNow=p.panY;view.cameraShakeX=p.shakeX;view.cameraShakeY=p.shakeY;
}
