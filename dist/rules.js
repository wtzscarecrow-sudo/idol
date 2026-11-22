export const applauseUnit=20;
export const goalScore=66*applauseUnit;
export const slots=['开场','过场','收场'];
export const varieties=['梅','兰','竹','菊'];
export const styles={
  garden:{name:'花卉',summary:'看花况。初绽留到下一幕会盛开，求雨婆能直接补一朵盛花。',glyph:'花',colors:[0xa5443b,0x658054,0x9b5265,0x8e4560,0x657d45,0xa97648]},
  fire:{name:'烟花',summary:'卡炸点。每束在预定幕的收场释放，基础得 4 喝彩。',glyph:'焰',colors:[0xb65b38,0x8c4d37,0xa6534a,0xc97036,0x905745,0xa84531]},
  gardenware:{name:'梅兰竹菊',summary:'补缺种。同品种只算一种，重复盆景可以换盆或卖掉。',glyph:'景',colors:[0x667b51,0x71704b,0x3a6651,0x826347,0x557081,0x56634a]},
  wings:{name:'蝴蝶',summary:'走路线。途经一席增益 +1，停留一席 +2，每席取最高。',glyph:'蝶',colors:[0x4a7472,0x72527b,0x527587,0x884e81,0xa76a7f,0x49696a]},
  circus:{name:'杂耍',summary:'控热度。收场按剩余热度加分，也可让观众离场换取即时喝彩。',glyph:'彩',colors:[0x976048,0x43807c,0xc08242,0x54698d,0x987344,0xb14c4b]},
};

