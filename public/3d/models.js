const THEMES = {
  golden:  { bg:'#0d0800', bg2:'#1a1000', accent:'#f59e0b', accent2:'#fbbf24', dim:'#78350f', text:'#fef3c7', fog:0x0d0800, l1:0xf59e0b, l2:0xef4444, l3:0x60a5fa },
  crystal: { bg:'#04060f', bg2:'#080e1e', accent:'#818cf8', accent2:'#c7d2fe', dim:'#312e81', text:'#e0e7ff', fog:0x04060f, l1:0x818cf8, l2:0xf472b6, l3:0x34d399 },
  forest:  { bg:'#040c04', bg2:'#081408', accent:'#4ade80', accent2:'#bbf7d0', dim:'#166534', text:'#d1fae5', fog:0x040c04, l1:0x4ade80, l2:0xfbbf24, l3:0x60a5fa },
  lava:    { bg:'#0f0202', bg2:'#1f0404', accent:'#ef4444', accent2:'#fca5a5', dim:'#7f1d1d', text:'#fee2e2', fog:0x0f0202, l1:0xef4444, l2:0xf97316, l3:0xa855f7 },
};
const THEME_NAMES = { golden:'Алт', crystal:'Болор', forest:'Ой', lava:'Галт' };

function buildHero(theme) {
  const T = THEMES[theme], g = new THREE.Group();
  const mG = new THREE.MeshPhongMaterial({color:T.accent,shininess:120,specular:0xffffff});
  const mD = new THREE.MeshPhongMaterial({color:0x111111,shininess:40});
  const mR = new THREE.MeshPhongMaterial({color:0xcc2222,shininess:60});
  const mS = new THREE.MeshPhongMaterial({color:0x888888,shininess:160,specular:0xffffff});
  const mB = new THREE.MeshPhongMaterial({color:0x2244aa,shininess:80});
  for (const sx of [-0.26,0.26]) {
    const leg=new THREE.Mesh(new THREE.BoxGeometry(.34,.8,.42),mD); leg.position.set(sx,-.9,0); g.add(leg);
    const boot=new THREE.Mesh(new THREE.BoxGeometry(.36,.24,.5),mG); boot.position.set(sx,-1.34,.04); g.add(boot);
  }
  const torso=new THREE.Mesh(new THREE.BoxGeometry(1,1.1,.6),mG); torso.position.y=.05; g.add(torso);
  const belt=new THREE.Mesh(new THREE.BoxGeometry(1.02,.18,.62),mD); belt.position.y=-.46; g.add(belt);
  const emb=new THREE.Mesh(new THREE.BoxGeometry(.28,.28,.1),new THREE.MeshPhongMaterial({color:0xffdd00,shininess:200,specular:0xffffff})); emb.position.set(0,.15,.35); g.add(emb);
  for (const sx of [-.68,.68]) {
    const p=new THREE.Mesh(new THREE.BoxGeometry(.36,.36,.5),mG); p.position.set(sx,.45,0); g.add(p);
    const arm=new THREE.Mesh(new THREE.BoxGeometry(.32,.7,.38),mG); arm.position.set(sx,-.08,0); g.add(arm);
    const glv=new THREE.Mesh(new THREE.BoxGeometry(.3,.28,.36),mD); glv.position.set(sx,-.5,0); g.add(glv);
  }
  const cape=new THREE.Mesh(new THREE.BoxGeometry(1.1,1.3,.08),mR); cape.position.set(0,-.05,-.34); g.add(cape);
  const neck=new THREE.Mesh(new THREE.BoxGeometry(.28,.22,.28),mG); neck.position.set(0,.65,0); g.add(neck);
  const head=new THREE.Mesh(new THREE.BoxGeometry(.78,.78,.76),mG); head.position.set(0,1.18,0); g.add(head);
  const vis=new THREE.Mesh(new THREE.BoxGeometry(.52,.18,.1),new THREE.MeshPhongMaterial({color:0x224466,shininess:200,transparent:true,opacity:.85})); vis.position.set(0,1.15,.39); g.add(vis);
  const crest=new THREE.Mesh(new THREE.BoxGeometry(.18,.32,.52),new THREE.MeshPhongMaterial({color:0xee2222})); crest.position.set(0,1.64,.05); g.add(crest);
  const htop=new THREE.Mesh(new THREE.BoxGeometry(.82,.26,.8),mG); htop.position.set(0,1.57,0); g.add(htop);
  const sg=new THREE.Group();
  const blade=new THREE.Mesh(new THREE.BoxGeometry(.1,1.6,.1),mS); blade.position.y=.9; sg.add(blade);
  const tip=new THREE.Mesh(new THREE.BoxGeometry(.06,.3,.06),new THREE.MeshPhongMaterial({color:0xaaddff,shininess:300,specular:0xffffff})); tip.position.y=1.85; sg.add(tip);
  const guard=new THREE.Mesh(new THREE.BoxGeometry(.54,.1,.14),mG); sg.add(guard);
  const grip=new THREE.Mesh(new THREE.BoxGeometry(.1,.42,.1),mD); grip.position.y=-.22; sg.add(grip);
  sg.position.set(1.1,.1,.2); sg.rotation.z=.15; g.add(sg);
  const shg=new THREE.Group();
  const sh=new THREE.Mesh(new THREE.BoxGeometry(.55,.75,.1),mB); shg.add(sh);
  const trim=new THREE.Mesh(new THREE.BoxGeometry(.6,.8,.06),new THREE.MeshPhongMaterial({color:parseInt(T.accent.replace('#','0x')),shininess:120})); trim.position.z=-.04; shg.add(trim);
  const boss=new THREE.Mesh(new THREE.SphereGeometry(.1,6,4),mG); boss.position.z=.1; shg.add(boss);
  shg.position.set(-1.1,.1,.15); g.add(shg);
  return g;
}

