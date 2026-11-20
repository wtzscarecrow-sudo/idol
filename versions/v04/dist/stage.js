import * as T from './three.module.min.js';

const TAU = Math.PI * 2;
const stands = [-3.55, 0, 3.55];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mat = (color, extra = {}) => new T.MeshStandardMaterial({ color, roughness: .72, ...extra });
const palette = {
  lacquer: mat(0x56261c), dark: mat(0x281b17), edge: mat(0xa35834),
  gold: mat(0xc08d49, { metalness: .51, roughness: .42 }),
  shadeGold: mat(0x745331, { metalness: .32 }),
  skin: mat(0xcb9359), cheek: mat(0xa04535), hair: mat(0x241c18),
  cream: mat(0xddc091), pupil: mat(0x1a1310), thread: mat(0xbb9362),
};
const boxG = new T.BoxGeometry(1,1,1);
const ballG = new T.SphereGeometry(1,20,14);
const cylinderG = new T.CylinderGeometry(1,1,1,28);
function mesh(parent, geometry, material, x,y,z, sx=1,sy=1,sz=1, shadows=true) {
  const object = new T.Mesh(geometry, material);
  object.position.set(x,y,z);
  object.scale.set(sx,sy,sz);
  object.castShadow = shadows;
  object.receiveShadow = shadows;
  parent.add(object);
  return object;
}
const box = (p,m,x,y,z,sx,sy,sz,s=true) => mesh(p,boxG,m,x,y,z,sx,sy,sz,s);
const ball = (p,m,x,y,z,sx,sy,sz,s=true) => mesh(p,ballG,m,x,y,z,sx,sy,sz,s);
const cyl = (p,m,x,y,z,sx,sy,sz,s=true) => mesh(p,cylinderG,m,x,y,z,sx,sy,sz,s);
function group(parent,x=0,y=0,z=0) {
  const g = new T.Group();
  g.position.set(x,y,z);
  parent.add(g);
  return g;
}
function rod(parent,m,start,end,r=.02) {
  const a = new T.Vector3(...start), b = new T.Vector3(...end);
  const center = a.clone().lerp(b,.5);
  const line = cyl(parent,m,center.x,center.y,center.z,r,a.distanceTo(b),r,false);
  line.quaternion.setFromUnitVectors(new T.Vector3(0,1,0), b.sub(a).normalize());
}
function ring(parent,m,x,y,z,r,tube=.018) {
  const o = mesh(parent,new T.TorusGeometry(r,tube,8,48),m,x,y,z);
  o.rotation.x = Math.PI / 2;
  return o;
}
function rng(seed) {
  return () => {
    seed = (Math.imul(seed,1664525)+1013904223)>>>0;
    return seed / 4294967296;
  };
}
function woodTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 256;
  const ctx = c.getContext('2d'), random = rng(451);
  ctx.fillStyle='#814729'; ctx.fillRect(0,0,c.width,c.height);
  for(let i=0;i<2200;i++){
    const y=random()*c.height,x=random()*c.width,len=16+random()*250;
    ctx.strokeStyle = random()>.51 ? 'rgba(53,22,15,.16)' : 'rgba(247,173,93,.11)';
    ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+len*.4,y+random()*3,x+len*.7,y-random()*3,x+len,y+random()*2);ctx.stroke();
  }
  for(let i=0;i<8;i++){
    const y=i*32;
    ctx.fillStyle='#44251c';ctx.fillRect(0,y,1024,2);
    ctx.fillStyle='#a8653e';ctx.fillRect(0,y+2,1024,1);
  }
  const map = new T.CanvasTexture(c); map.colorSpace=T.SRGBColorSpace; map.anisotropy=8;
  return map;
}
const venueSkies = {
  '柳溪村':['#141f2d','#586365','#c28761','#f0ce9f',55,800],
  '青石集':['#2c2028','#886358','#d7a075','#fac29a',41,719],
  '栖云庙':['#182932','#687f7b','#a4a48b','#f2debb',49,820],
  '白鹭渡':['#182840','#527379','#8c9990','#eedbbe',42,650],
  '上元城':['#211d37','#575470','#ab7272','#ffdea7',66,903],
};
function backdrop(venue) {
  const c=document.createElement('canvas');c.width=1600;c.height=850;
  const [upper,middle,lower,moon,moonSize,seed]=venueSkies[venue];
  const ctx=c.getContext('2d'),random=rng(seed);
  const sky=ctx.createLinearGradient(0,0,0,850);
  sky.addColorStop(0,upper);sky.addColorStop(.55,middle);sky.addColorStop(1,lower);
  ctx.fillStyle=sky;ctx.fillRect(0,0,1600,850);
  const halo=ctx.createRadialGradient(1085,217,22,1085,217,235);
  halo.addColorStop(0,'#f8d39b6e');halo.addColorStop(1,'#f8d39b00');
  ctx.fillStyle=halo;ctx.fillRect(0,0,1600,650);
  ctx.fillStyle=moon;ctx.beginPath();ctx.arc(1085,217,moonSize,0,TAU);ctx.fill();
  for(let layer=0;layer<5;layer++){
    const base=405+layer*75;
    ctx.beginPath();ctx.moveTo(-10,850);ctx.lineTo(-10,base);
    for(let x=0;x<=1610;x+=13){
      const y=base-143*Math.pow(Math.abs(Math.sin(x/(120+20*layer)+layer*.94)),3)
        -72*Math.pow(Math.abs(Math.cos(x/93+layer*2)),5)-random()*12;
      ctx.lineTo(x,y);
    }
    ctx.lineTo(1610,850);ctx.closePath();
    const colors=['#758180','#5c6b6a','#485957','#354743','#243834'];
    const fog=ctx.createLinearGradient(0,base-160,0,base+95);
    fog.addColorStop(0,colors[layer]);fog.addColorStop(1,layer>2?'#68736b':'#a68e79');
    ctx.fillStyle=fog;ctx.fill();
  }
  ctx.globalAlpha=.4;
  for(let i=0;i<1700;i++){
    ctx.fillStyle=random()>.5?'#d5b393':'#182529';ctx.fillRect(random()*1600,random()*850,1+random()*2,1);
  }
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;
  return t;
}
function lantern(parent,x,y,z,scale=1) {
  const g=group(parent,x,y,z);g.scale.setScalar(scale);
  const paper=mat(0xff793c,{emissive:0xff6324,emissiveIntensity:.7,roughness:.86});
  const iron=palette.dark;
  ball(g,paper,0,0,0,.33,.41,.33,false);
  cyl(g,iron,0,.38,0,.21,.075,.21,false);
  cyl(g,iron,0,-.37,0,.19,.06,.19,false);
  for(let i=0;i<9;i++){
    const a=TAU*i/9;
    for(let j=0;j<9;j++){
      const pt=(k)=>{const b=Math.PI*(k+1)/11;return [.336*Math.sin(b)*Math.cos(a),.414*Math.cos(b),.336*Math.sin(b)*Math.sin(a)];};
      rod(g,palette.shadeGold,pt(j),pt(j+1),.007);
    }
  }
  rod(g,palette.thread,[0,.4,0],[0,1.15,0],.014);
  rod(g,palette.thread,[0,-.39,0],[0,-.7,0],.018);
  ball(g,palette.gold,0,-.55,0,.038,.04,.038,false);
  const l=new T.PointLight(0xff8a4d,13,5.5,2);l.position.z=.48;g.add(l);
  return g;
}
function curtains(parent) {
  const curtain=mat(0x722d28,{roughness:.96,side:T.DoubleSide});
  const trim=mat(0xbf814e,{side:T.DoubleSide});
  for(const side of [-1,1]){
    const geometry=new T.PlaneGeometry(1,1,24,22);
    const pos=geometry.attributes.position;
    for(let i=0;i<pos.count;i++){
      const u=pos.getX(i)+.5,v=pos.getY(i)+.5;
      const edge=4.68+.75*Math.sin(Math.PI*v)+.15*v;
      const x=edge+(6.38-edge)*u;
      const y=1.1+4.85*v+.18*Math.cos(u*TAU*5)*(1-v);
      const z=.3+Math.cos(u*TAU*5)*.105+.30*(1-v);
      pos.setXYZ(i,side*x,y,z);
    }
    geometry.computeVertexNormals();
    mesh(parent,geometry,curtain,0,0,-2.2);
    for(let i=0;i<8;i++){
      rod(parent,palette.gold,[side*(5.56+i*.08),2.67,-1.84],[side*(5.68+i*.075),2.65,-1.81],.017);
    }
  }
  const top=new T.PlaneGeometry(1,1,84,12);
  const p=top.attributes.position;
  for(let i=0;i<p.count;i++){
    const u=p.getX(i)+.5,v=p.getY(i)+.5;
    const wave=Math.abs(Math.sin(u*3*Math.PI));
    p.setXYZ(i,(u-.5)*13.2,5.87-(1-v)*(.27+.49*wave),-.95+.14*Math.sin(u*38*Math.PI));
  }
  top.computeVertexNormals();mesh(parent,top,curtain,0,0,0);
  for(let i=0;i<112;i++){
    const at=(j)=>{const u=j/112;return [(u-.5)*13.2,5.6-.49*Math.abs(Math.sin(u*3*Math.PI)),-.94+.14*Math.sin(u*38*Math.PI)];};
    rod(parent,trim,at(i),at(i+1),.025);
  }
}
function lattice(p,center) {
  box(p,palette.dark,center,2.85,-3.3,1.55,4.75,.15);
  const panel=mat(0x5d4232,{emissive:0x573423,emissiveIntensity:.22});
  box(p,panel,center,2.85,-3.19,1.36,4.57,.025);
  for(let i=-3;i<=3;i++) box(p,palette.shadeGold,center+i*.2,2.85,-3.13,.033,4.49,.035);
  for(let j=0;j<13;j++) box(p,palette.shadeGold,center,.64+j*.37,-3.11,1.36,.038,.04);
  for(const x of [-.73,.73]) box(p,palette.lacquer,center+x,2.85,-3.06,.075,4.69,.09);
}
function sign(parent) {
  const c=document.createElement('canvas');c.width=640;c.height=160;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#301d16';ctx.fillRect(0,0,640,160);ctx.strokeStyle='#ad7146';ctx.lineWidth=8;ctx.strokeRect(8,8,624,144);
  ctx.strokeStyle='#74502f';ctx.lineWidth=3;ctx.strokeRect(21,21,598,118);
  ctx.fillStyle='#edc58a';ctx.font='bold 79px SimSun, serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('聽　春　臺',320,84);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;
  mesh(parent,new T.PlaneGeometry(3.05,.76),new T.MeshBasicMaterial({map}),0,5.43,-.66);
}
function stageSet(scene) {
  const p=group(scene);
  const grain=mat(0xd29b70,{map:woodTexture()});
  box(p,palette.dark,0,-.69,0,14.8,1.12,7.65);
  box(p,palette.edge,0,-.21,0,14.97,.17,7.78);
  mesh(p,new T.PlaneGeometry(14.65,7.56),grain,0,-.114,0).rotation.x=-Math.PI/2;
  box(p,palette.lacquer,0,-.55,3.91,15,.49,.12);
  for(const offset of [-.76,-.34]) box(p,palette.gold,0,offset,3.99,14.91,.025,.035);
  for(let i=-6;i<=6;i++){
    const x=i*1.1;
    box(p,palette.edge,x,-.55,4,.39,.24,.035);
    const boss=box(p,palette.shadeGold,x,-.55,4.025,.11,.11,.04);
    boss.rotation.z=Math.PI/4;
  }
  for(const [x,z,y,w] of [[-6.39,-1.56,5.9,.36],[6.39,-1.56,5.9,.36],[-6.85,-3.28,5.8,.29],[6.85,-3.28,5.8,.29]]){
    box(p,palette.lacquer,x,y/2,z,w,y,w);
    box(p,palette.edge,x-w*.25,y/2,z+w*.42,w*.18,y*.94,w*.14);
    box(p,palette.gold,x,.46,z,w*1.3,.10,w*1.3);
    box(p,palette.dark,x,.19,z,w*1.56,.44,w*1.56);
    box(p,palette.gold,x,y-.32,z,w*1.38,.12,w*1.38);
    box(p,palette.dark,x,y-.15,z,w*1.7,.24,w*1.7);
  }
  box(p,palette.dark,0,6.1,-1.63,13.9,.44,.63);
  box(p,palette.edge,0,5.96,-1.21,13.6,.075,.09);
  box(p,palette.gold,0,6.17,-1.19,13.92,.05,.1);
  for(let i=-8;i<=8;i++) box(p,palette.dark,i*.84,5.89,-1.35,.18,.23,.6);
  for(const x of [-6.45,-4.88,4.88,6.45]) lattice(p,x);
  curtains(p);
  sign(p);
  lantern(p,-5.6,3.92,-.66,1.12);
  lantern(p,5.6,3.92,-.66,1.12);
  lantern(p,-6.84,3.01,1.91,.65);
  lantern(p,6.84,3.01,1.91,.65);
  const stagePads=stands.map(x=>{
    const pad=group(p,x,.04,.47);
    cyl(pad,palette.dark,0,.04,0,1.02,.18,.87);
    cyl(pad,palette.lacquer,0,.15,0,.96,.1,.82);
    ring(pad,palette.gold,0,.212,0,.79,.022).scale.y=.86;
    ring(pad,palette.shadeGold,0,.213,0,.67,.013).scale.y=.86;
    for(let i=0;i<8;i++){
      const a=i*TAU/8;
      ball(pad,palette.gold,.87*Math.cos(a),.198,.75*Math.sin(a),.035,.016,.035,false);
    }
    return pad;
  });
  for(const side of [-1,1]){
    const pot=group(p,side*5.7,0,2.55);
    cyl(pot,palette.lacquer,0,.21,0,.34,.42,.31);
    ring(pot,palette.gold,0,.43,0,.29);
    const leaf=mat(0x435744);
    const random=rng(410+side);
    for(let i=0;i<13;i++){
      const x=(random()-.5)*.9,y=.54+random()*.64,z=(random()-.5)*.6;
      rod(pot,palette.shadeGold,[0,.38,0],[x,y,z],.013);
      const l=ball(pot,leaf,x,y,z,.15,.044,.067,false);l.rotation.z=(random()-.5)*2;
    }
  }
  return stagePads;
}

