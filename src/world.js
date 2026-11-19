import Phaser from "phaser";

const TILE = 32;
const MAP_W = 160;
const MAP_H = 60;
const WORLD_W = MAP_W * TILE;
const WORLD_H = MAP_H * TILE;

const PALETTE = {
  grass: 0x527f43,
  grassLight: 0x71964d,
  grassDark: 0x3e6839,
  path: 0xa58a65,
  stone: 0xaaa18f,
  stoneDark: 0x6e6a60,
  wood: 0x68412d,
  woodLight: 0x9a6944,
  roof: 0x78372f,
  roofLight: 0xb85640,
  cream: 0xe1cba0
};

function polygon(ctx, points, fill, stroke = null, lineWidth = 1) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
}

function makeHouseTexture(scene, key, style = 0) {
  const width = 240, height = 196;
  const texture = scene.textures.createCanvas(key, width, height);
  const ctx = texture.getContext();
  ctx.imageSmoothingEnabled = false;

  const roofColors = [
    ["#71362f", "#9e493b", "#c46a4c"],
    ["#38434a", "#53616a", "#78858a"],
    ["#62402d", "#8a5538", "#b97b4a"]
  ][style % 3];
  const wall = style % 2 ? "#d2c29b" : "#e5d2a8";
  const wallShade = style % 2 ? "#a99877" : "#b8a37e";

  // Contact shadow and stone foundation.
  ctx.fillStyle = "rgba(15,19,18,.34)";
  ctx.beginPath(); ctx.ellipse(122, 172, 106, 17, 0, 0, Math.PI * 2); ctx.fill();
  polygon(ctx, [[25,111],[119,77],[219,109],[219,162],[119,190],[25,158]], "#655f54", "#292b2c", 3);
  polygon(ctx, [[25,111],[119,77],[119,164],[25,158]], "#999080", "#514a40", 2);
  polygon(ctx, [[119,77],[219,109],[219,162],[119,164]], "#82796c", "#514a40", 2);
  for (let x = 31; x < 216; x += 17) {
    ctx.fillStyle = "#c0b39a";
    ctx.fillRect(x, 158 + Math.sin(x) * 2, 11, 3);
  }

  // Plastered walls, seen from two sides.
  polygon(ctx, [[34,89],[119,57],[119,157],[34,166]], wall, "#3b3028", 3);
  polygon(ctx, [[119,57],[208,88],[208,163],[119,157]], wallShade, "#3b3028", 3);

  // Dark half-timber framing.
  ctx.strokeStyle = "#573a2a";
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(41,94); ctx.lineTo(41,162); ctx.moveTo(112,67); ctx.lineTo(112,158);
  ctx.moveTo(34,125); ctx.lineTo(119,96); ctx.moveTo(119,96); ctx.lineTo(208,125);
  ctx.moveTo(121,69); ctx.lineTo(121,157); ctx.moveTo(202,92); ctx.lineTo(202,161);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#b08b5f";
  ctx.beginPath(); ctx.moveTo(47,99); ctx.lineTo(47,155); ctx.moveTo(127,74); ctx.lineTo(127,151); ctx.stroke();

  // Gabled roof with separate shaded planes.
  polygon(ctx, [[13,83],[112,14],[229,72],[119,112]], roofColors[1], "#27262a", 4);
  polygon(ctx, [[13,83],[112,14],[112,39],[27,99]], roofColors[0], "#27262a", 2);
  polygon(ctx, [[112,14],[229,72],[210,96],[112,47]], roofColors[2], "#27262a", 2);
  polygon(ctx, [[27,99],[112,47],[112,67],[36,117]], roofColors[1], "#27262a", 2);
  polygon(ctx, [[112,47],[210,96],[194,116],[112,67]], roofColors[0], "#27262a", 2);

  // Individual roof courses and tile highlights.
  ctx.save();
  polygon(ctx, [[13,83],[112,14],[229,72],[119,112]], null);
  ctx.clip();
  for (let y = 27; y < 113; y += 9) {
    ctx.strokeStyle = y % 18 ? "rgba(28,25,27,.48)" : "rgba(235,164,112,.30)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(250,y+8); ctx.stroke();
  }
  for (let y = 28; y < 104; y += 18) {
    for (let x = 20 + (y % 36); x < 225; x += 19) {
      ctx.fillStyle = "rgba(235,174,123,.24)";
      ctx.fillRect(x,y,8,2);
      ctx.fillStyle = "rgba(35,27,28,.33)";
      ctx.fillRect(x+8,y+4,7,2);
    }
  }
  ctx.restore();
  ctx.strokeStyle = "#322a29"; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(13,83); ctx.lineTo(112,14); ctx.lineTo(229,72); ctx.stroke();
  ctx.strokeStyle = "rgba(245,190,139,.5)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(20,80); ctx.lineTo(112,21); ctx.lineTo(220,73); ctx.stroke();

  // Chimney with cap and warm brick details.
  polygon(ctx, [[167,37],[181,30],[181,57],[167,64]], "#887c6c", "#342d29", 2);
  ctx.fillStyle = "#b7aa92"; ctx.fillRect(164,31,20,7);
  ctx.fillStyle = "#62594e"; ctx.fillRect(168,43,3,8); ctx.fillRect(176,39,3,7);

  // Windows, leaded glass, shutters and warm reflections.
  const windowAt = (x,y,side) => {
    ctx.fillStyle = "#493328"; ctx.fillRect(x-3,y-3,28,33);
    ctx.fillStyle = "#6b432d"; ctx.fillRect(x,y,22,27);
    ctx.fillStyle = "#6c9bab"; ctx.fillRect(x+3,y+3,16,20);
    ctx.fillStyle = "rgba(221,239,220,.65)"; ctx.fillRect(x+4,y+4,5,15);
    ctx.fillStyle = "#3a2a22"; ctx.fillRect(x+10,y+3,2,20); ctx.fillRect(x+3,y+12,16,2);
    ctx.fillStyle = "#9a6038"; ctx.fillRect(x-5,y-2,4,31); ctx.fillRect(x+23,y-2,4,31);
    ctx.fillStyle = "#d2b276"; ctx.fillRect(x+7,y+25,8,2);
  };
  windowAt(57,111); windowAt(153,111);

  // Front door with stone lintel, planks, ring and step.
  polygon(ctx, [[91,120],[111,113],[111,163],[91,166]], "#4d3024", "#2a211d", 2);
  polygon(ctx, [[95,124],[108,119],[108,160],[95,162]], "#805034", "#37271e", 2);
  ctx.strokeStyle = "#bd8a54"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(101,123); ctx.lineTo(101,160); ctx.stroke();
  ctx.fillStyle = "#e6c47b"; ctx.fillRect(105,141,2,3);
  polygon(ctx, [[87,118],[113,109],[113,116],[88,125]], "#c1b39a", "#51483c", 2);
  polygon(ctx, [[86,166],[114,161],[120,170],[83,177]], "#b6a991", "#50483d", 2);

  // Hanging sign and lantern.
  ctx.fillStyle = "#443026"; ctx.fillRect(65,94,3,19);
  ctx.fillStyle = "#d4b16d"; ctx.fillRect(55,94,23,14);
  ctx.fillStyle = "#593923"; ctx.fillRect(58,97,17,8);
  ctx.fillStyle = "#f4d68c"; ctx.fillRect(63,99,7,2);
  ctx.fillStyle = "#3a3028"; ctx.fillRect(181,117,3,13);
  ctx.fillStyle = "#f4c46c"; ctx.fillRect(177,126,11,9);
  ctx.fillStyle = "rgba(255,197,91,.22)"; ctx.fillRect(173,131,19,12);

  // Small plaster cracks and stone chips.
  ctx.strokeStyle = "rgba(90,67,45,.35)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(73,143); ctx.lineTo(77,138); ctx.lineTo(76,134); ctx.stroke();
  ctx.fillStyle = "rgba(255,243,205,.4)"; ctx.fillRect(49,105,15,2); ctx.fillRect(137,102,13,2);

  texture.refresh();
  return texture;
}