const groups={
  garden:[
    ['florist','采花娘','种花',0,2,'+2{flower}','放下 2 朵初绽的花。','flower','flower'],
    ['rain','求雨婆','盛花',0,2,'+1{bloom}','放下一朵已经盛开的花。','flower'],
    ['flowerShow','赏花伶','赏花',0,1,'每朵{bud}+1{applause}；{bloom}+2{applause}（至多 5）','初绽的花每朵额外得 1 喝彩，盛开的花每朵额外得 2。最多得 5，再算蝶加成。','fan','applause'],
    ['ornament','簪花童','赏花',2,1,'最好一朵{bud}+2{applause}／{bloom}+4{applause}','自动选开得最好的一朵。初绽额外得 2 喝彩，盛开额外得 4。','flower','applause'],
    ['snip','剪花客','剪花',2,2,'−1{bloom} → +2{applause}','剪下一朵盛花，额外得 2 喝彩。先赏花、后剪花可以兼得。','flower','applause'],
    ['tend','护花匠','留花',3,2,'+1{bud}；1{bloom} 多开一幕','放下一朵初绽的花，再让一朵盛开的花多开一幕。','flower'],
  ],
  fire:[
    ['ignite','点火童','点火',0,2,'+1{firework} 两幕后放；末幕 +1{applause}','点燃 1 束烟花，两幕后释放，最晚在第五幕。第五幕登台时改为额外得 1 喝彩。','rocket','firework'],
    ['fuse','催引匠','催引',2,2,'1{firework} 提前一幕；无则 +1{applause}','让一束原定后续幕释放的烟花提前一幕。没有可提前的烟花时，额外得 1 喝彩。','rocket'],
    ['flameSong','伴焰伶','伴焰',0,1,'本幕每放 1{firework} +1{applause}','本幕每释放一束烟花，额外得 1 喝彩。','fan','applause'],
    ['quick','急火童','即放',0,1,'本幕无待放{firework} → 点 1 束；否则 +1{applause}','若收场还没有安排烟花，就点燃一束本幕释放的烟花。已有本幕烟花或台面已满时，改为额外得 1 喝彩。','rocket'],
    ['paper','纸筒匠','备筒',2,2,'有后幕{firework} +2{applause}','只要台上有后续幕释放的烟花，额外得 2 喝彩。','rocket','applause'],
    ['double','双响将','齐放',4,1,'本幕放 1{firework} +1{applause}／≥2 束 +5','本幕释放一束烟花时额外得 1 喝彩，释放至少两束时额外得 5 喝彩。','drum','applause'],
  ],
  gardenware:[
    ['planter','抱盆童','陈设',0,2,'+1{bonsai} 二选一','从本幕公开的两种盆景里选一盆摆上台。','bonsai'],
    ['exchange','换盆客','换盆',2,2,'重复{bonsai} → 缺种；三种时自动补齐','把一盆重复盆景换成缺少的品种。已有三种时，即使没有重复也能直接补齐。','bonsai'],
    ['judge','评景先生','评景',0,1,'每种{bonsai} +1{applause}','台上每有一种盆景，额外得 1 喝彩。','fan','applause'],
    ['vendor','卖盆叟','售盆',2,2,'有{bonsai} +1{applause}；售重复再 +1','台上有盆景便额外得 1 喝彩。若有重复，卖掉一盆再得 1 喝彩。','bonsai'],
    ['orchid','送兰侍','送兰',0,2,'+1{bonsai}兰；已有兰再 +1{applause}','摆上一盆兰。台上原本已有兰时，额外得 1 喝彩。重复的兰可用来换盆或出售。','bonsai'],
    ['four','四雅先生','四景',4,1,'三种{bonsai} +2{applause}／四种 +5','有三种盆景时额外得 2 喝彩，四种齐全时额外得 5 喝彩。','fan','applause'],
  ],
  wings:[
    ['lure','引蝶童','引蝶',0,2,'本席 +1{butterfly}；台上已有蝶再 +1{applause}','开演前在本席引一只蝶。引蝶前台上已有蝶时，额外得 1 喝彩。','fan'],
    ['herd','赶蝶娘','赶蝶',0,2,'1{butterfly}飞往另一席；无蝶先引 1 只','开演前，赶一只蝶到另一席。台上无蝶时，从本席引一只蝶自动飞到最远的一席。','fan'],
    ['dancer','蝶衣伶','观路',0,1,'{butterfly}飞过本席 +3{applause}／飞抵 +2','本幕有蝶飞过本席时额外得 3 喝彩；若只有蝶飞抵本席，额外得 2 喝彩。两种效果取其一。','fan','applause'],
    ['fan','扇蝶童','送蝶',2,2,'本席与邻席移 1{butterfly}','开演前，在本席和邻席之间移一只蝶。本席有蝶就送出，无蝶就从邻席引入，优先开场一侧。','fan'],
    ['perch','停蝶伶','停蝶',2,1,'{butterfly}停本席 → +2{applause}','若有蝶停在自己这席，额外得 2 喝彩，再算蝶加成。','flower','applause'],
    ['peep','观蝶客','观路',3,2,'{butterfly}从本席起飞 +2{applause}','本幕有蝶从自己这席起飞时，额外得 2 喝彩。','fan'],
  ],
  circus:[
    ['balls','抛丸童','揽客',0,1,'+2{audience}','吸引 2 名观众。','balls','audience'],
    ['rope','翻索客','杂技',0,2,'+1{audience}','吸引 1 名观众。','clapper','audience'],
    ['warm','暖场童','暖场',2,2,'低热 +3{audience}／其余 +1{audience}','只有 0 或 1 名观众时招来 3 名，其余时候招来 1 名。','balls','audience'],
    ['walker','走绳伶','杂技',2,2,'已有 ≥4{audience} → +2{applause}','至少有 4 名观众时，额外得 2 喝彩。','clapper','applause'],
    ['tea','卖茶客','待客',3,2,'恰有 3{audience} +2{applause}','卖茶客结算时，台上恰好有 3 名观众，额外得 2 喝彩。','lamp'],
    ['jester','弄臣','高潮',0,1,'每名{audience}+1{applause}；再 −2{audience}','每名观众额外得 1 喝彩，随后至多两名观众离场。','drum','applause'],
  ],
};

export const cards=Object.fromEntries(Object.entries(groups).flatMap(([style,list])=>
  list.map(([id,name,role,cost,base,notation,text,prop,boost],i)=>{
    const color=styles[style].colors[i];
    const shade=(factor)=>[16,8,0].reduce((value,shift)=>value+(Math.round(((color>>shift)&255)*factor)<<shift),0);
    return [id,{id,name,role,cost,base,notation,text,prop,boost,style,color,dark:shade(.62),accent:0xe5aa77,
      back:shade(.57),hat:['buns','cap','wing','buns','wing','crown'][i]}];
  })
));

