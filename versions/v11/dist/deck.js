import {cards} from './rules.js?v=16';

export const deckSize=18;
export const copyLimit=4;
const openingSize=6;
const drawPerAct=3;

const presetCounts={
  garden:{florist:4,rain:4,flowerShow:4,ornament:2,snip:2,tend:2},
  fire:{ignite:3,quick:3,flameSong:4,fuse:3,paper:3,double:2},
  gardenware:{planter:4,orchid:2,judge:4,exchange:3,four:3,vendor:2},
  wings:{lure:4,herd:4,dancer:2,fan:2,perch:4,peep:2},
  circus:{balls:4,rope:4,jester:4,warm:3,walker:2,tea:1},
};

export const presets=Object.fromEntries(Object.entries(presetCounts).map(([style,counts])=>[
  style,Object.entries(counts).flatMap(([id,count])=>Array(count).fill(id)),
]));

export function validDeck(deck){
  if(!Array.isArray(deck)||deck.length!==deckSize)return false;
  const counts=new Map();
  for(const id of deck){
    if(!Object.hasOwn(cards,id))return false;
    counts.set(id,(counts.get(id)??0)+1);
    if(counts.get(id)>copyLimit)return false;
  }
  return true;
}

export function startDeck(state,deck,random=Math.random){
  if(!validDeck(deck))throw new RangeError('牌组必须为 18 张，同名最多 4 张。');
  state.deck=[...deck];
  state.draw=deck.map((_,i)=>i);
  for(let i=state.draw.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [state.draw[i],state.draw[j]]=[state.draw[j],state.draw[i]];
  }
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
