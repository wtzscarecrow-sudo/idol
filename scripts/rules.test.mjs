import assert from 'node:assert/strict';
import test from 'node:test';
import { applauseUnit, events, fresh, goalScore, nextBoard, scoreAct } from '../dist/rules.js';
import { presets, validDeck } from '../dist/deck.js';
import { progressPercent } from '../dist/presentation.js';

function play(lineup,{act=0,board={},choices=[]}={}){
  const state=fresh();
  return scoreAct({...state,act,lineup,choices,board:{...state.board,...board}});
}

function award(result,id,kind='applause'){
  return result.steps.filter(step=>step.id===id).flatMap(step=>step.changes)
    .filter(change=>change.kind===kind).reduce((sum,change)=>sum+change.amount,0);
}

test('the presets satisfy deck size and copy limits',()=>{
  assert(Object.values(presets).every(validDeck));
});

test('the dancer benefits from passing or arrival, but resting butterflies are for the perch',()=>{
  const passing=play(['herd','dancer','perch']);
  assert.equal(award(passing,'dancer'),5);
  assert.equal(award(passing,'perch'),5);
  const arrival=play(['herd',null,'dancer']);
  assert.equal(award(arrival,'dancer'),5);
  const resting=play([null,null,'dancer'],{board:{butterflies:[2]}});
  assert.equal(award(resting,'dancer'),1);
});

test('the fan draws from an adjacent source and the observer scores only a takeoff from their seat',()=>{
  const result=play(['peep','fan',null],{board:{butterflies:[0,2]}});
  assert.deepEqual(result.board.butterflies,[1,2]);
  assert.deepEqual(result.cues[0].sources,[0]);
  assert.deepEqual(result.cues[0].targets,[1]);
  assert.equal(award(result,'peep'),4);
  assert.equal(award(play(['herd','peep',null]),'peep'),2);
  assert.equal(award(play(['herd',null,'peep']),'peep'),2);
});

test('exchange requires a duplicate or three varieties, while the vendor can show a single pot',()=>{
  const result=play(['exchange','vendor'],{board:{pots:['兰']}});
  assert.deepEqual(result.board.pots,['兰']);
  assert.equal(award(result,'exchange'),2);
  assert.equal(award(result,'vendor'),3);

  const exchange=play(['exchange'],{board:{pots:['梅','梅','兰']},choices:[{pot:'菊'}]});
  assert.deepEqual(exchange.board.pots,['梅','兰','菊']);
  const sale=play(['vendor'],{board:{pots:['梅','梅','兰']}});
  assert.deepEqual(sale.board.pots,['梅','兰']);
  assert.equal(award(sale,'vendor'),4);
  assert.equal(award(play(['four'],{board:{pots:['梅','兰','竹']}}),'four'),3);
  assert.equal(award(play(['four'],{board:{pots:['梅','兰','竹','菊']}}),'four'),6);
});

test('the orchid supplies the first orchid or a spare for exchanging or selling',()=>{
  const first=play(['orchid']);
  assert.deepEqual(first.board.pots,['兰']);
  assert.equal(award(first,'orchid'),2);

  const exchange=play(['orchid','exchange'],{board:{pots:['兰']},choices:[{}, {pot:'菊'}]});
  assert.deepEqual(exchange.board.pots,['兰','菊']);
  assert.equal(award(exchange,'orchid'),3);
  const sale=play(['orchid','vendor'],{board:{pots:['兰']}});
  assert.deepEqual(sale.board.pots,['兰']);
  assert.equal(award(sale,'vendor'),4);

  const full=play(['orchid'],{board:{pots:['梅','兰','竹','菊','梅','兰','竹','菊']}});
  assert.equal(full.board.pots.length,8);
  assert.equal(award(full,'orchid'),3);
});

test('the exchange completes the fourth variety automatically',()=>{
  const board={pots:['梅','兰','竹']};
  const completed=play(['exchange','four'],{board});
  assert.deepEqual(completed.cues[0].offers,['菊']);
  assert.deepEqual(completed.board.pots,['梅','兰','竹','菊']);
  assert.equal(award(completed,'four'),6);
});

test('the quick card starts a finale of fireworks only when the act has no scheduled shot',()=>{
  const pair=play(['quick','quick','double']);
  assert.equal(award(pair,'quick','firework'),1);
  assert.equal(award(pair,'quick'),3);
  assert.equal(award(pair,'double'),2);

  const scheduled=play(['quick','paper','double'],{board:{fireworks:[0,0]}});
  assert.equal(award(scheduled,'quick','firework'),0);
  assert.equal(award(scheduled,'paper'),2);
  assert.equal(award(scheduled,'double'),6);

  const full=play(['quick'],{board:{fireworks:Array(8).fill(1)}});
  assert.equal(award(full,'quick','firework'),0);
  assert.equal(award(full,'quick'),2);
});

