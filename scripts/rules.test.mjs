import assert from 'node:assert/strict';
import test from 'node:test';
import {cards,tones,styles,fresh,nextBoard,scoreAct,actCount,goalScore} from '../dist/rules.js';
import {presets,validDeck,startDeck,draftOptions,drawCards,clearStage,deckSize,toneSupply} from '../dist/deck.js';
import {scenarios} from '../dist/scenarios.js';
const play=(lineup,options={})=>{const state=fresh();return scoreAct({...state,...options,lineup,board:{...state.board,...options.board}});};
const award=(result,id)=>result.steps.filter(step=>step.id===id).flatMap(step=>step.changes)
  .filter(change=>change.kind==='applause').reduce((n,change)=>n+change.amount,0);

test('forty tour puppets across four styles and the neutral group have catalog colors',()=>{
  for(const style of Object.keys(styles)){
    const pool=Object.values(cards).filter(card=>card.style===style);
    assert.equal(pool.length,8);
    for(const tone of tones)assert(pool.some(card=>card.tone===tone.id));
  }
});
test('shuffled tours reveal five then replenish three and keep each copy color',()=>{
  assert.equal(deckSize,11);assert.equal(actCount,3);
  for(const deck of Object.values(presets)){
    assert(validDeck(deck));
    const state=fresh();startDeck(state,deck,()=>0);
    assert.equal(state.hand.length,5);assert.equal(state.draw.length,6);
    assert.notDeepEqual(state.hand,[0,1,2,3,4]);
    assert.deepEqual(tones.map(tone=>state.copyTones.filter(id=>id===tone.id).length).sort((a,b)=>b-a),toneSupply);
    assert(new Set(state.hand.map(copy=>state.copyTones[copy])).size>=2);
    const colors=[...state.copyTones];
    state.lineup=state.hand.slice(0,3);
    clearStage(state);
    assert.equal(state.hand.length,2);
    state.act=1;drawCards(state);
    assert.equal(state.hand.length,5);assert.equal(state.draw.length,3);
    state.lineup=state.hand.slice(0,3);
    clearStage(state);
    state.act=2;drawCards(state);
    assert.equal(state.hand.length,5);assert.equal(state.draw.length,0);
    assert.equal(new Set([...state.hand,...state.used]).size,deckSize);
    assert.deepEqual(state.copyTones,colors);
    const another=fresh();startDeck(another,deck,()=>0.999);
    assert.notDeepEqual(another.copyTones,colors);
  }
  assert(!validDeck(Array(deckSize).fill('florist')));
  assert(!validDeck([...presets.garden.slice(1),'general']));
});
test('draft offers three per seat, excludes staged and used copies, and survives serialization',()=>{
  const state=fresh();startDeck(state,presets.mixed,()=>0.63,'draft');
  for(let act=0;act<actCount;act++){
    state.act=act;
    for(let seat=0;seat<3;seat++){
      const offers=draftOptions(state,seat);
      assert.equal(new Set(offers).size,3);
      assert(offers.every(copy=>!state.used.includes(copy)&&!state.lineup.includes(copy)));
      assert.deepEqual(draftOptions(JSON.parse(JSON.stringify(state)),seat),offers);
      state.lineup[seat]=offers[0];
    }
    clearStage(state);
  }
  assert.equal(state.used.length,9);
});

test('tour matching has a modest effect and only newly corrected seats award tuning bonuses',()=>{
  const fixed=play(['balls',null,null],{mode:'hand',lineupTones:['red',null,null]});
  const tuned=play(['balls',null,null],{mode:'hand',lineupTones:['blue',null,null]});
  assert.equal(fixed.factor,21);
  assert.equal(tuned.factor,21);
  assert.equal(award(fixed,'balls'),1);
  assert.equal(award(tuned,'balls'),2);
  const swapped=play(['rope','florist','jester'],{mode:'draft'});
  assert.equal(award(swapped,'rope'),4);
});

