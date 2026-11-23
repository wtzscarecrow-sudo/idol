import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {cards,fresh,scoreAct,actCount,goalScore} from '../dist/rules.js';
import * as currentDeck from '../dist/deck.js';

const args=process.argv.slice(2);
const detailed=args.includes('--details');
const [sampleCount,archivePath]=args.filter(arg=>arg!=='--details');
const samples=Number(sampleCount??120);
assert(Number.isInteger(samples)&&samples>0);
const archive=archivePath?pathToFileURL(archivePath):null;
const rules=archive?await import(archive):{cards,scoreAct};
const {presets,startDeck,draftOptions,drawCards,clearStage}=archive?await import(new URL('./deck.js',archive)):currentDeck;
const pool=Object.values(rules.cards).filter(card=>card.style!=='story');
const baseline={...rules.cards,baseline:{base:2}};
const toneOrder=['red','blue','yellow'];
const positionCards=new Set(['warm','paper','drummer','arrange','sparker','pole','lighter']);

function random(seed){
  return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
}

function sampleFrom(values,count,rng){
  const shuffled=[...values];
  for(let i=0;i<count;i++){
    const j=i+Math.floor(rng()*(shuffled.length-i));
    [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
  }
  return shuffled.slice(0,count);
}

function evaluate(state,picks,index=rules.cards){
  return rules.scoreAct({...state,lineup:picks.map(copy=>state.deck[copy]),
    lineupTones:picks.map(copy=>state.copyTones[copy])},index);
}

// Put some value on reusable props, pending fireworks, and future audiences.
function value(result,act){
  const remaining=actCount-act-1;
  const {flowers,fireworks,pots,butterflies}=result.board;
  const props=Math.min(4,flowers.length)+new Set(pots).size+Math.min(4,butterflies.length);
  return result.score+remaining*(7*props+10*result.audienceGain)+55*fireworks.length;
}

function bestCompletion(state,picks,offersAt){
  if(picks.length===3)return {picks,value:value(evaluate(state,picks),state.act)};
  let best;
  for(const choice of offersAt(picks)){
    const option=bestCompletion(state,[...picks,choice],offersAt);
    if(!best||option.value>best.value)best=option;
  }
  return best;
}

function pickLineup(state,rng){
  const available=picks=>state.hand.filter(copy=>!picks.includes(copy));
  if(state.mode==='hand')return bestCompletion(state,[],available).picks;
  const picks=[];
  for(let seat=0;seat<3;seat++){
    const offers=draftOptions({...state,lineup:picks},seat);
    // Forecast unseen seats with independent sample orders, shared by all current choices.
    const guesses=Array.from({length:2},()=>[0,1,2].map(()=>sampleFrom(state.hand,state.hand.length,rng)));
    let best=-Infinity, selected;
    for(const choice of offers){
      const expected=guesses.reduce((total,orders)=>total+bestCompletion(state,[...picks,choice],
        partial=>orders[partial.length].filter(copy=>!partial.includes(copy)).slice(0,3)).value,0);
      if(expected>best){best=expected;selected=choice;}
    }
    picks.push(selected);
  }
  return picks;
}

function replayWithout(turns,changedTurn,seat){
  let board=turns[changedTurn].state.board,total=0;
  for(let i=changedTurn;i<turns.length;i++){
    const {state,picks}=turns[i];
    const lineup=picks.map(copy=>state.deck[copy]);
    if(i===changedTurn)lineup[seat]='baseline';
    const result=rules.scoreAct({...state,board,lineup,lineupTones:picks.map(copy=>state.copyTones[copy])},baseline);
    total+=result.score;
    board=result.board;
  }
  return total;
}

for(const mode of ['hand','draft']){
  const usage=Object.fromEntries(pool.map(card=>[card.id,{offered:0,played:0,triggered:0,positive:0,delta:0}]));
  const seatUsage=Object.fromEntries([...positionCards].filter(id=>usage[id]).map(id=>[id,Object.fromEntries(toneOrder.map(tone=>
    [tone,{seen:0,allSeatsPlayed:0,allSeatsFired:0,onColor:0,fired:0}]))]));
  const timing={created:0,sameAct:0,advanced:0};
  const tuning={acts:0,activeActs:0,extraMatches:0,extraApplause:0,extraBase:0};
  const totals={};
  for(let i=0;i<samples;i++){
    const seed=Math.imul(i+1,2654435761)>>>0;
    const shuffled=sampleFrom(pool,11,random(seed^373231)).map(card=>card.id);
    for(const [name,deck] of Object.entries({...presets,shuffled})){
      const state=fresh(), decisions=random(seed^914093);
      startDeck(state,deck,random(seed),mode);
      const turns=[];
      for(;state.act<actCount;state.act++){
        const picks=pickLineup(state,decisions);
        const seen=mode==='hand'?state.hand:new Set(picks.flatMap((_,seat)=>draftOptions({...state,lineup:picks.slice(0,seat)},seat)));
        for(const copy of seen){
          usage[deck[copy]].offered++;
          if(detailed&&seatUsage[deck[copy]])seatUsage[deck[copy]][state.copyTones[copy]].seen++;
        }
        const result=evaluate(state,picks);
        if(detailed){
          if(name==='fire'&&state.act<actCount-1){
            for(const step of result.steps)for(const {kind,amount} of step.changes){
              if(kind==='advance')timing.advanced+=amount;
              if(kind!=='firework'||amount<=0)continue;
              timing.created+=amount;
              timing.sameAct+=step.board.fireworks.slice(-amount).filter(when=>when<=state.act).length;
            }
          }
          if(Array.isArray(result.tuningGains)&&['circus','mixed'].includes(name)){
            tuning.acts++;
            if(result.tuningGains.some(gain=>gain>0)){
              const original=rules.scoreAct({...state,lineup:picks.map(copy=>deck[copy]),
                lineupTones:picks.map(copy=>state.copyTones[copy])},rules.cards,null,{tuning:false});
              tuning.activeActs++;
              tuning.extraMatches+=result.audienceGain-original.audienceGain;
              tuning.extraApplause+=result.score-original.score;
              tuning.extraBase+=result.baseApplause-original.baseApplause;
            }
          }
        }
        turns.push({state:{act:state.act,mode,deck,copyTones:state.copyTones,board:state.board},picks,result});
        state.lineup=picks;
        state.board=result.board;
        state.applause+=result.score;
        clearStage(state);
        if(mode==='hand')drawCards(state,state.act+1<actCount?3:0);
      }
      const totalsForDeck=totals[name]??={total:0,wins:0};
      totalsForDeck.total+=state.applause;
      totalsForDeck.wins+=Number(state.applause>=goalScore);
      let tail=state.applause;
      turns.forEach(({picks,result},turn)=>{
        picks.forEach((copy,seat)=>{
          const id=deck[copy], stat=usage[id];
          const playedSkill=result.steps.filter(step=>step.i===seat).some(step=>step.changes.some(change=>
            change.kind==='applause'?change.amount>(step.phase==='main'?rules.cards[id].base:0):change.amount!==0));
          const delta=tail-replayWithout(turns,turn,seat);
          stat.played++;
          stat.triggered+=Number(playedSkill);
          stat.positive+=Number(delta>0);
          stat.delta+=delta;
          const tone=turns[turn].state.copyTones[copy];
          if(detailed&&seatUsage[id]){
            const row=seatUsage[id][tone];
            const onColor=tone===toneOrder[seat];
            const drumsBehind=seat===toneOrder.length-1&&Array.isArray(result.tuningGains);
            const partner=deck[picks[drumsBehind?seat-1:seat+1]];
            const didActivate=id==='drummer'?rules.cards[partner]?.style==='circus':playedSkill;
            row.allSeatsPlayed++;
            row.allSeatsFired+=Number(didActivate);
            row.onColor+=Number(onColor);
            row.fired+=Number(onColor&&didActivate);
          }
        });
        tail-=result.score;
      });
    }
  }
  console.log(JSON.stringify({mode,samples,decks:Object.fromEntries(Object.entries(totals).map(([name,row])=>
    [name,{mean:Math.round(row.total/samples),wins:row.wins}]))}));
  console.table(pool.map(({id,name})=>{
    const {offered,played,triggered,positive,delta}=usage[id];
    return {id,name,played,pickRate:Math.round(100*played/offered),triggerRate:Math.round(100*triggered/played),
      positiveRate:Math.round(100*positive/played),tourDelta:Math.round(delta/played)};
  }));
  if(detailed)console.log(JSON.stringify({mode,timing,tuning,seatUsage}));
}
