import assert from 'node:assert/strict';
import test from 'node:test';
import {cards,tones,styles,fresh,nextBoard,scoreAct,actCount,goalScore} from '../dist/rules.js';
import {presets,validDeck,startDeck,clearStage,deckSize} from '../dist/deck.js';
import {scenarios} from '../dist/scenarios.js';
const play=(lineup,options={})=>{const state=fresh();return scoreAct({...state,...options,lineup,board:{...state.board,...options.board}});};
const award=(result,id)=>result.steps.filter(step=>step.id===id).flatMap(step=>step.changes)
  .filter(change=>change.kind==='applause').reduce((n,change)=>n+change.amount,0);

test('thirty puppets and every style distribute two of each tone',()=>{
  for(const style of Object.keys(styles)){
    const pool=Object.values(cards).filter(card=>card.style===style);
    assert.equal(pool.length,6);
    for(const tone of tones)assert.equal(pool.filter(card=>card.tone===tone.id).length,2);
  }
});
test('presets expose nine puppets with three per tone and no random supply',()=>{
  assert.equal(deckSize,9);assert.equal(actCount,3);
  for(const deck of Object.values(presets)){
    assert(validDeck(deck));
    const state=fresh();startDeck(state,deck);
    assert.equal(state.hand.length,9);assert.equal(state.draw.length,0);
    assert.deepEqual(state.hand,deck.map((_,i)=>i));
    for(const tone of tones)assert.equal(deck.filter(id=>cards[id].tone===tone.id).length,3);
    state.lineup=[0,1,2];clearStage(state);
    assert.equal(state.hand.length,6);assert.deepEqual(state.used,[0,1,2]);
    assert.deepEqual(state.lineup,[null,null,null]);
  }
  assert(!validDeck(Array(9).fill('florist')));
  assert(!validDeck([...presets.garden.slice(1),'general']));
});
test('matching grows spectators before multiplying the act once',()=>{
  const result=play(['florist','rain','flowerShow']);
  assert.deepEqual(result.matches,[true,true,true]);
  assert.equal(result.audienceGain,3);assert.equal(result.factor,4);
  assert.equal(result.score,result.baseApplause*4);
  assert.equal(result.score,36);assert.deepEqual(result.reward,{score:0});
  assert.equal(result.steps.at(-2).cue,'match');
  assert.equal(result.steps.at(-1).cue,'audience');
  assert.equal(result.steps.at(-1).changes[0].amount,result.score);
  const next=play(['florist','rain','flowerShow'],{act:1,board:nextBoard(result.board)});
  assert.equal(next.factor,7);
  const finale=play(['ornament','snip','flowerShow'],{act:2,board:nextBoard(next.board)});
  assert.equal(finale.factor,10);assert(finale.score>next.score);
});
test('wrong colors and empty seats remain legal and retain spectators',()=>{
  const result=play(['rain',null,'florist'],{board:{audience:3}});
  assert.equal(result.audienceGain,0);assert.equal(result.board.audience,3);
  assert.equal(result.baseApplause,4);assert.equal(result.score,16);
  const last=play(['rain',null,null],{act:2,board:{audience:3}});
  const matched=play([null,'rain',null],{act:2,board:{audience:3}});
  assert.equal(matched.score,last.score+2);
});
test('flowers persist and appreciation precedes clipping without mutating inputs',()=>{
  const state=fresh();state.lineup=['florist','snip','flowerShow'];
  const before=structuredClone(state), result=scoreAct(state);
  assert.deepEqual(state,before);
  assert.equal(award(result,'snip'),6);assert.equal(award(result,'flowerShow'),3);
  assert.equal(nextBoard(result.board).flowers.length,1);
  assert.equal(award(play(['florist','flowerShow','snip']),'flowerShow'),4);
});
test('fireworks persist to next act and finale ignition fires immediately',()=>{
  const initial=play(['ignite',null,null]);
  assert.deepEqual(initial.board.fireworks,[1]);
  const next=play(['paper',null,'flameSong'],{act:1,board:nextBoard(initial.board)});
  assert.equal(award(next,'paper'),5);assert.equal(award(next,'flameSong'),3);
  assert.equal(next.board.fireworks.length,0);
  assert.equal(play(['ignite',null,null],{act:2}).board.fireworks.length,0);
  const pair=play(['quick','fuse','double'],{board:{fireworks:[1]}});
  assert.equal(award(pair,'double'),6);assert.equal(pair.board.fireworks.length,0);
});
test('bonsai fill missing types and butterflies need no route options',()=>{
  const pots=play(['planter','exchange','judge']);
  assert.deepEqual(pots.board.pots,['梅','兰']);assert.equal(award(pots,'judge'),4);
  const four=play(['planter','exchange','four'],{board:{pots:['兰']}});
  assert.equal(award(four,'four'),6);
  const wings=play(['lure','herd','dancer']);
  assert.equal(award(wings,'dancer'),4);assert.equal(wings.board.butterflies.length,2);
  assert.deepEqual(wings.cues,[]);assert(!wings.steps.some(step=>step.flight));
});
test('circus tuning changes only effective colors',()=>{
  const wildcard=play([null,'balls',null]);
  assert.equal(wildcard.matches[1],true);assert.equal(cards.balls.tone,'red');
  const swapped=play(['rope','florist','jester']);
  assert.deepEqual(swapped.effectiveTones,['red','blue','yellow']);
  assert.equal(swapped.audienceGain,3);assert.equal(award(swapped,'jester'),6);
  const tuned=play(['warm','florist','jester']);
  assert.deepEqual(tuned.matches,[false,true,true]);
  assert.equal(tuned.audienceGain,2);
  assert(!play(['florist','rope','jester']).steps.some(step=>step.id==='rope'&&step.phase==='pre'));
  assert.equal(play([null,null,'warm']).audienceGain,1);
  assert.equal(play(['walker','tea','jester']).baseApplause,16);
});
test('scoring rejects closed positions and overcapacity story lineups',()=>{
  const act=scenarios[1].acts[2];
  assert.deepEqual(act.openSlots,[0,2]);
  const result=play(['general',null,'granny'],{act:2,totalActs:4,openSlots:act.openSlots,maxPuppets:act.maxPuppets});
  assert.equal(result.audienceGain,2);assert.equal(result.board.lamps.length,1);
  assert.throws(()=>play(['general','soldier','granny'],{openSlots:act.openSlots,maxPuppets:2}),RangeError);
  assert.throws(()=>play(['general','soldier','granny'],{maxPuppets:2}),RangeError);
  assert.equal(goalScore,140);
  assert(scenarios.every(s=>s.acts.every(act=>!Object.hasOwn(act,'target'))));
});
