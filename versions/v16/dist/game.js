import { actCount, applauseUnit, audienceFactor, cards, events, fresh, goalScore, heatPercent, nextBoard, route, scoreAct, slots, styles, tones, varieties } from './rules.js?v=16';
import { clearStage, copyLimit, deckSize, draftOptions, drawCards, presets, revealsPerAct, startDeck, toneSupply, validDeck } from './deck.js?v=16';
import { createStage } from './stage.js?v=12';
import { cardRules, changesLine, effectName, feedback, goalDetail, icon, progressPercent, updateMeter } from './presentation.js?v=16';

const byId=id=>document.getElementById(id);
const key='dengxia-ouxi-save-v16';
const theatre=byId('theatre'), stage=byId('stage'), hand=byId('hand'), dialog=byId('dialog'), dialogBody=byId('dialog-body');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cn=['一','二','三','四','五'];
const effects=feedback(stage,byId('stage-effects'));
const load=mode=>{
  try {
    const data=JSON.parse(localStorage.getItem(key+'-'+mode));
    if(data?.mode===mode&&Number.isInteger(data.act)&&data.act>=0&&data.act<actCount&&data.lineup?.length===3&&
      ['deck','copyTones','draw','hand','used','history'].every(field=>Array.isArray(data[field]))&&validDeck(data.deck)&&
      data.copyTones.length===deckSize&&tones.map(tone=>data.copyTones.filter(id=>id===tone.id).length)
        .sort((a,b)=>b-a).every((n,i)=>n===toneSupply[i])&&
      (data.mode==='hand'||data.mode==='draft'&&data.draftOrders?.length===actCount&&
        data.draftOrders.every(orders=>Array.isArray(orders)&&orders.length===slots.length&&
          orders.every(order=>Array.isArray(order)&&order.length===deckSize&&new Set(order).size===deckSize&&
            order.every(copy=>Number.isInteger(copy)&&copy>=0&&copy<deckSize))))&&
      ['market','shrine'].includes(data.branch)&&data.choices&&data.board&&
      ['flowers','fireworks','pots','butterflies'].every(kind=>Array.isArray(data.board[kind]))&&
      Number.isInteger(data.board.audience)&&data.board.audience>=0&&data.board.audience<=9){
      const copies=[...data.hand,...data.draw,...data.used], staged=data.lineup.filter(copy=>copy!==null);
      if(data.started&&copies.length===deckSize&&new Set(copies).size===deckSize&&
        copies.every(copy=>Number.isInteger(copy)&&copy>=0&&copy<deckSize)&&
        new Set(staged).size===staged.length&&staged.every(copy=>data.hand.includes(copy))&&
        data.history.length===data.act+Number(data.ready||data.finished))return data;
    }
  }catch{}
  return fresh();
};
let selectedMode='hand';
try {
  if(localStorage.getItem(key+'-mode')==='draft')selectedMode='draft';
} catch {}
let state=load(selectedMode), playing=false, current=-1, muted=true, audio=null, filter='all';
let plannedFlights=[];
let draftStyle='garden';
let draft={};
try {
  const saved=JSON.parse(localStorage.getItem(key+'-deck'));
  if(validDeck(saved))for(const id of saved)draft[id]=(draft[id]??0)+1;
} catch {}
function persist(){
  if(!state.started)return;
  try { localStorage.setItem(key+'-'+state.mode,JSON.stringify(state)); } catch {}
}
const event=()=>events[route(state.branch)[state.act]];
const canEdit=()=>state.started&&!state.ready&&!state.finished&&!playing;
const cardId=copy=>copy===null?null:state.deck[copy];
const cast=()=>state.lineup.map(cardId);
const cardTone=copy=>copy===null?null:state.copyTones[copy];
const forecastAct=()=>scoreAct({...state,lineup:cast(),lineupTones:state.lineup.map(cardTone),choices:state.lineup.map(copy=>state.choices[copy])});
const text=(id,value)=>{byId(id).textContent=value;};
const multiplier=percent=>'×'+audienceFactor(percent,state.mode??selectedMode);
const nextDraftSeat=()=>state.lineup.indexOf(null);
const delay=time=>new Promise(resolve=>setTimeout(resolve,reduced?Math.min(260,time):time));
const click=(id,fn)=>byId(id).addEventListener('click',fn);

const slotButtons=slots.map((name,i)=>{
  const button=document.createElement('button');
  button.className='slot';
  button.type='button';
  button.addEventListener('click',()=>place(i,null));
  button.addEventListener('dragover',e=>{
    if(!canEdit())return;
    e.preventDefault();
    e.dataTransfer.dropEffect='move';
  });
  button.addEventListener('drop',e=>{
    e.preventDefault();
    stage.dataset.selected='false';
    const copy=e.dataTransfer.getData('text/plain');
    if(/^\d+$/.test(copy))place(i,Number(copy));
  });
  byId('slots').append(button);
  return button;
});