function puppet(parent,card) {
  const root=group(parent);
  const coat=mat(card.color), muted=mat(card.dark), inset=mat(card.accent);
  const body=group(root,0,.61,0);
  const skirt=new T.CylinderGeometry(.28,.57,.82,12);
  mesh(body,skirt,coat,0,.3,0,1,1,.73);
  cyl(body,muted,0,-.099,0,.56,.082,.41);
  ring(body,palette.gold,0,-.052,0,.53,.015).scale.y=.74;
  ball(body,coat,0,.82,0,.39,.44,.28);
  ball(body,muted,0,.668,.213,.28,.27,.086);
  ball(body,inset,0,.746,.286,.157,.137,.045);
  box(body,palette.gold,0,.43,.268,.51,.055,.036);
  for(const s of [-1,1]){
    rod(body,palette.cream,[s*.23,1.03,.234],[0,.78,.30],.029);
    ball(body,palette.dark,s*.22,-.16,.125,.153,.092,.207);
    for(let i=0;i<3;i++) ball(body,palette.gold,s*(.14+i*.082),.1-i*.026,.311,.033,.029,.012);
  }
  const head=group(body,0,1.05,0);
  ball(head,palette.gold,0,.075,0,.105,.103,.098);
  ball(head,palette.skin,0,.40,.025,.329,.36,.276);
  ball(head,palette.hair,0,.565,-.054,.345,.225,.268);
  ball(head,palette.skin,0,.342,.291,.049,.053,.047);
  for(const s of [-1,1]){
    ball(head,palette.skin,s*.317,.378,.016,.055,.082,.065);
    ball(head,palette.cheek,s*.179,.287,.247,.051,.028,.014);
    ball(head,palette.pupil,s*.112,.394,.283,.045,.016,.019);
    ball(head,palette.hair,s*.109,.455,.28,.058,.011,.016).rotation.z=s*.16;
    ball(head,palette.gold,s*.331,.299,.048,.04,.048,.04);
  }
  ball(head,palette.cheek,0,.235,.249,.07,.018,.021);
  if(card.hat==='buns'){
    for(const s of [-1,1]){
      ball(head,palette.hair,s*.265,.691,-.007,.153,.139,.142);
      ball(head,inset,s*.29,.739,.105,.09,.074,.053);
      for(let i=0;i<5;i++){
        const a=i*TAU/5;
        ball(head,palette.cream,s*.29+.047*Math.cos(a),.739+.047*Math.sin(a),.151,.03,.025,.024);
      }
    }
  } else {
    cyl(head,palette.shadeGold,0,.665,0,.39,.049,.296);
    mesh(head,new T.CylinderGeometry(.22,.304,.21,12),muted,0,.755,0,1,1,.84);
    ball(head,palette.gold,0,.794,.243,.068,.07,.029);
    if(card.hat==='lion'){
      ball(head,inset,0,.816,.14,.35,.152,.2);
      for(const side of [-1,1]){
        ball(head,palette.cream,side*.19,.879,.26,.095,.092,.064);
        ball(head,palette.dark,side*.19,.886,.323,.039,.047,.025);
        ball(head,coat,side*.304,.798,.113,.086,.103,.09);
      }
    } else if(card.hat==='crown'){
      for(let i=-2;i<=2;i++){
        ball(head,palette.gold,i*.094,.868-.026*Math.abs(i),.13,.042,.095,.032).rotation.z=-i*.15;
      }
    } else if(card.hat==='wing'){
      for(const s of [-1,1]) rod(head,palette.gold,[0,.775,.01],[s*.49,.828,-.012],.023);
    }
  }
  const arms=[];
  for(const side of [-1,1]){
    const arm=group(body,side*.377,.956,0);
    arm.rotation.z=side*.36;
    ball(arm,palette.gold,0,-.02,0,.105,.108,.099);
    ball(arm,coat,0,-.23,0,.142,.227,.132);
    const elbow=group(arm,0,-.39,0);
    elbow.rotation.x=-.18;
    ball(elbow,palette.gold,0,-.015,0,.09,.099,.093);
    ball(elbow,muted,0,-.173,.006,.12,.156,.117);
    ball(elbow,palette.skin,0,-.302,.014,.083,.092,.081);
    ball(elbow,palette.gold,0,-.246,.017,.122,.035,.114);
    arms.push({arm,elbow,side,angle:side*.36,velocity:0});
  }
  const held=group(arms[1].elbow,0,-.315,.047);
  if(card.prop==='drum'){
    const d=group(held,0,-.09,.15);d.rotation.x=.8;
    cyl(d,muted,0,0,0,.23,.13,.23);cyl(d,palette.cream,0,.079,0,.219,.032,.219);
    ring(d,palette.gold,0,.093,0,.21);
  } else if(card.prop==='lamp'){
    rod(held,palette.shadeGold,[0,-.07,0],[.08,.30,.04],.024);
    miniatureLamp(held,.10,.08,.12).scale.setScalar(.78);
  } else if(card.prop==='rocket'){
    rocket(held,.1,-.1,.08).scale.setScalar(.65);
  } else if(card.prop==='bonsai'){
    bonsai(held,.10,-.12,.08).object.scale.setScalar(.58);
  } else if(card.prop==='balls'){
    for(let i=0;i<3;i++)ball(held,i===1?palette.gold:inset,(i-1)*.11,.05+Math.sin(i*Math.PI/2)*.14,.09,.075,.075,.075);
  } else if(card.prop==='clapper'){
    for(const side of [-1,1]){
      const slate=box(held,palette.edge,.045*side,-.10,.07,.069,.34,.075);
      slate.rotation.z=.22*side;
    }
  } else if(card.prop==='flower'){
    rod(held,palette.shadeGold,[0,-.11,0],[.12,.2,.02],.022);
    for(let i=0;i<6;i++){
      const a=i*TAU/6;
      ball(held,inset,.12+.083*Math.cos(a),.21+.083*Math.sin(a),.025,.07,.064,.036);
    }
    ball(held,palette.gold,.12,.21,.061,.045,.048,.026);
  } else {
    const fan=group(held,.03,-.12,.045);fan.rotation.z=-.28;
    mesh(fan,new T.CircleGeometry(.26,24,0,Math.PI),inset,0,0,0);
    for(let i=0;i<=8;i++){
      const a=i*Math.PI/8;
      rod(fan,palette.gold,[0,-.09,.01],[.25*Math.cos(a),.25*Math.sin(a),.013],.008);
    }
  }
  return {root,head,body,arms,angle:0,velocity:0,energy:0,phase:0};
}
function flower(parent,x,z) {
  const p=group(parent,x,.01,z);const stem=mat(0x687343),petal=mat(0xe79596);
  for(let j=0;j<3;j++){
    const a=j*TAU/3;
    const tip=[Math.cos(a)*.14,.26+j*.055,Math.sin(a)*.14];
    rod(p,stem,[0,.03,0],tip,.018);
    for(let i=0;i<5;i++){
      const b=i*TAU/5;
      ball(p,petal,tip[0]+.057*Math.cos(b),tip[1]+.016,tip[2]+.057*Math.sin(b),.055,.039,.055,false);
    }
    ball(p,palette.gold,tip[0],tip[1]+.049,tip[2],.038,.026,.038,false);
  }
  return p;
}
function rocket(parent,x,y,z){
  const o=group(parent,x,y,z);
  cyl(o,palette.edge,0,.24,0,.105,.30,.105);
  mesh(o,new T.ConeGeometry(.13,.18,12),palette.gold,0,.47,0);
  rod(o,palette.shadeGold,[0,0,0],[0,.14,0],.025);
  return o;
}
const foliage={梅:0xdb718e,兰:0x8871bc,竹:0x7aa35b,菊:0xeab860};
function bonsai(parent,x,y,z){
  const object=group(parent,x,y,z);
  cyl(object,palette.lacquer,0,.08,0,.23,.16,.18);
  ring(object,palette.gold,0,.15,0,.21,.012).scale.y=.8;
  const leaves=mat(foliage.梅);
  for(let k=-1;k<=1;k++){
    rod(object,palette.shadeGold,[0,.14,0],[k*.13,.41+.10*(1-Math.abs(k)),0],.017);
    ball(object,leaves,k*.13,.42+.10*(1-Math.abs(k)),0,.115,.113,.093,false);
  }
  return {object,leaves};
}
function viewer(parent,x,z,i){
  const o=group(parent,x,.02,z);
  const coat=mat([0x58374d,0x395759,0x693e32,0x455136,0x58476e][i]);
  cyl(o,coat,0,.16,0,.17,.31,.127);
  ball(o,palette.skin,0,.38,0,.106,.115,.104,false);
  ball(o,palette.hair,0,.435,.025,.13,.07,.112,false);
  return o;
}
function butterfly(parent,x,z) {
  const p=group(parent,x,.72,z), wings=[];
  const wing=mat(0xf4ad60,{emissive:0x9d5324,emissiveIntensity:.47,side:T.DoubleSide});
  const pattern=mat(0xbd5841,{side:T.DoubleSide});
  for(const s of [-1,1]){
    const w=group(p);
    ball(w,wing,s*.138,.026,0,.156,.102,.019,false).rotation.z=s*.46;
    ball(w,pattern,s*.116,-.073,0,.099,.077,.019,false);
    ball(w,palette.cream,s*.158,.048,.018,.032,.03,.008,false);
    wings.push(w);
  }
  ball(p,palette.dark,0,0,.016,.034,.137,.036,false);
  return {p,wings,x,z};
}
const lampPaper=mat(0xffb855,{emissive:0xfe852b,emissiveIntensity:1.05});
function miniatureLamp(parent,x,y,z){
  const lamp=group(parent,x,y,z);
  cyl(lamp,palette.dark,0,.055,0,.21,.11,.21);
  ball(lamp,lampPaper,0,.236,0,.177,.182,.177,false);
  for(const side of [-1,1]){
    cyl(lamp,palette.gold,0,.236+side*.154,0,.123,.045,.123,false);
    rod(lamp,palette.shadeGold,[.135*side,.12,.091],[.135*side,.35,.091],.014);
  }
  return lamp;
}
function lights(scene) {
  scene.add(new T.HemisphereLight(0xfdf1d4,0x645346,2.05));
  const key=new T.DirectionalLight(0xffdfa8,3.2);
  key.position.set(-4,8,6);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);
  Object.assign(key.shadow.camera,{left:-10,right:10,top:9,bottom:-9,near:1,far:29});
  key.shadow.normalBias=.036;
  scene.add(key);
  const rim=new T.DirectionalLight(0xa6d7d3,1.6);rim.position.set(6,5,-6);scene.add(rim);
}
function integrate(value,target,velocity,dt,stiffness,damping) {
  velocity+=(stiffness*(target-value)-damping*velocity)*dt;
  return [value+velocity*dt,velocity];
}
function strings(scene,actor) {
  const coordinates=new Float32Array(18);
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.BufferAttribute(coordinates,3));
  const threads=new T.LineSegments(geometry,new T.LineBasicMaterial({
    color:0xe3bc84,transparent:true,opacity:.43,
  }));
  threads.frustumCulled=false;
  scene.add(threads);
  const hand=new T.Vector3();
  return {
    threads,
    update(){
      const anchors=[
        [actor.head,0,.71,-.03],
        [actor.arms[0].elbow,0,-.30,.01],
        [actor.arms[1].elbow,0,-.30,.01],
      ];
      for(const [i,[part,x,y,z]] of anchors.entries()){
        part.localToWorld(hand.set(x,y,z));
        coordinates.set([hand.x,hand.y,hand.z,
          actor.root.position.x+(i===0?0:i===1?-.7:.7),4.75,.31],i*6);
      }
      geometry.attributes.position.needsUpdate=true;
    },
  };
}

