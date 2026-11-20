export const goalScore = 36;
export const stockLimit = 8;
export const stockKinds = ['flower','butterfly','lamp'];
export const slots = ['开场','过场','收场'];
export const styles = {
  garden:{name:'花蝶',summary:'种花、引蝶，留景或换喝彩。'},
  lantern:{name:'灯火',summary:'积攒灯盏，择机点燃或转成锣点。'},
  rhythm:{name:'锣鼓',summary:'当幕积累锣点，留给压轴木偶。'},
};

const gain = (kind,amount) => ({kind,amount});
const rule = (grants,when=null,spends=[]) => ({grants,when,spends});
const spend = (kind,amount) => ({kind,amount});
const position = i => ({type:'slot',value:i,label:slots[i]});
const threshold = (kind,value,label) => ({type:kind,value,label});
const makeCard = (id,name,style,role,cost,color,dark,accent,back,hat,prop,rules,text) =>
  ({id,name,style,role,cost,color,dark,accent,back,hat,prop,rules,text});

export const cards = Object.fromEntries([
  makeCard('florist','采花娘','garden','铺景',0,0xa5443b,0x6c342c,0xe79699,0x573530,'buns','flower',[
    rule([gain('flower',2)]),
  ],'放下 2 朵花。'),
  makeCard('lure','引蝶童','garden','转化',0,0x405a5a,0x2b3d3a,0xa2c4a3,0x344844,'wing','fan',[
    {...rule([gain('butterfly',1),gain('applause',1)],null,[spend('flower',1)]),repeat:2,needsRoom:'butterfly'},
  ],'逐朵消耗花，最多 2 朵。每朵换来 1 只蝶和 1 喝彩。蝶满时保留花。'),
  makeCard('dancer','蝶衣伶','garden','唱段',3,0x774b77,0x523653,0xde9999,0x54394e,'buns','fan',[
    rule([gain('applause',1)]),
    rule([gain('applause',4)],null,[spend('butterfly',1)]),
  ],'先得 1 喝彩。有蝶时消耗 1 只，再得 4 喝彩。'),
  makeCard('gardener','青篱花匠','garden','借灯',2,0x527c49,0x334c32,0xe29a84,0x394c35,'cap','flower',[
    rule([gain('flower',1)]),
    rule([gain('flower',2)],threshold('lamp',1,'有灯')),
  ],'放下 1 朵花。台上有灯盏时，再放下 2 朵，无需消耗灯。'),
  makeCard('moth','迎蝶婆','garden','转化',4,0x93595e,0x5c3b42,0xf0bf76,0x563841,'crown','flower',[
    rule([gain('applause',1)]),
    {...rule([gain('butterfly',1),gain('lamp',1)],null,[spend('flower',1)]),needsRoom:['butterfly','lamp']},
  ],'得 1 喝彩。蝶或灯还能增加时，用 1 朵花换来 1 蝶与 1 灯。'),
  makeCard('lantern','挑灯人','lantern','铺景',0,0xb26034,0x67402d,0xffbf64,0x634027,'cap','lamp',[
    rule([gain('lamp',2)]),
  ],'放下 2 盏灯。'),
  makeCard('fireworks','焰火师','lantern','爆发',4,0xb5492d,0x773a2d,0xffd778,0x62332b,'crown','lamp',[
    rule([gain('applause',1)]),
    rule([gain('applause',5)],null,[spend('lamp',2)]),
  ],'先得 1 喝彩。消耗 2 盏灯，再得 5 喝彩。'),
  makeCard('singer','灯下伶','lantern','借灯',3,0x537079,0x34424a,0xffc584,0x3c4655,'buns','fan',[
    rule([gain('applause',2)]),
    rule([gain('applause',2)],threshold('lamp',2,'台上至少 2 灯')),
  ],'得 2 喝彩。台上至少有 2 盏灯，再得 2 喝彩，无需消耗灯。'),
  makeCard('watch','巡夜客','lantern','转化',2,0x3a536b,0x293241,0xe4a773,0x313c4a,'cap','lamp',[
    rule([gain('coin',1)]),
    rule([gain('beat',2)],null,[spend('lamp',1)]),
  ],'得 1 赏钱。消耗 1 盏灯，打出 2 锣点。'),
  makeCard('craft','纸灯匠','lantern','借锣',3,0xb08245,0x664735,0xe4bc79,0x5e4832,'cap','lamp',[
    rule([gain('lamp',1),gain('coin',1)]),
    rule([gain('flower',2)],threshold('beat',2,'手上至少 2 锣点')),
  ],'放下 1 盏灯，得 1 赏钱。手上至少有 2 锣点时，再放下 2 朵花。'),
  makeCard('drum','鼓生','rhythm','起势',0,0xa56437,0x704126,0xebaf6e,0x533b27,'wing','drum',[
    rule([gain('coin',2),gain('applause',2),gain('beat',1)]),
  ],'得 2 赏钱、2 喝彩，打出 1 锣点。'),
  makeCard('scholar','说书客','rhythm','开场',0,0x557b68,0x304a3d,0xa7a676,0x3a4640,'wing','fan',[
    rule([gain('coin',1)]),
    rule([gain('applause',2),gain('beat',1)],position(0)),
    rule([gain('flower',1)],{type:'other',value:0,label:'其余站位'}),
  ],'得 1 赏钱。开场时再得 2 喝彩和 1 锣点，其余站位放下 1 朵花。'),
  makeCard('master','镇台老生','rhythm','压轴',5,0x364e71,0x252e47,0xc69a56,0x363745,'crown','drum',[
    rule([gain('applause',2)]),
    rule([gain('applause',3)],position(2)),
    rule([gain('applause',2)],threshold('beat',3,'手上至少 3 锣点')),
  ],'得 2 喝彩。收场时再得 3 喝彩。手上至少有 3 锣点时，额外得 2 喝彩。'),
  makeCard('clapper','执板童','rhythm','起势',0,0x8b553a,0x563526,0xefb977,0x5d3e2f,'buns','clapper',[
    rule([gain('beat',2)]),
    rule([gain('coin',1)],position(1)),
  ],'打出 2 锣点。站在过场时，再得 1 赏钱。'),
  makeCard('lion','醒狮将','rhythm','爆发',4,0xb0443a,0x753329,0xffce76,0x623830,'lion','drum',[
    rule([gain('applause',1)]),
    rule([gain('applause',6),gain('lamp',1)],null,[spend('beat',3)]),
  ],'先得 1 喝彩。消耗 3 锣点，再得 6 喝彩并放下 1 灯。'),
].map(card=>[card.id,card]));