const act=(name,place,story,target,bonus)=>({name,place,story,target:target*applauseUnit,bonus:bonus*applauseUnit,goal:'本幕演出获得 '+target*applauseUnit+' 喝彩。'});
export const events={
  spring:act('春社试台','柳溪村','柳溪新搭了戏台，乡亲们等着看春景。',6,2),
  butterfly:act('蝶过花窗','柳溪村','孩童候着看蝴蝶登台，也爱听一阵热闹的锣鼓。',9,3),
  market:act('赶晚集','青石集','摊贩散场，纷纷围来看戏。',12,4),
  shrine:act('庙前说春','栖云庙','香客爱听旧故事，也会为春灯驻足。',12,4),
  ferry:act('渡口听风','白鹭渡','渡船未至，台上还得留些景致给过客。',14,4),
  finale:act('上元灯会','上元城','满城灯火，戏台前只等最后三锣。',16,5),
};
export const route=branch=>['spring','butterfly',branch,'ferry','finale'];
export const marketPots=(act,branch)=>[
  ['梅','兰'],['兰','竹'],branch==='shrine'?['竹','菊']:['梅','竹'],['菊','梅'],['兰','菊'],
][act];
export const heat=audience=>audience>=4?2:audience>=2?1:0;
const audienceBonuses=[0,5,10,15,25,35];
export const heatPercent=audience=>audienceBonuses[audience];
export const audienceFactor=percent=>applauseUnit+percent/5;
export const publicAudienceLimit=3;

export function fresh(){
  return {act:0,branch:'market',applause:0,applauseUnit,board:{flowers:[],fireworks:[],pots:[],butterflies:[],audience:0},
    started:false,deck:[],draw:[],hand:[],used:[],lineup:[null,null,null],choices:{},history:[],ready:false,finished:false};
}

export function nextBoard(board){
  return {...board,flowers:board.flowers.flatMap(flower=>
    flower.age===0?[{age:1}]:flower.keep?[{age:1}]:[])};
}

const hasChoice=(values,value)=>values.includes(value);
const countPots=board=>new Set(board.pots).size;
const repeatedPots=board=>[...new Set(board.pots.filter((type,i)=>board.pots.indexOf(type)!==i))];
const bloomCount=board=>board.flowers.filter(flower=>flower.age===1).length;
const clone=board=>({
  flowers:board.flowers.map(flower=>({...flower})),
  fireworks:[...board.fireworks],pots:[...board.pots],butterflies:[...board.butterflies],
  audience:board.audience,
});

