import { cards, events, fresh, goalScore, roster, route, scoreAct, slots, stockKinds, stockLimit, styles } from './rules.js?v=2';
import { createStage } from './stage.js?v=3';
import { cardRules, changesLine, effectName, feedback, goalDetail, icon, progressPercent, updateMeter } from './presentation.js?v=2';

const byId=id=>document.getElementById(id);
const key='dengxia-ouxi-save-v1';
const theatre=byId('theatre'), stage=byId('stage'), hand=byId('hand'), dialog=byId('dialog'), dialogBody=byId('dialog-body');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cn=['一','二','三','四','五'];
const effects=feedback(stage,byId('stage-effects'));
const initial=()=>{
  const state=fresh();
  state.lineup=['florist',null,'drum'];
  return state;
};
const load=()=>{
  try {
    const data=JSON.parse(localStorage.getItem(key));
    if(data&&Number.isInteger(data.act)&&data.act>=0&&data.act<5&&Array.isArray(data.lineup)&&
       data.lineup.length===3&&Array.isArray(data.owned)&&data.owned.every(id=>Object.hasOwn(cards,id))&&
       data.lineup.every(id=>id===null||data.owned.includes(id))&&Array.isArray(data.history)&&
       ['market','shrine'].includes(data.branch)&&stockKinds.every(kind=>
         Number.isInteger(data.stock?.[kind]??0)&&(data.stock?.[kind]??0)>=0&&(data.stock?.[kind]??0)<=stockLimit)){
      data.stock={flower:0,butterfly:0,lamp:0,...data.stock};
      data.owned=[...new Set([...roster,...data.owned])];
      return data;
    }
  } catch {}
  return initial();
};
let state=load(), selected=null, playing=false, current=-1, muted=true, audio=null, filter='all';
function persist(){
  try { localStorage.setItem(key,JSON.stringify(state)); } catch {}
}
const event=()=>events[route(state.branch)[state.act]];
const canEdit=()=>!state.ready&&!state.finished&&!playing;
const text=(id,value)=>{byId(id).textContent=value;};
const delay=time=>new Promise(resolve=>setTimeout(resolve,reduced?Math.min(260,time):time));
const click=(id,fn)=>byId(id).addEventListener('click',fn);

