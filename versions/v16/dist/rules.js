export const applauseUnit=1;
export const goalScore=700;
export const actCount=3;
export const slots=['开场','过场','收场'];
export const tones=[
  {id:'red',name:'朱',glyph:'●',color:'#ed8b7d'},
  {id:'blue',name:'青',glyph:'◆',color:'#86cdd6'},
  {id:'yellow',name:'金',glyph:'▲',color:'#efca79'},
];
export const varieties=['梅','兰','竹','菊'];
export const styles={
  garden:{name:'花蝶',summary:'添花能接赏花和剪花，也能交给下一席引蝶。',glyph:'花',color:0x8e5565},
  fire:{name:'烟花',summary:'每束烟花得 2 基础喝彩。可以本幕齐放，也可以留到下幕。',glyph:'焰',color:0xa85639},
  gardenware:{name:'盆景',summary:'补齐梅兰竹菊，或提前评景、卖盆。',glyph:'景',color:0x667b51},
  circus:{name:'杂耍',summary:'按邻席安排搭档、修正颜色，也能接上其他流派的道具技能。',glyph:'彩',color:0x54698d},
  neutral:{name:'通用',summary:'提供稳定喝彩，或把两派木偶接在一起。',glyph:'偶',color:0x956143},
};
const groups={
  garden:[
    ['florist','采花娘',2,'留下两朵花。','flower'],
    ['tend','护花匠',2,'留一朵花；在收场席留两朵。','flower'],
    ['flowerShow','赏花伶',2,'台上每朵花 +1，最多 +4。','fan'],
    ['snip','剪花客',2,'剪一朵花，+4。','flower'],
    ['lure','引蝶童',2,'留一只蝶；上一席添过花，再留一只。','fan'],
    ['perch','停蝶伶',2,'台上有蝶，+3。','fan'],
    ['peep','观蝶客',2,'放飞三只蝶，+7。','fan'],
    ['herd','赶蝶娘',2,'把最早的一朵花换成两只蝶。','fan'],
  ],
  fire:[
    ['ignite','点火童',1,'点一束烟花，下幕放；谢幕当幕放。','rocket'],
    ['quick','急火童',1,'点一束烟花，本幕放。','rocket'],
    ['fuse','催引匠',2,'将一束下幕烟花提前，+2。','rocket'],
    ['flameSong','伴焰伶',2,'本幕每放一束烟花 +1，最多 +4。','fan'],
    ['double','双响将',2,'本幕放至少两束，+4。','drum'],
    ['paper','纸筒匠',2,'下一席点火后，另留一束到下幕；谢幕不加烟花。','rocket'],
    ['ember','守焰童',2,'收场时若无烟花要放，补点一束到下幕；谢幕当幕放。','rocket'],
    ['seal','封火师',2,'把一束本幕烟花留到下幕，+2；谢幕照常放。','rocket'],
  ],
  gardenware:[
    ['planter','抱盆童',2,'按梅、兰、竹、菊的顺序补一个缺种。','bonsai'],
    ['orchid','送兰侍',2,'缺兰时摆兰；已有兰则 +2。','bonsai'],
    ['exchange','换盆客',2,'按菊、竹、兰、梅的顺序补一个缺种。','bonsai'],
    ['judge','评景先生',2,'台上每种盆景 +1。','fan'],
    ['vendor','卖盆叟',2,'卖掉最早摆上的一盆，+4。','bonsai'],
    ['arrange','理盆童',2,'下一席摆盆后，再补一个缺种。','bonsai'],
    ['four','四雅先生',2,'台上集齐四种盆景，+6。','fan'],
    ['bamboo','青竹侍',2,'缺竹就摆竹；已有竹则改补菊。','bonsai'],
  ],
  circus:[
    ['balls','抛丸童',1,'变为本席色；修成匹配时 +1。','balls'],
    ['rope','翻索客',2,'自动和最能增加匹配的邻席换色；每修成一席 +1。','clapper'],
    ['walker','走绳伶',2,'自己最终匹配时 +2。','clapper'],
    ['tea','卖茶客',2,'上一席若摆盆、引蝶或靠景物得分，留两朵花。','lamp'],
    ['drummer','对鼓童',2,'若下一席和自己同派，两席各 +1。','drum'],
    ['pole','递竿客',2,'开演前若上一席已匹配，调正自己。','clapper'],
    ['mask','变脸生',2,'若有邻席被调成匹配，+2。','fan'],
    ['jester','弄臣',2,'三席来自三个主流派，+4。','drum'],
  ],
  neutral:[
    ['runner','跑堂童',3,'','fan'],
    ['warm','暖场童',2,'调正下一席；修成匹配时 +1。','balls'],
    ['support','捧场伶',2,'站在过场，左右属于不同主流派时 +3。','fan'],
    ['clearer','收台童',2,'收掉一朵花，无花就放飞一只蝶；成功 +3。','clapper'],
    ['sparker','引火小厮',2,'下一席添花后，点一束本幕放的烟花。','rocket'],
    ['bouquet','献花童',2,'上一席摆过盆景，留两朵花。','flower'],
    ['scenery','送景人',2,'上一席留过蝶，补一种缺少的盆景。','bonsai'],
    ['lighter','举灯童',2,'上一席在开演前被调过色，留两只蝶。','lamp'],
  ],
};
export const cards=Object.fromEntries(Object.entries(groups).flatMap(([style,list])=>
  list.map(([id,name,base,notation,prop],i)=>{
    const color=styles[style].color;
    const shade=factor=>[16,8,0].reduce((value,shift)=>value+(Math.round(((color>>shift)&255)*factor)<<shift),0);
    return [id,{id,name,role:styles[style].name,cost:0,base,notation,text:notation,prop,style,tone:tones[i%3].id,
      color,dark:shade(.62),accent:0xe5aa77,back:shade(.57),hat:['buns','cap','wing','buns','wing','crown'][i%6]}];
  })
));

