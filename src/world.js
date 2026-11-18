import Phaser from "phaser";

const W=48,H=36;
export function createWorld(){
 let sceneRef=null,inside=false;
 const game=new Phaser.Game({
  type:Phaser.CANVAS,parent:"world3d",width:window.innerWidth,height:window.innerHeight,
  backgroundColor:"#477d43",pixelArt:true,antialias:false,roundPixels:true,
  scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},
  physics:{default:"arcade",arcade:{debug:false}},
  scene:{preload,create,update}
 });
 function preload(){this.load.tilemapTiledJSON("ardencourt","./maps/ardencourt.json");this.load.image("tiles","./assets/arcadias-tiles.svg");}
 function makeSpriteSheet(key,tunic,hair,skin="#f2c9a0"){
  const c=this.textures.createCanvas(key,48,64),ctx=c.getContext();ctx.imageSmoothingEnabled=false;
  for(let row=0;row<4;row++)for(let f=0;f<3;f++){
   const ox=f*16,oy=row*16,step=f===1?1:0;
   ctx.fillStyle="#26302d";ctx.fillRect(ox+4,oy+14,8,2);
   ctx.fillStyle="#47362e";ctx.fillRect(ox+5+step,oy+12,2,3);ctx.fillRect(ox+9-step,oy+12,2,3);
   ctx.fillStyle=tunic;ctx.fillRect(ox+4,oy+7,8,6);ctx.fillRect(ox+3,oy+8,2,4);ctx.fillRect(ox+11,oy+8,2,4);
   ctx.fillStyle="#e8c78e";ctx.fillRect(ox+4,oy+12,8,1);
   ctx.fillStyle=skin;ctx.fillRect(ox+5,oy+3,6,5);
   ctx.fillStyle=hair;ctx.fillRect(ox+4,oy+2,8,3);ctx.fillRect(ox+4,oy+4,2,3);
   ctx.fillStyle="#292d3c";ctx.fillRect(ox+6,oy+5,1,1);ctx.fillRect(ox+9,oy+5,1,1);
   if(row===1){ctx.fillStyle="#e7e9f1";ctx.fillRect(ox+12,oy+7,2,7)}
   if(row===2){ctx.fillStyle="#e7e9f1";ctx.fillRect(ox+2,oy+7,2,7)}
   if(row===3){ctx.fillStyle="#e7e9f1";ctx.fillRect(ox+7,oy+13,2,2)}
  }
  c.refresh();return key;
 }
 function create(){
  sceneRef=this;
  const map=this.make.tilemap({key:"ardencourt"});
  const tiles=map.addTilesetImage("arcadias","tiles",16,16,0,0);
  const floor=map.createLayer("Sol",tiles,0,0),deco=map.createLayer("Décor et bâtiments",tiles,0,0);
  floor.setScale(2);deco.setScale(2);deco.setDepth(1);
  const cx=24*32,cy=18*32;
  this.add.circle(cx,cy,58,0x6d777b).setDepth(2);
  this.add.circle(cx,cy,47,0x3d9fc0).setDepth(2);
  this.add.circle(cx,cy,33,0x72d5e8).setDepth(2);
  this.add.rectangle(cx,cy-13,12,38,0xb5a78b).setDepth(3);
  this.add.circle(cx,cy-34,10,0xd7c18d).setDepth(3);
  for(let i=0;i<4;i++){const jet=this.add.rectangle(cx-20+i*13,cy-24,3,12,0xa8efff).setDepth(3);this.tweens.add({targets:jet,alpha:.25,y:cy-34,duration:500+i*80,yoyo:true,repeat:-1});}
  const house=(x,y,w=6,h=5)=>{const g=this.add.container(x*32,y*32);for(let j=0;j<h;j++)for(let i=0;i<w;i++){const roof=j<2;const tile=this.add.rectangle(i*32,j*32,32,32,roof?(j===0?0x9d3d31:0xb94f3d):0xd9bd8b).setOrigin(0);g.add(tile);if(!roof&&(i===0||i===w-1||j===h-1))tile.setFillStyle(0x70452e);if(!roof&&j===2&&i%3===1){g.add(this.add.rectangle(i*32+16,j*32+12,12,16,0x79b9c7));}}g.setDepth(y*32+80);return g};
  [[5,6],[12,4],[5,25],[34,6],[34,25],[15,29]].forEach(([x,y])=>house(x,y));
  for(let y=3;y<33;y++)for(let x=43;x<46;x++){this.add.rectangle(x*32,y*32,32,32,0x89877e).setOrigin(0).setDepth(y*32+10);this.add.rectangle(x*32,y*32,32,4,0xc8c1ae).setOrigin(0).setDepth(y*32+11);}
  for(let x=40;x<47;x+=2){this.add.rectangle(x*32,3*32,32,22,0xa39d8e).setOrigin(0).setDepth(110);this.add.rectangle(x*32,32*32,32,22,0xa39d8e).setOrigin(0).setDepth(1030);}
  for(const [x,y] of [[3,4],[9,9],[40,7],[4,29],[39,29],[16,7],[31,29]]){
   this.add.rectangle(x*32,y*32,28,28,0x315f37).setDepth(y*32+4);
   this.add.rectangle(x*32+5,y*32+4,22,18,0x4c984c).setDepth(y*32+5);
   this.add.rectangle(x*32+10,y*32+2,8,7,0x91bb62).setDepth(y*32+6);
   for(let i=0;i<3;i++)this.add.rectangle(x*32+4+i*9,y*32+22,4,4,[0xf2d56a,0xe9a4cf,0xf1eee0][i]).setDepth(y*32+7);
  }
  const makeChar=(key,x,y,tunic,hair)=>{makeSpriteSheet.call(this,key,tunic,hair);const s=this.add.sprite(x*32,y*32,key,0).setOrigin(.5,.85).setDepth(y*32+20).setScale(2.1);return s};
  const player=makeChar("hero",24,23,"#3d5f9c","#593b2b");
  const amelie=makeChar("amelie",27,20,"#bd668c","#e2b15e");
  const guard=makeChar("guard",39,14,"#65758a","#51412f");
  const mage=makeChar("mage",37,24,"#7653a2","#392a4c");
  const merchant=makeChar("merchant",11,17,"#b47b42","#70412d");
  this.physics.add.existing(player);player.body.setSize(13,9).setOffset(9,20).setCollideWorldBounds(true);
  this.physics.world.setBounds(0,0,W*32,H*32);
  this.physics.add.existing([amelie,guard,mage,merchant]);
  [amelie,guard,mage,merchant].forEach(s=>{s.body.setImmovable(true);s.body.setSize(15,10).setOffset(8,20)});
  this.physics.add.collider(player,[amelie,guard,mage,merchant]);
  this.cameras.main.setBounds(0,0,W*32,H*32);this.cameras.main.setZoom(1.75);this.cameras.main.startFollow(player,true,.12,.12);
  [[amelie,"Amélie · Guide"],[guard,"Garde royal"],[mage,"Morgane · Mage"],[merchant,"Élise · Marchande"]].forEach(([s,t])=>this.add.text(s.x,s.y-43,t,{fontFamily:"monospace",fontSize:"11px",color:"#fff1c7",backgroundColor:"#172333",padding:{x:4,y:3},stroke:"#4e3528",strokeThickness:2}).setOrigin(.5).setDepth(2000));
  this.add.text(cx,cy-90,"✦ FONTAINE DES FONDATEURS ✦",{fontFamily:"monospace",fontSize:"10px",color:"#fff0c4",stroke:"#3d3024",strokeThickness:3}).setOrigin(.5).setDepth(2000);
  this.player=player;this.npcs={amelie,guard,mage,merchant};this.desired={x:0,y:0};
 }
 function update(time){
  if(!this.player)return;
  const p=this.player,d=this.desired||{x:0,y:0},speed=125,len=Math.hypot(d.x,d.y)||1;
  p.body.setVelocity(d.x/len*speed,d.y/len*speed);
  if(d.x||d.y){const row=Math.abs(d.x)>Math.abs(d.y)?(d.x<0?1:2):(d.y<0?3:0);p.setFrame(Math.floor(time/180)%3+row*3);}
  p.setDepth(p.y+20);
  Object.values(this.npcs).forEach(s=>s.setDepth(s.y+20));
 }
 return {
  move(dx,dz){if(sceneRef){sceneRef.desired={x:dx,y:dz};return true}return false},
  nearAmelie(){return !!sceneRef?.player&&Phaser.Math.Distance.Between(sceneRef.player.x,sceneRef.player.y,sceneRef.npcs.amelie.x,sceneRef.npcs.amelie.y)<75},
  nearDoor(){return false},nearInnkeeper(){return false},enterInterior(){inside=true;return true},exitInterior(){inside=false;return true},
  get insideBuilding(){return inside},player:null
 };
}