let scene;
try {
  scene=createStage(byId('world'),slotButtons,cards);
} catch(error) {
  byId('graphics-warning').hidden=false;
  console.warn('舞台改用简化模式',error);
  const fallback=document.createElement('div');
  fallback.className='fallback-stage';
  fallback.innerHTML='<div class="fallback-sign">聽春臺</div><div class="fallback-figures"></div>';
  byId('world').append(fallback);
  const figures=fallback.querySelector('.fallback-figures');
  scene={
    portraits:{},
    sync(ids){
      figures.replaceChildren(...ids.map(id=>{
        const figure=document.createElement('span');
        figure.textContent=id?styles[cards[id].style].glyph:'◇';
        if(id)figure.style.backgroundColor='#'+cards[id].color.toString(16);
        return figure;
      }));
    },
    highlight(i){
      Array.from(figures.children).forEach((el,index)=>el.classList.toggle('active',i===index));
    },
    accent(){},
    stageProps(){},
  };
}

function place(i,copy){
  if(!canEdit())return;
  const existing=state.lineup[i];
  if(existing===copy)return;
  if(copy===null){
    state.lineup[i]=null;
    text('announcement',cards[cardId(existing)].name+'回到手牌');
  } else {
    if(!state.hand.includes(copy))return;
    if(state.mode==='draft'&&(i!==nextDraftSeat()||!draftOptions(state,i).includes(copy)))return;
    const origin=state.lineup.indexOf(copy);
    if(origin!==-1&&origin!==i)state.lineup[origin]=existing;
    state.lineup[i]=copy;
    text('announcement',cards[cardId(copy)].name+'，'+slots[i]);
  }
  sound('tap');
  persist();
  update();
}
function togglePlacement(copy){
  if(!canEdit())return;
  const seated=state.lineup.indexOf(copy);
  if(seated!==-1){
    place(seated,null);
    return;
  }
  if(state.mode==='draft'){
    const seat=nextDraftSeat();
    if(seat!==-1)place(seat,copy);
    return;
  }
  const matching=tones.findIndex(tone=>tone.id===cardTone(copy));
  const empty=state.lineup[matching]===null?matching:state.lineup.indexOf(null);
  if(empty!==-1)place(empty,copy);
  else text('announcement','站位已满。再点一张已上场的手牌可撤下。');
}

