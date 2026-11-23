// 剧情戏台 —— 主线桥段玩法（v5）。
// 底层复用 rules.js 的 scoreAct（数值结算引擎）与 stage.js 的三维舞台。
// 幕类型：
//   performance —— 纯演出幕：给定阵容自动登台，台本逐句播放（点击推进）。
//   puzzle      —— 排戏幕：数值目标 + 要素条件（遇仙），或分支判定 judge（风雪归人）。
// 分支判定 judge：true（真实版本）/ official（官方版本·有意义的错版）/ flop（演砸+定向提示）。
// 体验流程：敲锣开场（仪式）→ 演出幕/排戏幕 → [剪影峰值] → 散场戏簿。
import { applauseUnit, cards, nextBoard, scoreAct, slots } from './rules.js?v=10';
import { scenarios, typeLabels, cueNames, backdropNames, gauzeNames, venueOf } from './scenarios.js?v=3';
import { createStage } from './stage.js?v=10';
import { cardRules, effectName, feedback, icon, updateMeter } from './presentation.js?v=6';

const byId=id=>document.getElementById(id);
const stage=byId('stage'), hand=byId('hand'), dialog=byId('dialog'), dialogBody=byId('dialog-body');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cn=['一','二','三','四'];
const effects=feedback(stage,byId('stage-effects'));
const BOOK_KEY='dengxia-books';

let scenario=null, state=null, selected=null, playing=false, current=-1, muted=true, audio=null;
let skipNarration=false, narrationPhase=false, advanceResolve=null, ceremonyOn=false, gongN=0;
let lastResult=null, seenOfficial=false, tries=0, backdrop=null, gauze='none', transient=null;

function bookSet(){
  try { return new Set(JSON.parse(localStorage.getItem(BOOK_KEY))??[]); } catch { return new Set(); }
}
function hasBook(id){ return bookSet().has(id); }
function markBook(id){
  const s=bookSet(); s.add(id);
  try { localStorage.setItem(BOOK_KEY, JSON.stringify([...s])); } catch {}
}

function freshStory(){
  return {act:0,branch:'market',applause:0,coins:0,board:{flowers:[],fireworks:[],pots:[],butterflies:[],audience:0,lamps:[]},
    lineup:[null,null,null],choices:{},history:[],finished:false};
}

const act=()=>scenario.acts[state.act];
const unit=()=>scenario.acts.some(a=>a.name.includes('折'))?'折':'幕';
const canEdit=()=>!playing&&!state.finished&&!ceremonyOn&&act().type!=='performance';
const cast=()=>state.lineup;
// 光环系统（统一规则）：布景/纱幕自带光环，加成作用于「对路的角色或生成物」。
// 配对 → 数值足够；不配对 → 自然凑不够目标。判定只有「数值 ≥ 目标」一条。
function auraValue(aura,board){
  const fx=aura.effect;
  if(fx.target==='resource'){
    const res=board[fx.type+'s']??board[fx.type]??[];
    return (Array.isArray(res)?res.length:res)*fx.per;
  }
  if(fx.target==='card')return state.lineup.filter(id=>id===fx.id).length*fx.per;
  if(fx.target==='prop')return state.lineup.filter(id=>cards[id]?.prop===fx.prop).length*fx.per;
  return 0;
}
function actMods(board){
  let total=0;
  for(const aura of act().auras??[]){
    const sel=aura.kind==='backdrop'?backdrop:gauze;
    if(sel!==aura.id)continue;
    total+=auraValue(aura,board);
  }
  return total;
}
const forecastAct=()=>scoreAct({...state,lineup:cast(),choices:state.lineup.map(id=>state.choices[id])},cards,actMods);
const text=(id,value)=>{byId(id).textContent=value;};
const delay=time=>new Promise(resolve=>setTimeout(resolve,reduced?Math.min(260,time):time));
const click=(id,fn)=>byId(id).addEventListener('click',fn);
const nameOf=id=>cards[id]?.name??id;

// —— 推进控制（玩家掌控台本节奏） ——
function waitAdvance(){
  if(reduced)return delay(700);
  return new Promise(resolve=>{advanceResolve=resolve;});
}
function doAdvance(){
  if(advanceResolve){const r=advanceResolve;advanceResolve=null;r();}
}
function doSkip(){ skipNarration=true; doAdvance(); }

// —— 补间（剪影行走用） ——
function tween(fn,from,to,dur){
  return new Promise(resolve=>{
    const t0=performance.now();
    const step=now=>{
      const k=Math.min(1,(now-t0)/dur);
      fn(from+(to-from)*k);
      if(k<1)requestAnimationFrame(step);else resolve();
    };
    requestAnimationFrame(step);
  });
}

