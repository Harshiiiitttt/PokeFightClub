export async function trainerRecallPause(view,team,next,wait,valid,from){
 const state={team,next,from:from?{...from}:null,start:view.noticeTime??view.presentationTime};view.trainerRecall=state;
 try{await (view.waitForTrainer||wait)(1500);return valid();}
 finally{if(view.trainerRecall===state)view.trainerRecall=null;}
}
