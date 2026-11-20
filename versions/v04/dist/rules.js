export const goalScore=36;
export const slots=['开场','过场','收场'];
export const varieties=['梅','兰','竹','菊'];
export const styles={
  garden:{name:'花卉',summary:'看花况。初绽、盛开、枯萎，求雨可以提前催开。',glyph:'花',colors:[0xa5443b,0x658054,0x9b5265,0x8e4560,0x657d45,0xa97648]},
  fire:{name:'烟花',summary:'卡炸点。每束在预定幕的收场释放，基础得 4 喝彩。',glyph:'焰',colors:[0xb65b38,0x8c4d37,0xa6534a,0xc97036,0x905745,0xa84531]},
  gardenware:{name:'梅兰竹菊',summary:'补缺种。同品种只算一种，重复盆景可以换盆或卖掉。',glyph:'景',colors:[0x667b51,0x71704b,0x3a6651,0x826347,0x557081,0x56634a]},
  wings:{name:'蝴蝶',summary:'走路线。途经一席增益 +1，停留一席 +2，每席取最高。',glyph:'蝶',colors:[0x4a7472,0x72527b,0x527587,0x884e81,0xa76a7f,0x49696a]},
  circus:{name:'杂耍',summary:'控热度。有喝彩产出的节目随热度加分，高潮后观众会离场。',glyph:'彩',colors:[0x976048,0x43807c,0xc08242,0x54698d,0x987344,0xb14c4b]},
};

const groups={
  garden:[
    ['florist','采花娘','种花',0,'放下 2 朵初绽的花。','flower','flower'],
    ['rain','求雨婆','催花',0,'让所有初绽的花立刻盛开。','flower'],
    ['flowerShow','赏花伶','赏花',0,'初绽的花每朵得 1 喝彩，盛开的花每朵得 2 喝彩。','fan','applause'],
    ['ornament','簪花童','赏花',2,'看开得最好的一朵。初绽得 2 喝彩，盛开得 4 喝彩。','flower','applause'],
    ['snip','剪花客','挣钱',2,'剪掉 1 朵盛开的花，得 3 赏钱。','flower','coin'],
    ['tend','护花匠','留花',3,'让 1 朵盛开的花多开一幕。','flower'],
  ],
  fire:[
    ['ignite','点火童','点火',0,'点燃 1 束烟花，两幕后释放。','rocket','firework'],
    ['fuse','催引匠','催引',0,'让一束原定后续幕释放的烟花提前一幕。','rocket'],
    ['flameSong','伴焰伶','伴焰',0,'本幕每释放一束烟花，再得 2 喝彩。','fan','applause'],
    ['quick','急火童','即放',2,'花 1 赏钱，点燃 1 束本幕收场释放的烟花。','rocket','firework'],
    ['paper','纸筒匠','挣钱',2,'每有一束尚未释放的烟花，得 1 赏钱，最多得 2。','rocket','coin'],
    ['double','双响将','齐放',4,'本幕若释放至少两束烟花，得 5 喝彩。','drum','applause'],
  ],
  gardenware:[
    ['planter','抱盆童','陈设',0,'从本幕公开的两种盆景里选一盆摆上台。','bonsai'],
    ['exchange','换盆客','换盆',0,'把一盆重复的盆景换成一种缺少的盆景。','bonsai'],
    ['judge','评景先生','评景',0,'台上每有一种盆景，得 1 喝彩。','fan','applause'],
    ['vendor','卖盆叟','挣钱',2,'卖掉一盆重复的盆景，得 2 赏钱。','bonsai','coin'],
    ['orchid','送兰侍','补兰',2,'摆上一盆兰。若台上已有兰，改为得 2 喝彩。','bonsai','applause'],
    ['four','四雅先生','四景',4,'梅兰竹菊齐全时得 6 喝彩，每局一次。','fan','applause'],
  ],
  wings:[
    ['lure','引蝶童','引蝶',0,'开演前，在自己这席引来 1 只蝶。','fan'],
    ['herd','赶蝶娘','赶蝶',0,'开演前，把一只蝶赶到选定的另一席。','fan'],
    ['dancer','蝶衣伶','观路',0,'本幕每有一个其他站位被蝶飞过，得 2 喝彩。','fan','applause'],
    ['fan','扇蝶童','送蝶',2,'开演前，把自己这席的一只蝶送到邻席，并得 1 赏钱。','fan'],
    ['perch','停蝶伶','停蝶',2,'若有蝶停在自己这席，得 3 喝彩。','flower','applause'],
    ['peep','观蝶客','观路',3,'若有蝶飞过自己这席，得 2 赏钱。','fan','coin'],
  ],
  circus:[
    ['balls','抛丸童','揽客',0,'吸引 2 名观众。','balls','audience'],
    ['rope','翻索客','杂技',0,'得 2 喝彩。中或高热度时，再吸引 1 名观众。','clapper','applause'],
    ['warm','暖场童','暖场',2,'低热度时吸引 3 名观众，其余时候吸引 1 名。','balls','audience'],
    ['walker','走绳伶','杂技',2,'得 2 喝彩。高热度时再得 2 喝彩。','clapper','applause'],
    ['tea','卖茶客','挣钱',3,'中或高热度时，得 2 赏钱。','lamp','coin'],
    ['jester','弄臣','高潮',0,'低、中、高热度分别得 2、5、8 喝彩，随后离场 2 名观众。','drum','applause'],
  ],
};