function buildGem(theme) {
  const T=THEMES[theme], g=new THREE.Group();
  const cols=[parseInt(T.accent.replace('#','0x')),0xf472b6,0x34d399,0x60a5fa,0xfbbf24];
  cols.forEach((col,i)=>{
    const mat=new THREE.MeshPhongMaterial({color:col,shininess:300,specular:0xffffff,transparent:true,opacity:.88,side:THREE.DoubleSide});
    const geo=i===0?new THREE.OctahedronGeometry(1.2,0):new THREE.ConeGeometry(.25+Math.random()*.2,.5+Math.random()*.6,[6,5,8,4,7][i],1);
    const mesh=new THREE.Mesh(geo,mat);
    if(i>0){const a=(i/cols.length)*Math.PI*2;mesh.position.set(Math.cos(a)*1.6,(i%2===0?.4:-.4),Math.sin(a)*1.6);mesh.rotation.set(Math.random(),Math.random(),Math.random());}
    g.add(mesh);
  });
  const inner=new THREE.Mesh(new THREE.OctahedronGeometry(.7,0),new THREE.MeshPhongMaterial({color:0xffffff,emissive:parseInt(T.accent.replace('#','0x')),emissiveIntensity:.6,transparent:true,opacity:.5}));
  g.add(inner);
  return g;
}