export const roster = ['florist','lure','lantern','drum','scholar','clapper'];
const requirement = (kind,target,label) => ({kind,target,label});
const flower = n => requirement('flower',n,'留花');
const butterfly = n => requirement('butterfly',n,'留蝶');
const lamp = n => requirement('lamp',n,'留灯');
const beat = n => requirement('beats',n,'本幕锣点');
const act = (name,place,stamp,story,goal,bonus,coin,goals) => ({name,place,stamp,story,goal,bonus,coin,goals});
export const events = {
  spring:act('春社试台','柳溪村','春','柳溪新搭了戏台，乡亲们等着看春景。','收场留 2 朵花，或留 2 盏灯。',2,1,[[flower(2)],[lamp(2)]]),
  butterfly:act('蝶过花窗','柳溪村','蝶','孩童候着看蝴蝶登台，也爱听一阵热闹的锣鼓。','本幕引来 2 只蝶，或打出 3 锣点。',3,1,[[requirement('summoned',2,'本幕引蝶')],[beat(3)]]),
  market:act('赶晚集','青石集','市','摊贩散场，纷纷围来看戏。','本幕挣 3 赏钱，或收场留 4 盏灯。',3,2,[[requirement('earned',3,'本幕赏钱')],[lamp(4)]]),
  shrine:act('庙前说春','栖云庙','祈','香客爱听旧故事，也会为春灯驻足。','说书客开场且收场留 2 花，或收场留 4 灯。',4,1,[[requirement('opening',1,'说书客开场'),flower(2)],[lamp(4)]]),
  ferry:act('渡口听风','白鹭渡','渡','渡船未至，台上还得留些景致给过客。','收场留 2 花和 2 蝶，或留 3 灯且本幕打出 3 锣点。',4,1,[[flower(2),butterfly(2)],[lamp(3),beat(3)]]),
  finale:act('上元灯会','上元城','灯','满城灯火，戏台前只等最后三锣。','本幕木偶合计至少获得 7 喝彩。',5,0,[[requirement('points',7,'本幕喝彩')]]),
};
export const route = branch => ['spring','butterfly',branch,'ferry','finale'];