export function createStage(host, slotButtons, cards) {
  const renderer=new T.WebGLRenderer({antialias:true,alpha:false});
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.12;
  const portraits={};
  const thumbScene=new T.Scene();
  thumbScene.background=new T.Color(0x3d2b21);
  lights(thumbScene);
  const portraitCam=new T.OrthographicCamera(-1.36,1.36,.71,-.71,.1,15);
  portraitCam.position.set(.56,2.3,7);
  portraitCam.lookAt(0,1.86,0);
  renderer.setSize(290,151,false);
  for(const card of Object.values(cards)){
    const figure=puppet(thumbScene,card);
    figure.root.rotation.y=-.18;
    thumbScene.background.set(card.back);
    renderer.render(thumbScene,portraitCam);
    portraits[card.id]=renderer.domElement.toDataURL('image/webp',.86);
    thumbScene.remove(figure.root);
  }
  renderer.domElement.setAttribute('aria-hidden','true');
  host.append(renderer.domElement);

  const scene=new T.Scene();
  const backgrounds=new Map();
  let currentVenue='';
  function setVenue(venue) {
    if(venue===currentVenue)return;
    if(!backgrounds.has(venue))backgrounds.set(venue,backdrop(venue));
    scene.background=backgrounds.get(venue);
    currentVenue=venue;
  }
  lights(scene);
  const pads=stageSet(scene);
  const camera=new T.OrthographicCamera(-8,8,4.5,-4.5,.1,55);
  const theatre=host.closest('.theatre');
  const actors=[null,null,null], castCache=new Map();
  const resources=group(scene);
  const tokenObjects={flower:[],butterfly:[],firework:[],bonsai:[],audience:[]};
  const burstColors={flower:0xffa7b2,bloom:0xff72a2,protect:0xff9fba,butterfly:0xffc16b,move:0xffc16b,
    firework:0xff9d60,advance:0xffaa62,bonsai:0x97cf83,audience:0xdcb8f6,applause:0xffde7c,coin:0xffb54c};
  const bursts=[];
  const pulse=new T.PointLight(0xffbc79,0,5.8,2);
  scene.add(pulse);
  function burstAt(x,y,z,kind){
    if(reduced)return;
    const material=new T.MeshBasicMaterial({color:burstColors[kind]??0xffda8f,transparent:true});
    const particles=[];
    const large=kind==='firework'&&y>2, size=large?28:9;
    for(let j=0;j<size;j++){
      const angle=j*TAU/size, speed=large?2.8:0.5;
      const spark=ball(scene,material,x,y,z,.045,.038,.045,false);
      particles.push({spark,vx:speed*Math.cos(angle),vy:large?2.7*Math.sin(angle):.45+(j%3)*.37,vz:.5*Math.sin(angle)});
    }
    bursts.push({age:0,particles,material});
  }
  const markerMaterial=mat(0xe5a353,{emissive:0xb96d32,emissiveIntensity:.65});
  const markers=pads.map(pad=>ring(pad,markerMaterial,0,.22,0,.965,.024));
  let active=-1,selecting=false,width=1,height=1;
  const motes=group(scene), random=rng(238), moteData=[];
  const dust=new T.MeshBasicMaterial({color:0xffca78,transparent:true,opacity:.55});
  for(let i=0;i<31;i++){
    const x=(random()-.5)*15,y=.18+random()*5.5,z=(random()-.5)*7;
    const o=ball(motes,dust,x,y,z,.014,.014,.014,false);
    moteData.push({o,x,y,phase:random()*TAU});
  }

  function resize() {
    width=host.clientWidth;height=host.clientHeight;
    if(!width||!height)return;
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));
    renderer.setSize(width,height,false);
    const aspect=width/height;
    const halfW=aspect<1.45?8.1:Math.max(8.6,aspect*4.36);
    const halfH=halfW/aspect;
    theatre.style.setProperty('--cue-width',3*(stands[2]-stands[1])/(2*halfW)*100+'%');
    camera.left=-halfW;camera.right=halfW;
    camera.top=halfH;camera.bottom=-halfH;
    camera.position.set(0,7.05,15.4);
    camera.lookAt(0,2.65,-.33);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    for(let i=0;i<stands.length;i++){
      const target=new T.Vector3(stands[i],.16,1.58).project(camera);
      slotButtons[i].style.left=(target.x+1)*50+'%';
      slotButtons[i].style.top=(1-target.y)*50+'%';
    }
  }
  new ResizeObserver(resize).observe(host);
  resize();
  function sync(ids,board,selected,venue,animate=false) {
    setVenue(venue);
    selecting=Boolean(selected);
    const changes=ids.map((id,i)=>(actors[i]?.id??null)!==id);
    actors.forEach((actor,i)=>{
      if(!actor||!changes[i])return;
      scene.remove(actor.root,actor.strings.threads);
      actors[i]=null;
    });
    ids.forEach((id,i)=>{
      if(!changes[i]||!id)return;
      if(!castCache.has(id)){
        const actor=puppet(scene,cards[id]);
        actor.id=id;
        actor.strings=strings(scene,actor);
        castCache.set(id,actor);
      }
      const actor=castCache.get(id);
      actors[i]=actor;
      scene.add(actor.root,actor.strings.threads);
      actor.phase=i*1.83;actor.angle=.20;actor.energy=.67;actor.velocity=-1.6;
      actor.root.position.set(stands[i],.23,.47);
    });
    const contents={flower:board.flowers,butterfly:board.butterflies,firework:board.fireworks,bonsai:board.pots,
      audience:Array.from({length:board.audience},(_,i)=>i)};
    for(const kind of Object.keys(tokenObjects)){
      const pieces=tokenObjects[kind];
      const items=contents[kind];
      while(pieces.length<items.length){
        const i=pieces.length;
        const x=kind==='flower'?-1.35-(i%4)*.63:kind==='bonsai'?1.35+(i%4)*.63:(i%4-1.5)*.58;
        const z=kind==='audience'?3.66:kind==='firework'?2.44+Math.floor(i/4)*.42:2.78+Math.floor(i/4)*.49;
        const model=kind==='butterfly'?butterfly(resources,x,z):kind==='bonsai'?bonsai(resources,x,.01,z):null;
        const object=model?.p??model?.object??(kind==='flower'?flower(resources,x,z):
          kind==='firework'?rocket(resources,x,.01,z):viewer(resources,(i-2)*.78,z,i));
        pieces.push({object,model,x,z,life:1,visible:false,scale:1,travel:1,from:x});
      }
      pieces.forEach((piece,i)=>{
        const show=i<items.length;
        const changed=piece.visible!==show;
        piece.object.visible=piece.visible=show;
        if(changed){
          piece.life=animate&&!reduced&&show?-.045*(i%4):1;
          if(animate)burstAt(piece.x,kind==='butterfly'?.84:.22,piece.z,kind);
        }
        if(!show)return;
        const value=items[i];
        if(kind==='flower'){
          const scale=value.age===1?1.30:.66;
          if(animate&&piece.scale!==scale)burstAt(piece.x,.33,piece.z,'bloom');
          piece.scale=scale;
        }
        if(kind==='bonsai'){
          piece.model.leaves.color.setHex(foliage[value]);
          piece.scale=value==='竹'?1.22:.92;
        }
        if(kind==='butterfly'){
          const x=stands[value]+(i%3-1)*.29;
          if(piece.x!==x){
            piece.from=piece.object.position.x;
            piece.x=x;
            piece.travel=animate&&!reduced?0:1;
          }
        }
      });
    }
  }
  function highlight(i){
    active=i;
    if(i>=0&&actors[i]){
      actors[i].energy=1;
      actors[i].velocity+=2.95;
      for(const arm of actors[i].arms)arm.velocity+=arm.side*2.5;
    }
  }
  function accent(i,kind){
    if(reduced)return;
    const x=stands[i]??0;
    pulse.color.setHex(burstColors[kind]??burstColors.applause);
    pulse.position.set(x,1.65,1.5);
    pulse.intensity=i<0?34:21;
    if(i<0&&kind==='firework'){
      burstAt(-2.15,3.72,-.12,'firework');
      burstAt(.2,4.18,-.24,'applause');
      burstAt(2.16,3.82,-.12,'firework');
    }else burstAt(x,1.36,.66,kind);
  }
  let previous=performance.now();
  renderer.setAnimationLoop(now=>{
    const dt=Math.min(Math.max((now-previous)/1000,0),.025);previous=now;
    const time=now/1000;
    actors.forEach((actor,i)=>{
      markers[i].visible=selecting||active===i||!actor;
      if(!actor)return;
      const {root,body,head,arms,phase}=actor;
      if(reduced){
        root.position.y=.04;actor.strings.update();return;
      }
      actor.energy=Math.max(0,actor.energy-dt*.88);
      const emphasis=active===i?.33:0;
      root.position.y=.04+.015*Math.sin(time*2+phase)+actor.energy*.13;
      root.rotation.y=.10*Math.sin(time*1.5+phase)+emphasis*Math.sin(time*8);
      body.rotation.z=.025*Math.sin(time*2.2+phase)+emphasis*.25*Math.sin(time*7);
      [actor.angle,actor.velocity]=integrate(actor.angle,-body.rotation.z*1.7,actor.velocity,dt,76,7.7);
      head.rotation.z=actor.angle;
      head.rotation.x=.045*Math.sin(time*2+phase)+actor.energy*.14;
      for(const a of arms){
        const target=a.side*(.30+.073*Math.sin(time*2.4+phase)+emphasis*(1.55+.86*Math.sin(time*9)));
        [a.angle,a.velocity]=integrate(a.angle,target,a.velocity,dt,57,7);
        a.arm.rotation.z=a.angle;
        a.elbow.rotation.x=-.19-actor.energy*.49*(.66+.34*Math.sin(time*8+phase));
      }
      actor.strings.update();
    });
    for(const pieces of Object.values(tokenObjects))pieces.forEach(piece=>{
      if(!piece.visible)return;
      piece.life=Math.min(1,piece.life+dt*2.1);
      const eased=piece.life>=1?1:Math.max(.05,1-Math.pow(1-Math.max(piece.life,0),3)*Math.cos(piece.life*9));
      piece.object.scale.setScalar(eased*piece.scale);
    });
    tokenObjects.butterfly.forEach((piece,i)=>{
      const {model:{p,wings},x,life}=piece;
      if(!p.visible)return;
      const t=reduced?i:time;
      const arrive=Math.max(0,1-life);
      piece.travel=Math.min(1,piece.travel+dt*2.35);
      const progress=piece.travel;
      const actualX=T.MathUtils.lerp(piece.from,x,progress);
      p.position.set(actualX+.22*Math.cos(t*2+i),1.55+.24*Math.sin(t*2.4+i)+arrive*.38+
        Math.sin(Math.PI*progress)*1.15,.92+.18*Math.sin(t*2+i));
      p.rotation.y=t*.56+i;
      wings.forEach((w,j)=>w.rotation.y=(j===0?-1:1)*(.27+.74*Math.sin(t*20+i)));
    });
    pulse.intensity=Math.max(0,pulse.intensity-dt*57);
    for(let j=bursts.length-1;j>=0;j--){
      const burst=bursts[j];
      burst.age+=dt;
      burst.material.opacity=Math.max(0,1-burst.age/.62);
      for(const particle of burst.particles){
        particle.spark.position.x+=particle.vx*dt;
        particle.spark.position.y+=(particle.vy-burst.age*2)*dt;
        particle.spark.position.z+=particle.vz*dt;
      }
      if(burst.age>=.62){
        scene.remove(...burst.particles.map(particle=>particle.spark));
        burst.material.dispose();
        bursts.splice(j,1);
      }
    }
    if(!reduced)for(const {o,x,y,phase} of moteData){
      o.position.x=x+.25*Math.sin(time*.47+phase);
      o.position.y=y+.17*Math.cos(time*.52+phase);
    }
    renderer.render(scene,camera);
  });
  return {sync,highlight,accent,portraits};
}