test('heat multiplies the full show once, then a separate reward and future audience are settled',()=>{
  const lineup=['quick','flameSong','paper'];
  const result=play(lineup,{act:1,board:{audience:2}});
  assert.equal(result.audiencePercent,10);
  assert.equal(result.progress[0][0].value,198);
  assert.equal(result.score,258);
  assert.equal(result.baseApplause,9);
  assert.deepEqual(result.steps.at(-1).changes,[{kind:'applause',amount:198}]);
  assert.equal(result.steps.at(-1).board.audience,2);
  assert.equal(result.keptAudience,true);
  assert.equal(nextBoard(result.board).audience,3);
  assert.equal(play(lineup,{board:{audience:3}}).board.audience,3);
  assert.equal(play(['quick'],{act:1,board:{audience:2}}).board.audience,2);
  assert.equal(play(['jester','warm','walker'],{act:4,board:{audience:5}}).keptAudience,false);
});

test('flowers can be appreciated before the snip consumes one',()=>{
  const board={flowers:Array.from({length:3},()=>({age:1}))};
  const result=play(['flowerShow','snip'],{board});
  assert.equal(award(result,'flowerShow'),6);
  assert.equal(award(result,'snip'),4);
  assert.equal(result.board.flowers.length,2);
  assert.equal(award(play(['snip','flowerShow'],{board}),'flowerShow'),5);
});

test('paper scores future fireworks and song scores launched fireworks',()=>{
  assert.equal(award(play(['paper'],{board:{fireworks:[0,1]}}),'paper'),4);
  assert.equal(award(play(['paper'],{board:{fireworks:[0]}}),'paper'),2);
  assert.equal(award(play(['paper'],{board:{fireworks:[1]}}),'paper'),4);
  assert.equal(award(play(['paper'],{board:{fireworks:[]}}),'paper'),2);
  assert.equal(award(play(['flameSong'],{board:{fireworks:[0,0]}}),'flameSong'),3);
  assert.equal(award(play(['flameSong'],{board:{fireworks:[1]}}),'flameSong'),1);
  assert.equal(award(play(['flameSong']),'flameSong'),1);
});

test('the tea card scores at exactly three spectators at its turn',()=>{
  for(const [audience,applause] of [[0,2],[1,2],[2,2],[3,4],[4,2],[5,2]]){
    assert.equal(award(play(['tea'],{board:{audience}}),'tea'),applause);
  }
  assert.equal(award(play(['rope','tea'],{board:{audience:2}}),'tea'),4);
  assert.equal(award(play(['tea','rope'],{board:{audience:2}}),'tea'),2);
});

test('an existing butterfly at another seat is enough for the lure bonus',()=>{
  const result=play(['lure'],{board:{butterflies:[2]}});
  assert.equal(award(result,'lure'),3);
  assert.deepEqual(result.board.butterflies,[2,0]);
  assert.equal(award(play(['lure']),'lure'),2);
});

test('the actual closing audience determines the multiplier',()=>{
  const jesterLast=play(['rope','walker','jester'],{board:{audience:3}});
  const jesterFirst=play(['jester','rope','walker'],{board:{audience:3}});
  assert.equal(jesterLast.audiencePercent,10);
  assert.equal(jesterFirst.audiencePercent,10);
  const restored=play(['jester','balls','walker'],{board:{audience:4}});
  assert.equal(restored.audiencePercent,25);
});

test('each spectator increases the score, even for a short show',()=>{
  const scores=Array.from({length:6},(_,audience)=>
    play(['rain'],{act:4,board:{audience}}).score);
  assert.deepEqual(scores,[40,42,44,46,50,54]);
  assert.equal(progressPercent([[{value:319,target:320}]]),99);
});

test('the playbill climbs across five acts and both routes use the same scoring goals',()=>{
  assert.deepEqual(['spring','butterfly','market','ferry','finale'].map(id=>events[id].target),[120,180,240,280,320]);
  assert.equal(events.market.target,events.shrine.target);
  assert.equal(events.market.bonus,events.shrine.bonus);
  assert.equal(applauseUnit,20);
  assert.equal(goalScore,1320);
});

test('delayed fireworks remain useful before the finale and never schedule new shots beyond it',()=>{
  const next=play(['ignite'],{act:3});
  assert.deepEqual(next.board.fireworks,[4]);
  const finale=play(['ignite','fuse'],{act:4});
  assert.deepEqual(finale.board.fireworks,[]);
  assert.equal(award(finale,'ignite'),3);
  assert.equal(award(finale,'fuse'),3);
  const advanced=play(['fuse'],{act:3,board:{fireworks:[4]}});
  assert.deepEqual(advanced.board.fireworks,[]);
  assert.equal(award(advanced,'fuse','advance'),1);
});