function applyActSetup(){
  const a=act();
  state.lineup=[null,null,null];
  if(a.type==='performance'&&a.cast)a.cast.forEach((id,i)=>{state.lineup[i]=id;});
  if(a.type==='puzzle'&&a.locked)a.locked.forEach(({slot,id})=>{state.lineup[slot]=id;});
  backdrop=a.backdrops?null:null;
  gauze=a.gauzes?(a.gauzes.includes('none')?'none':(a.gauzes[0]??'none')):'none';
  lastResult=null;
  tries=0;
  transient=null;
}

function startScenario(s){
  scenario=s;
  state=freshStory();
  seenOfficial=false;
  selected=null;
  applyActSetup();
  update();
  startCeremony();
}

// —— 敲锣开场仪式 ——
function setCeremonyLamps(n){
  Array.from(byId('ceremony').querySelectorAll('.cer-lamps i')).forEach((lamp,i)=>lamp.classList.toggle('lit',i<n));
}
function startCeremony(){
  ceremonyOn=true;
  gongN=0;
  setCeremonyLamps(0);
  byId('ceremony').hidden=false;
  byId('gong-btn').hidden=false;
  byId('cer-poem').hidden=true;
  byId('cer-hint').hidden=false;
  scene.mood?.(0.9);
  update();
}
function endCeremony(){
  ceremonyOn=false;
  byId('ceremony').hidden=true;
  scene.mood?.(0);
  update();
  text('announcement',scenario.title+' · 开锣');
}
click('gong-btn',()=>{
  if(!ceremonyOn||gongN>=3)return;
  gongN++;
  setCeremonyLamps(gongN);
  sound('gong');
  if(gongN===3){
    byId('gong-btn').hidden=true;
    byId('cer-hint').hidden=true;
    const op=scenario.opening??{title:scenario.title,poem:[],from:''};
    text('cer-title',op.title);
    text('cer-lines',(op.poem??[]).join('\n'));
    text('cer-from',op.from??'');
    byId('cer-poem').hidden=false;
  }
});
click('cer-start',()=>endCeremony());

// —— 声音 ——
function sound(kind){
  if(muted)return;
  const Context=window.AudioContext||window.webkitAudioContext;
  if(!Context)return;
  try{
    audio ||= new Context();
    if(audio.state==='suspended')void audio.resume().catch(()=>{});
    const start=audio.currentTime;
    const cues={win:[329.6,392,523.25,659.25],gong:[107,167],applause:[393,523],tap:[290],flop:[220,180,150]};
    const pitches=cues[kind]??cues.tap;
    pitches.forEach((pitch,i)=>{
      const tone=audio.createOscillator(),volume=audio.createGain();
      const time=start+i*.075;
      tone.type=kind==='gong'?'triangle':'sine';
      tone.frequency.setValueAtTime(pitch,time);
      tone.frequency.exponentialRampToValueAtTime(pitch*.77,time+.21);
      volume.gain.setValueAtTime(.001,time);
      volume.gain.exponentialRampToValueAtTime(kind==='gong'?.2:.07,time+.013);
      volume.gain.exponentialRampToValueAtTime(.001,time+.28);
      tone.connect(volume);volume.connect(audio.destination);
      tone.start(time);tone.stop(time+.29);
    });
  }catch{}
}
click('sound',()=>{
  muted=!muted;
  byId('sound').setAttribute('aria-pressed',String(!muted));
  text('sound',muted?'声音关':'声音开');
  sound('tap');
});

// —— 站位 ——
const slotButtons=slots.map((name,i)=>{
  const button=document.createElement('button');
  button.className='slot';button.type='button';
  button.addEventListener('click',()=>place(i,selected));
  byId('slots').append(button);
  return button;
});

// —— 舞台 ——
let scene;
try{
  scene=createStage(byId('world'),slotButtons,cards);
}catch(error){
  byId('graphics-warning').hidden=false;
  console.warn('舞台改用简化模式',error);
  const fallback=document.createElement('div');
  fallback.className='fallback-stage';
  fallback.innerHTML='<div class="fallback-sign">聽春臺</div><div class="fallback-figures"></div>';
  byId('world').append(fallback);
  const figures=fallback.querySelector('.fallback-figures');
  scene={portraits:{},
    sync(ids){
      figures.replaceChildren(...ids.map(id=>{
        const figure=document.createElement('span');
        figure.textContent=id?nameOf(id)[0]:'◇';
        if(id)figure.style.backgroundColor='#'+cards[id].color.toString(16);
        return figure;
      }));
    },
    highlight(i){Array.from(figures.children).forEach((el,index)=>el.classList.toggle('active',i===index));},
    accent(){},
    mood(){},
    glow(){},
    zoom(){},
    actors(){return [null,null,null];},
  };
}