function makeTreeTexture(scene, key, autumn = false) {
  const texture = scene.textures.createCanvas(key, 80, 92);
  const ctx = texture.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "rgba(9,18,12,.28)";
  ctx.beginPath(); ctx.ellipse(41,80,33,9,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#60432c"; ctx.fillRect(34,49,12,34);
  ctx.fillStyle = "#9a7045"; ctx.fillRect(37,52,4,27);
  ctx.fillStyle = "#513a2a"; ctx.fillRect(26,55,8,4); ctx.fillRect(45,58,10,4);
  const shades = autumn
    ? ["#813e31","#a94e37","#c76a42","#e0a05c","#633a35"]
    : ["#24583c","#347449","#4b8b4d","#78a957","#1f4934"];
  const blobs = [[40,23,22],[23,35,17],[58,37,18],[31,49,17],[52,53,18],[42,39,22],[17,25,12],[63,20,12]];
  blobs.forEach((b,i)=>{
    ctx.fillStyle=shades[(i*3+1)%shades.length];
    ctx.beginPath();ctx.ellipse(b[0],b[1],b[2],b[2]*.72,0,0,Math.PI*2);ctx.fill();
  });
  ctx.fillStyle=shades[3];ctx.fillRect(28,15,7,4);ctx.fillRect(49,26,6,4);ctx.fillRect(15,32,5,4);
  ctx.fillStyle="rgba(18,40,25,.4)";ctx.fillRect(17,40,8,5);ctx.fillRect(53,48,9,5);
  texture.refresh();
  return texture;
}

function makeCharacterTexture(scene,key,tunic,hair,accent,cloak=false) {
  // Sprite chibi anime : tête volontairement surdimensionnée, petit corps et
  // contours nets pour rester lisible sur écran mobile.
  const fw=48,fh=64,cols=3,rows=4;
  const texture=scene.textures.createCanvas(key,fw*cols,fh*rows);
  const ctx=texture.getContext();ctx.imageSmoothingEnabled=true;
  // rounded rectangle compatible with older Android WebView/Chrome builds.
  const rr=(x,y,w,h,r,color,stroke="#30283a",lw=1.6)=>{
    const rad=Math.min(r,w/2,h/2);
    ctx.fillStyle=color;ctx.beginPath();
    ctx.moveTo(x+rad,y);ctx.lineTo(x+w-rad,y);
    ctx.quadraticCurveTo(x+w,y,x+w,y+rad);
    ctx.lineTo(x+w,y+h-rad);ctx.quadraticCurveTo(x+w,y+h,x+w-rad,y+h);
    ctx.lineTo(x+rad,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-rad);
    ctx.lineTo(x,y+rad);ctx.quadraticCurveTo(x,y,x+rad,y);
    ctx.closePath();ctx.fill();
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}
  };
  const ellipse=(x,y,rx,ry,color,stroke=null,lw=1)=>{
    ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}
  };
  for(let row=0;row<rows;row++)for(let frame=0;frame<cols;frame++){
    const ox=frame*fw,oy=row*fh;ctx.save();ctx.translate(ox,oy);
    const step=frame===0?-1:frame===2?1:0;
    // Ombre douce au sol et mini-bottes.
    ellipse(24,58,13,3.5,"rgba(22,22,39,.28)");
    rr(15+step,47,8,9,3,"#394057");
    rr(25-step,47,8,9,3,"#394057");
    rr(13+step,53,11,6,3,"#25283c");
    rr(24-step,53,11,6,3,"#25283c");
    // Petit corps chibi, veste et col contrasté.
    rr(13,34,22,17,7,cloak?"#34304f":tunic,"#282338",2);
    polygon(ctx,[[16,35],[24,41],[32,35],[30,49],[18,49]],accent,"#3a2b3b",1);
    rr(21,40,6,10,2,"#f1dfc4","#9b765d",1);
    rr(8,36,8,12,4,cloak?"#3a3558":tunic);
    rr(32,36,8,12,4,cloak?"#3a3558":tunic);
    ellipse(12,48,3.3,3.7,"#f0c4a9","#8c5d59",.8);
    ellipse(36,48,3.3,3.7,"#f0c4a9","#8c5d59",.8);
    // Tête large et joues rosées.
    rr(19,29,10,8,3,"#efc3a7","#a86e65",1);
    ellipse(24,19,12.5,13.5,"#f4cdb2","#392b3a",1.8);
    // Chevelure en volume, avec reflets façon illustration webtoon.
    ctx.fillStyle=hair;ctx.strokeStyle="#302638";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(11,20);ctx.quadraticCurveTo(7,3,23,3);
    ctx.quadraticCurveTo(41,1,37,20);ctx.lineTo(35,28);
    ctx.quadraticCurveTo(30,20,29,15);ctx.quadraticCurveTo(23,24,17,17);
    ctx.lineTo(13,28);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle="rgba(255,255,255,.28)";
    ctx.beginPath();ctx.moveTo(13,11);ctx.quadraticCurveTo(22,1,32,8);
    ctx.quadraticCurveTo(23,6,17,17);ctx.closePath();ctx.fill();
    if(row===3){
      ctx.fillStyle=hair;ctx.beginPath();ctx.moveTo(11,13);
      ctx.quadraticCurveTo(7,29,14,37);ctx.lineTo(18,26);ctx.fill();
      ctx.beginPath();ctx.moveTo(37,13);ctx.quadraticCurveTo(42,29,34,37);
      ctx.lineTo(30,26);ctx.fill();
    }
    // Yeux brillants et expressifs, sauf pour la vue arrière.
    if(row!==3){
      ctx.strokeStyle="#382538";ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(14,17);ctx.quadraticCurveTo(18,14,22,17);
      ctx.moveTo(26,17);ctx.quadraticCurveTo(30,14,34,17);ctx.stroke();
      const iris=key==="amelie"?"#9a5d9b":key==="mage"?"#6b91d7":"#4d83a7";
      ellipse(19,21,2.7,3.8,"#fff");
      ellipse(29,21,2.7,3.8,"#fff");
      ellipse(19,21,2.05,3.1,iris);
      ellipse(29,21,2.05,3.1,iris);
      ellipse(19.5,19.7,.8,1,"#fff");
      ellipse(29.5,19.7,.8,1,"#fff");
      // Reflets de joues et petit sourire.
      ellipse(14,26,1.8,.9,"rgba(239,130,143,.38)");
      ellipse(34,26,1.8,.9,"rgba(239,130,143,.38)");
      ctx.strokeStyle="#a45f69";ctx.lineWidth=1.1;
      ctx.beginPath();ctx.moveTo(22,28);ctx.quadraticCurveTo(24,30,26,28);ctx.stroke();
    }
    // Accessoires distinctifs des rôles.
    if(key==="guard"){rr(37,35,4,18,2,"#d8e1ec","#5b5360",1);rr(35,33,8,4,2,"#e4c579");}
    if(key==="mage"){rr(7,8,34,5,2,"#594477");ellipse(39,22,3,4,"#8ce8ff");}
    if(key==="merchant"){rr(12,35,24,4,2,"#e8c779");}
    if(key==="amelie"){ellipse(36,31,3,3,"#f4d58c","#805a55",.8);}
    ctx.restore();
  }
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++)
    texture.add(row*cols+col,0,col*fw,row*fh,fw,fh);
  texture.refresh();return texture;
}
export function createWorld() {
  let sceneRef=null;
  let inside=false;
  let tavernDoor={x:0,y:0};
  let cityVisibility=null;
  let interiorObjects=[];
  let interiorDoor={x:0,y:0};

  const parent=document.querySelector("#world3d");
  const game=new Phaser.Game({
    type:Phaser.CANVAS,
    parent:"world3d",
    width:parent?.clientWidth||window.innerWidth,
    height:parent?.clientHeight||window.innerHeight,
    backgroundColor:"#477d43",
    pixelArt:false,
    antialias:true,
    roundPixels:false,
    scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},
    physics:{default:"arcade",arcade:{debug:false}},
    scene:{
      preload:function loadArtwork(){
        this.load.image("ardencourt-art","./assets/ardencourt-reference.webp");
        this.load.svg("frontier-art","./assets/asterion-frontier.svg",{width:2560,height:1920});
      },
      create:function initializeScene(){
        try{create.call(this);}
        catch(error){
          console.error("ARCADIAS scene initialization failed:",error);
          this.add.rectangle(0,0,WORLD_W,WORLD_H,0x527f43).setOrigin(0);
          this.add.text(24,24,"ARCADIAS · Chargement du monde",{
            fontFamily:"monospace",fontSize:"18px",color:"#fff0c4",
            backgroundColor:"#263528",padding:{x:10,y:8}
          }).setScrollFactor(0).setDepth(99999);
          try{
            makeCharacterTexture(this,"hero-recovery","#3e5d91","#493126","#d6bd7e");
            this.add.sprite(160,160,"hero-recovery",1).setScale(2).setDepth(100000);
          }catch(spriteError){console.error("ARCADIAS hero recovery failed:",spriteError);}
        }
      },
      update
    }
  });

  function drawGround(scene) {
    // Grande illustration isométrique de la capitale, utilisée comme décor du monde.
    scene.add.rectangle(1280,960,2560,1920,0xb5aa91).setDepth(-21);
    const artwork=scene.add.image(0,0,"ardencourt-art")
      .setOrigin(0,0).setDisplaySize(2560,1707).setDepth(-20);
    artwork.setData("region","Ardencourt");
    const frontier=scene.add.image(2560,0,"frontier-art")
      .setOrigin(0,0).setDisplaySize(2560,1920).setDepth(-19);
    frontier.setData("region","Frontières d’Asterion");
  }

  function addFountain(scene) {
    const x=24*TILE+16, y=18*TILE+16;
    const base=scene.add.ellipse(x,y+9,155,54,0x1a211d,0.35).setDepth(30);
    const rim=scene.add.ellipse(x,y,142,88,0x716f68).setDepth(31);
    rim.setStrokeStyle(5,0x373b3a,1);
    scene.add.ellipse(x,y-2,121,69,0xc1b59a).setDepth(32);
    scene.add.ellipse(x,y-6,102,55,0x397f9a).setDepth(33);
    scene.add.ellipse(x-8,y-11,61,22,0x65bad0,0.85).setDepth(34);
    scene.add.ellipse(x+24,y+6,34,13,0x235f80,0.9).setDepth(34);
    for(let i=0;i<12;i++){
      const angle=(Math.PI*2*i)/12;
      const px=x+Math.cos(angle)*62, py=y+Math.sin(angle)*36;
      scene.add.rectangle(px,py,16,8, i%2?0xd2c7ae:0x969184).setRotation(angle).setDepth(35);
    }
    scene.add.rectangle(x,y-22,23,35,0x8b8478).setDepth(36);
    scene.add.rectangle(x,y-31,32,8,0xc5b99f).setDepth(37);
    scene.add.circle(x,y-43,11,0xb9a98b).setDepth(38);
    scene.add.circle(x,y-44,5,0x6fc7df).setDepth(39);
    const spray=scene.add.ellipse(x,y-52,28,14,0x8ee8ff,0.45).setDepth(40);
    scene.tweens.add({targets:spray,alpha:0.12,scaleX:1.45,scaleY:0.7,duration:720,yoyo:true,repeat:-1});
    scene.add.text(x,y-105,"FONTAINE DES FONDATEURS",{
      fontFamily:"monospace",fontSize:"10px",color:"#fff0c4",
      stroke:"#33271e",strokeThickness:3
    }).setOrigin(0.5).setDepth(1000);
  }

  function addHouse(scene, x, y, key, style=0, isTavern=false) {
    const groundY=y*TILE+193;
    const image=scene.add.image(x*TILE+120,y*TILE+177,key).setOrigin(0.5,0.92);
    image.setDepth(groundY+4);
    const body=scene.add.rectangle(x*TILE+120,y*TILE+147,184,34,0x000000,0);
    scene.physics.add.existing(body,true);
    houseBodies.push(body);
    if(isTavern){
      tavernDoor={x:x*TILE+101,y:y*TILE+162};
      scene.add.text(x*TILE+120,y*TILE+14,"AUBERGE DU DRAGON D’OR",{
        fontFamily:"monospace",fontSize:"9px",color:"#ffe4a1",
        backgroundColor:"#34251d",padding:{x:4,y:2},stroke:"#241b17",strokeThickness:2
      }).setOrigin(0.5).setDepth(image.depth+2);
    }
    return image;
  }

  function addMarketStall(scene,x,y,clothA,clothB) {
    const groundY=y+21;
    scene.add.ellipse(x,y+19,82,13,0x111710,0.30).setDepth(groundY-1);
    const post=scene.add.graphics().setDepth(groundY+2);
    post.fillStyle(0x67432e,1);
    post.fillRect(x-39,y-32,5,53);post.fillRect(x+34,y-32,5,53);
    post.fillRect(x-42,y-36,84,5);
    // Striped canvas roof.
    polygonToGraphics(post,[[x-48,y-36],[x+48,y-36],[x+39,y-8],[x-39,y-8]],clothA);
    for(let i=0;i<6;i++){
      post.fillStyle(clothB,1);
      post.fillRect(x-41+i*14,y-33,7,23);
    }
    post.fillStyle(0x8a5a36,1);post.fillRect(x-36,y-6,72,9);
    post.fillStyle(0x765033,1);post.fillRect(x-34,y+3,68,18);
    post.fillStyle(0xc8a66c,1);post.fillRect(x-30,y+5,60,3);
    post.fillStyle(0x9b7346,1);post.fillRect(x-30,y-3,10,7);post.fillRect(x-10,y-3,10,7);post.fillRect(x+10,y-3,10,7);
  }

  function polygonToGraphics(graphics,points,color) {
    graphics.fillStyle(color,1);
    graphics.beginPath();
    graphics.moveTo(points[0][0],points[0][1]);
    for(let i=1;i<points.length;i++)graphics.lineTo(points[i][0],points[i][1]);
    graphics.closePath();graphics.fillPath();
  }

  function addProps(scene) {
    // Each prop is depth-sorted at its actual contact line with the ground.
    for(const [x,y] of [[17,12],[29,25],[10,20],[37,18]]){
      const px=x*TILE,py=y*TILE,groundY=py+15;
      const prop=scene.add.graphics().setDepth(groundY+2);
      scene.add.ellipse(px+4,py+17,18,6,0x111710,0.30).setDepth(groundY-1);
      prop.fillStyle(0x70462e,1);prop.fillRoundedRect(px-8,py-13,25,27,4);
      prop.fillStyle(0xb27c4b,1);prop.fillRect(px-5,py-11,18,3);prop.fillRect(px-5,py+5,18,3);
      prop.fillStyle(0x533321,1);prop.fillRect(px+1,py-12,3,25);
      prop.lineStyle(1,0x3b291f,0.9);prop.strokeRoundedRect(px-8,py-13,25,27,4);
    }
    for(const [x,y] of [[18,11],[30,24]]){
      const px=x*TILE,py=y*TILE,groundY=py+14;
      const prop=scene.add.graphics().setDepth(groundY+2);
      scene.add.ellipse(px+1,py+15,20,6,0x111710,0.28).setDepth(groundY-1);
      prop.fillStyle(0x5d3d29,1);prop.fillRect(px-13,py-9,28,22);
      prop.fillStyle(0xa97948,1);prop.fillRect(px-11,py-7,24,3);
      prop.fillStyle(0x453023,1);prop.fillRect(px-8,py-3,3,15);prop.fillRect(px+5,py-3,3,15);
      prop.lineStyle(1,0x34251c,0.9);prop.strokeRect(px-13,py-9,28,22);
    }
    for(const [x,y] of [[19,15],[28,15],[19,22],[29,22],[8,17],[39,17]]){
      const px=x*TILE,py=y*TILE,groundY=py+3;
      const prop=scene.add.graphics().setDepth(groundY+2);
      scene.add.ellipse(px,py+4,13,5,0x111710,0.28).setDepth(groundY-1);
      prop.fillStyle(0x4c4031,1);prop.fillRect(px-2,py-25,4,27);
      prop.fillStyle(0x2e2c29,1);prop.fillRect(px-8,py-29,16,4);
      prop.fillStyle(0xf7d98b,1);prop.fillRect(px-5,py-25,10,9);
      prop.fillStyle(0xffd170,0.16);prop.fillCircle(px,py-20,16);
    }
    for(const [x,y] of [[20,14],[28,22]]){
      const px=x*TILE,py=y*TILE,groundY=py+12;
      const prop=scene.add.graphics().setDepth(groundY+2);
      scene.add.ellipse(px,py+13,22,6,0x111710,0.28).setDepth(groundY-1);
      prop.fillStyle(0x493326,1);prop.fillRect(px-18,py-2,36,5);
      prop.fillStyle(0x9c6a3c,1);prop.fillRect(px-18,py-8,36,7);
      prop.fillRect(px-13,py+3,4,9);prop.fillRect(px+10,py+3,4,9);
    }
  }

  const houseBodies=[];

  function create() {
    sceneRef=this;
    this.physics.world.setBounds(0,0,WORLD_W,WORLD_H);
    drawGround(this);

    // The detailed illustrated city is loaded as a single optimized SVG backdrop.

    // Les bâtiments et jardins sont intégrés dans l'illustration détaillée.
    // Les portes restent interactives et les collisions sont gérées séparément.
    tavernDoor={x:2315,y:585};

    const cx=24*TILE+16,cy=18*TILE+16;
    const makeNpc=(key,x,y,tunic,hair,accent,cloak=false)=>{
      makeCharacterTexture(this,key,tunic,hair,accent,cloak);
      // The sprite position is its ground-contact point: align the soles
      // with the floor instead of anchoring the character around its torso.
      const groundX=x*TILE+16,groundY=y*TILE+16;
      const shadow=this.add.ellipse(groundX,groundY+1,27,8,0x11170f,0.42).setDepth(groundY+2);
      const sprite=this.add.sprite(groundX,groundY,key,1)
        .setOrigin(0.5,0.92).setScale(1.12).setDepth(groundY+30);
      sprite.setData("shadow",shadow);
      this.physics.add.existing(sprite);
      sprite.body.setSize(18,12).setOffset(15,45).setCollideWorldBounds(true);
      return sprite;
    };

    const player=makeNpc("hero",40,34,"#3e5d91","#493126","#d6bd7e");
    const amelie=makeNpc("amelie",52,28,"#ad527d","#d2a25a","#f1d6a5");
    const guard=makeNpc("guard",40,8,"#52647a","#4a382b","#d8c28a");
    const mage=makeNpc("mage",17,17,"#554078","#352645","#7cc8de",true);
    const merchant=makeNpc("merchant",6,17,"#b47b42","#63412d","#e4c27c");

    // Chaque habitant possède son propre secteur, sa vitesse et ses pauses.
    const roamers=[
      {sprite:amelie,zone:{left:49*TILE,top:25*TILE,right:57*TILE,bottom:32*TILE},speed:42,pause:900,goal:null,next:0,stuck:0,lastX:amelie.x,lastY:amelie.y,row:0},
      {sprite:guard,zone:{left:37*TILE,top:6*TILE,right:48*TILE,bottom:13*TILE},speed:34,pause:1400,goal:null,next:0,stuck:0,lastX:guard.x,lastY:guard.y,row:0},
      {sprite:mage,zone:{left:13*TILE,top:14*TILE,right:23*TILE,bottom:22*TILE},speed:30,pause:1800,goal:null,next:0,stuck:0,lastX:mage.x,lastY:mage.y,row:0},
      {sprite:merchant,zone:{left:3*TILE,top:14*TILE,right:11*TILE,bottom:22*TILE},speed:25,pause:2200,goal:null,next:0,stuck:0,lastX:merchant.x,lastY:merchant.y,row:0}
    ];
    this.roamers=roamers;

    const npcGroup=this.physics.add.group();
    [amelie,guard,mage,merchant].forEach(sprite=>{
      npcGroup.add(sprite);
      sprite.body.setImmovable(true);
      sprite.body.setSize(18,12).setOffset(15,45);
    });

    // Buildings block the player; NPCs remain approachable.
    this.physics.add.collider(player,houseBodies);
    this.physics.add.collider(player,npcGroup);

    const obstacles=this.physics.add.staticGroup();
    const addObstacle=(x,y,w,h)=>{
      const block=this.add.rectangle(x,y,w,h,0x000000,0);
      obstacles.add(block);
      block.body.setSize(w,h);
    };
    // Collisions approximatives des bâtiments et du bassin central d’Ardencourt.
    addObstacle(1280,78,1120,135);
    addObstacle(270,185,470,210);
    addObstacle(2390,475,300,340);
    addObstacle(1280,720,350,58);
    addObstacle(1088,850,58,250);
    addObstacle(1472,850,58,250);
    addObstacle(1280,1035,350,48);
    // Arbres, colonnes en ruine et eau du Lac d’Azur dans les nouvelles régions.
    const frontierX=2560;
    [[130,120],[410,120],[610,80],[990,80],[900,470],[250,540],[690,560],
     [160,1160],[420,1390],[790,1150],[1120,1450],[1500,1190],[1860,1390],
     [2220,1150],[2430,1550]].forEach(([x,y])=>addObstacle(frontierX+x,y,58,58));
    [[1165,350],[1390,320],[1655,340],[1870,355]].forEach(([x,y])=>addObstacle(frontierX+x,y,48,72));
    // Le pont reste libre : seule la surface profonde du lac est bloquante.
    addObstacle(frontierX+2090,1510,760,440);
    this.physics.add.collider(player,obstacles);
    // PNJ respectent les bâtiments, les limites et les obstacles du village.
    this.physics.add.collider(npcGroup,houseBodies);
    this.physics.add.collider(npcGroup,obstacles);
    this.physics.add.collider(npcGroup,npcGroup);

    this.cameras.main.setBounds(0,0,WORLD_W,WORLD_H);
    // Frame the royal square, library, market and palace together.
    this.cameras.main.setZoom(0.78);
    this.cameras.main.startFollow(player,true,0.12,0.12);

    const labels=[
      [amelie,"Amélie · Guide"],[guard,"Garde royal"],
      [mage,"Morgane · Mage"],[merchant,"Élise · Marchande"]
    ];
    labels.forEach(([sprite,label])=>{
      const text=this.add.text(sprite.x,sprite.y-37,label,{
        fontFamily:"monospace",fontSize:"10px",color:"#fff0c4",
        backgroundColor:"#1d2a24",padding:{x:4,y:2},
        stroke:"#33271e",strokeThickness:3
      }).setOrigin(0.5).setDepth(3000);
      sprite.setData("label",text);
    });

    this.player=player;
    this.npcs={amelie,guard,mage,merchant};
    this.desired={x:0,y:0};
    this.lastWalkFrame=0;
    this.add.text(45*TILE,18*TILE,"PORTE D’ARDENCOURT",{
      fontFamily:"monospace",fontSize:"10px",color:"#f5d99b",
      stroke:"#34281d",strokeThickness:3
    }).setOrigin(0.5).setDepth(1700);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{sceneRef=null;});
  }

  function update(time,delta=16) {
    if(!this.player||!this.player.body)return;
    const p=this.player;
    const d=this.desired||{x:0,y:0};
    const moving=!!(d.x||d.y);
    const speed=190;
    const length=Math.hypot(d.x,d.y)||1;
    p.body.setVelocity(moving?d.x/length*speed:0,moving?d.y/length*speed:0);

    if(moving){
      const row=Math.abs(d.x)>Math.abs(d.y)?(d.x<0?1:2):(d.y<0?3:0);
      const frame=Math.floor(time/190)%3;
      p.setFrame(row*3+frame);
    }else{
      const row=this.lastWalkFrame||0;
      p.setFrame(row*3+1);
    }
    if(moving){
      this.lastWalkFrame=Math.abs(d.x)>Math.abs(d.y)?(d.x<0?1:2):(d.y<0?3:0);
    }

    // Déplacement autonome des habitants avec destinations aléatoires bornées.
    const chooseGoal=(agent)=>{
      const z=agent.zone;
      for(let attempt=0;attempt<24;attempt++){
        const x=Phaser.Math.Between(z.left,z.right);
        const y=Phaser.Math.Between(z.top,z.bottom);
        // On évite le bassin central, les façades et les zones hors des allées.
        const inFountain=Phaser.Math.Distance.Between(x,y,24*TILE+16,18*TILE+16)<100;
        if(!inFountain){agent.goal={x,y};agent.next=time+Phaser.Math.Between(500,1300);agent.stuck=0;return;}
      }
      agent.goal={x:agent.sprite.x+Phaser.Math.Between(-55,55),y:agent.sprite.y+Phaser.Math.Between(-45,45)};
      agent.next=time+700;
    };
    if(!inside){
      if(this.pauseNpcMovement){
        (this.roamers||[]).forEach(agent=>agent.sprite.body?.setVelocity(0,0));
      } else (this.roamers||[]).forEach(agent=>{
        const a=agent.sprite;
        if(!a.active||!a.body)return;
        if(!agent.goal&&time>=agent.next)chooseGoal(agent);
        if(!agent.goal){a.body.setVelocity(0,0);return;}
        const dx=agent.goal.x-a.x,dy=agent.goal.y-a.y;
        const distance=Math.hypot(dx,dy);
        if(distance<9){
          a.body.setVelocity(0,0);agent.goal=null;agent.next=time+agent.pause+Phaser.Math.Between(0,1000);
        }else{
          const speed=agent.speed;
          a.body.setVelocity(dx/distance*speed,dy/distance*speed);
          agent.row=Math.abs(dx)>Math.abs(dy)?(dx<0?1:2):(dy<0?3:0);
          const frame=Math.floor(time/260)%3;
          a.setFrame(agent.row*3+frame);
        }
        if(time-agent.lastCheck>500||agent.lastCheck===undefined){
          const moved=Phaser.Math.Distance.Between(a.x,a.y,agent.lastX,agent.lastY);
          agent.stuck=moved<2?agent.stuck+1:0;
          agent.lastX=a.x;agent.lastY=a.y;agent.lastCheck=time;
          if(agent.stuck>=2){a.body.setVelocity(0,0);agent.goal=null;agent.next=time+100;agent.stuck=0;}
        }
      });
    }else{
      roamers.forEach(agent=>agent.sprite.body?.setVelocity(0,0));
    }

    const actors=[p,...Object.values(this.npcs)];
    actors.forEach(actor=>{
      actor.setDepth(actor.y+30);
      const shadow=actor.getData("shadow");
      if(shadow){shadow.setPosition(actor.x,actor.y+1).setDepth(actor.y+2);}
      const label=actor.getData("label");
      if(label)label.setPosition(actor.x,actor.y-37).setDepth(actor.y+500);
    });
  }

  return {
    pauseNpcMovement(paused){
      if(!sceneRef)return false;
      sceneRef.pauseNpcMovement=!!paused;
      if(paused)(sceneRef.roamers||[]).forEach(agent=>agent.sprite.body?.setVelocity(0,0));
      return true;
    },
    move(dx,dy){
      if(!sceneRef)return false;
      const x=Number.isFinite(dx)?dx:0;
      const y=Number.isFinite(dy)?dy:0;
      sceneRef.desired={x,y};
      if(sceneRef.player?.body && x===0 && y===0){
        sceneRef.player.body.setVelocity(0,0);
        sceneRef.player.body.stop();
      }
      return true;
    },
    nearAmelie(){
      if(!sceneRef?.player)return false;
      const n=sceneRef.npcs.amelie;
      return Phaser.Math.Distance.Between(sceneRef.player.x,sceneRef.player.y,n.x,n.y)<76;
    },
    nearDoor(){
      if(!sceneRef?.player)return false;
      const door=inside?interiorDoor:tavernDoor;
       return Phaser.Math.Distance.Between(sceneRef.player.x,sceneRef.player.y,door.x,door.y)<72;
    },
    nearInnkeeper(){return false;},
    enterInterior(){
      if(!sceneRef?.player||inside)return false;
      inside=true;
      const scene=sceneRef,p=scene.player;
      cityVisibility=scene.children.list.map(obj=>[obj,obj.visible]);
      cityVisibility.forEach(([obj])=>{if(obj!==p&&obj!==p.getData("shadow"))obj.setVisible(false);});
      const g=scene.add.graphics().setDepth(10);
      g.fillStyle(0x111522,1);g.fillRect(0,0,WORLD_W,WORLD_H);
      g.fillStyle(0x76513b,1);g.fillRoundedRect(11*TILE,8*TILE,26*TILE,20*TILE,18);
      g.fillStyle(0xc49a68,1);g.fillRoundedRect(12*TILE,9*TILE,24*TILE,18*TILE,12);
      g.fillStyle(0x8d6344,1);g.fillRect(13*TILE,10*TILE,22*TILE,16*TILE);
      g.fillStyle(0xb98250,1);g.fillRect(14*TILE,12*TILE,20*TILE,12*TILE);
      for(let y=12;y<24;y++)for(let x=14;x<34;x++){if((x+y)%2===0){g.lineStyle(1,0x75482f,.55);g.lineBetween(x*TILE,y*TILE,(x+1)*TILE,y*TILE);}}
      g.fillStyle(0x493044,1);g.fillRect(13*TILE,10*TILE,22*TILE,2*TILE);
      g.fillStyle(0x342638,1);g.fillRect(13*TILE,10*TILE,2*TILE,16*TILE);g.fillRect(33*TILE,10*TILE,2*TILE,16*TILE);
      g.fillStyle(0x26394a,1);g.fillRect(21*TILE,10*TILE,5*TILE,2*TILE);
      g.lineStyle(3,0xe5bd83,1);g.strokeRect(21*TILE,10*TILE,5*TILE,2*TILE);
      g.fillStyle(0x392b2a,1);g.fillRoundedRect(29*TILE,12*TILE,4*TILE,5*TILE,5);
      g.fillStyle(0xf18a42,1);g.fillEllipse(31*TILE,16*TILE,54,35);
      g.fillStyle(0xffd477,.75);g.fillEllipse(31*TILE,16*TILE,25,19);
      g.fillStyle(0x563522,1);g.fillRoundedRect(17*TILE,16*TILE,5*TILE,3*TILE,5);
      g.fillStyle(0xc18a51,1);g.fillRoundedRect(17*TILE,15*TILE,5*TILE,2*TILE,4);
      g.fillStyle(0x563522,1);g.fillRoundedRect(25*TILE,19*TILE,5*TILE,3*TILE,5);
      g.fillStyle(0xc18a51,1);g.fillRoundedRect(25*TILE,18*TILE,5*TILE,2*TILE,4);
      g.fillStyle(0x4b3025,1);g.fillRect(15*TILE,11*TILE,7*TILE,2*TILE);
      g.fillStyle(0xe4c27e,1);g.fillRect(15*TILE,11*TILE,7*TILE,3);
      interiorDoor={x:24*TILE+16,y:24*TILE};
      interiorObjects=[g,scene.add.text(24*TILE+16,9*TILE,"AUBERGE DU DRAGON D’OR",{fontFamily:"Georgia",fontSize:"22px",color:"#ffe0a0",stroke:"#40291e",strokeThickness:5}).setOrigin(.5).setDepth(20),scene.add.text(24*TILE+16,26*TILE,"SORTIE",{fontFamily:"Georgia",fontSize:"14px",color:"#fff0c4",stroke:"#40291e",strokeThickness:4}).setOrigin(.5).setDepth(20)];
      p.setPosition(interiorDoor.x,interiorDoor.y-90);p.body.reset(p.x,p.y);p.body.setCollideWorldBounds(false);
      return true;
    },
    exitInterior(){
      if(!sceneRef?.player||!inside)return false;
      inside=false;interiorObjects.forEach(obj=>obj?.destroy());interiorObjects=[];
      cityVisibility?.forEach(([obj,visible])=>{if(obj?.active)obj.setVisible(visible);});cityVisibility=null;
      const p=sceneRef.player;p.setPosition(tavernDoor.x,tavernDoor.y+75);p.body.reset(p.x,p.y);p.body.setCollideWorldBounds(true);
      return true;
    },
    get insideBuilding(){return inside;},
    get player(){return sceneRef?.player||null;},
    destroy(){game.destroy(true);sceneRef=null;}
  };
}
