const symbols = {
  flower:['✿','花','#ff9aa7'],butterfly:['⋈','蝴蝶','#ffbd68'],lamp:['','灯盏','#ffd276'],
  beat:['◎','锣点','#d6a6ff'],coin:['●','赏钱','#ffcf78'],applause:['✦','喝彩','#ffe49c'],
  slot:['▣','站位','#ead5a4'],
};
const objectiveKinds = {summoned:'butterfly',earned:'coin',beats:'beat',points:'applause',opening:'slot'};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

export const effectName = kind => symbols[kind][1];
export function icon(kind){
  const span=document.createElement('i');
  span.className='icon';span.dataset.kind=kind;span.ariaHidden='true';
  span.textContent=symbols[kind][0];
  return span;
}
function chip(kind,amount,explicit=true){
  const span=document.createElement('span');
  span.className='effect-chip';
  span.dataset.negative=amount<0;
  const number=(amount>0&&explicit?'+':amount<0?'−':'')+Math.abs(amount);
  span.append(icon(kind),number);
  span.title=number+' '+effectName(kind);
  span.setAttribute('aria-label',span.title);
  return span;
}
export function changesLine(changes){
  const line=document.createElement('span');
  line.className='effects-line';
  for(const {kind,amount} of changes)line.append(chip(kind,amount));
  if(!changes.length)line.textContent='无变化';
  return line;
}
export function cardRules(card){
  const wrapper=document.createElement('span');
  wrapper.className='card-actions';
  wrapper.title=card.text;
  wrapper.ariaHidden='true';
  for(const {grants,when,spends,repeat=1} of card.rules){
    const row=document.createElement('span');
    row.className='rule-line';
    if(when){
      const condition=document.createElement('span');
      condition.className='rule-condition';condition.textContent=when.label;
      row.append(condition);
    }
    for(const {kind,amount} of spends)row.append(chip(kind,-amount));
    if(spends.length){
      const arrow=document.createElement('span');
      arrow.className='exchange';arrow.textContent='→';row.append(arrow);
    }
    for(const {kind,amount} of grants)row.append(chip(kind,amount));
    if(repeat>1){
      const maximum=document.createElement('span');
      maximum.className='rule-condition';maximum.textContent='最多 '+repeat+' 次';row.append(maximum);
    }
    wrapper.append(row);
  }
  return wrapper;
}
export function progressPercent(paths){
  return Math.max(...paths.map(path=>Math.round(100*path.reduce((sum,req)=>sum+Math.min(1,req.value/req.target),0)/path.length)));
}
export function updateMeter(meter,value,maximum,forecast=value){
  const capped=Math.min(value,maximum);
  meter.setAttribute('aria-valuenow',capped);
  meter.setAttribute('aria-valuemax',maximum);
  meter.dataset.hit=String(capped>=maximum);
  meter.querySelector('.meter-fill').style.width=(capped/maximum*100)+'%';
  const projected=meter.querySelector('.meter-forecast');
  if(projected)projected.style.width=(Math.min(forecast,maximum)/maximum*100)+'%';
}
export function goalDetail(container,paths){
  container.replaceChildren();
  for(const [i,path] of paths.entries()){
    if(i)container.append(document.createTextNode(' 或 '));
    const wrap=document.createElement('span');wrap.className='goal-path';
    for(const {kind,label,target,value} of path){
      const badge=document.createElement('span');badge.className='goal-chip';badge.dataset.hit=String(value>=target);
      const counter=document.createElement('b');
      counter.textContent=kind==='opening'?(value?'✓':'○'):Math.min(value,target)+'/'+target;
      badge.append(icon(objectiveKinds[kind]??kind),label,counter);
      wrap.append(badge);
    }
    container.append(wrap);
  }
}
export function feedback(stage,host){
  const center=(element)=>{
    const bounds=element.getBoundingClientRect();
    return {x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2};
  };
  function show(name,changes,anchor,reward=false){
    const bounds=stage.getBoundingClientRect();
    const pos=anchor?center(anchor):{x:bounds.x+bounds.width*.5,y:bounds.y+bounds.height*.44};
    pos.y-=anchor?Math.min(118,bounds.height*.22):0;
    pos.x=Math.min(bounds.right-75,Math.max(bounds.left+75,pos.x));
    const callout=document.createElement('div');
    callout.className='stage-callout';
    if(reward)callout.dataset.kind='reward';
    callout.style.left=(pos.x-bounds.left)+'px';
    callout.style.top=(pos.y-bounds.top)+'px';
    const title=document.createElement('b');
    title.className='callout-name';title.textContent=name;
    callout.append(title);
    if(changes.length)callout.append(changesLine(changes));
    host.replaceChildren(callout);
    if(reduced)return;
    const visible=changes.length?changes.slice(0,5):[{kind:'applause'}];
    for(const [i,change] of visible.entries()){
      const count=reward?8:5;
      for(let n=0;n<count;n++){
        const particle=document.createElement('i');
        const angle=(n/count+0.08*i)*Math.PI*2;
        const length=(reward?95:56)+15*((n+i)%3);
        particle.className='spark';
        particle.style.left=callout.style.left;
        particle.style.top=callout.style.top;
        particle.style.setProperty('--dx',Math.cos(angle)*length+'px');
        particle.style.setProperty('--dy',Math.sin(angle)*length+'px');
        particle.style.setProperty('--spark',symbols[change.kind][2]);
        host.append(particle);
      }
    }
  }
  function fly(changes,targets){
    if(reduced||!host.firstChild)return;
    const from=center(host.firstChild);
    for(const {kind,amount} of changes){
      const target=targets(kind);
      if(!target||amount<0)continue;
      const to=center(target);
      if(to.y<0||to.y>innerHeight)continue;
      const marker=chip(kind,amount);
      marker.classList.add('flight');
      marker.ariaHidden='true';
      marker.style.left=from.x+'px';
      marker.style.top=from.y+'px';
      document.body.append(marker);
      const dx=to.x-from.x,dy=to.y-from.y;
      const animation=marker.animate([
        {transform:'translate(-50%,-50%) scale(.8)',opacity:0},
        {transform:'translate(calc(-50% + '+dx*.3+'px),calc(-50% + '+(dy*.25-32)+'px)) scale(1.12)',opacity:1,offset:.4},
        {transform:'translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px)) scale(.72)',opacity:.75},
      ],{duration:480,easing:'cubic-bezier(.3,.65,.44,1)'});
      animation.finished.then(()=>marker.remove(),()=>marker.remove());
    }
  }
  return {show,fly,clear:()=>host.replaceChildren()};
}