function place(i,id){
  if(!canEdit())return;
  const a=act();
  if(id!==null&&a.maxPuppets){
    const onStage=state.lineup.filter(Boolean).length;
    const moving=state.lineup.includes(id);
    if(!moving&&onStage>=a.maxPuppets){
      text('announcement','这台戏只容 '+a.maxPuppets+' 只偶，先撤下一只。');
      return;
    }
  }
  if(a.locked?.some(l=>l.slot===i)){
    text('announcement',nameOf(state.lineup[i])+'已锁定在'+slots[i]);
    return;
  }
  lastResult=null;transient=null;
  const existing=state.lineup[i];
  if(id===null){
    if(existing===null)return;
    state.lineup[i]=null;
    text('announcement',nameOf(existing)+'已撤下');
  }else{
    const origin=state.lineup.indexOf(id);
    if(origin!==-1&&origin!==i)state.lineup[origin]=existing;
    state.lineup[i]=id;
    text('announcement',nameOf(id)+'，'+slots[i]);
    sound('tap');
  }
  selected=null;
  update();
}
function select(id){
  if(!canEdit())return;
  selected=selected===id?null:id;
  text('announcement',selected!==null?'已选中'+nameOf(id)+'。选择一个站位。':'已取消选择');
  update();
}

// —— 手牌 ——
const cardButtons=new Map();
function makeCard(id,locked=false){
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
  info.innerHTML='<span class="card-name">'+card.name+'<small>'+(locked?'已在台上 · 锁定':card.role)+'</small></span>';
  info.append(cardRules(card));
  button.title='上台即得 '+card.base+' 喝彩。'+card.text;
  button.append(info);
  if(!locked)button.addEventListener('click',()=>select(id));
  cardButtons.set(id,button);
  return button;
}

// —— 台上资源 ——
function syncTokens(board,changes=[]){
  const container=byId('tokens');
  const bloom=board.flowers.filter(flower=>flower.age===1).length;
  const labels={
    flower:'花 · 初绽 '+(board.flowers.length-bloom)+' / 盛开 '+bloom,
    lamp:'灯 '+(board.lamps?.length??0),
    audience:'观众 '+board.audience,
    butterfly:'蝶 '+board.butterflies.length,
  };
  container.replaceChildren();
  for(const [kind,label] of Object.entries(labels)){
    const item=document.createElement('span');
    item.className='token';item.id='token-'+kind;
    item.append(icon(kind),label);
    if(changes.some(change=>change.kind===kind||kind==='flower'&&['bloom','protect'].includes(change.kind))){
      item.dataset.flash='true';
    }
    container.append(item);
  }
  const a=act();
  const venue=a.type==='puzzle'&&a.judge?venueOf(backdrop):a.place;
  scene.sync(cast(),board,selected!==null,venue,changes.length>0);
}

// —— 飘雪（前景纱幕效果） ——
const snowFx=byId('snow-fx');
const snowCtx=snowFx.getContext('2d');
const flakes=Array.from({length:130},()=>({x:Math.random(),y:Math.random(),r:1+Math.random()*2.2,v:.0035+Math.random()*.007,w:Math.random()*Math.PI*2}));
function sizeSnow(){
  const rect=stage.getBoundingClientRect();
  snowFx.width=Math.max(1,rect.width);
  snowFx.height=Math.max(1,rect.height);
}
new ResizeObserver(sizeSnow).observe(stage);
sizeSnow();
(function snowLoop(){
  if(gauze==='snow'&&!ceremonyOn&&state&&!state.finished){
    snowFx.style.opacity='1';
    const W=snowFx.width,H=snowFx.height;
    snowCtx.clearRect(0,0,W,H);
    snowCtx.fillStyle='rgba(255,255,255,.85)';
    for(const f of flakes){
      f.y+=f.v;
      f.x+=Math.sin(f.y*60+f.w)*.0006;
      if(f.y>1){f.y=-.02;f.x=Math.random();}
      snowCtx.beginPath();
      snowCtx.arc(f.x*W,f.y*H,f.r,0,7);
      snowCtx.fill();
    }
  }else{
    snowFx.style.opacity='0';
  }
  requestAnimationFrame(snowLoop);
})();

