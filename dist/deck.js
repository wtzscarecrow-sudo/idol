import {cards} from './rules.js?v=12';

export const deckSize=9;
export const copyLimit=2;
const openingSize=9;
const drawPerAct=0;

const presetCounts={
  garden:{florist:2,rain:2,flowerShow:2,ornament:1,snip:1,tend:1},
  fire:{ignite:2,fuse:2,flameSong:2,quick:1,paper:1,double:1},
  gardenware:{planter:2,exchange:2,judge:2,vendor:1,orchid:1,four:1},
  wings:{lure:2,herd:2,dancer:2,fan:1,perch:1,peep:1},
  circus:{balls:2,rope:2,warm:2,walker:1,tea:1,jester:1},
};

export const presets=Object.fromEntries(Object.entries(presetCounts).map(([style,counts])=>[
  style,Object.entries(counts).flatMap(([id,count])=>Array(count).fill(id)),
]));
presets.mixed=['florist','ignite','balls','rope','paper','snip','warm','jester','flowerShow'];

export function validDeck(deck){
  if(!Array.isArray(deck)||deck.length!==deckSize)return false;
  const counts=new Map();
  for(const id of deck){
    if(!Object.hasOwn(cards,id)||cards[id].style==='story')return false;
    counts.set(id,(counts.get(id)??0)+1);
    if(counts.get(id)>copyLimit)return false;
  }
  return true;
}

export function startDeck(state,deck){
  if(!validDeck(deck))throw new RangeError('戏班必须为 9 只，同名最多 2 只。');
  state.deck=[...deck];
  state.draw=deck.map((_,i)=>i);

  state.started=true;
  drawCards(state,openingSize);
}

export function drawCards(state,count=drawPerAct){
  state.hand.push(...state.draw.splice(0,count));
}

export function clearStage(state){
  const played=state.lineup.filter(copy=>copy!==null);
  state.used.push(...played);
  state.hand=state.hand.filter(copy=>!played.includes(copy));
  state.lineup=state.lineup.map(()=>null);
  state.choices={};
}