export function fresh() {
  return {act:0,branch:'market',applause:0,coins:0,stock:{flower:0,butterfly:0,lamp:0},owned:[...roster],lineup:[null,null,null],history:[],ready:false,finished:false};
}

function eligible(when,i,stock,beat){
  if(!when)return true;
  if(when.type==='slot')return i===when.value;
  if(when.type==='other')return i!==when.value;
  return (when.type==='beat'?beat:stock[when.type])>=when.value;
}

export function scoreAct(lineup,carried,event){
  const stock={lamp:0,...carried};
  let points=0, earned=0, summoned=0, beat=0, beats=0;
  const objectives=opening=>event.goals.map(path=>path.map(req=>({
    ...req,value:({ ...stock, points, earned, summoned, beats, opening })[req.kind],
  })));
  const start=objectives(0);
  const steps=[];
  lineup.forEach((id,i)=>{
    if(!id)return;
    const previous={...stock,applause:points,coin:earned,beat};
    const changes=[];
    for(const {grants,when,spends,repeat=1,needsRoom=[]} of cards[id].rules){
      if(!eligible(when,i,stock,beat))continue;
      for(let times=0;times<repeat;times++){
        const rooms=[].concat(needsRoom);
        if(rooms.length&&rooms.every(kind=>stock[kind]>=stockLimit))break;
        if(spends.some(({kind,amount})=>(kind==='beat'?beat:stock[kind])<amount))break;
        const change=(kind,amount)=>{
          if(!amount)return;
          const previous=changes.find(item=>item.kind===kind&&Math.sign(item.amount)===Math.sign(amount));
          if(previous)previous.amount+=amount;
          else changes.push({kind,amount});
        };
        for(const {kind,amount} of spends){
          if(kind==='beat')beat-=amount;
          else stock[kind]-=amount;
          change(kind,-amount);
        }
        for(const {kind,amount} of grants){
          let actual=amount;
          if(kind==='coin')earned+=amount;
          else if(kind==='applause')points+=amount;
          else if(kind==='beat'){
            beat+=amount;beats+=amount;
          } else {
            actual=Math.min(amount,stockLimit-stock[kind]);
            stock[kind]+=actual;
            if(kind==='butterfly')summoned+=actual;
          }
          change(kind,actual);
        }
      }
    }
    steps.push({i,id,stock:{...stock},beat,points,coins:earned,score:points-previous.applause,
      earned:earned-previous.coin,changes,objectives:objectives(Number(lineup[0]==='scholar'))});
  });
  const progress=steps.at(-1)?.objectives??start;
  const hit=progress.some(path=>path.every(req=>req.value>=req.target));
  const reward={score:hit?event.bonus:0,coins:hit?event.coin:0};
  return {stock,steps,hit,start,progress,reward,score:points+reward.score,coins:earned+reward.coins};
}