// —— 判定 ——
function produceTotal(steps,type){
  return steps.reduce((sum,step)=>sum+step.changes.reduce((s,change)=>{
    if(change.amount<=0)return s;
    if(change.kind===type)return s+change.amount;
    if(type==='flower'&&['bloom','protect'].includes(change.kind))return s+change.amount;
    return s;
  },0),0);
}
function legacyConditions(lineup,steps){
  return act().requires.map(req=>{
    if(req.kind==='cast'){
      const ok=lineup.includes(req.id);
      return {kind:'slot',label:'木偶 · '+nameOf(req.id)+' 登场',ok};
    }
    const value=produceTotal(steps,req.type);
    return {kind:req.type,label:'产出 · '+typeLabels[req.type]+' 至少 '+req.n,ok:value>=req.n};
  });
}
function auraLabel(aura){
  const fx=aura.effect;
  if(fx.target==='resource')return (typeLabels[fx.type]??fx.type)+' +'+fx.per;
  if(fx.target==='card')return nameOf(fx.id)+' +'+fx.per;
  if(fx.target==='prop')return ({lamp:'持灯'}[fx.prop]??fx.prop)+' +'+fx.per;
  return '';
}
function judgeChips(points,target,board){
  const j=act().judge, w=j.true.when, chips=[];
  if(act().auras?.some(x=>x.kind==='backdrop')){
    const ba=act().auras.find(x=>x.kind==='backdrop'&&x.id===backdrop);
    chips.push({label:'幕布 · '+(backdrop===null?'未挂':(backdropNames[backdrop]??backdrop))+(ba?'（'+auraLabel(ba)+'）':'（无光环）'),hit:'info',counter:ba?'+'+auraValue(ba,board)*applauseUnit:'0'});
  }
  if(act().auras?.some(x=>x.kind==='gauze')){
    const ga=act().auras.find(x=>x.kind==='gauze'&&x.id===gauze);
    chips.push({label:'纱幕 · '+gauzeNames[gauze]+(ga?'（'+auraLabel(ga)+'）':'（无光环）'),hit:'info',counter:ga?'+'+auraValue(ga,board)*applauseUnit:'0'});
  }
  if(act().maxPuppets)chips.push({kind:'slot',label:'本折只容 '+act().maxPuppets+' 只偶',ok:state.lineup.filter(Boolean).length<=act().maxPuppets,counter:state.lineup.filter(Boolean).length+'/'+act().maxPuppets});
  if('slot3' in w)chips.push({kind:'slot',label:'站位三 · '+nameOf(w.slot3),ok:state.lineup[2]===w.slot3});
  chips.push({kind:'applause',label:'本幕喝彩',ok:points>=target,counter:Math.min(points,target)+'/'+target});
  return chips;
}
function goalDetail(chips){
  const host=byId('goal-detail');
  host.replaceChildren();
  for(const c of chips){
    const badge=document.createElement('span');
    badge.className='goal-chip';badge.dataset.hit=c.hit??String(c.ok);
    const counter=document.createElement('b');counter.textContent=c.counter??(c.ok?'✓':'○');
    if(c.kind)badge.append(icon(c.kind));
    badge.append(counter,c.label);
    host.append(badge);
  }
}
function matchWhen(when){
  if(when.backdrop!==undefined){
    if(when.backdrop===null){if(backdrop!==null)return false;}
    else if(String(when.backdrop).startsWith('!')){if(backdrop===String(when.backdrop).slice(1))return false;}
    else if(backdrop!==when.backdrop)return false;
  }
  if(when.gauze!==undefined){
    if(String(when.gauze).startsWith('!')){if(gauze===String(when.gauze).slice(1))return false;}
    else if(gauze!==when.gauze)return false;
  }
  const slotOf=key=>{
    const v=when[key];
    if(v===undefined)return true;
    const slotIndex=key==='slot2'?1:2;
    if(v==='empty')return state.lineup[slotIndex]===null;
    if(v==='!empty')return state.lineup[slotIndex]!==null;
    return state.lineup[slotIndex]===v;
  };
  if(!slotOf('slot2'))return false;
  if(!slotOf('slot3'))return false;
  return true;
}
function auraFlopLine(board,points){
  const target=act().target;
  const auras=act().auras??[];
  // 单个未挂的光环就够 → 直接推荐它
  for(const aura of auras){
    const sel=aura.kind==='backdrop'?backdrop:gauze;
    if(sel===aura.id)continue;
    if(points+auraValue(aura,board)*applauseUnit>=target)return aura.note??'还差些喝彩。';
  }
  // 需要幕布+纱幕一起换 → 推荐最佳组合
  const best=kind=>(auras.filter(x=>x.kind===kind&&(kind==='backdrop'?backdrop:gauze)!==x.id)
    .map(x=>({aura:x,v:auraValue(x,board)})).sort((a,b)=>b.v-a.v)[0]??null);
  const bb=best('backdrop'),bg=best('gauze');
  const total=((bb?.v??0)+(bg?.v??0))*applauseUnit;
  if(total>0&&points+total>=target){
    const names=[bb&&('「'+(backdropNames[bb.aura.id]??bb.aura.id)+'」'),bg&&('「'+gauzeNames[bg.aura.id]+'」')].filter(Boolean).join(' + ');
    return '试试 '+names+' 的光环：'+(bb?bb.aura.note:'')+(bg?'；'+bg.aura.note:'');
  }
  return '还差些喝彩——看看哪处布景能帮上台上的木偶。';
}
function resolveOutcome(points,board){
  const a=act(), j=a.judge;
  if(matchWhen(j.true.when)){
    if(points>=a.target)return {outcome:'true',ok:true};
    return {outcome:'flop',line:auraFlopLine(board,points)+'（'+points+'/'+a.target+'）'};
  }
  if(j.official&&matchWhen(j.official.when))return {outcome:'official',ok:false};
  if(state.lineup[2]==='soldier')return {outcome:'flop',line:'雪夜城外，哪来的兵卒？（'+points+'/'+a.target+'）'};
  return {outcome:'flop',line:auraFlopLine(board,points)+'（'+points+'/'+a.target+'）'};
}