const cardButtons=new Map();
const filterButtons=Object.entries({all:{name:'全部'},...styles}).map(([id,style])=>{
  const button=document.createElement('button');
  button.className='filter';button.type='button';button.textContent=style.name;
  button.addEventListener('click',()=>{filter=id;update();});
  byId('hand-filter').append(button);
  return [id,button];
});
function makeCard(copy){
  const id=cardId(copy);
  const card=cards[id], button=document.createElement('button');
  button.className='card';button.type='button';
  const portrait=scene.portraits[id];
  if(portrait){
    const img=document.createElement('img');
    img.className='portrait';img.alt='';img.src=portrait;img.draggable=false;
    button.append(img);
  }else{
    const art=document.createElement('span');
    art.className='portrait portrait-fallback';
    art.textContent=card.role;
    art.style.setProperty('--tint','#'+card.color.toString(16));
    button.append(art);
  }
  const info=document.createElement('span');
  info.className='card-info';
  info.innerHTML='<span class="card-name">'+card.name+'<small data-style="'+card.style+'">'+styles[card.style].name+'</small></span>';
  info.append(cardRules({...card,tone:cardTone(copy)}));
  button.title=tones.find(tone=>tone.id===cardTone(copy)).name+'色。上台即得 '+card.base+' 基础喝彩。'+card.text;
  button.append(info);
  button.addEventListener('click',()=>togglePlacement(copy));
  button.addEventListener('dragstart',e=>{
    if(!canEdit()){e.preventDefault();return;}
    stage.dataset.selected='true';
    e.dataTransfer.effectAllowed='move';
    e.dataTransfer.setData('text/plain',String(copy));
  });
  button.addEventListener('dragend',()=>{stage.dataset.selected='false';});
  cardButtons.set(copy,button);return button;
}
function syncTokens(board,changes=[],step=null){
  const container=byId('tokens');
  const bloom=board.flowers.filter(flower=>flower.age===1).length;
  const dates=[...board.fireworks].sort((a,b)=>a-b).map(date=>date===state.act?'今幕':'第'+(date+1)+'幕');
  const counts=varieties.map(pot=>[pot,board.pots.filter(type=>type===pot).length]);
  const labels={
    flower:'花 '+board.flowers.length,
    firework:dates.length?'待放 '+dates.join('、'):'待放 0',
    bonsai:counts.map(([pot,n])=>pot+(n>1?'×'+n:n?'':'□')).join(' '),
    butterfly:'蝶 '+board.butterflies.length,
    audience:'观众 '+board.audience+' · '+multiplier(heatPercent(board.audience)),
  };
  for(const [kind,label] of Object.entries(labels)){
    let item=byId('token-'+kind);
    if(!item){
      item=document.createElement('span');
      item.id='token-'+kind;item.className='token';container.append(item);
    }
    item.replaceChildren(icon(kind),label);
    item.dataset.flash='false';
    if(changes.some(change=>change.kind===kind||kind==='flower'&&['bloom','protect'].includes(change.kind)||kind==='firework'&&change.kind==='advance'||kind==='butterfly'&&change.kind==='move')){
      void item.offsetWidth;
      item.dataset.flash='true';
    }
  }
  scene.sync(cast(),board,false,event().place,changes.length>0,step);
}
function renderChoices(cues){
  const host=byId('stage-options');
  const active=document.activeElement;
  host.replaceChildren();
  function pick(cue,key,label,options,value,format=String){
    if(options.length<2)return;
    const field=document.createElement('label'), select=document.createElement('select');
    const copy=state.lineup[cue.i];
    select.id='option-'+copy+'-'+key;
    for(const option of options)select.add(new Option(format(option),option));
    select.value=value;
    field.append(label,select);host.append(field);
    select.addEventListener('change',()=>{
      state.choices[copy]={...state.choices[copy],[key]:select.value};
      persist();update();
    });
  }
  if(canEdit()){
    for(const cue of cues){
      const prefix=cast().filter(id=>id===cue.id).length>1?slots[cue.i]+' · ':'';
      if(cue.offers)pick(cue,'pot',prefix+cards[cue.id].name,cue.offers,cue.pot);
      if(cue.dates)pick(cue,'date',prefix+'催引',cue.dates,cue.date,date=>'第 '+(date+1)+' 幕烟花');
      if(cue.sources)pick(cue,'from',prefix+'起飞',cue.sources,cue.from,seat=>slots[seat]);
      if(cue.targets)pick(cue,'to',prefix+'落点',cue.targets,cue.to,seat=>slots[seat]);
    }
  }
  host.hidden=!host.children.length;
  if(active?.id.startsWith('option-'))byId(active.id)?.focus();
}
function drawFlights(){
  const host=byId('butterfly-paths'), bounds=stage.getBoundingClientRect();
  host.replaceChildren();
  for(const [index,{from,to}] of plannedFlights.entries()){
    const origin=slotButtons[from].getBoundingClientRect(), destination=slotButtons[to].getBoundingClientRect();
    const left=Math.min(origin.x+origin.width/2,destination.x+destination.width/2);
    const right=Math.max(origin.x+origin.width/2,destination.x+destination.width/2);
    const line=document.createElement('i');
    line.className='butterfly-route';line.dataset.direction=from<to?'right':'left';
    Object.assign(line.style,{left:(left-bounds.x)+'px',top:(origin.y-bounds.y-33-index*12)+'px',width:(right-left)+'px'});
    host.append(line);
  }
}
new ResizeObserver(()=>requestAnimationFrame(drawFlights)).observe(stage);
function goalStatus(result,settled=false){
  updateMeter(byId('act-meter'),result.audienceGain,3);
  const status=byId('goal-state');
  status.dataset.hit=String(result.audienceGain===3);
  status.textContent=(settled?'招来 ':'预计招来 ')+result.audienceGain+' 位';
  text('goal-detail','同色入席，每席 +1 观众；错色仍可演。');
}
function balance(score,changes=[]){
  text('applause',score);
  updateMeter(byId('tour-meter'),score,goalScore);
  if(!changes.some(change=>change.kind==='applause'))return;
  const tally=byId('applause');
  tally.classList.remove('balance-bump');
  void tally.offsetWidth;
  tally.classList.add('balance-bump');
}
const closingTitle={firework:'收场 · 烟花',match:'配色 · 观众入座',audience:'收场 · 喝彩入账'};
function forecastSlots(steps=[],settled=false){
  const cue=byId('forecast');
  cue.replaceChildren();
  for(const [i,position] of slots.entries()){
    const turns=steps.filter(item=>item.i===i);
    const displayed=turns[0]?.id??cardId(state.lineup[i]);
    const row=document.createElement('div');
    row.className='forecast-line';
    const title=document.createElement('span');
    if(displayed){
      const slotLabel=document.createElement('span');
      slotLabel.className='forecast-slot';
      slotLabel.textContent=position;
      title.append(slotLabel,' · '+cards[displayed].name);
    } else title.textContent=position;
    row.append(title);
    if(turns.length)row.append(changesLine(turns.flatMap(step=>step.changes)));
    else{
      const note=document.createElement('small');
      note.className='forecast-empty';
      note.textContent=displayed&&settled?'已演':'空位';
      row.append(note);
    }
    cue.append(row);
  }
  for(const step of steps.filter(turn=>turn.cue)){
    const row=document.createElement('div'),label=document.createElement('span');
    row.className='forecast-line';
    label.textContent=closingTitle[step.cue];
    row.append(label,changesLine(step.changes));
    cue.append(row);
  }
}
function highlightSlot(index){
  slotButtons.forEach((button,i)=>button.setAttribute('aria-current',String(i===index)));
  Array.from(byId('forecast').children).forEach((row,i)=>row.classList.toggle('is-current',i===index));
  scene.highlight(index);
}
function update(){
  const e=event();
  const forecast=forecastAct();
  const lineup=cast();
  plannedFlights=canEdit()?forecast.steps.flatMap(step=>step.flight?[step.flight]:[]):[];
  text('location',e.place);
  text('phase',!state.started?'待开局':playing?'演出中':state.finished?'已谢幕':state.ready?'本幕落定':'排演中');
  text('act-number','第'+cn[state.act]+'幕 / 三幕');
  byId('act-track').innerHTML=Array.from({length:actCount},(_,i)=>'<span class="'+(i===state.act?'current':i<state.act?'done':'')+'"></span>').join('');
  text('event-title',e.name);
  text('event-goal',e.goal);
  balance(state.applause);
  const hasCast=lineup.some(Boolean);
  const previewHeat=canEdit()&&hasCast;
  const lastAct=state.ready||state.finished?state.history.at(-1):null;
  const percent=previewHeat?forecast.audiencePercent:lastAct?.audiencePercent??heatPercent(state.board.audience);
  text('heat-label',previewHeat?'招客后倍率':lastAct?'收场倍率':'观众倍率');
  text('heat-multiplier',multiplier(percent));
  text('score-target',' / '+goalScore);
  const drafting=state.mode==='draft';
  const draftSeat=nextDraftSeat();
  const handHint=drafting
    ?(draftSeat===-1?'三席已选齐。点台上的木偶可撤回重选。':slots[draftSeat]+'选 1 只，随后选择下一席')
    :lineup.includes(null)?'点击优先入同色空席；拖动可换位':'站位已满，再点已上场的牌可撤下';
  text('hand-hint',canEdit()?handHint:'');
  byId('tour-mode').disabled=playing;
  byId('tour-mode').value=selectedMode;
  byId('hand-filter').hidden=drafting;
  text('hand-heading',drafting?'三选一':'候场木偶');
  text('deck-status',state.started&&drafting?'已选 '+lineup.filter(Boolean).length+' / 3':
    state.started?'候场 '+state.hand.length+' · 待揭 '+state.draw.length+' · 已演 '+state.used.length:
    selectedMode==='draft'?'每席三选一':'开局揭 5 张');
  text('deck',state.started&&!state.finished?'查看戏班':'选戏班');
  byId('deck').disabled=playing;
  const b=byId('perform');
  b.disabled=playing||(canEdit()&&draftSeat!==-1);
  b.textContent=!state.started?'直接开演':state.finished?'再开一局':state.ready?(drafting?'下一幕 · 重新选角':'下一幕 · 揭 '+revealsPerAct[state.act+1]+' 张'):playing?'锣声已响':'击鼓开戏';
  slotButtons.forEach((button,i)=>{
    const id=lineup[i];
    button.disabled=!canEdit();
    button.setAttribute('aria-current',String(current===i));
    button.dataset.butterfly=canEdit()&&forecast.buffs[i]?'+'+forecast.buffs[i]:'';
    button.setAttribute('aria-label',slots[i]+'，'+(id?cards[id].name+'。点按撤下':'空位'));
    button.dataset.tone=tones[i].id;
    button.dataset.match=String(Boolean(id)&&forecast.matches[i]);
    const tuned=id&&cardTone(state.lineup[i])!==forecast.effectiveTones[i];
    button.innerHTML='<b>'+tones[i].glyph+' '+tones[i].name+' · '+slots[i]+'</b>'+(id?cards[id].name:'＋')+'<small>'+(id?(forecast.matches[i]?(tuned?'调色成功 · 招客 +1':'配色成功 · 招客 +1'):'错色可演 · 不招客'):'同色招客 +1')+'</small>';
    button.setAttribute('aria-label',tones[i].name+'色'+slots[i]+'，'+(id?cards[id].name+(forecast.matches[i]?'，招客加一':'，错色可演')+'。点按撤下':'空位，同色招客加一'));
  });
  for(const [id,button] of filterButtons){
    button.disabled=playing||!state.started;
    button.setAttribute('aria-pressed',String(filter===id));
  }
  const visible=drafting?(canEdit()&&draftSeat!==-1?draftOptions(state,draftSeat):[]):
    state.hand.filter(copy=>filter==='all'||cards[cardId(copy)].style===filter);
  if(hand.children.length!==visible.length||visible.some((id,i)=>hand.children[i]!==cardButtons.get(id))){
    hand.replaceChildren(...visible.map(id=>cardButtons.get(id)||makeCard(id)));
  }
  for(const copy of visible){
    const button=cardButtons.get(copy);
    const slot=state.lineup.indexOf(copy);
    button.disabled=!canEdit();button.draggable=canEdit()&&!drafting;
    button.dataset.inPlay=slot!==-1;
    button.dataset.slot=slot!==-1?slots[slot]:'';
    button.setAttribute('aria-pressed',String(slot!==-1));
    button.setAttribute('aria-label',cards[cardId(copy)].name+'。'+button.title+(slot!==-1?' 已在'+slots[slot]+'。':''));
  }
  syncTokens(state.board);
  renderChoices(forecast.cues);
  drawFlights();
  if(state.ready||state.finished){
    const last=state.history.at(-1);
    goalStatus(last,true);
    text('cue-title','本幕结算');
    text('forecast-summary','+'+last.score+' 喝彩 · 招客 +'+last.audienceGain+' · 观众 '+state.board.audience);
    forecastSlots(last.steps,true);
    if(state.finished)text('caption',state.applause>=goalScore?'满堂彩 · '+state.applause+' 喝彩':'巡演谢幕 · '+state.applause+' / '+goalScore+' 喝彩');
    else text('caption','本幕 +'+last.score+' 喝彩 · 观众留到下一幕');
    return;
  }
  if(!playing)text('caption','');
  goalStatus(forecast);
  text('cue-title',playing?'逐位结算':'排演预估');
  const points=forecast.progress[0][0].value;
  const breakdown=forecast.baseApplause+' 基础 '+multiplier(forecast.audiencePercent)+' = '+points+' 喝彩 · 招客 +'+forecast.audienceGain;
  text('forecast-summary',!state.started?(selectedMode==='draft'?'每席三选一':'随机揭 5 张'):playing?'本幕 +0 喝彩':hasCast?breakdown:'先安排木偶');
  forecastSlots(forecast.steps);
}