const slotButtons=slots.map((name,i)=>{
  const button=document.createElement('button');
  button.className='slot';
  button.type='button';
  button.addEventListener('click',()=>place(i,selected));
  button.addEventListener('dragover',e=>{
    if(!canEdit())return;
    e.preventDefault();
    e.dataTransfer.dropEffect='move';
  });
  button.addEventListener('drop',e=>{
    e.preventDefault();
    const id=e.dataTransfer.getData('text/plain');
    if(state.owned.includes(id))place(i,id);
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
      const glyph={garden:'花',lantern:'灯',rhythm:'锣'};
      figures.replaceChildren(...ids.map(id=>{
        const figure=document.createElement('span');
        figure.textContent=id?glyph[cards[id].style]:'◇';
        if(id)figure.style.backgroundColor='#'+cards[id].color.toString(16);
        return figure;
      }));
    },
    highlight(i){
      Array.from(figures.children).forEach((el,index)=>el.classList.toggle('active',i===index));
    },
    accent(){},
  };
}

function place(i,id){
  if(!canEdit())return;
  const existing=state.lineup[i];
  if(id===null){
    if(!existing)return;
    state.lineup[i]=null;
    text('announcement',cards[existing].name+'回到候场');
  } else {
    if(!state.owned.includes(id))return;
    const origin=state.lineup.indexOf(id);
    if(origin!==-1&&origin!==i)state.lineup[origin]=existing;
    state.lineup[i]=id;
    text('announcement',cards[id].name+'，'+slots[i]);
    sound('tap');
  }
  selected=null;
  persist();
  update();
}
function select(id){
  if(!canEdit())return;
  selected=selected===id?null:id;
  text('announcement',selected?'已选中'+cards[id].name+'。选择一个站位。':'已取消选择');
  update();
}

const cardButtons=new Map();
const filterButtons=Object.entries({all:{name:'全部'},...styles}).map(([id,style])=>{
  const button=document.createElement('button');
  button.className='filter';button.type='button';button.textContent=style.name;
  button.addEventListener('click',()=>{filter=id;update();});
  byId('hand-filter').append(button);
  return [id,button];
});
function makeCard(id){
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
  info.append(cardRules(card));
  button.title=card.text;
  button.append(info);
  button.addEventListener('click',()=>select(id));
  button.addEventListener('dragstart',e=>{
    if(!canEdit()){e.preventDefault();return;}
    selected=id;
    e.dataTransfer.effectAllowed='move';
    e.dataTransfer.setData('text/plain',id);
    update();
  });
  cardButtons.set(id,button);return button;
}
function syncTokens(stock,beat=0,changes=[]){
  const container=byId('tokens');
  for(const kind of [...stockKinds,'beat']){
    let item=byId('token-'+kind);
    if(!item){
      item=document.createElement('span');
      item.id='token-'+kind;item.className='token';container.append(item);
    }
    const value=kind==='beat'?beat:stock[kind]+'/'+stockLimit;
    item.replaceChildren(icon(kind),effectName(kind)+' '+value);
    item.dataset.flash='false';
    if(changes.some(change=>change.kind===kind)){
      void item.offsetWidth;
      item.dataset.flash='true';
    }
  }
  scene.sync(state.lineup,stock,selected,event().place,changes.length>0);
}
function goalStatus(paths,anticipated=paths,settled=null){
  const amount=progressPercent(paths), predicted=progressPercent(anticipated);
  updateMeter(byId('act-meter'),amount,100,predicted);
  goalDetail(byId('goal-detail'),paths);
  const status=byId('goal-state');
  status.dataset.hit=String(settled??amount===100);
  status.textContent=settled===true?'✓ 已达成':settled===false?'目标未达成':playing?(amount===100?'已满足':amount+'%'):'预计 '+predicted+'%';
}
function balances(score,coins,changes=[]){
  text('applause',score);text('coins',coins);
  updateMeter(byId('tour-meter'),score,goalScore);
  for(const [el,kind] of [[byId('applause'),'applause'],[byId('coins'),'coin']]){
    if(!changes.some(change=>change.kind===kind))continue;
    el.classList.remove('balance-bump');
    void el.offsetWidth;
    el.classList.add('balance-bump');
  }
}
function payout(reward){
  const result=[];
  if(reward.score)result.push({kind:'applause',amount:reward.score});
  if(reward.coins)result.push({kind:'coin',amount:reward.coins});
  return result;
}
function rewardLabel(event,paid=false){
  const label=byId('event-reward');
  label.dataset.paid=String(paid);
  label.replaceChildren(paid?'已领取':'幕末奖励',changesLine(payout({score:event.bonus,coins:event.coin})));
}
function forecastSlots(steps=[],settled=false){
  const cue=byId('forecast');
  cue.replaceChildren();
  for(const [i,position] of slots.entries()){
    const step=steps.find(item=>item.i===i);
    const displayed=step?.id??state.lineup[i];
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
    if(step)row.append(changesLine(step.changes));
    else{
      const note=document.createElement('small');
      note.className='forecast-empty';
      note.textContent=displayed&&settled?'已演':'空位';
      row.append(note);
    }
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
  stage.dataset.selected=Boolean(selected);
  text('location',e.place);
  text('phase',playing?'演出中':state.finished?'已谢幕':state.ready?'本幕落定':'排演中');
  text('act-number','第'+cn[state.act]+'幕 / 五幕');
  byId('act-track').innerHTML=Array.from({length:5},(_,i)=>'<span class="'+(i===state.act?'current':i<state.act?'done':'')+'"></span>').join('');
  text('event-title',e.name);
  text('event-goal',e.goal);
  rewardLabel(e);
  balances(state.applause,state.coins);
  text('score-target',' / '+goalScore);
  text('hand-hint',canEdit()?(selected?'已选 '+cards[selected].name+'，请选择站位':'点选或拖动木偶，安排上场'):'');
  byId('recruit').disabled=playing;
  const b=byId('perform');
  b.disabled=playing||(!state.ready&&!state.finished&&state.lineup.every(id=>!id));
  b.textContent=state.finished?'再开一局':state.ready?'下一幕':playing?'锣声已响':'击鼓开戏';
  slotButtons.forEach((button,i)=>{
    const id=state.lineup[i];
    button.disabled=!canEdit();
    button.setAttribute('aria-current',String(current===i));
    button.setAttribute('aria-label',slots[i]+'，'+(id?cards[id].name+'。'+(selected?'放置选中的木偶':'点按撤下'):'空位'));
    button.innerHTML='<b>'+slots[i]+'</b>'+(id?cards[id].name:'＋');
  });
  for(const [id,button] of filterButtons){
    button.disabled=playing;
    button.setAttribute('aria-pressed',String(filter===id));
  }
  const visible=state.owned.filter(id=>filter==='all'||cards[id].style===filter);
  if(hand.children.length!==visible.length||visible.some((id,i)=>hand.children[i]!==cardButtons.get(id))){
    hand.replaceChildren(...visible.map(id=>cardButtons.get(id)||makeCard(id)));
  }
  for(const id of visible){
    const button=cardButtons.get(id);
    const slot=state.lineup.indexOf(id);
    button.disabled=!canEdit();button.draggable=canEdit();
    button.dataset.inPlay=slot!==-1;
    button.dataset.slot=slot!==-1?slots[slot]:'';
    button.setAttribute('aria-pressed',String(selected===id));
    button.setAttribute('aria-label',cards[id].name+'。'+cards[id].text+(slot!==-1?' 已在'+slots[slot]+'。':''));
  }
  const forecast=scoreAct(state.lineup,state.stock,e);
  syncTokens(state.stock,(state.ready||state.finished)?state.history.at(-1)?.beat??0:0);
  if(state.ready||state.finished){
    const last=state.history.at(-1);
    const verdict=last.hit?'目标达成':'目标未达成';
    if(last.progress)goalStatus(last.progress,last.progress,last.hit);
    else{
      goalStatus(forecast.start,forecast.start,last.hit);
      updateMeter(byId('act-meter'),last.hit?100:0,100);
      text('goal-detail','本幕沿用上一版本的结算。');
    }
    rewardLabel(e,last.hit);
    text('cue-title','本幕结算');
    text('forecast-summary','+'+last.score+' 喝彩 · +'+last.coins+' 赏钱');
    forecastSlots(last.steps,true);
    if(state.finished)text('caption',state.applause>=goalScore?'满堂彩 · '+state.applause+' 喝彩':'巡演谢幕 · '+state.applause+' / '+goalScore+' 喝彩');
    else text('caption',verdict+' · '+last.score+' 喝彩');
    return;
  }
  if(!playing)text('caption','');
  goalStatus(forecast.start,forecast.progress);
  text('cue-title',playing?'逐位结算':'排演预估');
  text('forecast-summary',playing?'本幕 +0 喝彩':forecast.steps.length?'预计 +'+forecast.score+' 喝彩':'先安排木偶');
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
      lamp:[329,493,659],beat:[149,202],coin:[740,987],applause:[393,523],tap:[290],
    };
    const pitches=cues[kind]??cues.tap;
    pitches.forEach((pitch,i)=>{
      const tone=audio.createOscillator(),volume=audio.createGain();
      const time=start+i*.075;
      tone.type=kind==='gong'?'triangle':'sine';
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

async function perform(){
  if(playing)return;
  if(state.finished){
    state=initial();selected=null;filter='all';persist();update();return;
  }
  if(state.ready){
    state.act++;
    state.ready=false;
    persist();update();return;
  }
  if(state.lineup.every(id=>!id))return;
  const e=event();
  const result=scoreAct(state.lineup,state.stock,e);
  playing=true;selected=null;update();sound('gong');
  const theatreBounds=theatre.getBoundingClientRect();
  if(theatreBounds.top<0){
    theatre.scrollIntoView({block:'start',behavior:reduced?'instant':'smooth'});
  }
  const target=kind=>kind==='applause'?byId('applause'):kind==='coin'?byId('coins'):byId('token-'+kind);
  effects.show('锣响 · 开戏',[]);
  text('caption','锣响，开戏');
  await delay(560);
  for(const step of result.steps){
    current=step.i;
    highlightSlot(current);
    const summary=step.changes.map(({kind,amount})=>(amount>0?'+':'−')+Math.abs(amount)+' '+effectName(kind)).join(' · ');
    text('caption',cards[step.id].name+' · '+(summary||'无变化'));
    const kind=step.changes.find(change=>change.amount>0)?.kind??'applause';
    effects.show(cards[step.id].name,step.changes,slotButtons[current]);
    scene.accent(current,kind);
    sound(kind);
    await delay(230);
    effects.fly(step.changes,target);
    syncTokens(step.stock,step.beat,step.changes);
    await delay(470);
    balances(state.applause+step.points,state.coins+step.coins,step.changes);
    text('forecast-summary','本幕 +'+step.points+' 喝彩');
    goalStatus(step.objectives);
    await delay(330);
  }
  highlightSlot(-1);
  const lastStep=result.steps.at(-1);
  const reward=payout(result.reward);
  if(result.hit){
    effects.show('戏帖达成 · 赏',reward,null,true);
    scene.accent(-1,'applause');sound('win');
    await delay(280);
    effects.fly(reward,target);
    await delay(470);
    balances(state.applause+result.score,state.coins+result.coins,reward);
    text('forecast-summary','本幕 +'+result.score+' 喝彩');
    goalStatus(result.progress,result.progress,true);
    rewardLabel(e,true);
    text('caption','戏帖奖励 · +'+result.reward.score+' 喝彩'+(result.reward.coins?' · +'+result.reward.coins+' 赏钱':''));
    await delay(530);
  }else{
    effects.show('本幕目标未达成',[]);
    goalStatus(result.progress,result.progress,false);
    await delay(520);
  }
  state.stock=result.stock;state.coins+=result.coins;state.applause+=result.score;
  state.history.push({event:e.name,location:e.place,hit:result.hit,score:result.score,coins:result.coins,
    lineup:state.lineup.filter(Boolean).map(id=>cards[id].name),progress:result.progress,beat:lastStep.beat,
    steps:result.steps.map(({i,id,changes})=>({i,id,changes}))});
  current=-1;playing=false;state.finished=state.act===4;state.ready=!state.finished;
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
}
function modalContent(type){
  dialogBody.replaceChildren();
  if(type==='help'){
    text('dialog-title','怎样排一台戏');
    row('看戏帖，排站位','每幕先看目标。选中候场木偶再点站位，也可以拖放。点击台上站位可撤下木偶。已有木偶可以用原站位和目标站位互换。');
    const legend=row('读能力图标','+ 表示获得，− 表示消耗。箭头左边是代价，右边是产出。触发条件写在对应一行。');
    const keyLine=document.createElement('div');keyLine.className='goal-detail';
    for(const kind of [...stockKinds,'beat','coin','applause']){
      const item=document.createElement('span');item.className='goal-chip';item.append(icon(kind),effectName(kind));keyLine.append(item);
    }
    legend.append(keyLine);
    row('按站位结算','击鼓后，从开场、过场到收场依次触发。目标条的斜纹是排演预估，实色随表演逐步填入。并列条件需要同时满足，「或」两边任选一条。');
    row('道具留台，锣点随幕重置','花、蝶、灯都会跨幕保留，每种最多 8 个。锣点只在当幕使用。戏帖里的「本幕锣点」统计打出过的总数，后续消耗不扣目标进度。');
    row('招募，选择巡演路线','从戏箱可以读到每只木偶的能力全文，排演时可用赏钱招募。第三幕前可从巡演图改去青石集或栖云庙。');
    row('五幕谢幕','演满五幕并累计至少 '+goalScore+' 喝彩，即可收获满堂彩。每幕后保留站位，可以直接沿用或重新调度。');
  } else if(type==='recruit'){
    text('dialog-title','戏箱 · 招募木偶');
    row('赏钱 '+state.coins+' 枚 · 已收集 '+state.owned.length+'/15','招募后木偶会留在本局候场名单里。');
    for(const [styleId,style] of Object.entries(styles)){
      row(style.name,style.summary);
      const grid=document.createElement('div');grid.className='recruit-grid';
      for(const card of Object.values(cards).filter(card=>card.style===styleId)){
        const owned=state.owned.includes(card.id);
        const item=row(card.name+' · '+card.role,card.text);
        item.querySelector('p').className='card-summary';
        item.prepend(cardRules(card));
        if(owned){
          const status=document.createElement('small');
          status.textContent='已入戏箱';item.append(status);
        } else {
          smallButton(item,'用 '+card.cost+' 赏钱招募',()=>{
            if(!canEdit()||state.owned.includes(card.id)||state.coins<card.cost)return;
            const position=dialog.scrollTop;
            state.owned.push(card.id);state.coins-=card.cost;
            filter='all';persist();update();modalContent(type);dialog.scrollTop=position;sound('coin');
          },!canEdit()||state.coins<card.cost);
        }
        grid.append(item);
      }
      dialogBody.append(grid);
    }
  } else if(type==='tour'){
    text('dialog-title','巡演图');
    const editable=!playing&&state.act<2;
    for(const [i,id] of route(state.branch).entries()){
      const e=events[id];
      const status=i<state.act||i===state.act&&(state.ready||state.finished)?' · 已演':i===state.act?' · 今幕':'';
      const item=row('第'+cn[i]+'幕 · '+e.place+status,e.name+'。'+e.story+' '+e.goal);
      if(i===2){
        const other=id==='market'?'shrine':'market';
        smallButton(item,'改走'+events[other].place,()=>{
          if(state.act>=2||playing)return;
          state.branch=other;persist();update();modalContent(type);
        },!editable);
      }
    }
  } else if(type==='summary'){
    const win=state.applause>=goalScore;
    text('dialog-title',win?'满堂彩':'巡演谢幕');
    row(state.applause+' 喝彩 / 目标 '+goalScore,win?'五幕已毕，观众仍留在台下叫好。':'五幕已毕，观众还想看一出更热闹的戏。');
    for(const [i,last] of state.history.entries())row('第'+cn[i]+'幕 · '+last.event,last.lineup.join('、')+' · '+last.score+' 喝彩');
    smallButton(dialogBody,'再开一局',()=>{dialog.close();void perform();});
  } else {
    text('dialog-title','演出记录');
    if(!state.history.length)row('还未开戏','完成一幕，便可在这里回看阵容和得分。');
    for(const [i,last] of state.history.entries())row('第'+cn[i]+'幕 · '+last.event,
      last.lineup.join('、')+' · '+(last.hit?'目标达成':'目标未达成')+' · '+last.score+' 喝彩 · '+last.coins+' 赏钱');
  }
}
function openModal(type){
  dialog.dataset.type=type;
  modalContent(type);
  if(!dialog.open)dialog.showModal();
}
for(const id of ['tour','help','recruit','log'])click(id,()=>openModal(id));
click('close',()=>dialog.close());
dialog.addEventListener('click',e=>{
  if(e.target!==dialog)return;
  const bounds=dialog.getBoundingClientRect();
  if(e.clientX<bounds.left||e.clientX>bounds.right||e.clientY<bounds.top||e.clientY>bounds.bottom)dialog.close();
});
update();