export const cards=Object.fromEntries(Object.entries(groups).flatMap(([style,list])=>
  list.map(([id,name,role,cost,text,prop,boost],i)=>{
    const color=styles[style].colors[i];
    const shade=(factor)=>[16,8,0].reduce((value,shift)=>value+(Math.round(((color>>shift)&255)*factor)<<shift),0);
    return [id,{id,name,role,cost,text,prop,boost,style,color,dark:shade(.62),accent:0xe5aa77,
      back:shade(.57),hat:['buns','cap','wing','buns','wing','crown'][i]}];
  })
));
export const roster=Object.values(cards).filter(card=>!card.cost).map(card=>card.id);

const act=(name,place,story,target,bonus,coin)=>({name,place,story,target,bonus,coin,goal:'本幕演出获得 '+target+' 喝彩。'});
export const events={
  spring:act('春社试台','柳溪村','柳溪新搭了戏台，乡亲们等着看春景。',4,2,1),
  butterfly:act('蝶过花窗','柳溪村','孩童候着看蝴蝶登台，也爱听一阵热闹的锣鼓。',6,3,1),
  market:act('赶晚集','青石集','摊贩散场，纷纷围来看戏。',7,3,2),
  shrine:act('庙前说春','栖云庙','香客爱听旧故事，也会为春灯驻足。',8,4,1),
  ferry:act('渡口听风','白鹭渡','渡船未至，台上还得留些景致给过客。',8,4,1),
  finale:act('上元灯会','上元城','满城灯火，戏台前只等最后三锣。',9,5,0),
};
export const route=branch=>['spring','butterfly',branch,'ferry','finale'];
export const marketPots=(act,branch)=>[
  ['梅','兰'],['兰','竹'],branch==='shrine'?['竹','菊']:['梅','竹'],['菊','梅'],['兰','菊'],
][act];
export const heat=audience=>audience>=4?2:audience>=2?1:0;

export function fresh(){
  return {act:0,branch:'market',applause:0,coins:3,board:{flowers:[],fireworks:[],pots:[],butterflies:[],audience:0,fourUsed:false},
    owned:[...roster],lineup:['florist','rain','flowerShow'],choices:{},history:[],ready:false,finished:false};
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
  audience:board.audience,fourUsed:board.fourUsed,
});

