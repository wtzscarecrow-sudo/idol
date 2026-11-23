import {cards,tones} from './rules.js?v=17';

export const deckSize=11;
export const copyLimit=2;
export const revealsPerAct=[5,3,3];
export const toneSupply=[4,4,3];

const presetCounts={
  garden:{florist:2,tend:1,flowerShow:2,snip:1,lure:2,perch:1,peep:1,warm:1},
  fire:{ignite:2,quick:2,fuse:1,flameSong:1,double:1,paper:1,ember:1,warm:1,runner:1},
  gardenware:{planter:2,orchid:2,judge:2,exchange:1,vendor:1,arrange:1,four:1,runner:1},
  circus:{balls:1,rope:2,walker:1,drummer:2,pole:1,mask:2,warm:1,runner:1},
};

export const presets=Object.fromEntries(Object.entries(presetCounts).map(([style,counts])=>[
  style,Object.entries(counts).flatMap(([id,count])=>Array(count).fill(id)),
]));
presets.mixed=['florist','planter','flowerShow','tea','snip','lure','perch','vendor','judge','rope','warm'];

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

function shuffle(list,random){
  for(let i=list.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [list[i],list[j]]=[list[j],list[i]];
  }
  return list;
}

export function startDeck(state,deck,random=Math.random,mode='hand'){
  if(!validDeck(deck))throw new RangeError('戏班必须为 11 只，同名最多 2 只。');
  state.mode=mode;
  state.deck=[...deck];
  const copies=deck.map((_,i)=>i);
  const shuffledTones=shuffle([...tones],random);
  state.copyTones=shuffle(shuffledTones.flatMap((tone,i)=>Array(toneSupply[i]).fill(tone.id)),random);
  if(mode==='draft'){
    state.hand=[...copies];
    state.draftOrders=Array.from({length:revealsPerAct.length},()=>Array.from({length:tones.length},()=>
      shuffle([...copies],random)));
  }else{
    state.draw=shuffle(copies,random);
    drawCards(state);
  }
  state.started=true;
}

export function drawCards(state,count=revealsPerAct[state.act]??0){
  state.hand.push(...state.draw.splice(0,count));
}

export function draftOptions(state,seat){
  return state.draftOrders[state.act][seat]
    .filter(copy=>state.hand.includes(copy)&&!state.lineup.includes(copy))
    .slice(0,3);
}

export function clearStage(state){
  const played=state.lineup.filter(copy=>copy!==null);
  state.used.push(...played);
  state.hand=state.hand.filter(copy=>!played.includes(copy));
  state.lineup=state.lineup.map(()=>null);
  state.choices={};
}