function sound(kind){
  if(muted)return;
  const Context=window.AudioContext||window.webkitAudioContext;
  if(!Context)return;
  try {
    audio ||= new Context();
    if(audio.state==='suspended')void audio.resume().catch(()=>{});
    const start=audio.currentTime;
    const cues={
      win:[329.6,392,523.25,659.25],gong:[107,167],flower:[440,587],butterfly:[620,780,890],
      bloom:[523,659,784],protect:[523,698],move:[510,765,1020],bonsai:[261,392,523],
      firework:[127,205,330],advance:[294,392],audience:[262,330,440],spend:[370,220],
      tally:[659,880],target:[392,523,659],lamp:[329,493,659],beat:[149,202],
      applause:[393,523],tap:[290],
    };
    const pitches=cues[kind]??cues.tap;
    pitches.forEach((pitch,i)=>{
      const tone=audio.createOscillator(),volume=audio.createGain();
      const time=start+i*.075;
      tone.type=['gong','firework','spend'].includes(kind)?'triangle':'sine';
      tone.frequency.setValueAtTime(pitch,time);
      tone.frequency.exponentialRampToValueAtTime(pitch*.77,time+.21);
      volume.gain.setValueAtTime(.001,time);
      volume.gain.exponentialRampToValueAtTime(kind==='gong'?.23:.075,time+.013);
      volume.gain.exponentialRampToValueAtTime(.001,time+.28);
      tone.connect(volume);volume.connect(audio.destination);
      tone.start(time);tone.stop(time+.29);
    });
  } catch {}
}
click('sound',()=>{
  muted=!muted;
  byId('sound').setAttribute('aria-pressed',String(!muted));
  text('sound',muted?'声音关':'声音开');
  sound('tap');
});