export const storyCards=Object.fromEntries([
  ['woodcutter','樵夫','迷途',0,2,'','风雪里赶路的樵夫。','clapper','applause',0x7d5f45,0x54402e,'cap'],
  ['immortal','仙人','引路',0,2,'','雾中宫殿里的仙家。','fan','applause',0xd9d2c2,0x9d9484,'crown'],
  ['wife','妻子','守门',0,2,'','城门外候着归人的妻子。','flower','applause',0xb0564a,0x7c3a32,'buns'],
  ['general','将军','守城',0,2,'+1{lamp}','拨亮 1 盏灯。','clapper','applause',0x7a2020,0x4d1414,'cap'],
  ['granny','提灯老妪','引灯',0,2,'每{lamp}+1{applause}','每盏灯额外得 1 喝彩，至多 4。','lamp','applause',0x4b5d73,0x333f4e,'buns'],
  ['soldier','兵卒','杂役',0,1,'','随行的杂役兵卒。','fan','applause',0x6b5a3a,0x4a3e28,'cap'],
  ['rain','求雨婆','花卉',0,2,'+1{flower}','留下一朵花。','flower','applause',0x658054,0x3a4930,'cap'],
].map(([id,name,role,cost,base,notation,text,prop,boost,color,dark,hat])=>[
  id,{id,name,role,cost,base,notation,text,prop,boost,style:'story',color,dark,accent:0xe5aa77,back:dark,hat,tone:{woodcutter:'red',immortal:'yellow',wife:'blue',general:'red',granny:'yellow',soldier:'blue',rain:'blue'}[id]},
]));
Object.assign(cards,storyCards);


const act=(name,place,story)=>({name,place,story,goal:'整场 '+goalScore+' 喝彩；本幕自由铺垫。'});
export const events={
  spring:act('春社试台','柳溪村','先搭台，再让演出渐渐热闹起来。'),
  market:act('赶晚集','青石集','摊贩散场，纷纷围来看戏。'),
  shrine:act('庙前说春','栖云庙','香客驻足，等着听旧故事。'),
  finale:act('上元灯会','上元城','满城灯火，最后一幕尽兴演。'),
};
export const route=branch=>['spring',branch,'finale'];
// 保留原调用接口，观众直接推进整数倍率，不维护第二条热度状态。
export const heatPercent=audience=>audience;
// Tour applause uses integer units, with each spectator adding 5% of base.
export const audienceFactor=(audience,mode)=>mode?20+audience:1+audience;