// —— 台本 / 旁白（点击推进） ——
function narrationBox(lines,hint=false){
  const host=byId('narration');
  if(hint){
    const p=document.createElement('p');
    p.className='narration-line current narration-hint';
    p.append(lines);
    host.replaceChildren(p);
    host.scrollTop=0;
    return;
  }
  host.replaceChildren(...lines.map(line=>{
    const p=document.createElement('p');
    p.className='narration-line'+(line.current?' current':'');
    const b=document.createElement('b');b.textContent=line.who+'：';
    p.append(b,line.text);
    return p;
  }));
  host.scrollTop=host.scrollHeight; // 固定高度内始终显示最新一句
}
byId('narration').addEventListener('click',()=>{if(narrationPhase)doAdvance();});
click('skip',()=>doSkip());

async function playNarration(lines){
  narrationPhase=true;
  update();
  for(const [index,line] of lines.entries()){
    if(skipNarration){skipNarration=false;break;}
    const speaker=cueNames[line.who]??null;
    const slotIndex=speaker===null?-1:state.lineup.indexOf(speaker);
    highlightSlot(slotIndex);
    if(slotIndex!==-1){
      scene.accent(slotIndex,'applause');
      sound('applause');
    }else sound('gong');
    narrationBox([...lines.slice(0,index).map(item=>({...item,current:false})),{...line,current:true}]);
    text('caption',line.who+'：'+line.text);
    await waitAdvance();
  }
  narrationPhase=false;skipNarration=false;
  highlightSlot(-1);
  update();
}

function highlightSlot(index){
  slotButtons.forEach((button,i)=>button.setAttribute('aria-current',String(i===index)));
  scene.highlight(index);
}

function setChipLabel(kind,id){
  const aura=act().auras?.find(x=>x.kind===kind&&x.id===id);
  const base=id===null?'未挂':(kind==='backdrop'?(backdropNames[id]??id):(gauzeNames[id]??id));
  return base+(aura?' · '+auraLabel(aura):' · 无光环');
}
function setChipNote(kind,id){
  return act().auras?.find(x=>x.kind===kind&&x.id===id)?.note??'';
}
// —— 幕布 / 纱幕选择器（行始终占位，尺寸恒定） ——
function renderSetRow(){
  const host=byId('set-row');
  const a=act();
  const editable=canEdit();
  const hasSet=Boolean(a.backdrops||a.gauzes);
  host.hidden=false;
  host.replaceChildren();
  if(!hasSet){
    const note=document.createElement('span');
    note.className='set-label';
    note.textContent='本幕无布景 · 观戏即可';
    host.append(note);
    return;
  }
  if(a.backdrops){
    const group=document.createElement('div');group.className='set-group';
    const label=document.createElement('span');label.className='set-label';label.textContent='背景幕';
    group.append(label);
    [[null,'未挂'],...a.backdrops.map(id=>[id,backdropNames[id]??id])].forEach(([id])=>{
      const chip=document.createElement('button');chip.type='button';
      chip.className='set-chip'+(backdrop===id?' sel':'');
      chip.textContent=setChipLabel('backdrop',id);
      chip.title=setChipNote('backdrop',id);
      chip.disabled=!editable;
      chip.addEventListener('click',()=>{
        if(!canEdit())return;
        backdrop=id;lastResult=null;transient=null;sound('tap');update();
      });
      group.append(chip);
    });
    host.append(group);
  }
  if(a.gauzes){
    const group=document.createElement('div');group.className='set-group';
    const label=document.createElement('span');label.className='set-label';label.textContent='前景纱幕';
    group.append(label);
    a.gauzes.forEach(id=>{
      const chip=document.createElement('button');chip.type='button';
      chip.className='set-chip'+(gauze===id?' sel':'');
      chip.textContent=setChipLabel('gauze',id);
      chip.title=setChipNote('gauze',id);
      chip.disabled=!editable;
      chip.addEventListener('click',()=>{
        if(!canEdit())return;
        gauze=id;lastResult=null;transient=null;sound('tap');update();
      });
      group.append(chip);
    });
    host.append(group);
  }
}

