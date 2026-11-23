export const applauseUnit=1;
export const goalScore=140;
export const actCount=3;
export const slots=['开场','过场','收场'];
export const tones=[
  {id:'red',name:'朱',glyph:'●',color:'#ed8b7d'},
  {id:'blue',name:'青',glyph:'◆',color:'#86cdd6'},
  {id:'yellow',name:'金',glyph:'▲',color:'#efca79'},
];
export const varieties=['梅','兰','竹','菊'];
export const styles={
  garden:{name:'花卉',summary:'花留在台上，种花后赏花；剪花能换来更多喝彩。',glyph:'花',colors:[0xa5443b,0x658054,0x9b5265,0x8e4560,0x657d45,0xa97648]},
  fire:{name:'烟花',summary:'点火留到下幕，烟花每束得 3 基础喝彩；伴焰和双响利用齐放。',glyph:'焰',colors:[0xb65b38,0x8c4d37,0xa6534a,0xc97036,0x905745,0xa84531]},
  gardenware:{name:'盆景',summary:'自动补缺少的品种，摆盆后评景；不必手选梅兰竹菊。',glyph:'景',colors:[0x667b51,0x71704b,0x3a6651,0x826347,0x557081,0x56634a]},
  wings:{name:'蝴蝶',summary:'蝴蝶留在台上，引蝶后观蝶；没有飞行路线和落点选项。',glyph:'蝶',colors:[0x4a7472,0x72527b,0x527587,0x884e81,0xa76a7f,0x49696a]},
  circus:{name:'杂耍',summary:'开演前自动变色、换色或替邻席调色，帮助混合戏班配色招客。',glyph:'彩',colors:[0x976048,0x43807c,0xc08242,0x54698d,0x987344,0xb14c4b]},
};

// 每派各有两只朱、青、金；颜色与艺种独立。卡面只保留基础贡献和一项技能。
const groups={
  garden:[
    ['florist','采花娘',2,'+2{flower}','留下 2 朵花。','flower'],
    ['rain','求雨婆',2,'+1{flower}','留下 1 朵花。','flower'],
    ['flowerShow','赏花伶',2,'每朵{flower}+1{applause}（最多 4）','每朵花额外得 1 基础喝彩，最多 4。','fan'],
    ['ornament','簪花童',2,'有{flower} +3{applause}','台上有花，额外得 3 基础喝彩。','flower'],
    ['snip','剪花客',2,'−1{flower} → +4{applause}','剪下一朵花，额外得 4 基础喝彩。','flower'],
    ['tend','护花匠',2,'+1{flower}','留下 1 朵花。','flower'],
  ],
  fire:[
    ['ignite','点火童',2,'+1{firework} 下幕放','点一束下幕释放的烟花；谢幕登台则当幕释放。','rocket'],
    ['fuse','催引匠',2,'1{firework} 提前到本幕','自动让一束待放烟花在本幕释放。','rocket'],
    ['flameSong','伴焰伶',2,'每束齐放{firework} +1{applause}（最多 4）','本幕每束烟花额外得 1 基础喝彩，最多 4。','fan'],
    ['quick','急火童',2,'+1{firework} 本幕放','点一束本幕释放的烟花。','rocket'],
    ['paper','纸筒匠',2,'有{firework} +3{applause}','收场前有烟花，额外得 3 基础喝彩。','rocket'],
    ['double','双响将',2,'齐放 ≥2{firework} +4{applause}','本幕释放至少两束烟花，额外得 4 基础喝彩。','drum'],
  ],
  gardenware:[
    ['planter','抱盆童',2,'+1{bonsai} 自动补缺','自动摆上一种缺少的盆景。','bonsai'],
    ['exchange','换盆客',2,'+1{bonsai} 自动补缺','自动摆上一种缺少的盆景。','bonsai'],
    ['judge','评景先生',2,'每种{bonsai}+1{applause}','每种盆景额外得 1 基础喝彩。','fan'],
    ['vendor','卖盆叟',2,'有{bonsai} +3{applause}','台上有盆景，额外得 3 基础喝彩。','bonsai'],
    ['orchid','送兰侍',2,'+1{bonsai}兰','摆上一盆兰。','bonsai'],
    ['four','四雅先生',2,'≥3种{bonsai} +4{applause}','台上至少三种盆景，额外得 4 基础喝彩。','fan'],
  ],
  wings:[
    ['lure','引蝶童',2,'+1{butterfly}','留下一只蝶。','fan'],
    ['herd','赶蝶娘',2,'+1{butterfly}','留下一只蝶。','fan'],
    ['dancer','蝶衣伶',2,'每只{butterfly}+1{applause}（最多 4）','每只蝶额外得 1 基础喝彩，最多 4。','fan'],
    ['fan','扇蝶童',2,'+1{butterfly}','留下一只蝶。','fan'],
    ['perch','停蝶伶',2,'有{butterfly} +3{applause}','台上有蝶，额外得 3 基础喝彩。','flower'],
    ['peep','观蝶客',2,'≥3只{butterfly} +4{applause}','台上至少三只蝶，额外得 4 基础喝彩。','fan'],
  ],
  circus:[
    ['balls','抛丸童',1,'变为本席色','开演前变成自己所在席的颜色。','balls'],
    ['rope','翻索客',2,'与邻席换色 · 自动择优','开演前与一个邻席交换颜色；只在匹配席数增加时交换。','clapper'],
    ['warm','暖场童',2,'给下一席调色','开演前让下一席的木偶变成该席颜色；收场位没有下一席。','balls'],
    ['walker','走绳伶',2,'本偶匹配 +3{applause}','调色后自己匹配所在席，额外得 3 基础喝彩。','clapper'],
    ['tea','卖茶客',2,'上一席匹配 +3{applause}','调色后上一席匹配，额外得 3 基础喝彩；开场位没有上一席。','lamp'],
    ['jester','弄臣',2,'三席匹配 +4{applause}','调色后三席全部匹配，额外得 4 基础喝彩。','drum'],
  ],
};
export const cards=Object.fromEntries(Object.entries(groups).flatMap(([style,list])=>
  list.map(([id,name,base,notation,text,prop],i)=>{
    const color=styles[style].colors[i];
    const shade=factor=>[16,8,0].reduce((value,shift)=>value+(Math.round(((color>>shift)&255)*factor)<<shift),0);
    return [id,{id,name,role:styles[style].name,cost:0,base,notation,text,prop,style,tone:tones[i%3].id,
      color,dark:shade(.62),accent:0xe5aa77,back:shade(.57),hat:['buns','cap','wing','buns','wing','crown'][i]}];
  })
));

