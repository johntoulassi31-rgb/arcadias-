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
 const camera=new THREE.PerspectiveCamera(34,1,.1,120);
 camera.position.set(22,25,25);
 camera.lookAt(0,0,0);

 scene.add(new THREE.HemisphereLight(0xe4f4ff,0x6c583d,2.0));
 const sun=new THREE.DirectionalLight(0xffe0ad,3.2);
 sun.position.set(-12,24,10);sun.castShadow=true;
 sun.shadow.mapSize.set(2048,2048);
 sun.shadow.camera.left=-25;sun.shadow.camera.right=25;sun.shadow.camera.top=25;sun.shadow.camera.bottom=-25;
 sun.shadow.bias=-.00025;scene.add(sun);

 const mat=(color,roughness=.85)=>new THREE.MeshStandardMaterial({color,roughness});
 const stone=mat(0xc8bda5),stoneDark=mat(0x827c70),mortar=mat(0x9d9585);
 const grass=mat(0x537d43),leaf=mat(0x397c48),leafLight=mat(0x6a9b4c);
 const wood=mat(0x68452e),woodLight=mat(0x986440),roof=mat(0x9d4936),roofLight=mat(0xc16a48);
 const wall=mat(0xe7d1a7),wall2=mat(0xcab58e),glass=new THREE.MeshStandardMaterial({color:0x83c8d9,metalness:.15,roughness:.2,emissive:0x173e4c});
 const gold=new THREE.MeshStandardMaterial({color:0xd4a94e,metalness:.55,roughness:.35});
 const water=new THREE.MeshStandardMaterial({color:0x36bde0,metalness:.25,roughness:.18,transparent:true,opacity:.88});
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(54,42),grass);ground.rotation.x=-Math.PI/2;ground.position.y=-.16;ground.receiveShadow=true;scene.add(ground);
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
  // foundation
  box(g,w+.3,.28,d+.3,stoneDark,0,-.12,0);
  if(kind==="inn"){
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
  return {group:g,bounds:{x,z,w:w+1.0,d:d+1.0}};
 }
 const buildings=[
  house(-10,-7,6,5,wall,"inn"),
  house(0,-9,5,4,wall2),
  house(10,-7,6,5,wall),
  house(-12,5,5,4,wall2),
  house(12,5,5,4,wall),
  house(-8,11,5,4,wall),
  house(8,11,5,4,wall2)
 ];

 // cobbled plaza, each stone is a shallow 3D block
 for(let x=-13;x<=13;x+=1.25)for(let z=-8;z<=9;z+=1.25){
  const tile=new THREE.Mesh(new THREE.BoxGeometry(1.18,.10,1.18),((Math.round(x*2)+Math.round(z*2))%3===0)?stone:mortar);
  tile.position.set(x,-.08,z);tile.receiveShadow=true;tile.castShadow=false;world.add(tile);
 }
 // paths from the plaza to the exits
 for(let i=0;i<8;i++){
  box(world,3,.12,1.15,stone,0,-.03,10+i*1.35,false);
 }
 // central fountain: stone basin, water, pedestal and statue
 const basin=new THREE.Mesh(new THREE.CylinderGeometry(3.25,3.5,.65,12),stoneDark);basin.position.set(0,.25,0);basin.castShadow=true;basin.receiveShadow=true;world.add(basin);
 const rim=new THREE.Mesh(new THREE.CylinderGeometry(3.45,3.45,.28,12),stone);rim.position.set(0,.67,0);rim.castShadow=true;world.add(rim);
 const pool=new THREE.Mesh(new THREE.CylinderGeometry(3.18,3.18,.12,32),water);pool.position.set(0,.76,0);world.add(pool);
 const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(.65,.9,2.1,8),stone);pedestal.position.set(0,1.7,0);pedestal.castShadow=true;world.add(pedestal);
 const statue=new THREE.Group();statue.position.set(0,2.85,0);world.add(statue);
 const body=new THREE.Mesh(new THREE.ConeGeometry(.58,1.55,7),gold);body.position.y=.75;body.castShadow=true;statue.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.32,12,10),gold);head.position.y=1.65;statue.add(head);
 const waterJet=new THREE.Mesh(new THREE.CylinderGeometry(.08,.18,1.2,10),water);waterJet.position.set(0,2.8,0);world.add(waterJet);

 function tree(x,z,s=1){
  const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22*s,.32*s,1.5*s,8),wood);trunk.position.y=.75*s;trunk.castShadow=true;g.add(trunk);
  for(let i=0;i<3;i++){const crown=new THREE.Mesh(new THREE.SphereGeometry((1.0-i*.13)*s,10,8),i===1?leafLight:leaf);crown.position.set(0,(1.7+i*.62)*s,0);crown.scale.set(1,.88,1);crown.castShadow=true;g.add(crown)}
 }
 [[-15,-3],[-15,2],[-7,-2],[7,-2],[15,-2],[15,9],[-15,9],[-5,9],[5,9]].forEach(p=>tree(p[0],p[1],.8+Math.random()*.3));
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
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.36,12,10),mat(isPlayer?0x292334:0x4c3326));hair.position.set(0,2.08,-.03);hair.scale.set(1,.72,1);g.add(hair);
  const cape=new THREE.Mesh(new THREE.ConeGeometry(.55,.95,4),mat(isPlayer?0x6c2940:0x3e5d83));cape.position.set(0,1.0,.42);cape.rotation.x=-.18;cape.castShadow=true;g.add(cape);
  if(isPlayer){const sword=new THREE.Mesh(new THREE.BoxGeometry(.10,1.05,.12),mat(0xd7e3ec,.25));sword.position.set(.62,1.12,-.12);sword.rotation.z=-.28;g.add(sword)}
  return g;
 }
 const player=character(0,5,0x344c7d,true);
 const amelie=character(3.9,-1.6,0x4b79a5,false);
 const guard=character(12,-2.5,0x6b7182,false);
 const mage=character(10,7,0x613b8b,false);
 const merchant=character(-10,-1,0xb17b45,false);

 const colliders=buildings.map(b=>b.bounds);
 function collides(x,z){
  if(x<-17||x>17||z<-13||z>15)return true;
  if(Math.hypot(x,z)<3.75)return true;
  return colliders.some(b=>Math.abs(x-b.x)<b.w*.52&&Math.abs(z-b.z)<b.d*.52);
 }
 const clock=new THREE.Clock();
 function animate(){
  const t=clock.getElapsedTime();
  waterJet.scale.y=.9+Math.sin(t*2.4)*.12;
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
  camera.position.lerp(new THREE.Vector3(target.x+22,25,target.z+25),.055);
  camera.lookAt(target);
  renderer.render(scene,camera);
 }
 renderer.setAnimationLoop(animate);
 function resize(){
  const w=canvas.clientWidth||window.innerWidth,h=canvas.clientHeight||window.innerHeight;
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
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
 function nearAmelie(){return Math.hypot(player.position.x-amelie.position.x,player.position.z-amelie.position.z)<2.2}
 return {move,nearAmelie,player,renderer,scene};
}