// —— 更新 ——
function moodValue(){
  if(state.finished)return .55;
  const a=act();
  if(a.dark)return a.dark;
  if(a.gauzes){
    if(gauze==='snow')return .15;
    if(gauze==='moon')return .24;
  }
  return 0;
}
function update(){
  if(!scenario||!state)return;
  const a=act();
  const lineup=cast();
  const isPerf=a.type==='performance';
  const forecast=isPerf?null:(lastResult??forecastAct());
  const points=forecast?forecast.progress[0][0].value:0;
  if(!ceremonyOn)scene.mood?.(moodValue());
  stage.dataset.selected=selected!==null;
  text('location',a.place);
  text('phase',state.finished?'已谢幕':playing?'演出中':isPerf?'演出幕':'排演中');
  text('act-number','第'+cn[state.act]+unit()+' / 共'+scenario.acts.length+unit());
  byId('act-track').innerHTML=Array.from({length:scenario.acts.length},(_,i)=>
    '<span class="'+(i===state.act?'current':i<state.act?'done':'')+'"></span>').join('');
  text('event-title',scenario.title+' · '+a.name);
  text('event-goal',a.hint??'');
  const status=byId('goal-state');
  const meter=byId('act-meter');
  if(isPerf){
    updateMeter(meter,0,1,0);
    status.dataset.hit='false';
    status.textContent='演出幕';
    goalDetail(a.cast?.map(id=>({kind:'slot',label:nameOf(id)+' 登台',ok:true}))??[]);
  }else if(lastResult&&lastResult.judge){
    const out=lastResult.outcome;
    updateMeter(meter,Math.min(points,a.target),a.target,points);
    status.dataset.hit=String(out==='true');
    status.textContent=out==='true'?'✓ 已达成':out==='official'?'官方版本 · 未收戏簿':'演砸了';
    goalDetail(judgeChips(points,a.target,forecast?.board??state.board));
  }else{
    updateMeter(meter,lastResult?points:0,a.target,points);
    status.dataset.hit=String(lastResult?.hit);
    status.textContent=lastResult?(lastResult.hit?'✓ 已达成':'目标未达成'):'预计 '+points+' 喝彩';
    const chips=a.judge?judgeChips(points,a.target,forecast?.board??state.board):
      [{kind:'applause',label:'本幕喝彩',ok:points>=a.target,counter:Math.min(points,a.target)+'/'+a.target},
       ...legacyConditions(lineup,forecast?forecast.steps:[])];
    goalDetail(chips);
  }
  text('applause',state.applause);
  text('hand-hint',canEdit()?(selected!==null?'已选 '+nameOf(selected)+'，请选择站位':'点选木偶，安排上场'):'');
  const b=byId('perform');
  if(playing&&narrationPhase){
    b.disabled=false;
    b.textContent='▶ 下一句';
    byId('skip').classList.remove('off');
  }else{
    b.disabled=playing;
    b.textContent=state.finished?'谢幕 · 重演':playing?'演出中':isPerf?'开演':'击鼓开戏';
    byId('skip').classList.add('off');
  }
  slotButtons.forEach((button,i)=>{
    const id=lineup[i];
    const locked=a.locked?.some(l=>l.slot===i);
    button.disabled=!canEdit()||locked;
    button.setAttribute('aria-current',String(current===i));
    button.setAttribute('aria-label',slots[i]+'，'+(id?nameOf(id)+(locked?'（锁定）':'。'+(selected!==null?'放置选中的木偶':'点按撤下')):'空位'));
    button.innerHTML='<b>'+slots[i]+(locked?' 🔒':'')+'</b>'+(id?nameOf(id):'＋');
  });
  const handIds=isPerf?[]:[...(a.locked?.map(l=>l.id)??[]),...(a.pool??[])];
  const uniqueHand=[...new Set(handIds)];
  if(hand.children.length!==uniqueHand.length||uniqueHand.some((id,i)=>hand.children[i]!==cardButtons.get(id))){
    hand.replaceChildren(...uniqueHand.map(id=>{
      const locked=a.locked?.some(l=>l.id===id)&&lineup.includes(id);
      return cardButtons.get(id)||makeCard(id,locked);
    }));
  }
  for(const id of uniqueHand){
    const button=cardButtons.get(id);
    const locked=a.locked?.some(l=>l.id===id)&&lineup.includes(id);
    button.disabled=!canEdit()||locked;
    button.dataset.inPlay=String(lineup.includes(id));
    button.setAttribute('aria-pressed',String(selected===id));
    button.setAttribute('aria-label',nameOf(id)+'。'+button.title+(lineup.includes(id)?' 已在台上。':''));
  }
  syncTokens(state.board);
  if(!playing&&!state.finished&&!ceremonyOn){
    if(lastResult?.outcome==='flop')narrationBox('班主：'+lastResult.line,true);
    else if(lastResult?.outcome==='official')narrationBox('班主：'+a.judge.branches.official.clue,true);
    else narrationBox((a.hint??'')+' 击鼓开戏后，逐句播放台本。',true);
  }
  if(state.finished)text('caption','全本已成 · 共 '+state.applause+' 喝彩');
  else if(!playing&&transient)text('caption',transient);
  else if(!playing&&!lastResult)text('caption','');
  text('cue-title',isPerf?'本折台本':'本幕台本');
  const first=a.narration[0];
  text('forecast-summary',first?first.who+'：'+first.text+'……'+(a.narration.length>1?'（共 '+a.narration.length+' 句）':''):'');
  renderSetRow();
}