export const storyCards=Object.fromEntries([
  ['woodcutter','樵夫','迷途',0,2,'','风雪里赶路的樵夫。','clapper','applause',0x7d5f45,0x54402e,'cap'],
  ['immortal','仙人','引路',0,2,'','雾中宫殿里的仙家。','fan','applause',0xd9d2c2,0x9d9484,'crown'],
  ['wife','妻子','守门',0,2,'','城门外候着归人的妻子。','flower','applause',0xb0564a,0x7c3a32,'buns'],
  ['general','将军','守城',0,2,'+1{lamp}','拨亮 1 盏灯。','clapper','applause',0x7a2020,0x4d1414,'cap'],
  ['granny','提灯老妪','引灯',0,2,'每{lamp}+1{applause}','每盏灯额外得 1 喝彩，至多 4。','lamp','applause',0x4b5d73,0x333f4e,'buns'],
  ['soldier','兵卒','杂役',0,1,'','随行的杂役兵卒。','fan','applause',0x6b5a3a,0x4a3e28,'cap'],
].map(([id,name,role,cost,base,notation,text,prop,boost,color,dark,hat])=>[
  id,{id,name,role,cost,base,notation,text,prop,boost,style:'story',color,dark,accent:0xe5aa77,back:dark,hat,tone:{woodcutter:'red',immortal:'yellow',wife:'blue',general:'red',granny:'yellow',soldier:'blue'}[id]},
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
export const audienceFactor=audience=>1+audience;

export function fresh(){
  return {act:0,branch:'market',applause:0,applauseUnit,board:{flowers:[],fireworks:[],pots:[],butterflies:[],audience:0},
    started:false,deck:[],draw:[],hand:[],used:[],lineup:[null,null,null],choices:{},history:[],ready:false,finished:false};
}
export const nextBoard=board=>({...board});
const clone=board=>({flowers:board.flowers.map(f=>({...f})),fireworks:[...board.fireworks],pots:[...board.pots],
  butterflies:[...board.butterflies],audience:board.audience,lamps:[...(board.lamps??[])]});

export function scoreAct(state,index=cards,mods=null){
  const openSlots=state.openSlots??[0,1,2];
  if(state.lineup.length!==3||state.lineup.some((id,i)=>id&&(!index[id]||!openSlots.includes(i)))||
    state.lineup.filter(Boolean).length>(state.maxPuppets??3))throw new RangeError('阵容超过本幕开放席位或人数。');
  const board=clone(state.board), steps=[], effectiveTones=state.lineup.map(id=>index[id]?.tone??null);
  const matched=()=>effectiveTones.map((tone,i)=>Boolean(state.lineup[i])&&tone===tones[i].id);
  let points=0, settledPoints;
  const objectives=()=>[[{kind:'points',target:goalScore,label:'本幕喝彩',value:settledPoints??points}]];
  const start=objectives();
  const snapshot=extra=>({...extra,board:clone(board),baseApplause:points,objectives:objectives()});
  // 调色仅改变本幕有效颜色。先从开场到收场调色，再执行技能与招客。
  for(const [i,id] of state.lineup.entries()){
    const before=[...effectiveTones];
    if(id==='balls')effectiveTones[i]=tones[i].id;
    if(id==='warm'&&state.lineup[i+1])effectiveTones[i+1]=tones[i+1].id;
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
    const changed=effectiveTones.filter((tone,j)=>tone!==before[j]).length;
    if(changed)steps.push(snapshot({id,i,phase:'pre',changes:[{kind:'tune',amount:changed}],effectiveTones:[...effectiveTones]}));
  }
  const matches=matched(), audienceGain=matches.filter(Boolean).length;
  const settledLater=[];
  for(const [i,id] of state.lineup.entries()){
    if(!id)continue;
    const card=index[id], changes=[], props=[];
    let applause=card.base;
    const grant=amount=>{applause+=amount;};
    const use=kind=>{const data=kind==='flower'?board.flowers:kind==='bonsai'?board.pots:board.butterflies;
      if(data.length)props.push({kind,indices:data.map((_,j)=>j)});};
    const flower=n=>{const actual=Math.min(n,8-board.flowers.length);
      for(let j=0;j<actual;j++)board.flowers.push({age:1});
      if(actual)changes.push({kind:'flower',amount:actual});};
    const pot=type=>{if(board.pots.length<8){board.pots.push(type);changes.push({kind:'bonsai',amount:1});}};
    const butterfly=()=>{if(board.butterflies.length<8){board.butterflies.push(i);changes.push({kind:'butterfly',amount:1});}};
    const rocket=when=>{if(board.fireworks.length<8){board.fireworks.push(when);changes.push({kind:'firework',amount:1});}};
    switch(id){
      case 'florist':flower(2);break;
      case 'rain':case 'tend':flower(1);break;
      case 'flowerShow':use('flower');grant(Math.min(4,board.flowers.length));break;
      case 'ornament':use('flower');if(board.flowers.length)grant(3);break;
      case 'snip':if(board.flowers.length){props.push({kind:'flower',indices:[0],remove:true});board.flowers.shift();changes.push({kind:'flower',amount:-1});grant(4);}break;
      case 'ignite':rocket(Math.min(state.act+1,(state.totalActs??actCount)-1));break;
      case 'quick':rocket(state.act);break;
      case 'fuse':{const j=board.fireworks.findIndex(when=>when>state.act);
        if(j!==-1){board.fireworks[j]=state.act;props.push({kind:'firework',indices:[j]});changes.push({kind:'advance',amount:1});}break;}
      case 'paper':if(board.fireworks.length){props.push({kind:'firework',indices:[0]});grant(3);}break;
      case 'flameSong':case 'double':settledLater.push({id,i});break;
      case 'planter':case 'exchange':pot(varieties.find(type=>!board.pots.includes(type))??varieties[0]);break;
      case 'orchid':pot('兰');break;
      case 'judge':use('bonsai');grant(new Set(board.pots).size);break;
      case 'vendor':use('bonsai');if(board.pots.length)grant(3);break;
      case 'four':use('bonsai');if(new Set(board.pots).size>=3)grant(4);break;
      case 'lure':case 'herd':case 'fan':butterfly();break;
      case 'dancer':use('butterfly');grant(Math.min(4,board.butterflies.length));break;
      case 'perch':use('butterfly');if(board.butterflies.length)grant(3);break;
      case 'peep':use('butterfly');if(board.butterflies.length>=3)grant(4);break;
      case 'walker':if(matches[i])grant(3);break;
      case 'tea':if(matches[i-1])grant(3);break;
      case 'jester':if(audienceGain===3)grant(4);break;
      case 'general':if(board.lamps.length<8){board.lamps.push(0);changes.push({kind:'lamp',amount:1});}break;
      case 'granny':grant(Math.min(4,board.lamps.length));break;
    }
    points+=applause;
    changes.push({kind:'applause',amount:applause});
    steps.push(snapshot({id,i,phase:'main',changes,props}));
  }
  const launching=board.fireworks.flatMap((when,i)=>when<=state.act?[i]:[]), fired=launching.length;
  if(fired){
    board.fireworks=board.fireworks.filter(when=>when>state.act);
    points+=fired*3;
    steps.push(snapshot({id:null,i:-1,phase:'close',cue:'firework',props:[{kind:'firework',indices:launching,remove:true}],
      changes:[{kind:'firework',amount:-fired},{kind:'applause',amount:fired*3}]}));
  }
  for(const {id,i} of settledLater){
    const amount=id==='flameSong'?Math.min(4,fired):fired>=2?4:0;
    if(amount){points+=amount;steps.push(snapshot({id,i,phase:'close',changes:[{kind:'applause',amount}]}));}
  }
  const extra=mods?.(board)??0;
  if(extra){points+=extra;steps.push(snapshot({id:null,i:-1,phase:'close',cue:'mod',changes:[{kind:'applause',amount:extra}]}));}
  board.audience+=audienceGain;
  if(audienceGain)steps.push(snapshot({id:null,i:-1,phase:'close',cue:'match',changes:[{kind:'audience',amount:audienceGain}]}));
  const factor=audienceFactor(board.audience);
  settledPoints=points*factor;
  steps.push(snapshot({id:null,i:-1,phase:'close',cue:'audience',changes:[{kind:'applause',amount:settledPoints}]}));
  return {board,steps,start,progress:objectives(),buffs:[0,0,0],cues:[],matches,effectiveTones,audienceGain,
    audiencePercent:board.audience,factor,baseApplause:points,reward:{score:0},score:settledPoints};
}