export function scoreAct(state){
  const e=events[route(state.branch)[state.act]];
  const board=clone(state.board);
  const buffs=[0,0,0], passed=[false,false,false], steps=[], cues=[];
  let points=0,earned=0;
  const objectives=()=>[[{kind:'points',target:e.target,label:'本幕喝彩',value:points}]];
  const start=objectives();
  function snapshot(extra){
    return {...extra,board:clone(board),points,coins:earned,objectives:objectives()};
  }
  function record(changes,kind,amount){
    if(!amount)return;
    const entry=changes.find(item=>item.kind===kind&&Math.sign(item.amount)===Math.sign(amount));
    if(entry)entry.amount+=amount;
    else changes.push({kind,amount});
  }

  for(const [i,id] of state.lineup.entries()){
    if(!['lure','herd','fan'].includes(id))continue;
    const choice=state.choices[id]??{};
    const changes=[];
    const occupied=[...new Set(board.butterflies)];
    let from=null,to=null;
    if(id==='lure'){
      if(board.butterflies.length<8){
        board.butterflies.push(i);
        record(changes,'butterfly',1);
      }
    }else{
      const sources=id==='fan'?occupied.filter(seat=>seat===i):occupied;
      from=hasChoice(sources,Number(choice.from))?Number(choice.from):sources[0]??null;
      const targets=from===null?[]:[0,1,2].filter(seat=>seat!==from&&(id!=='fan'||Math.abs(seat-from)===1));
      to=hasChoice(targets,Number(choice.to))?Number(choice.to):targets.at(-1)??null;
      if(from!==null&&to!==null){
        board.butterflies[board.butterflies.indexOf(from)]=to;
        for(let seat=Math.min(from,to)+1;seat<Math.max(from,to);seat++)passed[seat]=true;
        record(changes,'move',1);
        if(id==='fan'){
          earned++;
          record(changes,'coin',1);
        }
      }
      cues.push({id,from,to,sources,targets});
    }
    if(changes.length)steps.push(snapshot({i,id,phase:'pre',changes,flight:from!==null&&to!==null?{from,to}:null}));
  }
  passed.forEach((value,i)=>{buffs[i]=value?1:0;});
  board.butterflies.forEach(i=>{buffs[i]=2;});
  const settledLater=[];
  for(const [i,id] of state.lineup.entries()){
    if(!id)continue;
    const choice=state.choices[id]??{};
    const changes=[];
    const card=cards[id];
    let applause=0,boostUsed=false;
    function grant(kind,amount,applyBoost=true){
      if(amount>0&&applyBoost&&!boostUsed&&kind===card.boost){
        amount+=buffs[i];
        boostUsed=true;
      }
      let actual=amount;
      if(kind==='applause')applause+=amount;
      if(kind==='coin')earned+=amount;
      if(kind==='audience'){
        const next=Math.min(5,Math.max(0,board.audience+amount));
        actual=next-board.audience;board.audience=next;
      }
      if(kind==='flower'){
        actual=Math.min(amount,8-board.flowers.length);
        for(let n=0;n<actual;n++)board.flowers.push({age:0});
      }
      record(changes,kind,actual);
    }
    function addFireworks(when){
      const count=Math.min(1+buffs[i],8-board.fireworks.length);
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
      case 'rain': {
        const buds=board.flowers.filter(flower=>flower.age===0);
        buds.forEach(flower=>{flower.age=1;});
        record(changes,'bloom',buds.length);
        break;
      }
      case 'flowerShow':grant('applause',board.flowers.length+bloomCount(board));break;
      case 'ornament':grant('applause',bloomCount(board)?4:board.flowers.length?2:0);break;
      case 'snip':{
        const index=board.flowers.findIndex(flower=>flower.age===1);
        if(index!==-1){
          board.flowers.splice(index,1);
          record(changes,'flower',-1);
          grant('coin',3);
        }
        break;
      }
      case 'tend':{
        const flower=board.flowers.find(item=>item.age===1&&!item.keep);
        if(flower){flower.keep=true;record(changes,'protect',1);}
        break;
      }
      case 'ignite':addFireworks(state.act+2);break;
      case 'fuse':{
        const dates=[...new Set(board.fireworks.filter(date=>date>state.act))].sort((a,b)=>a-b);
        const date=hasChoice(dates,Number(choice.date))?Number(choice.date):dates[0];
        cues.push({id,dates,date});
        if(date!==undefined){board.fireworks[board.fireworks.indexOf(date)]--;record(changes,'advance',1);}
        break;
      }
      case 'flameSong':
      case 'double':settledLater.push({id,i});break;
      case 'quick':
        if(state.coins+earned>0&&board.fireworks.length<8){grant('coin',-1);addFireworks(state.act);}
        break;
      case 'paper':grant('coin',Math.min(2,board.fireworks.length));break;
      case 'planter':{
        const offers=marketPots(state.act,state.branch);
        const pot=hasChoice(offers,choice.pot)?choice.pot:offers.find(type=>!board.pots.includes(type))??offers[0];
        cues.push({id,offers,pot});
        addPot(pot);
        break;
      }
      case 'exchange':{
        const offers=varieties.filter(type=>!board.pots.includes(type));
        const duplicate=repeatedPots(board)[0];
        const pot=hasChoice(offers,choice.pot)?choice.pot:offers[0];
        cues.push({id,offers:duplicate?offers:[],pot});
        if(duplicate&&pot){
          board.pots.splice(board.pots.lastIndexOf(duplicate),1);
          addPot(pot);
          record(changes,'bonsai',-1);
        }
        break;
      }
      case 'judge':grant('applause',countPots(board));break;
      case 'vendor':{
        const duplicate=repeatedPots(board)[0];
        if(duplicate){
          board.pots.splice(board.pots.lastIndexOf(duplicate),1);
          record(changes,'bonsai',-1);
          grant('coin',2);
        }
        break;
      }
      case 'orchid':
        if(board.pots.includes('兰'))grant('applause',2);
        else addPot('兰');
        break;
      case 'four':
        if(!board.fourUsed&&countPots(board)===4){board.fourUsed=true;grant('applause',6);}
        break;
      case 'dancer':grant('applause',2*passed.filter((value,j)=>value&&j!==i).length);break;
      case 'perch':if(board.butterflies.includes(i))grant('applause',3);break;
      case 'peep':if(passed[i])grant('coin',2);break;
      case 'balls':grant('audience',2);break;
      case 'rope':
        grant('applause',2);
        if(temperature>=1)grant('audience',1);
        break;
      case 'warm':grant('audience',temperature===0?3:1);break;
      case 'walker':grant('applause',temperature===2?4:2);break;
      case 'tea':if(temperature>=1)grant('coin',2);break;
      case 'jester':
        grant('applause',[2,5,8][temperature]);
        grant('audience',-2);
        break;
    }
    if(applause>0){
      record(changes,'applause',temperature);
      points+=applause+temperature;
    }
    steps.push(snapshot({id,i,phase:'main',changes}));
  }
  const fired=board.fireworks.filter(date=>date<=state.act).length;
  if(fired){
    board.fireworks=board.fireworks.filter(date=>date>state.act);
    points+=fired*4;
    steps.push(snapshot({id:null,i:-1,phase:'close',changes:[{kind:'firework',amount:-fired},{kind:'applause',amount:fired*4}]}));
    for(const {id,i} of settledLater){
      const base=id==='flameSong'?fired*2:fired>=2?5:0;
      if(!base)continue;
      const amount=base+buffs[i]+heat(board.audience);
      points+=amount;
      steps.push(snapshot({id,i,phase:'close',changes:[{kind:'applause',amount}]}));
    }
  }
  const progress=objectives();
  const hit=points>=e.target;
  return {board,steps,start,progress,hit,buffs,cues,reward:{score:hit?e.bonus:0,coins:hit?e.coin:0},
    score:points+(hit?e.bonus:0),coins:earned+(hit?e.coin:0)};
}