// —— 推进 / 结算 ——
function advance(){
  state.act++;
  state.board=nextBoard(state.board);
  state.choices={};
  applyActSetup();
  update();
}
function finishScenario(){
  state.finished=true;
  playing=false;current=-1;narrationPhase=false;
  markBook(scenario.id);
  const ec=scenario.endCard;
  text('end-title',ec.title);
  text('end-quote',ec.quote);
  text('end-stamp',ec.stamp);
  byId('endCard').hidden=false;
  update();
}
function restartScenario(){
  byId('endCard').hidden=true;
  state=freshStory();
  seenOfficial=false;
  selected=null;
  applyActSetup();
  update();
  startCeremony();
}

async function perform(){
  if(playing){
    if(narrationPhase)doAdvance();
    return;
  }
  if(!scenario||ceremonyOn)return;
  if(state.finished){restartScenario();return;}
  const a=act();
  if(a.type==='performance'){
    playing=true;selected=null;current=-1;update();sound('gong');
    effects.show('锣响 · 开戏',[]);
    text('caption','锣响，开戏');
    await delay(520);
    await playNarration(a.narration);
    playing=false;
    if(state.act===scenario.acts.length-1){
      if(scenario.peak)await startPeak();
      else finishScenario();
    }else{
      advance();
      text('announcement','第'+cn[state.act]+unit()+' · 已就绪');
    }
    return;
  }
  if(state.lineup.every(id=>id===null))return;
  const result=forecastAct();
  const snapshot=JSON.parse(JSON.stringify(state.board));
  const points=result.progress[0][0].value;
  lastResult=null;skipNarration=false;transient=null;
  playing=true;selected=null;current=-1;update();sound('gong');
  effects.show('锣响 · 开戏',[]);
  text('caption','锣响，开戏');
  await delay(520);
  await playNarration(a.narration);
  await delay(260);
  for(const step of result.steps){
    current=step.i;
    highlightSlot(current);
    if(!step.changes.length)continue;
    const title=step.id?cards[step.id].name:step.cue==='mod'?'布景 · 光环':'收场';
    text('caption',title+' · '+step.changes.map(({kind,amount})=>(amount>0?'+':'−')+Math.abs(amount)+' '+effectName(kind)).join(' · '));
    const kind=step.cue??step.changes.find(change=>change.amount>0)?.kind??'applause';
    effects.show(title,step.changes,slotButtons[current],step.i===-1);
    scene.accent(current,kind);
    sound(kind);
    await delay(260);
    syncTokens(step.board,step.changes);
    await delay(430);
    text('applause',state.applause+(step.objectives?.[0]?.[0]?.value??step.baseApplause*applauseUnit));
    await delay(300);
  }
  highlightSlot(-1);
  if(a.judge){
    const outcome=resolveOutcome(points,result.board);
    tries++;
    if(outcome.outcome==='true'){
      await playNarration(a.judge.branches.true.narration);
      effects.show('本幕已成 · 喝彩',[{kind:'applause',amount:points}],null,true);
      scene.accent(-1,'applause');sound('win');
      await delay(520);
      state.board=result.board;
      state.board.audience=0; // 剧情模式不累计观众，保持 ×20 系数一致
      state.applause+=points;
      state.history.push({name:a.name,lineup:state.lineup.filter(Boolean).map(nameOf),points});
      current=-1;playing=false;
      lastResult={judge:true,outcome:'true',points,steps:result.steps,progress:result.progress,board:result.board};
      if(state.act===scenario.acts.length-1)finishScenario();
      else{
        const prev=a.name;
        advance();
        text('announcement',prev+' 已补全 · 第'+cn[state.act]+unit()+'已就绪');
        text('caption','戏本的空页被填上了');
      }
    }else if(outcome.outcome==='official'){
      await playNarration(a.judge.branches.official.narration);
      seenOfficial=true;
      sound('applause');
      await delay(420);
      state.board=snapshot;
      playing=false;
      lastResult={judge:true,outcome:'official',points,steps:result.steps,progress:result.progress,board:result.board};
      transient='官方版本 · 看客喝彩，但戏簿没有记下这一折';
      update();
    }else{
      scene.mood?.(.3);
      effects.show('演砸',[],null,false);
      sound('flop');
      await delay(760);
      state.board=snapshot;
      playing=false;
      lastResult={judge:true,outcome:'flop',points,line:outcome.line,steps:result.steps,progress:result.progress,board:result.board};
      transient='演砸了 · '+outcome.line;
      update();
    }
  }else{
    const conditions=legacyConditions(state.lineup,result.steps);
    const hit=points>=a.target&&conditions.every(c=>c.ok);
    if(hit){
      effects.show('本幕已成 · 喝彩',[{kind:'applause',amount:points}],null,true);
      scene.accent(-1,'applause');sound('win');
      await delay(520);
      state.board=result.board;
      state.board.audience=0; // 剧情模式不累计观众，保持 ×20 系数一致
      state.applause+=points;
      state.history.push({name:a.name,lineup:state.lineup.filter(Boolean).map(nameOf),points});
      current=-1;playing=false;
      lastResult={judge:false,hit:true,points,steps:result.steps,progress:result.progress};
      if(state.act===scenario.acts.length-1)finishScenario();
      else{
        advance();
        text('announcement','第'+cn[state.act]+unit()+' · 已就绪');
        text('caption','台本已换');
      }
    }else{
      await delay(400);
      state.board=snapshot;
      playing=false;
      lastResult={judge:false,hit:false,points,steps:result.steps,progress:result.progress};
      const unmet=conditions.filter(c=>!c.ok).map(c=>c.label);
      const line=points<a.target?'喝彩不足 '+points+'/'+a.target:unmet.join('、');
      transient='未达成 · '+line;
      update();
    }
  }
}
click('perform',()=>void perform());
click('end-again',()=>restartScenario());
click('end-back',()=>{
  byId('endCard').hidden=true;
  openModal('pick');
});