const propActions={
  flower:{gain:'新花登台',use:'赏花取彩',spend:'剪下盛花'},
  bloom:{gain:'盛花绽放'},protect:{gain:'留花一幕'},
  firework:{gain:'火种入台',use:'借焰取利'},advance:{gain:'引信缩短'},
  bonsai:{gain:'盆景入台',use:'盆景点彩',spend:'旧盆离台'},
  butterfly:{gain:'引蝶入场',use:'停蝶增彩'},move:{gain:'蝴蝶掠过戏台'},
  audience:{gain:'看客入座',spend:'看客离场'},
};
function stageCue(step){
  if(step.cue==='firework')return {theme:'firework',action:'升空 · 齐放',reward:true};
  if(step.cue==='match')return {theme:'audience',action:'配色招客'};
  if(step.changes.some(change=>change.kind==='tune'))return {theme:'tune',action:'开演前调色'};
  if(step.cue==='audience')return {theme:'audience',action:'席间喝彩'};
  const change=step.changes.find(item=>item.kind==='move')??step.changes.find(item=>propActions[item.kind]);
  const used=step.props?.[0];
  if(change){
    const {kind,amount}=change;
    const actions=propActions[kind];
    const exchanged=kind==='bonsai'&&step.changes.some(item=>item.kind===kind&&item.amount<0)&&step.changes.some(item=>item.kind===kind&&item.amount>0);
    return {theme:kind,action:exchanged?'旧盆换新景':amount<0?actions.spend:actions.gain};
  }
  if(used)return {theme:used.kind,action:propActions[used.kind].use};
  return {theme:'applause',action:'登台喝彩'};
}
function surge(element){
  element.dataset.surged='false';
  void element.offsetWidth;
  element.dataset.surged='true';
}

