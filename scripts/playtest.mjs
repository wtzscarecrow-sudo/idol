import assert from 'node:assert/strict';
import {fresh,nextBoard,scoreAct,actCount,goalScore} from '../dist/rules.js';
import {presets,startDeck,draftOptions,drawCards,clearStage} from '../dist/deck.js';

const samples=Number(process.argv[2]??150);
assert(Number.isInteger(samples)&&samples>0);

function random(seed){
  return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
}

function* lineups(state,lineup=[]){
  if(lineup.length===3){yield lineup;return;}
  const available=state.mode==='draft'?draftOptions({...state,lineup},lineup.length):
    state.hand.filter(copy=>!lineup.includes(copy));
  for(const copy of available)yield* lineups(state,[...lineup,copy]);
}

function run(deck,mode,seed,policy){
  const state=fresh();
  startDeck(state,deck,random(seed),mode);
  let favorsTools=0,oldFavorsTools=0,actors=0;
  for(;state.act<actCount;state.act++){
    const options=Array.from(lineups(state),lineup=>{
      const result=scoreAct({...state,lineup:lineup.map(copy=>state.deck[copy]),
        lineupTones:lineup.map(copy=>state.copyTones[copy])});
      return {lineup,result};
    });
    const maxMatches=Math.max(...options.map(option=>option.result.audienceGain));
    const bestScore=options.reduce((best,option)=>option.result.score>best.result.score?option:best);
    const matched=options.filter(option=>option.result.audienceGain===maxMatches);
    const matchedBest=Math.max(...matched.map(option=>option.result.score));
    if(bestScore.result.score>matchedBest)favorsTools++;
    const oldScore=option=>option.result.baseApplause*(1+option.result.board.audience);
    if(Math.max(...options.map(oldScore))>Math.max(...matched.map(oldScore)))oldFavorsTools++;
    const selected=policy==='score'?bestScore:matched.reduce((best,option)=>option.result.score>best.result.score?option:best);
    state.lineup=selected.lineup;
    state.applause+=selected.result.score;
    state.board=nextBoard(selected.result.board);
    actors+=selected.result.steps.filter(step=>step.phase==='pre'&&step.changes.some(change=>change.kind==='tune')).length;
    clearStage(state);
    if(mode==='hand')drawCards(state,state.act+1<actCount?3:0);
  }
  return {score:state.applause,favorsTools,oldFavorsTools,actors};
}

for(const mode of ['hand','draft'])for(const [name,deck] of Object.entries(presets)){
  const seeds=Array.from({length:samples},(_,i)=>Math.imul(i+1,2654435761)>>>0);
  const colors=seeds.map(seed=>run(deck,mode,seed,'match'));
  const scores=seeds.map(seed=>run(deck,mode,seed,'score'));
  const mean=(runs,key)=>Math.round(runs.reduce((sum,result)=>sum+result[key],0)/samples);
  console.log(JSON.stringify({mode,name,target:goalScore,colorMean:mean(colors,'score'),scoreMean:mean(scores,'score'),
    colorWins:colors.filter(r=>r.score>=goalScore).length,scoreWins:scores.filter(r=>r.score>=goalScore).length,
    choices:colors.reduce((sum,r)=>sum+r.favorsTools,0),oldChoices:colors.reduce((sum,r)=>sum+r.oldFavorsTools,0)}));
}
