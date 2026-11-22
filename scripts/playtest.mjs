import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

// Run from the project root: node scripts/playtest.mjs 240
// Uses the live rules and a frozen baseline. The planning policy samples unseen cards
// from the known remaining composition, independently of the real draw order.
const sampleCount=Number(process.argv[2]??120);
const baseline=process.argv[3]??'versions/v09/dist';
assert(Number.isInteger(sampleCount)&&sampleCount>0,'Expected a positive number of paired seeds');

async function load(directory){
  const rules=await import(pathToFileURL(path.resolve(directory,'rules.js')));
  const deck=await import(pathToFileURL(path.resolve(directory,'deck.js')));
  return {...rules,...deck};
}

function random(seed){
  return ()=>{
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    return seed/2**32;
  };
}

function* lineups(hand,seatSensitive){
  const selected=[null,null,null];
  const counted=new Map();
  for(const id of hand)counted.set(id,(counted.get(id)??0)+1);
  function* fill(i){
    if(i===selected.length){
      if(selected.some(Boolean))yield [...selected];
      return;
    }
    if(seatSensitive)yield* fill(i+1);
    else if(i>0)yield [...selected];
    for(const [id,count] of counted){
      if(count===0)continue;
      counted.set(id,count-1);
      selected[i]=id;
      yield* fill(i+1);
      selected[i]=null;
      counted.set(id,count);
    }
  }
  yield* fill(0);
}

const cueFields=[['sources','from'],['targets','to'],['offers','pot'],['dates','date']];

function* tactics(scoreAct,state,lineup,choices=[]){
  const result=scoreAct({...state,lineup,choices});
  for(const cue of result.cues){
    for(const [options,key] of cueFields){
      const available=cue[options];
      if(!available||available.length<2||choices[cue.i]?.[key]!==undefined)continue;
      for(const value of available){
        const next=[...choices];
        next[cue.i]={...next[cue.i],[key]:value};
        yield* tactics(scoreAct,state,lineup,next);
      }
      return;
    }
  }
  yield result;
}

function* candidates(rules,state,hand){
  const seatSensitive=state.board.butterflies.length>0||hand.some(id=>rules.cards[id].style==='wings');
  for(const lineup of lineups(hand,seatSensitive)){
    const count=lineup.filter(Boolean).length;
    for(const result of tactics(rules.scoreAct,state,lineup))yield {count,lineup,result};
  }
}

function futureValue(state,{result,count},usesCoins){
  const {board}=result;
  const distinctPots=new Set(board.pots).size;
  const butterflySeats=new Set(board.butterflies).size;
  const flowers=board.flowers.filter(flower=>flower.age===0||flower.keep).length;
  const fireworks=board.fireworks.reduce((sum,date)=>sum+(date<=4?(date===state.act+1?3:2):0),0);
  const coins=usesCoins?Math.min(6,state.coins+result.coins)*0.36:0;
  return distinctPots*1.2+butterflySeats*1.05+board.audience*0.32+flowers*0.64+fireworks+coins-count*0.45;
}

function immediate(rules,state,hand,usesCoins){
  let best;
  let bestRank=-Infinity;
  for(const option of candidates(rules,state,hand)){
    const rank=option.result.score/(rules.applauseUnit??1)+(state.act===4?-0.01*option.count:0.001*futureValue(state,option,usesCoins));
    if(rank>bestRank){best=option;bestRank=rank;}
  }
  return best;
}

function removeCards(hand,lineup){
  const remaining=[...hand];
  for(const id of lineup)if(id)remaining.splice(remaining.indexOf(id),1);
  return remaining;
}

function plausibleDraws(remaining,seed){
  const rng=random(seed);
  const composition=[...remaining].sort();
  return Array.from({length:2},()=>{
    const available=[...composition];
    return Array.from({length:Math.min(3,available.length)},()=>
      available.splice(Math.floor(rng()*available.length),1)[0]);
  });
}