async function perform(){
  if(playing)return;
  if(!state.started||state.finished){
    begin(presets.garden);return;
  }
  if(state.ready){
    const board=state.board;
    state.act++;
    state.board=nextBoard(state.board);
    state.ready=false;
    if(state.mode==='hand')drawCards(state);
    filter='all';
    const growth=board.flowers.filter(flower=>flower.age===0).length;
    const wilt=board.flowers.length-state.board.flowers.length;
    const growthChanges=[];
    if(growth)growthChanges.push({kind:'bloom',amount:growth});
    if(wilt)growthChanges.push({kind:'flower',amount:-wilt});
    if(growthChanges.length)syncTokens(state.board,growthChanges);
    persist();update();
    text('announcement','第'+cn[state.act]+'幕，'+(state.mode==='draft'?'请为开场选角':'揭 '+revealsPerAct[state.act]+' 张')+'；观众与道具留场');
    if(growthChanges.length)text('caption',[growth?'新开 '+growth+' 朵':'',wilt?'花谢 '+wilt+' 朵':''].filter(Boolean).join(' · '));
    return;
  }
  if(nextDraftSeat()!==-1)return;
  const e=event();
  const result=forecastAct();
  playing=true;update();sound('gong');
  const theatreBounds=theatre.getBoundingClientRect();
  if(theatreBounds.top<0){
    theatre.scrollIntoView({block:'start',behavior:reduced?'instant':'smooth'});
  }
  const target=()=>byId('applause');
  effects.show('锣响 · 开戏',[],null,{action:'帘前亮相'});
  text('caption','锣响，开戏');
  await delay(560);
  for(const step of result.steps){
    current=step.i;
    highlightSlot(current);
    const summary=step.changes.map(({kind,amount})=>(amount>0?'+':'−')+Math.abs(amount)+' '+effectName(kind)).join(' · ');
    if(!step.changes.length)continue;
    const title=step.id?cards[step.id].name:closingTitle[step.cue];
    text('caption',title+' · '+summary);
    const cue=stageCue(step);
    const closing=step.cue==='audience';
    const payouts=closing?step.changes:[];
    effects.show(title,step.changes,slotButtons[current],cue);
    scene.accent(current,cue.theme);
    if(step.changes.some(change=>change.amount<0&&change.kind!=='firework'))sound('spend');
    scene.stageProps(step);
    syncTokens(step.board,step.changes,step);
    sound(cue.theme);
    const fired=step.cue==='firework'?-step.changes[0].amount:0;
    await delay(fired?620+(fired-1)*90:cue.theme==='applause'?210:390);
    await effects.fly(payouts,target);
    if(closing)balance(state.applause+step.objectives[0][0].value,step.changes);
    if(payouts.some(change=>change.kind==='applause')){
      sound('tally');surge(byId('applause').closest('.score-box'));
    }
    text('forecast-summary',closing?step.baseApplause+' 基础 '+multiplier(result.audiencePercent)+' = '+step.objectives[0][0].value+' 喝彩':'本幕 '+step.baseApplause+' 基础喝彩');
    text('heat-multiplier',multiplier(heatPercent(step.board.audience)));
    await delay(145);
  }
  highlightSlot(-1);
  goalStatus(result,true);
  state.board=result.board;state.applause+=result.score;
  state.history.push({event:e.name,location:e.place,score:result.score,
    audiencePercent:result.audiencePercent,audienceGain:result.audienceGain,
    lineup:cast().filter(Boolean).map(id=>cards[id].name),progress:result.progress,
    steps:result.steps.map(({i,id,changes,cue})=>({i,id,changes,cue}))});
  clearStage(state);
  current=-1;playing=false;state.finished=state.act===actCount-1;state.ready=!state.finished;
  effects.clear();persist();update();
  if(state.finished)openModal('summary');
}
click('perform',()=>void perform());