test('tour colors override catalog colors and automatic tuning keeps matching',()=>{
  const result=play(['florist','rain','balls'],{lineupTones:['blue','red','red']});
  assert.deepEqual(result.matches,[false,false,true]);
  assert.deepEqual(result.effectiveTones,['blue','red','yellow']);
});
test('matching grows spectators before multiplying the act once',()=>{
  const result=play(['florist','rain','flowerShow'],{lineupTones:['red','blue','yellow']});
  assert.deepEqual(result.matches,[true,true,true]);
  assert.equal(result.audienceGain,3);assert.equal(result.factor,4);
  assert.equal(result.score,result.baseApplause*4);
  assert.equal(result.score,36);assert.deepEqual(result.reward,{score:0});
  assert.equal(result.steps.at(-2).cue,'match');
  assert.equal(result.steps.at(-1).cue,'audience');
  assert.equal(result.steps.at(-1).changes[0].amount,result.score);
  const next=play(['florist','rain','flowerShow'],{act:1,board:nextBoard(result.board),lineupTones:['red','blue','yellow']});
  assert.equal(next.factor,7);
  const finale=play(['perch','snip','flowerShow'],{act:2,board:nextBoard(next.board),lineupTones:['red','blue','yellow']});
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
  assert.equal(award(next,'paper'),2);assert.equal(award(next,'flameSong'),3);
  assert.equal(next.board.fireworks.length,0);
  assert.equal(play(['ignite',null,null],{act:2}).board.fireworks.length,0);
  const pair=play(['quick',null,'double'],{board:{fireworks:[0]}});
  assert.equal(award(pair,'double'),6);assert.equal(pair.board.fireworks.length,0);
});
test('the fuse bonus requires bringing a future firework forward',()=>{
  const advanced=play(['ignite','fuse',null]);
  assert.equal(award(advanced,'ignite'),1);
  assert.equal(award(advanced,'fuse'),4);
  assert.equal(advanced.baseApplause,8);
  const single=play(['quick','fuse','double'],{board:{fireworks:[0]}});
  assert.equal(award(single,'fuse'),2);
  assert.equal(award(single,'double'),6);
});
test('bonsai fill missing types and butterflies need no route options',()=>{
  const pots=play(['planter','exchange','judge']);
  assert.deepEqual(pots.board.pots,['梅','菊']);assert.equal(award(pots,'judge'),4);
  const four=play(['planter','exchange','four'],{board:{pots:['兰','竹']}});
  assert.equal(award(four,'four'),8);
  const wings=play(['florist','lure','perch']);
  assert.equal(award(wings,'perch'),5);assert.equal(wings.board.butterflies.length,2);
  assert.deepEqual(wings.cues,[]);assert(!wings.steps.some(step=>step.flight));
});
test('an orchid gift adds only the first orchid and pays applause for existing orchids',()=>{
  const result=play(['orchid','orchid','judge']);
  assert.deepEqual(result.board.pots,['兰']);
  assert.equal(award(result,'orchid'),6);
  assert.equal(award(result,'judge'),3);
});
test('circus tuning changes only effective colors',()=>{
  const wildcard=play([null,'balls',null]);
  assert.equal(wildcard.matches[1],true);assert.equal(cards.balls.tone,'red');
  const swapped=play(['rope','florist','ignite'],{lineupTones:['blue','red','yellow']});
  assert.deepEqual(swapped.effectiveTones,['red','blue','yellow']);
  assert.equal(swapped.audienceGain,3);
  const tuned=play(['warm','florist','jester'],{lineupTones:['blue','red','yellow']});
  assert.deepEqual(tuned.matches,[false,true,true]);
  assert.equal(tuned.audienceGain,2);
  assert(!play(['florist','rope','jester'],{lineupTones:['red','blue','yellow']}).steps.some(step=>step.id==='rope'&&step.phase==='pre'));
  assert.equal(play([null,null,'warm'],{lineupTones:[null,null,'yellow']}).audienceGain,1);
  assert.equal(award(play(['florist','ignite','jester']),'jester'),6);
});
test('paper delays the extra firework and cannot make an immediate double alone',()=>{
  const combined=play(['paper','quick','double']);
  assert.deepEqual(combined.board.fireworks,[1,1]);
  assert.equal(award(combined,'double'),2);
  assert.equal(award(play(['paper','quick','double'],{board:{fireworks:[0]}}),'double'),6);
  assert.deepEqual(play(['paper','quick','double'],{act:2}).board.fireworks,[]);
  assert.equal(play(['quick',null,null],{mode:'hand'}).baseApplause,1);
  assert.deepEqual(play([null,'quick','paper']).board.fireworks,[1,1]);
  assert.equal(play(['quick',null,null],{act:2,mode:'hand'}).baseApplause,3);
});
test('tea bridges scenery applause and the following butterfly cue',()=>{
  const result=play(['judge','tea','lure'],{board:{pots:['梅']}});
  assert.equal(result.board.flowers.length,2);
  assert.equal(result.board.butterflies.length,2);
  assert.equal(play(['judge','tea','lure']).board.butterflies.length,1);
  assert.equal(play(['planter','tea','lure']).board.butterflies.length,2);
});
test('borrowed scenery effects require the specific adjacent action',()=>{
  assert.deepEqual(play(['arrange','orchid','judge']).board.pots,['兰','梅']);
  assert.deepEqual(play(['sparker','florist','double']).board.fireworks,[1]);
  assert.deepEqual(play([null,'florist','sparker']).board.fireworks,[1]);
  assert.deepEqual(play([null,'orchid','arrange']).board.pots,['兰','梅']);
  assert.equal(play(['sparker','runner','double']).baseApplause,7);
  assert.equal(play(['florist','lure','peep'],{board:{butterflies:[0]}}).board.butterflies.length,0);
  assert.equal(play(['warm','florist','lighter']).board.butterflies.length,2);
});
test('a gold warm can tune backwards and enable the neighbouring skill',()=>{
  const state={...fresh(),mode:'hand',lineup:['lighter','walker','warm'],lineupTones:['red','yellow','yellow']};
  const tuned=scoreAct(state), untuned=scoreAct(state,cards,null,{tuning:false});
  assert.deepEqual(tuned.matches,[true,true,true]);
  assert.equal(award(tuned,'walker'),5);
  assert.equal(tuned.board.butterflies.length,2);
  assert.equal(untuned.board.butterflies.length,0);
  assert(tuned.score>untuned.score);
  assert.equal(award(play([null,'walker','drummer']),'drummer'),4);
});
test('scoring rejects closed positions and overcapacity story lineups',()=>{
  const act=scenarios[1].acts[2];
  assert.deepEqual(act.openSlots,[0,2]);
  const result=play(['general',null,'granny'],{act:2,totalActs:4,openSlots:act.openSlots,maxPuppets:act.maxPuppets});
  assert.equal(result.audienceGain,2);assert.equal(result.board.lamps.length,1);
  assert.throws(()=>play(['general','soldier','granny'],{openSlots:act.openSlots,maxPuppets:2}),RangeError);
  assert.throws(()=>play(['general','soldier','granny'],{maxPuppets:2}),RangeError);
  assert.equal(goalScore,700);
  assert(scenarios.every(s=>s.acts.every(act=>!Object.hasOwn(act,'target'))));
});