export function scoreAct(state){
  const stops=route(state.branch);
  const e=events[stops[state.act]];
  const lastAct=stops.length-1;
  const board=clone(state.board);
  const buffs=[0,0,0], passed=[false,false,false], arrived=[false,false,false], steps=[], cues=[];
  let points=0;
  const luresWithCompany=new Set();
  const departed=new Set();
  let settledPoints;
  const objectives=()=>[[{kind:'points',target:e.target,label:'本幕喝彩',value:settledPoints??points*applauseUnit}]];
  const start=objectives();
  function snapshot(extra){
    return {...extra,board:clone(board),baseApplause:points,objectives:objectives()};
  }
  function record(changes,kind,amount){
    if(!amount)return;
    const entry=changes.find(item=>item.kind===kind&&Math.sign(item.amount)===Math.sign(amount));
    if(entry)entry.amount+=amount;
    else changes.push({kind,amount});
  }

  for(const [i,id] of state.lineup.entries()){
    if(!['lure','herd','fan'].includes(id))continue;
    const choice=state.choices[i]??{};
    const changes=[];
    const occupied=[...new Set(board.butterflies)];
    let from=null,to=null;
    if(id==='lure'){
      if(occupied.length)luresWithCompany.add(i);
      if(board.butterflies.length<8){
        board.butterflies.push(i);
        record(changes,'butterfly',1);
      }
    }else{
      const summon=id==='herd'&&!occupied.length;
      let sources=summon?[i]:occupied;
      if(id==='fan'){
        const sending=occupied.includes(i);
        sources=sending?[i]:[i-1,i+1].filter(seat=>occupied.includes(seat)).slice(0,1);
      }
      from=hasChoice(sources,Number(choice.from))?Number(choice.from):sources[0]??null;
      const targets=from===null?[]:id==='fan'&&from!==i?[i]
        :[0,1,2].filter(seat=>seat!==from&&(id!=='fan'||Math.abs(seat-from)===1));
      to=hasChoice(targets,Number(choice.to))?Number(choice.to):targets.at(-1)??null;
      if(summon)to=i===2?0:2;
      if(from!==null&&to!==null){
        if(summon){
          board.butterflies.push(to);
          record(changes,'butterfly',1);
        }else board.butterflies[board.butterflies.indexOf(from)]=to;
        for(let seat=Math.min(from,to)+1;seat<Math.max(from,to);seat++)passed[seat]=true;
        departed.add(from);
        arrived[to]=true;
        record(changes,'move',1);
      }
      if(!summon)cues.push({id,i,from,to,sources,targets});
    }
    if(changes.length)steps.push(snapshot({i,id,phase:'pre',changes,flight:from!==null&&to!==null?{from,to}:null}));
  }
  passed.forEach((value,i)=>{buffs[i]=value?1:0;});
  board.butterflies.forEach(i=>{buffs[i]=2;});
  const settledLater=[];
  for(const [i,id] of state.lineup.entries()){
    if(!id)continue;
    const choice=state.choices[i]??{};
    const changes=[],props=[];
    const card=cards[id];
    let applause=0,boostUsed=false;
    function use(kind,indices,remove=false){
      if(indices.length)props.push({kind,indices,remove});
    }
    function grant(kind,amount,applyBoost=true){
      if(amount>0&&applyBoost&&!boostUsed&&kind===card.boost){
        amount+=buffs[i];
        boostUsed=true;
      }
      let actual=amount;
      if(kind==='applause')applause+=amount;
      if(kind==='audience'){
        const next=Math.min(5,Math.max(0,board.audience+amount));
        actual=next-board.audience;board.audience=next;
      }
      if(kind==='flower'||kind==='bloom'){
        actual=Math.min(amount,8-board.flowers.length);
        for(let n=0;n<actual;n++)board.flowers.push({age:kind==='bloom'?1:0});
      }
      record(changes,kind,actual);
    }
    function addFireworks(when,requested){
      const count=Math.min(requested,8-board.fireworks.length);
      for(let n=0;n<count;n++)board.fireworks.push(when);
      record(changes,'firework',count);
    }
    function addPot(type){
      if(board.pots.length===8)return;
      board.pots.push(type);
      record(changes,'bonsai',1);
    }
    const temperature=heat(board.audience);
    switch(id){
      case 'florist': grant('flower',2);break;
      case 'rain':grant('bloom',1);break;
      case 'flowerShow':
        use('flower',board.flowers.map((_,j)=>j));
        grant('applause',Math.min(5,board.flowers.length+bloomCount(board)));break;
      case 'ornament':{
        const best=board.flowers.findIndex(flower=>flower.age===1);
        if(board.flowers.length)use('flower',[Math.max(0,best)]);
        grant('applause',best!==-1?4:board.flowers.length?2:0);break;
      }
      case 'snip':{
        const index=board.flowers.findIndex(flower=>flower.age===1);
        if(index!==-1){
          use('flower',[index],true);
          board.flowers.splice(index,1);
          record(changes,'flower',-1);
          grant('applause',2);
        }
        break;
      }
      case 'tend':{
        grant('flower',1);
        const flower=board.flowers.find(item=>item.age===1&&!item.keep);
        if(flower){use('flower',[board.flowers.indexOf(flower)]);flower.keep=true;record(changes,'protect',1);}
        break;
      }
      case 'ignite':
        if(state.act===lastAct)grant('applause',1);
        else addFireworks(Math.min(state.act+2,lastAct),1+buffs[i]);
        break;
      case 'fuse':{
        const dates=[...new Set(board.fireworks.filter(date=>date>state.act))].sort((a,b)=>a-b);
        const date=hasChoice(dates,Number(choice.date))?Number(choice.date):dates[0];
        cues.push({id,i,dates,date});
        if(date!==undefined){
          const index=board.fireworks.indexOf(date);
          use('firework',[index]);board.fireworks[index]--;record(changes,'advance',1);
        }else grant('applause',1);
        break;
      }
      case 'flameSong':
      case 'double':settledLater.push({id,i});break;
      case 'quick':
        if(!board.fireworks.includes(state.act)&&board.fireworks.length<8){
          addFireworks(state.act,1);
        }else grant('applause',1);
        break;
      case 'paper':{
        const later=board.fireworks.findIndex(date=>date>state.act);
        if(later!==-1){
          use('firework',[later]);
          grant('applause',2);
        }
        break;
      }
      case 'planter':{
        const offers=marketPots(state.act,state.branch);
        const pot=hasChoice(offers,choice.pot)?choice.pot:offers.find(type=>!board.pots.includes(type))??offers[0];
        cues.push({id,i,offers,pot});
        addPot(pot);
        break;
      }
      case 'exchange':{
        const missing=varieties.filter(type=>!board.pots.includes(type));
        const duplicate=repeatedPots(board)[0];
        const offers=duplicate||missing.length===1?missing:[];
        const pot=hasChoice(offers,choice.pot)?choice.pot:offers[0];
        cues.push({id,i,offers,pot});
        if(pot){
          if(duplicate){
            const index=board.pots.lastIndexOf(duplicate);
            use('bonsai',[index],true);
            board.pots.splice(index,1);
            record(changes,'bonsai',-1);
          }
          addPot(pot);
        }
        break;
      }
      case 'judge':{
        const kinds=countPots(board);
        use('bonsai',[...new Set(board.pots)].map(type=>board.pots.indexOf(type)));
        grant('applause',kinds);
        break;
      }
      case 'vendor':{
        const duplicate=repeatedPots(board)[0];
        if(board.pots.length)grant('applause',1);
        if(duplicate){
          const index=board.pots.lastIndexOf(duplicate);
          use('bonsai',[index],true);
          board.pots.splice(index,1);
          record(changes,'bonsai',-1);
          grant('applause',1,false);
        }
        break;
      }
      case 'orchid':{
        const index=board.pots.indexOf('兰');
        if(index!==-1){use('bonsai',[index]);grant('applause',1);}
        addPot('兰');
        break;
      }
      case 'four':{
        const kinds=[...new Set(board.pots)];
        if(kinds.length>=3){
          use('bonsai',kinds.map(type=>board.pots.indexOf(type)));
          grant('applause',kinds.length===4?5:2);
        }
        break;
      }
      case 'lure':if(luresWithCompany.has(i))grant('applause',1);break;
      case 'dancer':grant('applause',passed[i]?3:arrived[i]?2:0);break;
      case 'perch':if(board.butterflies.includes(i)){
        use('butterfly',[board.butterflies.indexOf(i)]);grant('applause',2);
      }break;
      case 'peep':if(departed.has(i))grant('applause',2);break;
      case 'balls':grant('audience',2);break;
      case 'rope':grant('audience',1);break;
      case 'warm':grant('audience',temperature===0?3:1);break;
      case 'walker':if(temperature===2)grant('applause',2);break;
      case 'tea':if(board.audience===3)grant('applause',2);break;
      case 'jester':
        grant('applause',board.audience);
        use('audience',Array.from({length:Math.min(2,board.audience)},(_,j)=>board.audience-1-j),true);
        grant('audience',-2);
        break;
    }
    grant('applause',card.base,false);
    points+=applause;
    steps.push(snapshot({id,i,phase:'main',changes,props}));
  }
  const launching=board.fireworks.flatMap((date,i)=>date<=state.act?[i]:[]);
  const fired=launching.length;
  if(fired){
    board.fireworks=board.fireworks.filter(date=>date>state.act);
    points+=fired*4;
    steps.push(snapshot({id:null,i:-1,phase:'close',cue:'firework',
      props:[{kind:'firework',indices:launching,remove:true}],
      changes:[{kind:'firework',amount:-fired},{kind:'applause',amount:fired*4}]}));
  }
  for(const {id,i} of settledLater){
    const base=id==='flameSong'?fired:fired>=2?5:fired;
    if(!base)continue;
    const amount=base+buffs[i];
    points+=amount;
    steps.push(snapshot({id,i,phase:'close',changes:[{kind:'applause',amount}]}));
  }
  const audiencePercent=heatPercent(board.audience);
  settledPoints=points*audienceFactor(audiencePercent);
  if(settledPoints){
    steps.push(snapshot({id:null,i:-1,phase:'close',cue:'audience',changes:[{kind:'applause',amount:settledPoints}]}));
  }
  const progress=objectives();
  const hit=settledPoints>=e.target;
  const keptAudience=hit&&state.act<lastAct&&board.audience<publicAudienceLimit;
  if(keptAudience)board.audience++;
  return {board,steps,start,progress,hit,buffs,cues,audiencePercent,keptAudience,baseApplause:points,
    reward:{score:hit?e.bonus:0},score:settledPoints+(hit?e.bonus:0)};
}