function row(title,description){
  const item=document.createElement('section'), heading=document.createElement('h3'), body=document.createElement('p');
  item.className='dialog-row';heading.textContent=title;body.textContent=description;
  item.append(heading,body);dialogBody.append(item);
  return item;
}
function smallButton(parent,label,action,disabled=false){
  const button=document.createElement('button');
  button.type='button';button.className='small-action';button.textContent=label;button.disabled=disabled;
  button.addEventListener('click',action);
  parent.append(button);
  return button;
}
function begin(deck,custom=false){
  if(playing||state.started&&!state.finished||!validDeck(deck))return;
  const branch=state.finished?'market':state.branch;
  state={...fresh(),branch};
  startDeck(state,deck,Math.random,selectedMode);
  if(custom){
    try {localStorage.setItem(key+'-deck',JSON.stringify(deck));} catch {}
  }
  filter='all';cardButtons.clear();
  dialog.close();persist();update();
  text('announcement',state.mode==='draft'?'请从三只木偶中为开场选一位。':'已揭开五张牌。点选优先入同色空席。');
}

const deckNames={
  garden:['春色满台','添花后可以赏花剪花，也可以引蝶。'],
  fire:['灯火连天','先点火留到下幕，再借齐放收分。'],
  gardenware:['四景同堂','收集梅兰竹菊，凑齐四种后得分。'],
  circus:['全场叫好','用相邻搭档调色、接鼓和得分。'],
  mixed:['彩戏搭台','卖茶客能接过摆盆、引蝶或赏景，再为下一席添花。'],
};