function buildCastle(theme) {
  const T=THEMES[theme], g=new THREE.Group();
  const mat=new THREE.MeshPhongMaterial({color:parseInt(T.accent.replace('#','0x')),shininess:60});
  const mD=new THREE.MeshPhongMaterial({color:0x222222,shininess:20});
  const mR=new THREE.MeshPhongMaterial({color:0x882222,shininess:80});
  const wall=new THREE.Mesh(new THREE.BoxGeometry(2.8,1.4,2.8),mat); wall.position.y=-.3; g.add(wall);
  const gate=new THREE.Mesh(new THREE.BoxGeometry(.7,.9,.4),mD); gate.position.set(0,-.6,1.4); g.add(gate);
  for(let i=-3;i<=3;i++){if(Math.abs(i)%2===0){for(const[bx,bz] of [[i*.4,1.4],[i*.4,-1.4],[1.4,i*.4],[-1.4,i*.4]]){const b=new THREE.Mesh(new THREE.BoxGeometry(.28,.4,.28),mat);b.position.set(bx,.5,bz);g.add(b);}}}
  for(const[tx,tz] of [[-1.2,-1.2],[1.2,-1.2],[-1.2,1.2],[1.2,1.2]]){
    const twr=new THREE.Mesh(new THREE.CylinderGeometry(.42,.46,2,8),mat);twr.position.set(tx,.5,tz);g.add(twr);
    const roof=new THREE.Mesh(new THREE.ConeGeometry(.52,.9,8),mR);roof.position.set(tx,1.95,tz);g.add(roof);
    for(let j=0;j<8;j++){const a=(j/8)*Math.PI*2;const bm=new THREE.Mesh(new THREE.BoxGeometry(.14,.22,.14),mat);bm.position.set(tx+Math.cos(a)*.4,1.55,tz+Math.sin(a)*.4);g.add(bm);}
  }
  const ct=new THREE.Mesh(new THREE.CylinderGeometry(.55,.6,2.6,8),mat);ct.position.set(0,.9,0);g.add(ct);
  const cr=new THREE.Mesh(new THREE.ConeGeometry(.7,1.1,8),mR);cr.position.set(0,2.5,0);g.add(cr);
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.8,4),mD);pole.position.set(.05,3.3,0);g.add(pole);
  const flag=new THREE.Mesh(new THREE.BoxGeometry(.5,.32,.02),new THREE.MeshPhongMaterial({color:0xffdd00,side:THREE.DoubleSide}));flag.position.set(.3,3.52,0);g.add(flag);
  for(const[wx,wy,wz] of [[.5,.4,1.4],[-.5,.4,1.4],[0,.3,-1.4],[1.4,.4,0],[-1.4,.4,0]]){
    const win=new THREE.Mesh(new THREE.BoxGeometry(.22,.28,.1),new THREE.MeshPhongMaterial({color:0x88ccff,emissive:0x2244aa,emissiveIntensity:.5}));
    win.position.set(wx,wy,wz);g.add(win);
  }
  return g;
}

function buildSword(theme) {
  const T=THEMES[theme], g=new THREE.Group();
  const mBl=new THREE.MeshPhongMaterial({color:0xddeeff,shininess:500,specular:0xffffff});
  const mG=new THREE.MeshPhongMaterial({color:parseInt(T.accent.replace('#','0x')),shininess:200,specular:0xffffff});
  const mGr=new THREE.MeshPhongMaterial({color:0x3a2208,shininess:40});
  const mGl=new THREE.MeshPhongMaterial({color:0x88ddff,emissive:parseInt(T.accent.replace('#','0x')),emissiveIntensity:.8,transparent:true,opacity:.7});
  const blade=new THREE.Mesh(new THREE.BoxGeometry(.18,3.2,.08),mBl);blade.position.y=1.4;g.add(blade);
  const full=new THREE.Mesh(new THREE.BoxGeometry(.06,2.6,.1),new THREE.MeshPhongMaterial({color:0xaabbcc,shininess:300,specular:0xffffff}));full.position.y=1.4;g.add(full);
  const tip=new THREE.Mesh(new THREE.CylinderGeometry(0,.1,.5,4,1),mBl);tip.rotation.y=Math.PI/4;tip.position.y=3.25;g.add(tip);
  for(let i=0;i<5;i++){const r=new THREE.Mesh(new THREE.BoxGeometry(.05,.18,.1),mGl);r.position.set((i%2===0?.06:-.06),.6+i*.5,.01);g.add(r);}
  const guard=new THREE.Mesh(new THREE.BoxGeometry(1.4,.18,.22),mG);guard.position.y=-.04;g.add(guard);
  for(const gx of [-.55,.55]){const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.1,0),new THREE.MeshPhongMaterial({color:0xff3366,shininess:400,specular:0xffffff,emissive:0x880022,emissiveIntensity:.4}));gem.position.set(gx,-.04,0);g.add(gem);}
  const grip=new THREE.Mesh(new THREE.CylinderGeometry(.09,.11,.9,8),mGr);grip.position.y=-.59;g.add(grip);
  for(let i=0;i<5;i++){const w=new THREE.Mesh(new THREE.TorusGeometry(.12,.02,4,8),mG);w.rotation.x=Math.PI/2;w.position.y=-.26-i*.14;g.add(w);}
  const pom=new THREE.Mesh(new THREE.OctahedronGeometry(.2,0),mG);pom.position.y=-1.12;g.add(pom);
  return g;
}