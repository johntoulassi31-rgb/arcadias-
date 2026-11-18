import * as THREE from "three";

export function createWorld(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.12;

 const scene=new THREE.Scene();
 scene.background=new THREE.Color(0x9dc4d0);
 scene.fog=new THREE.Fog(0x9dc4d0,34,68);
 const camera=new THREE.OrthographicCamera(-18,18,18,-18,.1,150);
 camera.position.set(22,25,25);
 camera.lookAt(0,0,0);

 scene.add(new THREE.HemisphereLight(0xe4f4ff,0x6c583d,2.0));
 const sun=new THREE.DirectionalLight(0xffe0ad,3.2);
 sun.position.set(-12,24,10);sun.castShadow=true;
 sun.shadow.mapSize.set(2048,2048);
 sun.shadow.camera.left=-25;sun.shadow.camera.right=25;sun.shadow.camera.top=25;sun.shadow.camera.bottom=-25;
 sun.shadow.bias=-.00025;scene.add(sun);

 const mat=(color,roughness=.85)=>new THREE.MeshStandardMaterial({color,roughness});
 // Hand-painted style procedural textures: masonry, paving, terracotta and timber.
 function paintedTexture(base,draw,size=256){
  const c=document.createElement("canvas");c.width=c.height=size;
  const ctx=c.getContext("2d");ctx.fillStyle=base;ctx.fillRect(0,0,size,size);draw(ctx,size);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.anisotropy=4;return tex;
 }
 const stoneTex=paintedTexture("#9a968e",(c,n)=>{
  for(let y=0;y<n;y+=42)for(let x=0;x<n;x+=64){
   c.fillStyle=["#b9b3a6","#aaa69d","#c7c0b0","#88877f"][(x/64+y/42)%4|0];
   c.fillRect(x+2,y+2,60,38);c.strokeStyle="#706e68";c.lineWidth=2;c.strokeRect(x+2,y+2,60,38);
   c.fillStyle="#d7d0bf";c.fillRect(x+5,y+5,50,2);
  }
 });
 const pavingTex=paintedTexture("#bdb5a4",(c,n)=>{
  for(let y=0;y<n;y+=28)for(let x=0;x<n;x+=42){
   const xx=x+((y/28|0)%2)*21;c.fillStyle=["#d5cbb7","#c6bda9","#b5ad9e","#e0d5c0"][(x+y)%4];
   c.fillRect(xx+1,y+1,39,25);c.strokeStyle="#817a6d";c.lineWidth=1.5;c.strokeRect(xx+1,y+1,39,25);
   c.strokeStyle="#eee4d1";c.beginPath();c.moveTo(xx+3,y+3);c.lineTo(xx+35,y+3);c.stroke();
  }
 });
 const roofTex=paintedTexture("#a34a36",(c,n)=>{
  for(let y=0;y<n;y+=22)for(let x=0;x<n;x+=32){
   const xx=x+((y/22|0)%2)*16;c.fillStyle=["#c65d43","#a94334","#d0714c","#8f392f"][(x+y)%4];
   c.fillRect(xx+1,y+1,29,19);c.strokeStyle="#71382f";c.lineWidth=2;c.strokeRect(xx+1,y+1,29,19);
   c.strokeStyle="#e58a65";c.beginPath();c.moveTo(xx+3,y+3);c.lineTo(xx+25,y+3);c.stroke();
  }
 });
 const timberTex=paintedTexture("#68452e",(c,n)=>{
  for(let i=0;i<30;i++){c.strokeStyle=i%2?"#8d6040":"#4c3022";c.lineWidth=1+(i%3);c.beginPath();c.moveTo(0,i*9);c.bezierCurveTo(80,i*9+4,170,i*9-4,n,i*9);c.stroke()}
 });
 const stone=new THREE.MeshStandardMaterial({color:0xd1c7b4,map:stoneTex,roughness:1}),stoneDark=mat(0x827c70),mortar=new THREE.MeshStandardMaterial({color:0xc9c0b0,map:pavingTex,roughness:1});
 const grass=mat(0x537d43),leaf=mat(0x397c48),leafLight=mat(0x6a9b4c);
 const wood=new THREE.MeshStandardMaterial({color:0x8a5a38,map:timberTex,roughness:.92}),woodLight=mat(0xb17a4e),roof=new THREE.MeshStandardMaterial({color:0xffffff,map:roofTex,roughness:.95}),roofLight=mat(0xc16a48);
 const wall=mat(0xe7d1a7),wall2=mat(0xcab58e),glass=new THREE.MeshStandardMaterial({color:0x83c8d9,metalness:.15,roughness:.2,emissive:0x173e4c});
 const gold=new THREE.MeshStandardMaterial({color:0xd4a94e,metalness:.55,roughness:.35});
 const water=new THREE.MeshStandardMaterial({color:0x36bde0,metalness:.25,roughness:.18,transparent:true,opacity:.88});
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(54,42),new THREE.MeshStandardMaterial({color:0x739b59,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.16;ground.receiveShadow=true;scene.add(ground);
 const world=new THREE.Group();scene.add(world);

 function box(parent,w,h,d,material,x,y,z,cast=true){
  const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(x,y+h/2,z);o.castShadow=cast;o.receiveShadow=true;parent.add(o);return o;
 }
 function roofMesh(parent,w,h,d,material,x,y,z){
  const g=new THREE.BufferGeometry();
  const a=[-w/2,0,-d/2],b=[w/2,0,-d/2],c=[0,h,-d/2],dd=[-w/2,0,d/2],e=[w/2,0,d/2],f=[0,h,d/2];
  const verts=[...a,...b,...c,...dd,...f,...e, ...a,...c,...f,...dd, ...b,...e,...f,...c, ...a,...dd,...e,...b];
  g.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));g.computeVertexNormals();
  const m=new THREE.Mesh(g,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);
  const side=new THREE.MeshStandardMaterial({color:0x713d32,roughness:.9,side:THREE.DoubleSide});
  const g2=new THREE.BufferGeometry();g2.setAttribute("position",new THREE.Float32BufferAttribute([
   -w/2,0,-d/2, -w/2,0,d/2, 0,h,0,
   w/2,0,-d/2, 0,h,0, w/2,0,d/2
  ],3));g2.computeVertexNormals();const sides=new THREE.Mesh(g2,side);sides.position.copy(m.position);sides.castShadow=true;parent.add(sides);
 }
 function windowAt(parent,x,y,z,front=true){
  box(parent,.62,.78,.09,wood,x,y,z);
  box(parent,.47,.61,.11,glass,x,y+.08,z+(front?-.055:.055));
  box(parent,.07,.68,.13,gold,x-.02,y+.05,z-.07);
  box(parent,.08,.68,.13,gold,x+.02,y+.05,z-.07);
  box(parent,.58,.06,.14,woodLight,x,y+.38,z-.07);
 }
 function house(x,z,w=5,d=4,tint=wall,kind="home"){
  const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
  box(g,w,3.2,d,tint,0,0,0);
  // dark timber framing makes each building visibly volumetric
  for(const xx of [-w/2+.16,w/2-.16])box(g,.16,3.3,.18,wood,xx,0,-d/2-.05);
  box(g,w+.2,.17,.2,wood,0,2.8,-d/2-.06);
  roofMesh(g,w+1.0,2.1,d+1.0,roof,0,3.15,0);
  box(g,w+1.08,.16,d+1.08,wood,0,3.12,0);
  // facade door and windows
  box(g,.9,1.9,.14,wood,0,0,-d/2-.10);
  box(g,.68,1.62,.16,woodLight,0,.08,-d/2-.18);
  const doorKnob=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),gold);doorKnob.position.set(.25,.95,-d/2-.28);g.add(doorKnob);
  windowAt(g,-w*.29,1.55,-d/2-.12);
  windowAt(g,w*.29,1.55,-d/2-.12);
  // timber cross-beams, stone steps and flower boxes add readable facade depth
  box(g,w+.12,.13,.22,wood,0,1.15,-d/2-.09);
  box(g,w+.12,.13,.22,wood,0,2.45,-d/2-.09);
  box(g,.12,3.2,.2,wood,-w*.18,0,-d/2-.10);
  box(g,.12,3.2,.2,wood,w*.18,0,-d/2-.10);
  box(g,1.35,.18,.48,stone,-.0,0,-d/2-.34);
  box(g,1.12,.12,.32,stoneDark,0,.18,-d/2-.34);
  for(const wx of [-w*.29,w*.29]){
   box(g,.95,.16,.3,wood,wx,1.42,-d/2-.28);
   for(let f=0;f<3;f++){
    const bloom=new THREE.Mesh(new THREE.SphereGeometry(.12,7,6),mat([0xd96d83,0xe7c45b,0x9b83cf][f]));
    bloom.position.set(wx-.28+f*.28,1.67,-d/2-.3);g.add(bloom);
   }
  }
  // chimney
  box(g,.55,1.6,.6,stoneDark,w*.27,4.05,d*.18);
  box(g,.7,.18,.72,stone,w*.27,5.55,d*.18);
  // Fronton triangulaire et étage en encorbellement, caractéristiques
  // des maisons à colombages visibles sur la référence.
  const gableShape=new THREE.Shape();gableShape.moveTo(-w/2,3.02);gableShape.lineTo(w/2,3.02);gableShape.lineTo(0,5.15);gableShape.closePath();
  const gable=new THREE.Mesh(new THREE.ShapeGeometry(gableShape),wall2);gable.position.set(0,0,-d/2-.13);gable.castShadow=true;gable.receiveShadow=true;g.add(gable);
  box(g,.2,2.95,.2,wood,-w/2+.12,0,-d/2-.2);
  box(g,.2,2.95,.2,wood,w/2-.12,0,-d/2-.2);
  box(g,w+.35,.2,.25,wood,0,3.0,-d/2-.2);
  const ridge=new THREE.Mesh(new THREE.BoxGeometry(.2,2.25,.2),wood);ridge.position.set(0,4.02,-d/2-.22);ridge.rotation.z=0;g.add(ridge);
  const gableBeamL=new THREE.Mesh(new THREE.BoxGeometry(w*.62,.17,.2),wood);gableBeamL.position.set(-w*.17,4.05,-d/2-.22);gableBeamL.rotation.z=-.58;g.add(gableBeamL);
  const gableBeamR=new THREE.Mesh(new THREE.BoxGeometry(w*.62,.17,.2),wood);gableBeamR.position.set(w*.17,4.05,-d/2-.22);gableBeamR.rotation.z=.58;g.add(gableBeamR);
  // Tuiles en relief sur les deux pans : elles suivent la pente du toit.
  const tileMats=[mat(0xa84332),mat(0xc45b3e),mat(0x913b30),mat(0xd27650)];
  for(let side of [-1,1]){
   for(let row=0;row<4;row++){
    const xx=side*(w*.43-row*w*.105);
    const yy=3.35+row*.40;
    for(let col=0;col<Math.ceil((d+1)/.62);col++){
     const zz=-d*.48+col*.62;
     const tile=new THREE.Mesh(new THREE.BoxGeometry(.78,.075,.54),tileMats[(row+col)%tileMats.length]);
     tile.position.set(xx,yy,zz);tile.rotation.z=side===-1?.48:-.48;tile.castShadow=true;g.add(tile);
    }
   }
  }
  // Contrevents, poutres diagonales et encadrements visibles sur la façade.
  for(const xx of [-w*.39,w*.39]){
   const brace=new THREE.Mesh(new THREE.BoxGeometry(.14,1.25,.18),woodLight);brace.position.set(xx,2.02,-d/2-.22);brace.rotation.z=xx<0?-.72:.72;g.add(brace);
  }
  // Foundation
  box(g,w+.3,.28,d+.3,stoneDark,0,-.12,0);
  if(kind==="inn"||kind==="shop"){
   // striped tavern awning, mounted over the front windows
   for(let i=0;i<7;i++){
    const stripe=new THREE.Mesh(new THREE.BoxGeometry(.62,.12,1.0),mat(i%2?0xf0dfc1:0xa9473c));
    stripe.position.set(-1.86+i*.62,2.7,-d/2-.55);stripe.rotation.x=-.12;stripe.castShadow=true;g.add(stripe);
   }
   const sign=new THREE.Mesh(new THREE.BoxGeometry(1.7,.85,.12),gold);sign.position.set(0,2.1,-d/2-.29);g.add(sign);
   const signFace=new THREE.Mesh(new THREE.BoxGeometry(1.48,.64,.04),wood);signFace.position.set(0,2.1,-d/2-.37);g.add(signFace);
   // sign emblem
   const emblem=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),gold);emblem.position.set(0,2.1,-d/2-.42);g.add(emblem);
  }
  return {group:g,bounds:{x,z,w:w+1.0,d:d+1.0},kind};
 }
 // Implantation reprise de la maquette : commerces et maisons à gauche,
 // grande place centrale dégagée, enceinte royale sur le côté droit.
 const buildings=[
  house(-12,-7,6.4,5.2,wall2,"shop"),
  house(-13,6.3,6.2,5.3,wall,"inn"),
  house(-6.8,-9.2,4.8,4.2,wall),
  house(-7.5,11.5,4.8,4.2,wall2)
 ];
 // Enceinte fortifiée d'Ardencourt : mur de pierre, tours, créneaux et portail.
 const castleMat=new THREE.MeshStandardMaterial({color:0xb6b5b0,map:stoneTex,roughness:1}),castleLight=mat(0xd0c9b9),castleDark=mat(0x454c58);
 function castleBlock(x,y,z,w,h,d,m=castleMat){return box(world,w,h,d,m,x,y,z)}
 function tower(x,z){
  castleBlock(x,0,z,3.1,8.2,3.1,castleMat);
  castleBlock(x,7.8,z,3.55,.55,3.55,castleLight);
  castleBlock(x,3.9,z,3.18,.16,3.18,castleLight);
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){
   castleBlock(x+a*1.15,8.35,z+b*1.15,.55,.7,.55,castleLight);
  }
  castleBlock(x,2.8,z-1.58,.72,1.7,.12,castleDark);
  castleBlock(x,5.3,z-1.58,.72,1.7,.12,castleDark);
 }
 // Mur visible au fond et sur la droite de la place.
 castleBlock(13.9,0,-13.9,1.3,7.7,7.2,castleMat);
 castleBlock(13.9,0,-2.2,1.3,7.7,9.0,castleMat);
 castleBlock(7.4,0,-17.3,14.2,7.7,1.3,castleMat);
 tower(13.8,-17.1);tower(13.8,2.1);tower(1.3,-17.1);
 // Porte monumentale à arche sombre, encadrée de pierres taillées.
 castleBlock(13.05,0,-10.1,1.8,6.5,1.15,castleLight);
 castleBlock(13.05,0,-5.1,1.8,6.5,1.15,castleLight);
 castleBlock(13.05,6.05,-7.6,1.8,.9,5.8,castleLight);
 // L'ouverture centrale reste réellement praticable pour le personnage.
 // Bannières bleues et or sur les remparts.
 const bannerMat=new THREE.MeshStandardMaterial({color:0x173e78,roughness:.8});
 function banner(x,z){
  const g=new THREE.Group();g.position.set(x,4.7,z);world.add(g);
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,2.5,8),gold);pole.position.y=.7;g.add(pole);
  const cloth=new THREE.Mesh(new THREE.PlaneGeometry(1.15,1.8),bannerMat);cloth.position.set(.58,.65,.03);cloth.rotation.y=-.08;g.add(cloth);
  const emblem=new THREE.Mesh(new THREE.CircleGeometry(.22,6),gold);emblem.position.set(.58,.72,.055);g.add(emblem);
 }
 banner(9.8,-16.45);banner(13.1,-12.2);banner(13.1,-2.2);

 // cobbled plaza, each stone is a shallow 3D block
 for(let x=-13;x<=13;x+=1.25)for(let z=-8;z<=9;z+=1.25){
  const tile=new THREE.Mesh(new THREE.BoxGeometry(1.18,.10,1.18),new THREE.MeshStandardMaterial({color:0xffffff,map:pavingTex,roughness:1}));
  tile.position.set(x,-.08,z);tile.receiveShadow=true;tile.castShadow=false;world.add(tile);
 }
 // paths from the plaza to the exits
 for(let i=0;i<8;i++){
  box(world,3,.12,1.15,stone,0,-.03,10+i*1.35,false);
 }
 // central fountain: stone basin, water, pedestal and statue
 const basin=new THREE.Mesh(new THREE.CylinderGeometry(3.55,3.8,.72,16),stoneDark);basin.position.set(0,.25,0);basin.castShadow=true;basin.receiveShadow=true;world.add(basin);
 const rim=new THREE.Mesh(new THREE.CylinderGeometry(3.82,3.82,.34,16),stone);rim.position.set(0,.72,0);rim.castShadow=true;world.add(rim);
 const pool=new THREE.Mesh(new THREE.CylinderGeometry(3.5,3.5,.14,40),water);pool.position.set(0,.88,0);world.add(pool);
 // Anneau de pavés concentriques autour de la fontaine, comme sur la maquette.
 for(let r=4.25;r<5.5;r+=.48)for(let a=0;a<Math.PI*2;a+=.18){
  const tile=new THREE.Mesh(new THREE.BoxGeometry(.52,.12,.42),stone);
  tile.position.set(Math.cos(a)*r,.04,Math.sin(a)*r);tile.rotation.y=-a;tile.receiveShadow=true;world.add(tile);
 }
 const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(.65,.9,2.1,8),stone);pedestal.position.set(0,1.7,0);pedestal.castShadow=true;world.add(pedestal);
 const statue=new THREE.Group();statue.position.set(0,2.85,0);world.add(statue);
 const body=new THREE.Mesh(new THREE.ConeGeometry(.58,1.55,7),gold);body.position.y=.75;body.castShadow=true;statue.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.32,12,10),gold);head.position.y=1.65;statue.add(head);
 const waterJet=new THREE.Mesh(new THREE.CylinderGeometry(.08,.18,1.2,10),water);waterJet.position.set(0,2.8,0);world.add(waterJet);
 const waterStreams=[];
 for(let i=0;i<6;i++){
  const a=i*Math.PI/3;
  const stream=new THREE.Mesh(new THREE.CylinderGeometry(.035,.09,1.05,8),water);
  stream.position.set(Math.cos(a)*1.35,1.55,Math.sin(a)*1.35);
  stream.rotation.z=Math.cos(a)*-.48;stream.rotation.x=Math.sin(a)*.48;world.add(stream);waterStreams.push(stream);
  const droplet=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),new THREE.MeshBasicMaterial({color:0xb8f4ff}));
  droplet.position.set(Math.cos(a)*1.9,1.85,Math.sin(a)*1.9);world.add(droplet);
 }
 const waterGlow=new THREE.PointLight(0x4acfff,1.5,7);waterGlow.position.set(0,2.3,0);world.add(waterGlow);

 function tree(x,z,s=1){
  const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22*s,.32*s,1.5*s,8),wood);trunk.position.y=.75*s;trunk.castShadow=true;g.add(trunk);
  for(let i=0;i<3;i++){const crown=new THREE.Mesh(new THREE.SphereGeometry((1.0-i*.13)*s,10,8),i===1?leafLight:leaf);crown.position.set(0,(1.7+i*.62)*s,0);crown.scale.set(1,.88,1);crown.castShadow=true;g.add(crown)}
 }
 [[-15,-3],[-15,2],[-7,-2],[7,-2],[15,-2],[15,9],[ -15,9],[-5,9],[5,9]].forEach(p=>tree(p[0],p[1],.8+Math.random()*.3));
 // Jardinières rectangulaires en pierre et massifs fleuris autour de la place.
 function planter(x,z,w=3,d=1.5){
  const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
  box(g,w,.42,d,stoneDark,0,0,0);
  box(g,w-.22,.16,d-.22,grass,0,.42,0);
  for(let i=0;i<Math.floor(w*2);i++){
   const fx=-w*.42+(i/(Math.max(1,Math.floor(w*2)-1)))*w*.84;
   const bush=new THREE.Mesh(new THREE.SphereGeometry(.34,8,7),i%2?leaf:leafLight);bush.position.set(fx,.72,0);bush.scale.set(1,.8,1);bush.castShadow=true;g.add(bush);
   const flower=new THREE.Mesh(new THREE.SphereGeometry(.12,7,6),mat(i%3===0?0xe9a0b4:i%3===1?0xf1d36d:0xd6b6ef));flower.position.set(fx,.98,.12);g.add(flower);
  }
 }
 planter(-7.2,1.0,3.2,1.8);planter(7.4,-1.6,3.0,1.8);planter(7.8,7.8,3.5,1.6);
 planter(-5.8,-12.0,4.2,1.5);planter(2.8,10.5,3.0,1.5);
 // Cristal bleu sur son autel, à droite de la place.
 const crystalBase=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.45,.55,8),stoneDark);crystalBase.position.set(11.0,.28,8.7);crystalBase.castShadow=true;world.add(crystalBase);
 const crystalPed=new THREE.Mesh(new THREE.CylinderGeometry(.65,.9,1.15,6),stone);crystalPed.position.set(11.0,1.0,8.7);crystalPed.castShadow=true;world.add(crystalPed);
 const crystalMat=new THREE.MeshStandardMaterial({color:0x55dfff,emissive:0x168bff,emissiveIntensity:1.8,metalness:.35,roughness:.18});
 const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.95,0),crystalMat);crystal.position.set(11.0,2.35,8.7);crystal.scale.set(.68,1.55,.68);crystal.castShadow=true;world.add(crystal);
 const crystalLight=new THREE.PointLight(0x42caff,2.8,8);crystalLight.position.set(11,2.2,8.7);world.add(crystalLight);
 function lamp(x,z){
  const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.12,2.5,8),wood);pole.position.y=1.25;pole.castShadow=true;g.add(pole);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.25,12,10),new THREE.MeshStandardMaterial({color:0xffd77b,emissive:0xffa52e,emissiveIntensity:2}));bulb.position.y=2.65;g.add(bulb);
  const light=new THREE.PointLight(0xffc36b,1.3,7);light.position.y=2.7;g.add(light);
 }
 [[-5,-4],[5,-4],[-9,5],[9,5],[0,9]].forEach(p=>lamp(...p));

 function character(x,z,color=0x2c3048,isPlayer=false){
  const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
  const skin=mat(0xe9b995),cloth=mat(color),trim=gold;
  const feet=new THREE.Mesh(new THREE.BoxGeometry(.48,.22,.72),wood);feet.position.set(0,.12,0);g.add(feet);
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.82,4,8),cloth);torso.position.y=1.05;torso.castShadow=true;g.add(torso);
  const limbMat=cloth;
  const leftArm=new THREE.Group();leftArm.position.set(-.48,1.35,0);g.add(leftArm);
  const la=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.62,3,6),limbMat);la.rotation.z=-.16;la.position.y=-.27;leftArm.add(la);
  const rightArm=new THREE.Group();rightArm.position.set(.48,1.35,0);g.add(rightArm);
  const ra=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.62,3,6),limbMat);ra.rotation.z=.16;ra.position.y=-.27;rightArm.add(ra);
  const leftLeg=new THREE.Group();leftLeg.position.set(-.2,.52,0);g.add(leftLeg);
  const ll=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.58,3,6),wood);ll.position.y=-.22;leftLeg.add(ll);
  const rightLeg=new THREE.Group();rightLeg.position.set(.2,.52,0);g.add(rightLeg);
  const rl=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.58,3,6),wood);rl.position.y=-.22;rightLeg.add(rl);
  g.userData.limbs={leftArm,rightArm,leftLeg,rightLeg};
  const head=new THREE.Mesh(new THREE.SphereGeometry(.34,14,12),skin);head.position.y=1.92;head.castShadow=true;g.add(head);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.36,14,12),mat(isPlayer?0x292334:color===0x613b8b?0x6c3b9b:0x75472f));hair.position.set(0,2.08,-.03);hair.scale.set(1,.72,1);g.add(hair);
  // Anime/webtoon silhouette: layered fringe, side locks, bright eyes and face highlights.
  const hairMat=hair.material;
  for(let k=0;k<5;k++){
   const spike=new THREE.Mesh(new THREE.ConeGeometry(.19,.52,5),hairMat);
   spike.position.set(-.25+k*.125,2.22,-.22);spike.rotation.z=(k-2)*-.22;spike.rotation.x=-.35;spike.castShadow=true;g.add(spike);
  }
  for(const side of [-1,1]){
   const lock=new THREE.Mesh(new THREE.ConeGeometry(.13,.62,6),hairMat);
   lock.position.set(side*.31,1.91,-.02);lock.rotation.z=side*.22;lock.castShadow=true;g.add(lock);
  }
  const eyeMat=new THREE.MeshStandardMaterial({color:isPlayer?0x263d70:0x503b70,emissive:isPlayer?0x101d40:0x100b22});
  for(const side of [-1,1]){
   const eye=new THREE.Mesh(new THREE.SphereGeometry(.055,8,6),eyeMat);
   eye.scale.set(1,.65,.35);eye.position.set(side*.13,1.98,-.315);g.add(eye);
   const glint=new THREE.Mesh(new THREE.SphereGeometry(.018,6,5),new THREE.MeshBasicMaterial({color:0xffffff}));
   glint.position.set(side*.13-.012,2.0,-.34);g.add(glint);
  }
  const collar=new THREE.Mesh(new THREE.ConeGeometry(.32,.35,5),gold);collar.position.set(0,1.52,0);g.add(collar);
  const cape=new THREE.Mesh(new THREE.ConeGeometry(.55,.95,4),mat(isPlayer?0x6c2940:0x3e5d83));cape.position.set(0,1.0,.42);cape.rotation.x=-.18;cape.castShadow=true;g.add(cape);
  if(isPlayer){const sword=new THREE.Mesh(new THREE.BoxGeometry(.10,1.05,.12),mat(0xd7e3ec,.25));sword.position.set(.62,1.12,-.12);sword.rotation.z=-.28;g.add(sword)}
  return g;
 }
 const player=character(-1.8,3.8,0x344c7d,true);
 const amelie=character(4.1,1.4,0x4b79a5,false);
 const guard=character(11.6,-5.4,0x6b7182,false);
 const mage=character(10.8,7.0,0x613b8b,false);
 const merchant=character(-10.8,-2.2,0xb17b45,false);


 const colliders=buildings.map(b=>b.bounds);
 const interior=new THREE.Group();scene.add(interior);interior.visible=false;
 const indoorFloor=new THREE.Mesh(new THREE.BoxGeometry(15,.35,12),mat(0x76543a));
 indoorFloor.position.set(0,-.22,0);indoorFloor.receiveShadow=true;interior.add(indoorFloor);
 function ibox(x,y,z,sx,sy,sz,material){
  const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);o.position.set(x,y+sy/2,z);o.castShadow=true;o.receiveShadow=true;interior.add(o);return o;
 }
 const interiorWall=mat(0x9c7650),interiorTrim=mat(0x4b3021);
 const warmLight=new THREE.PointLight(0xffbd72,85,24);warmLight.position.set(0,7,0);interior.add(warmLight);
 ibox(0,0,-5.8,15,6,.35,interiorWall);ibox(-7.3,0,0,.35,6,12,interiorWall);ibox(7.3,0,0,.35,6,12,interiorWall);
 ibox(0,5.8,0,15,.25,12,interiorTrim);
 for(let x=-6;x<=6;x+=3)ibox(x,0,-5.45,.18,5.6,.2,interiorTrim);
 ibox(-5,0,-5.35,2.4,2.3,.55,stoneDark);ibox(-5,1.9,-5.35,2.1,.22,.65,stone);
 const fire=new THREE.PointLight(0xff6b25,5,8);fire.position.set(-5,1.2,-4.6);interior.add(fire);
 const flame=new THREE.Mesh(new THREE.ConeGeometry(.35,1.05,7),new THREE.MeshBasicMaterial({color:0xff8a27}));flame.position.set(-5,1.15,-4.8);interior.add(flame);
 ibox(3.8,0,-3.8,5.2,1.25,1.1,woodLight);ibox(3.8,1.25,-3.8,5.3,.12,1.2,gold);
 for(let x=1.7;x<=5.8;x+=1.35){ibox(x,2.1,-5.45,.85,1.2,.25,wood);ibox(x,2.25,-5.28,.55,.85,.08,woodLight)}
 for(const p of [[-2,1],[2,2],[-2,3.6]]){
  const table=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.15,.18,12),woodLight);table.position.set(p[0],1.15,p[1]);table.castShadow=true;interior.add(table);
  const leg=new THREE.Mesh(new THREE.CylinderGeometry(.16,.22,1.15,8),interiorTrim);leg.position.set(p[0],.55,p[1]);interior.add(leg);
  for(const side of [-1,1]){const stool=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.16,8),wood);stool.position.set(p[0]+side*1.45,.55,p[1]);interior.add(stool)}
 }
 for(const x of [-6,6]){const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.48,.55,1.25,10),woodLight);barrel.position.set(x,.63,3.8);barrel.castShadow=true;interior.add(barrel)}
 const innkeeper=character(0,0,0xb17b45,false);world.remove(innkeeper);interior.add(innkeeper);innkeeper.position.set(3.7,0,-2.5);innkeeper.rotation.y=Math.PI;
 let inside=false,returnPosition={x:-10,z:-10};
 function nearDoor(){return inside?player.position.z>4.1:Math.hypot(player.position.x-(-13),player.position.z-3.65)<2.2}
 function enterInterior(){
  if(inside)return false;
  returnPosition={x:player.position.x,z:player.position.z};
  world.remove(player);interior.add(player);world.visible=false;interior.visible=true;inside=true;player.position.set(0,0,2.5);player.rotation.y=Math.PI;return true;
 }
 function exitInterior(){
  if(!inside)return false;
  interior.remove(player);world.add(player);interior.visible=false;world.visible=true;inside=false;player.position.set(-13,0,2.3);return true;
 }

 function collides(x,z){
  if(inside)return x<-6.5||x>6.5||z<-5||z>5;
  if(x<-17||x>17||z<-13||z>15)return true;
  if(Math.hypot(x,z)<4.05)return true;
  // Remparts infranchissables, sauf l'ouverture du grand portail royal.
  if(x>13.0&&x<15.2&&z>-17.5&&z<3.0&&!(z>-10.1&&z<-5.1))return true;
  if(z<-16.6&&x>0.3&&x<14.7)return true;
  return colliders.some(b=>{
   const inDoorway=b.kind==="inn"&&Math.abs(x+13)<.9&&z>2.45&&z<4.65;
   return !inDoorway&&Math.abs(x-b.x)<b.w*.52&&Math.abs(z-b.z)<b.d*.52;
  });
 }
 const clock=new THREE.Clock();
 function animate(){
  const t=clock.getElapsedTime();
  waterJet.scale.y=.9+Math.sin(t*2.4)*.12;
  waterStreams.forEach((p,i)=>{p.scale.y=.8+Math.sin(t*3+i)*.22;p.material.opacity=.65+.25*Math.sin(t*2+i)});
  statue.rotation.y=Math.sin(t*.2)*.06;
  [amelie,guard,mage,merchant].forEach((p,i)=>{p.position.y=Math.sin(t*1.5+i)*.025;p.rotation.y=Math.sin(t*.5+i)*.04});
  const moving=!!player.userData.walking;
  const limbs=player.userData.limbs;
  if(limbs){
   const swing=moving?Math.sin(t*13)*.58:Math.sin(t*2)*.035;
   limbs.leftLeg.rotation.x=swing;limbs.rightLeg.rotation.x=-swing;
   limbs.leftArm.rotation.x=-swing*.72;limbs.rightArm.rotation.x=swing*.72;
  }
  // Follow the adventurer while keeping the same isometric viewing angle.
  const target=new THREE.Vector3(player.position.x,0,player.position.z);
  camera.position.lerp(inside?new THREE.Vector3(target.x+12,13,target.z+14):new THREE.Vector3(target.x+22,25,target.z+25),.055);
  camera.lookAt(target);
  renderer.render(scene,camera);
 }
 renderer.setAnimationLoop(animate);
 function resize(){
  const w=canvas.clientWidth||window.innerWidth,h=canvas.clientHeight||window.innerHeight;
  const aspect=w/h,viewHeight=25;
  camera.left=-viewHeight*aspect/2;camera.right=viewHeight*aspect/2;
  camera.top=viewHeight/2;camera.bottom=-viewHeight/2;
  camera.updateProjectionMatrix();renderer.setSize(w,h,false);
 }
 window.addEventListener("resize",resize);resize();
 function move(dx,dz,dt){
  const len=Math.hypot(dx,dz)||1;dx/=len;dz/=len;
  const speed=5.2*Math.min(dt,.05);
  const nx=player.position.x+dx*speed,nz=player.position.z+dz*speed;
  let moved=false;
  if(!collides(nx,player.position.z)){player.position.x=nx;moved=true}
  if(!collides(player.position.x,nz)){player.position.z=nz;moved=true}
  if(dx||dz)player.rotation.y=Math.atan2(dx,dz);
  player.userData.walking=moved;
  return moved;
 }
 function nearAmelie(){return !inside&&Math.hypot(player.position.x-amelie.position.x,player.position.z-amelie.position.z)<2.2}
 function nearInnkeeper(){return inside&&Math.hypot(player.position.x-innkeeper.position.x,player.position.z-innkeeper.position.z)<2.2}
 return {move,nearAmelie,nearDoor,nearInnkeeper,enterInterior,exitInterior,get insideBuilding(){return inside},player,renderer,scene};
}
