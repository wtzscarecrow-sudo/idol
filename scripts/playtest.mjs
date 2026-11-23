import assert from 'node:assert/strict';
import {cards,fresh,nextBoard,scoreAct,tones,actCount,goalScore} from '../dist/rules.js';
import {presets,startDeck,clearStage} from '../dist/deck.js';
// Fixed visible casts. Search reports best-known paths, not proven optimality.
const samples=Number(process.argv[2]??300), width=64;
assert(Number.isInteger(samples)&&samples>0);
function random(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};}
function resolve(state,lineup){
  const result=scoreAct({...state,lineup:lineup.map(copy=>state.deck[copy])});
  const next={...state,board:nextBoard(result.board),lineup,hand:[...state.hand],used:[...state.used],
    history:[...state.history,{lineup:lineup.map(copy=>state.deck[copy]),score:result.score,factor:result.factor,base:result.baseApplause}],applause:state.applause+result.score};
  clearStage(next);next.act++;
  return next;
}
function* triples(state){
  const seen=new Set();
  for(const a of state.hand)for(const b of state.hand)for(const c of state.hand){
    if(a===b||a===c||b===c)continue;
    const signature=[a,b,c].map(copy=>state.deck[copy]).join(',');
    if(seen.has(signature))continue;
    seen.add(signature);yield[a,b,c];
  }
}
function search(deck){
  const state=fresh();startDeck(state,deck);let beam=[state];
  for(let act=0;act<actCount;act++){
    const unique=new Map();
    for(const state of beam)for(const lineup of triples(state)){
      const next=resolve(state,lineup);
      const signature=JSON.stringify([next.hand.map(copy=>deck[copy]).sort(),next.board]);
      if(!unique.has(signature)||next.applause>unique.get(signature).applause)unique.set(signature,next);
    }
    beam=[...unique.values()].sort((a,b)=>b.applause-a.applause).slice(0,width);
  }
  return beam[0];
}
function novice(deck,seed){
  let state=fresh();startDeck(state,deck);const rng=random(seed);
  for(let act=0;act<actCount;act++){
    const available=[...state.hand],lineup=[];
    for(const tone of tones){
      const candidates=available.filter(copy=>cards[deck[copy]].tone===tone.id);
      const pick=candidates[Math.floor(rng()*candidates.length)];
      assert(pick!==undefined);lineup.push(pick);available.splice(available.indexOf(pick),1);
    }
    state=resolve(state,lineup);
  }
  return state;
}
const report=[];
for(const [name,deck] of Object.entries(presets)){
  let best=search(deck);
  const results=Array.from({length:samples},(_,i)=>novice(deck,Math.imul(i+1,2654435761)>>>0));
  const noviceBest=results.reduce((a,b)=>a.applause>b.applause?a:b);
  if(noviceBest.applause>best.applause)best=noviceBest;
  const successful=results.filter(state=>state.applause>=goalScore);
  assert(best.applause>=goalScore,name+' cannot meet the target');
  assert(successful.length>=samples*.8,name+' requires too much optimization');
  const paths=new Set(successful.map(state=>JSON.stringify(state.history.map(act=>act.lineup))));
  assert(paths.size>1,name+' needs multiple successful arrangements');
  assert(results.every(state=>state.history.map(act=>act.factor).join(',')==='4,7,10'));
  report.push({name,target:goalScore,bestKnown:best.applause,noviceMin:Math.min(...results.map(state=>state.applause)),
    noviceMax:Math.max(...results.map(state=>state.applause)),noviceSuccess:successful.length+'/'+samples,distinctSuccess:paths.size,example:best.history});
}
console.log(JSON.stringify({scope:'64-state beam plus color-matching novice samples; not exhaustive optimization',report},null,2));