function deckEditor(){
  text('dialog-title','自组牌组');
  const control=document.createElement('div');
  control.className='deck-controls';
  const status=document.createElement('strong');
  status.id='draft-status';status.setAttribute('aria-live','polite');
  const start=smallButton(control,'用这套牌开演',()=>{
    begin(Object.entries(draft).flatMap(([id,count])=>Array(count).fill(id)),true);
  });
  const preset=document.createElement('select');
  preset.setAttribute('aria-label','载入预设作为底稿');
  preset.add(new Option('载入预设作为底稿',''));
  for(const [style,[name]] of Object.entries(deckNames))preset.add(new Option(name,style));
  preset.addEventListener('change',()=>{
    if(!preset.value)return;
    draft={};draftStyle=preset.value==='mixed'?'garden':preset.value;
    for(const id of presets[preset.value])draft[id]=(draft[id]??0)+1;
    modalContent('builder');
  });
  control.prepend(status);
  control.append(preset);
  smallButton(control,'返回预设',()=>openModal('presets'));
  dialogBody.append(control);
  const filters=document.createElement('div');
  filters.className='filters';
  dialogBody.append(filters);
  for(const [id,style] of Object.entries(styles)){
    const button=smallButton(filters,style.name,()=>{draftStyle=id;modalContent('builder');});
    button.setAttribute('aria-pressed',String(id===draftStyle));
  }
  const grid=document.createElement('div');
  grid.className='recruit-grid';
  const counters=[];
  for(const card of Object.values(cards).filter(card=>card.style===draftStyle)){
    const item=row(card.name,'');
    item.insertBefore(cardRules(card,{showTone:false}),item.querySelector('p'));
    const actions=document.createElement('div');
    actions.className='deck-counter';
    const label=document.createElement('output');
    const minus=smallButton(actions,'−',()=>change(-1));
    actions.append(label);
    const plus=smallButton(actions,'+',()=>change(1));
    minus.setAttribute('aria-label','移除一张'+card.name);
    plus.setAttribute('aria-label','加入一张'+card.name);
    function change(delta){
      draft[card.id]=(draft[card.id]??0)+delta;
      refreshCounts();
      if(document.activeElement===plus&&plus.disabled)minus.focus();
      if(document.activeElement===minus&&minus.disabled&&!plus.disabled)plus.focus();
    }
    counters.push({id:card.id,label,minus,plus});
    item.append(actions);
    grid.append(item);
  }
  dialogBody.append(grid);
  function refreshCounts(){
    const total=Object.values(draft).reduce((sum,count)=>sum+count,0);
    status.textContent=total+' / '+deckSize+' 只 · 开局随机分色 · 同名最多 '+copyLimit;
    start.disabled=total!==deckSize;
    for(const {id,label,minus,plus} of counters){
      const count=draft[id]??0;
      label.textContent=count;
      minus.disabled=count===0;
      plus.disabled=count===copyLimit||total===deckSize;
    }
  }
  refreshCounts();
}
function modalContent(type){
  dialogBody.replaceChildren();
  if(type==='help'){
    text('dialog-title','怎样排一台戏');
    row('两种排演模式','五选三开局揭 5 张，以后每幕补 3 张，每幕选满三席，未登台的牌留在手里。逐席三选一按开场、过场、收场依次选角，选齐三席才能开演。');
    row('配色招客','每局随机分色。朱●开场、青◆过场、金▲收场。配色每席招 1 位观众，错色也可正常演出。杂耍调色如果增加匹配，还会获得基础喝彩。');
    row('越演越热闹','先演木偶，再放烟花、招客。巡演以 ×20 为起点，每位观众让整幕整数倍率增加 1。');
    row('看相邻两席','有些木偶等上一席完成动作，有些会接着下一席加一道戏。卡面上的 + 分指额外基础喝彩。');
    row('先铺垫，后收尾','观众和道具留到下一幕。没有单幕分数门槛，三幕累计 '+goalScore+' 喝彩获得满堂彩；没达标也不损失木偶。');
    for(const style of Object.values(styles))row(style.name,style.summary);
  } else if(type==='presets'){
    text('dialog-title','选择戏班');
    const grid=document.createElement('div');
    grid.className='preset-grid';
    for(const [style,[name,description]] of Object.entries(deckNames)){
      const button=document.createElement('button');
      button.type='button';
      button.className='preset-button';
      button.dataset.style=style;
      const label=document.createElement('strong');
      label.textContent=name+' · '+(styles[style]?.name??'混合戏班');
      const note=document.createElement('span');
      note.textContent=description;
      button.append(label,note);
      button.addEventListener('click',()=>begin(presets[style]));
      grid.append(button);
    }
    dialogBody.append(grid);
    smallButton(dialogBody,'进阶 · 自组牌组',()=>openModal('builder'));
  } else if(type==='builder'){
    deckEditor();
  } else if(type==='deck'){
    text('dialog-title','本局牌组');
    const grid=document.createElement('div');
    grid.className='recruit-grid';
    for(const id of new Set(state.deck)){
      const count=state.deck.filter(card=>card===id).length;
      const used=state.used.filter(copy=>cardId(copy)===id).length;
      const item=row(cards[id].name+' ×'+count,cards[id].text+' 已演 '+used+' 张。');
      item.insertBefore(cardRules(cards[id],{showTone:false}),item.querySelector('p'));
      grid.append(item);
    }
    dialogBody.append(grid);
  } else if(type==='tour'){
    text('dialog-title','巡演图');
    const editable=!playing&&state.act<1;
    for(const [i,id] of route(state.branch).entries()){
      const e=events[id];
      const status=i<state.act||i===state.act&&(state.ready||state.finished)?' · 已演':i===state.act?' · 今幕':'';
      const item=row('第'+cn[i]+'幕 · '+e.place+status,e.name+'。'+e.story+' '+e.goal);
      if(i===1){
        const other=id==='market'?'shrine':'market';
        smallButton(item,'改走'+events[other].place,()=>{
          if(state.act>=1||playing)return;
          state.branch=other;persist();update();modalContent(type);
        },!editable);
      }
    }
  } else if(type==='summary'){
    const win=state.applause>=goalScore;
    text('dialog-title',win?'满堂彩':'巡演谢幕');
    row(state.applause+' 喝彩 / 目标 '+goalScore,win?'三幕已毕，观众仍留在台下叫好。':'三幕已毕，观众还想看一出更热闹的戏。');
    for(const [i,last] of state.history.entries())row('第'+cn[i]+'幕 · '+last.event,last.lineup.join('、')+' · '+last.score+' 喝彩');
    smallButton(dialogBody,'再开一局',()=>{dialog.close();void perform();});
  } else {
    text('dialog-title','演出记录');
    if(!state.history.length)row('还未开戏','完成一幕，便可在这里回看阵容和得分。');
    for(const [i,last] of state.history.entries())row('第'+cn[i]+'幕 · '+last.event,
      last.lineup.join('、')+' · '+last.score+' 喝彩 · 招客 +'+last.audienceGain);
  }
}
function openModal(type){
  dialog.dataset.type=type;
  modalContent(type);
  if(!dialog.open)dialog.showModal();
}
for(const id of ['tour','help','log'])click(id,()=>openModal(id));
byId('tour-mode').addEventListener('change',event=>{
  if(playing)return;
  selectedMode=event.target.value;
  try {localStorage.setItem(key+'-mode',selectedMode);} catch {}
  state=load(selectedMode);
  filter='all';cardButtons.clear();update();
});
click('deck',()=>openModal(state.started&&!state.finished?'deck':'presets'));
click('close',()=>dialog.close());
dialog.addEventListener('click',e=>{
  if(e.target!==dialog)return;
  const bounds=dialog.getBoundingClientRect();
  if(e.clientX<bounds.left||e.clientX>bounds.right||e.clientY<bounds.top||e.clientY>bounds.bottom)dialog.close();
});
update();