function planned(rules,state,hand,remaining,seed,usesCoins){
  if(state.act===4)return immediate(rules,state,hand,usesCoins);
  const beam=[];
  for(const option of candidates(rules,state,hand)){
    const rank=option.result.score/(rules.applauseUnit??1)+futureValue(state,option,usesCoins);
    if(beam.length===4&&rank<=beam.at(-1).rank)continue;
    const {board,coins}=option.result;
    const leftover=removeCards(hand,option.lineup);
    const identity=JSON.stringify([board,coins,[...leftover].sort()]);
    const duplicate=beam.findIndex(entry=>entry.identity===identity);
    if(duplicate!==-1){
      if(beam[duplicate].rank>=rank)continue;
      beam.splice(duplicate,1);
    }
    beam.push({option,rank,identity,leftover});
    beam.sort((a,b)=>b.rank-a.rank);
    if(beam.length>4)beam.pop();
  }
  const draws=plausibleDraws(remaining,seed);
  let best;
  let bestRank=-Infinity;
  for(const {option,leftover} of beam){
    const {result}=option;
    const next={...state,act:state.act+1,coins:(state.coins??0)+(result.coins??0),board:rules.nextBoard(result.board)};
    const outcomes=draws.map(draw=>immediate(rules,next,[...leftover,...draw],usesCoins));
    const nextValue=outcomes.reduce((sum,choice)=>sum+choice.result.score/(rules.applauseUnit??1)+
      (next.act<4?0.36*futureValue(next,choice,usesCoins):0),0)/outcomes.length;
    const rank=result.score/(rules.applauseUnit??1)+0.72*nextValue;
    if(rank>bestRank){best=option;bestRank=rank;}
  }
  return best;
}

function play(rules,deck,seed,policy,stats){
  const state=rules.fresh();
  const usesCoins=state.coins!==undefined&&deck.includes('quick');
  state.branch=seed%2?'market':'shrine';
  rules.startDeck(state,deck,random(Math.imul(seed,0x9e3779b9)));
  let hit=0;
  for(state.act=0;state.act<5;state.act++){
    if(state.act){state.board=rules.nextBoard(state.board);rules.drawCards(state);}
    const hand=state.hand.map(copy=>state.deck[copy]);
    const option=policy==='immediate'?immediate(rules,state,hand,usesCoins):
      planned(rules,state,hand,state.draw.map(copy=>state.deck[copy]),Math.imul(seed,31)+state.act,usesCoins);
    const {lineup,result}=option;
    hit+=Number(result.hit);
    if(state.act===0)stats.openingHits+=Number(result.hit);
    for(const [i,id] of lineup.entries()){
      if(!id)continue;
      const counts=stats.cards[id]??={played:0,triggered:0,effects:{}};
      const steps=result.steps.filter(step=>step.i===i);
      const effects=new Set(steps.flatMap(step=>step.changes.filter(change=>
        step.phase!=='main'||change.kind!=='applause'||change.amount!==rules.cards[id].base)
        .map(({kind,amount})=>`${amount>0?'+':'-'}${kind}`)));
      counts.played++;
      counts.triggered+=Number(effects.size>0);
      for(const effect of effects)counts.effects[effect]=(counts.effects[effect]??0)+1;
    }
    const available=[...state.hand];
    state.lineup=lineup.map(id=>id?available.splice(available.findIndex(copy=>state.deck[copy]===id),1)[0]:null);
    state.board=result.board;
    if(state.coins!==undefined)state.coins+=result.coins;
    state.applause=Math.round((state.applause+result.score)*100)/100;
    rules.clearStage(state);
  }
  return {score:state.applause/(rules.applauseUnit??1),hit,win:state.applause>=rules.goalScore};
}

function compare(before,after,name,policy){
  const versions=[before,after];
  const stats=versions.map(()=>({openingHits:0,cards:{},tours:[]}));
  for(let seed=1;seed<=sampleCount;seed++){
    versions.forEach((rules,i)=>stats[i].tours.push(play(rules,rules.presets[name],seed,policy,stats[i])));
  }
  const mean=values=>values.reduce((sum,n)=>sum+n,0)/values.length;
  const rounded=(value)=>Number(value.toFixed(2));
  const paired=stats[1].tours.map((tour,i)=>tour.score-stats[0].tours[i].score);
  const average=mean(paired);
  const margin=sampleCount>1?1.96*Math.sqrt(mean(paired.map(delta=>(delta-average)**2))/(sampleCount-1)):0;
  console.log(JSON.stringify({name,policy,sampleCount,
    versions:stats.map(({tours,openingHits,cards})=>({
      meanScore:rounded(mean(tours.map(tour=>tour.score))),wins:tours.filter(tour=>tour.win).length,
      openingHits,meanGoals:rounded(mean(tours.map(tour=>tour.hit))),cards,
    })),
    pairedMean:rounded(average),pairedApprox95:[rounded(average-margin),rounded(average+margin)],
  }));
}

const [before,after]=await Promise.all([load(baseline),load('dist')]);
const selected=process.argv.slice(4);
for(const name of selected.length?selected:Object.keys(after.presets)){
  assert(before.validDeck(before.presets[name])&&after.validDeck(after.presets[name]),`Invalid preset: ${name}`);
  for(const policy of ['immediate','planned'])compare(before,after,name,policy);
}