export function fresh(){
  return {act:0,branch:'market',applause:0,applauseUnit,board:{flowers:[],fireworks:[],pots:[],butterflies:[],audience:0},
    started:false,deck:[],copyTones:[],draw:[],hand:[],used:[],lineup:[null,null,null],choices:{},history:[],ready:false,finished:false};
}
export const nextBoard=board=>({...board});
const clone=board=>({flowers:board.flowers.map(f=>({...f})),fireworks:[...board.fireworks],pots:[...board.pots],
  butterflies:[...board.butterflies],audience:board.audience,lamps:[...(board.lamps??[])]});
const sceneryScorers=new Set(['flowerShow','snip','orchid','judge','vendor','four','perch','peep','clearer']);

export function scoreAct(state,index=cards,mods=null){
  const openSlots=state.openSlots??[0,1,2];
  if(state.lineup.length!==3||state.lineup.some((id,i)=>id&&(!index[id]||!openSlots.includes(i)))||
    state.lineup.filter(Boolean).length>(state.maxPuppets??3))throw new RangeError('阵容超过本幕开放席位或人数。');
  const board=clone(state.board), steps=[], effectiveTones=state.lineup.map((id,i)=>id?(state.lineupTones?.[i]??index[id]?.tone??null):null);
  const matched=()=>effectiveTones.map((tone,i)=>Boolean(state.lineup[i])&&tone===tones[i].id);
  let points=0, settledPoints;
  const objectives=()=>[[{kind:'points',target:goalScore,label:'本幕喝彩',value:settledPoints??points}]];
  const start=objectives();
  const snapshot=extra=>({...extra,board:clone(board),baseApplause:points,objectives:objectives()});
  // 调色仅改变本幕有效颜色。先从开场到收场调色，再执行技能与招客。
  const tuningGains=[0,0,0];
  for(const [i,id] of state.lineup.entries()){
    if(!['balls','rope','warm','pole'].includes(id))continue;
    const before=[...effectiveTones];
    const previousMatches=matched().filter(Boolean).length;
    if(id==='balls')effectiveTones[i]=tones[i].id;
    if(id==='warm'&&state.lineup[i+1])effectiveTones[i+1]=tones[i+1].id;
    if(id==='pole'&&matched()[i-1])effectiveTones[i]=tones[i].id;
    if(id==='rope'){
      const current=matched().filter(Boolean).length;
      let best=current, swap=null;
      for(const j of [i-1,i+1].filter(j=>j>=0&&j<3&&state.lineup[j])){
        [effectiveTones[i],effectiveTones[j]]=[effectiveTones[j],effectiveTones[i]];
        const count=matched().filter(Boolean).length;
        if(count>best){best=count;swap=j;}
        [effectiveTones[i],effectiveTones[j]]=[effectiveTones[j],effectiveTones[i]];
      }
      if(swap!==null)[effectiveTones[i],effectiveTones[swap]]=[effectiveTones[swap],effectiveTones[i]];
    }
    tuningGains[i]=matched().filter(Boolean).length-previousMatches;
    const changed=effectiveTones.filter((tone,j)=>tone!==before[j]).length;
    if(changed)steps.push(snapshot({id,i,phase:'pre',changes:[{kind:'tune',amount:changed}],effectiveTones:[...effectiveTones]}));
  }
  const matches=matched(), audienceGain=matches.filter(Boolean).length;
  const changedTone=effectiveTones.map((tone,i)=>tone!==
    (state.lineupTones?.[i]??index[state.lineup[i]]?.tone??null));
  const settledLater=[], seatChanges=[], scoredScenery=[];
  const nextAct=Math.min(state.act+1,(state.totalActs??actCount)-1);
  for(const [i,id] of state.lineup.entries()){
    if(!id)continue;
    const card=index[id], changes=[], props=[];
    const previous=state.lineup[i-1], next=state.lineup[i+1];
    let applause=card.base+(previous==='drummer'&&card.style==='circus'?1:0);
    const grant=amount=>{applause+=amount;};
    const use=kind=>{const data=kind==='flower'?board.flowers:kind==='bonsai'?board.pots:board.butterflies;
      if(data.length)props.push({kind,indices:data.map((_,j)=>j)});};
    const flower=n=>{const actual=Math.min(n,8-board.flowers.length);
      for(let j=0;j<actual;j++)board.flowers.push({age:1});
      if(actual)changes.push({kind:'flower',amount:actual});};
    const pot=type=>{if(type&&!board.pots.includes(type)){board.pots.push(type);changes.push({kind:'bonsai',amount:1});}};
    const fill=(order=varieties)=>pot(order.find(type=>!board.pots.includes(type)));
    const butterfly=(n=1)=>{
      const actual=Math.min(n,8-board.butterflies.length);
      for(let j=0;j<actual;j++)board.butterflies.push(i);
      if(actual)changes.push({kind:'butterfly',amount:actual});
    };
    const rocket=when=>{if(board.fireworks.length<8){board.fireworks.push(when);changes.push({kind:'firework',amount:1});}};
    const consume=(kind,count=1)=>{
      const pool=kind==='flower'?board.flowers:kind==='bonsai'?board.pots:board.butterflies;
      if(pool.length<count)return false;
      pool.splice(0,count);
      props.push({kind,indices:Array.from({length:count},(_,j)=>j),remove:true});
      changes.push({kind,amount:-count});
      return true;
    };
    switch(id){
      case 'florist':flower(2);break;
      case 'rain':flower(1);break;
      case 'tend':flower(i===2?2:1);break;
      case 'flowerShow':use('flower');grant(Math.min(4,board.flowers.length));break;
      case 'snip':if(consume('flower'))grant(4);break;
      case 'ignite':rocket(nextAct);break;
      case 'quick':rocket(state.act);break;
      case 'fuse':{const j=board.fireworks.findIndex(when=>when>state.act);
        if(j!==-1){board.fireworks[j]=state.act;props.push({kind:'firework',indices:[j]});changes.push({kind:'advance',amount:1});grant(2);}break;}
      case 'seal':{
        const j=board.fireworks.findIndex(when=>when===state.act);
        if(nextAct>state.act&&j!==-1){board.fireworks[j]=nextAct;props.push({kind:'firework',indices:[j]});grant(2);}
        break;
      }
      case 'flameSong':case 'double':case 'ember':settledLater.push({id,i});break;
      case 'planter':fill();break;
      case 'exchange':fill([...varieties].reverse());break;
      case 'orchid':{
        const orchid=board.pots.indexOf('兰');
        if(orchid===-1)pot('兰');
        else{props.push({kind:'bonsai',indices:[orchid]});grant(2);}
        break;
      }
      case 'judge':use('bonsai');grant(new Set(board.pots).size);break;
      case 'vendor':if(consume('bonsai'))grant(4);break;
      case 'four':use('bonsai');if(new Set(board.pots).size===4)grant(6);break;
      case 'bamboo':fill(['竹','菊']);break;
      case 'lure':butterfly(seatChanges[i-1]?.has('flower')?2:1);break;
      case 'herd':if(board.butterflies.length<8&&consume('flower'))butterfly(2);break;
      case 'perch':use('butterfly');if(board.butterflies.length)grant(3);break;
      case 'peep':if(consume('butterfly',3))grant(7);break;
      case 'balls':case 'rope':case 'warm':grant(tuningGains[i]);break;
      case 'walker':if(matches[i])grant(2);break;
      case 'tea':if(scoredScenery[i-1]||seatChanges[i-1]?.has('bonsai')||seatChanges[i-1]?.has('butterfly'))flower(2);break;
      case 'drummer':if(index[next]?.style==='circus')grant(1);break;
      case 'mask':if([i-1,i+1].some(j=>changedTone[j]&&matches[j]))grant(2);break;
      case 'jester':{
        const lineupStyles=state.lineup.map(actor=>index[actor]?.style);
        if(lineupStyles.every(style=>style&&style!=='neutral')&&new Set(lineupStyles).size===3)grant(4);
        break;
      }
      case 'support':if(i===1&&[index[previous]?.style,index[next]?.style].every(style=>style&&style!=='neutral')&&
        index[previous].style!==index[next].style)grant(3);break;
      case 'clearer':if(i===2&&(consume('flower')||consume('butterfly')))grant(3);break;
      case 'bouquet':if(seatChanges[i-1]?.has('bonsai'))flower(2);break;
      case 'scenery':if(seatChanges[i-1]?.has('butterfly'))fill();break;
      case 'lighter':if(changedTone[i-1])butterfly(2);break;
      case 'general':if(board.lamps.length<8){board.lamps.push(0);changes.push({kind:'lamp',amount:1});}break;
      case 'granny':grant(Math.min(4,board.lamps.length));break;
    }
    scoredScenery[i]=sceneryScorers.has(id)&&applause>card.base;
    const produced=seatChanges[i]=new Set(changes.filter(change=>change.amount>0).map(change=>change.kind));
    points+=applause;
    changes.push({kind:'applause',amount:applause});
    steps.push(snapshot({id,i,phase:'main',changes,props}));
    const follow=previous==='paper'&&produced.has('firework')&&nextAct>state.act&&board.fireworks.length<8?['firework',nextAct]:
      previous==='sparker'&&produced.has('flower')&&board.fireworks.length<8?['firework',state.act]:
      previous==='arrange'&&produced.has('bonsai')&&varieties.some(type=>!board.pots.includes(type))?['bonsai',varieties.find(type=>!board.pots.includes(type))]:null;
    if(follow){
      const [kind,item]=follow;
      (kind==='bonsai'?board.pots:board.fireworks).push(item);
      steps.push(snapshot({id:previous,i:i-1,phase:'close',changes:[{kind,amount:1}]}));
    }
  }
  for(const {id,i} of settledLater){
    if(id==='ember'&&!board.fireworks.some(when=>when<=state.act)&&board.fireworks.length<8){
      board.fireworks.push(nextAct);
      steps.push(snapshot({id,i,phase:'close',changes:[{kind:'firework',amount:1}]}));
    }
  }
  const launching=board.fireworks.flatMap((when,i)=>when<=state.act?[i]:[]), fired=launching.length;
  if(fired){
    board.fireworks=board.fireworks.filter(when=>when>state.act);
    const fireworkApplause=fired*(state.mode?2:3);
    points+=fireworkApplause;
    steps.push(snapshot({id:null,i:-1,phase:'close',cue:'firework',props:[{kind:'firework',indices:launching,remove:true}],
      changes:[{kind:'firework',amount:-fired},{kind:'applause',amount:fireworkApplause}]}));
  }
  for(const {id,i} of settledLater){
    if(id==='ember')continue;
    const amount=id==='flameSong'?Math.min(4,fired):fired>=2?4:0;
    if(amount){points+=amount;steps.push(snapshot({id,i,phase:'close',changes:[{kind:'applause',amount}]}));}
  }
  const extra=mods?.(board)??0;
  if(extra){points+=extra;steps.push(snapshot({id:null,i:-1,phase:'close',cue:'mod',changes:[{kind:'applause',amount:extra}]}));}
  board.audience+=audienceGain;
  if(audienceGain)steps.push(snapshot({id:null,i:-1,phase:'close',cue:'match',changes:[{kind:'audience',amount:audienceGain}]}));
  const factor=audienceFactor(board.audience,state.mode);
  settledPoints=points*factor;
  steps.push(snapshot({id:null,i:-1,phase:'close',cue:'audience',changes:[{kind:'applause',amount:settledPoints}]}));
  return {board,steps,start,progress:objectives(),buffs:[0,0,0],cues:[],matches,effectiveTones,audienceGain,
    audiencePercent:board.audience,factor,baseApplause:points,reward:{score:0},score:settledPoints};
}