// —— 剪影峰值：拉绳揭后幕 ——
async function startPeak(){
  const peak=scenario.peak;
  playing=true;narrationPhase=false;
  scene.mood?.(.97);
  scene.zoom(1.28);
  scene.sync(['general',null,'granny'],state.board,false,'城门外',true);
  const actors=scene.actors();
  const g=actors[0],gr=actors[2];
  if(g)g.root.position.x=-3.2;
  if(gr)gr.root.position.x=3.55;
  text('caption',peak.prompt);
  await delay(500);
  await playNarration([peak.lines[0]]);
  scene.glow(true);
  sound('gong');
  await delay(400);
  await playNarration([peak.lines[1]]);
  await Promise.all([
    tween(x=>{if(gr)gr.root.position.x=x;},3.55,0.2,2300),
    tween(x=>{if(g)g.root.position.x=x;},-3.2,-1.35,2300),
  ]);
  await delay(300);
  await playNarration([peak.lines[2]]);
  if(gr)gr.root.scale.x=-1;
  await tween(x=>{if(gr)gr.root.position.x=x;},0.2,4.7,2600);
  await delay(300);
  await playNarration([peak.lines[3]]);
  await delay(600);
  scene.glow(false);
  scene.zoom(1);
  playing=false;
  finishScenario();
}

// —— 弹窗 ——
function row(title,description){
  const item=document.createElement('section'), heading=document.createElement('h3'), body=document.createElement('p');
  item.className='dialog-row';heading.textContent=title;body.textContent=description;
  item.append(heading,body);dialogBody.append(item);
  return item;
}
function smallButton(parent,label,action){
  const button=document.createElement('button');
  button.type='button';button.className='small-action';button.textContent=label;
  button.addEventListener('click',action);
  parent.append(button);
  return button;
}
function openModal(type){
  dialogBody.replaceChildren();
  if(type==='pick'){
    const collected=scenarios.filter(s=>hasBook(s.id)).length;
    text('dialog-title','戏单 · 钧州旧事（已收录 '+collected+' / '+scenarios.length+' 本）');
    for(const s of scenarios){
      const item=row(s.title+(s.book?' · '+s.book:''),s.summary+(hasBook(s.id)?' · 已收录，可反复开演':''));
      smallButton(item,'开演',()=>{dialog.close();startScenario(s);});
    }
  }else if(type==='script'){
    if(!scenario){openModal('pick');return;}
    text('dialog-title',scenario.title+' · 台本');
    row('故事概括',scenario.summary);
    for(const a of scenario.acts){
      const lines=a.narration.map(line=>line.who+'：'+line.text).join('\n');
      if(a.judge){
        row(a.name+' · '+a.place,lines+'\n\n【光环】雪原·每盏灯+1 / 城门·仙人+1 / 军帐·兵卒+2；风雪纱·持灯+1 / 月夜纱·仙人+1。目标 140 喝彩（基础 7 × 观众 20）：将军2+老妪2+引灯1+雪原1+风雪纱1 恰好。站位三放仙人 = 官方版本（最多 6/7）。');
      }else row(a.name+' · '+a.place,lines);
    }
    if(scenario.peak)row('后幕',scenario.peak.lines.map(line=>line.who+'：'+line.text).join('\n'));
  }
  dialog.dataset.type=type;
  if(!dialog.open)dialog.showModal();
}
click('script',()=>openModal('script'));
click('close',()=>dialog.close());
dialog.addEventListener('click',e=>{
  if(e.target!==dialog)return;
  const bounds=dialog.getBoundingClientRect();
  if(e.clientX<bounds.left||e.clientX>bounds.right||e.clientY<bounds.top||e.clientY>bounds.bottom)dialog.close();
});

openModal('pick');
update();
