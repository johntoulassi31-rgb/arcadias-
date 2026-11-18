const stage=document.querySelector("#stage");
const scene=document.querySelector("#scene");
const hero=document.querySelector("#hero");
const sprite=document.querySelector("#hero-sprite");
const ring=document.querySelector("#player-ring");
const pad=document.querySelector("#psp-pad");
const status=document.querySelector("#move-state");
const hint=document.querySelector("#collision-hint");
const interactButton=document.querySelector("#interact");
const dialogue=document.querySelector("#dialogue");
const dialogueText=document.querySelector("#dialogue-text");
const toast=document.querySelector("#game-toast");

const held=new Set();
const vectors={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const keyMap={ArrowUp:"up",KeyW:"up",ArrowDown:"down",KeyS:"down",ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right"};
const state={x:.50,y:.47,hp:820,mp:220,gold:152750,quest:0,inventory:["Potion de soin × 2"],level:15};
const walkable=[[.20,.34],[.52,.32],[.69,.35],[.91,.36],[.96,.66],[.88,.82],[.78,.92],[.38,.94],[.25,.82],[.18,.62],[.10,.48]];
const obstacles=[
 {x:.59,y:.51,rx:.13,ry:.16}, // fontaine
 {x:.45,y:.27,rx:.07,ry:.10}, // forge
 {x:.82,y:.34,rx:.045,ry:.09}, // garde
 {x:.26,y:.43,rx:.035,ry:.065}, // marchande
 {x:.75,y:.75,rx:.045,ry:.09} // mage
];
const npc={amelie:{x:.68,y:.56,name:"Amélie",lines:[
 "Bonjour, voyageur. Bienvenue à Ardencourt ! Je suis Amélie, la guide de cette cité.",
 "Une ancienne librairie de Lyon renfermerait un secret oublié. Pour commencer, retrouve-moi lorsque tu seras prêt à quitter Ardencourt.",
 "Nouvelle quête : Le secret de la librairie. Objectif : parler à Amélie à Lyon."
]}};
let last=0,hintTimer=0,toastTimer=0,dialogueStep=0,activeNpc=null;

function insidePolygon(px,py){
 let inside=false;
 for(let i=0,j=walkable.length-1;i<walkable.length;j=i++){
  const [xi,yi]=walkable[i],[xj,yj]=walkable[j];
  const hit=((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi+1e-9));
  if(hit)inside=!inside;
 }
 return inside;
}
function blocked(px,py){
 if(!insidePolygon(px,py))return true;
 return obstacles.some(o=>((px-o.x)/o.rx)**2+((py-o.y)/o.ry)**2<1);
}
function showToast(message){
 toast.textContent=message;toast.classList.add("show");
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),1800);
}
function showBlocked(){
 hint.classList.add("visible");clearTimeout(hintTimer);
 hintTimer=setTimeout(()=>hint.classList.remove("visible"),650);
}
function updateVisual(dx=0,dy=0){
 hero.style.left=(state.x*100)+"%";hero.style.top=(state.y*100)+"%";
 hero.style.zIndex=String(7+Math.round(state.y*100));
 ring.style.left=(state.x*100)+"%";ring.style.top=((state.y+.018)*100)+"%";
 hero.classList.toggle("walking",!!(dx||dy));
 hero.classList.toggle("facing-left",dx<-.01);
 hero.classList.toggle("facing-up",dy<-.01);
 const labels={up:"Haut",down:"Bas",left:"Gauche",right:"Droite"};
 const label=held.size?[...held].map(d=>labels[d]).join(" + "):"Prêt";
 status.value=label;status.textContent=label;
 pad.querySelectorAll(".direction").forEach(b=>b.classList.toggle("pressed",held.has(b.dataset.dir)));
 const near=Math.hypot((state.x-npc.amelie.x)*1.1,(state.y-npc.amelie.y)*1.7)<.105;
 interactButton.hidden=!near||!dialogue.hidden;
 if(near&&dialogue.hidden)interactButton.hidden=false;
}
function press(dir){held.add(dir);updateVisual()}
function release(dir){held.delete(dir);updateVisual()}

function buildCharacterLayers(){
 const image=scene;
 const w=image.naturalWidth,h=image.naturalHeight;
 if(!w||!h)return;
 const bg=document.createElement("canvas");bg.width=w;bg.height=h;
 const b=bg.getContext("2d");b.drawImage(image,0,0);
 // Reconstruction du pavage à l'endroit où le héros était imprimé dans la maquette.
 const sx=Math.round(w*.345),sy=Math.round(h*.385),sw=Math.round(w*.112),sh=Math.round(h*.195);
 const dx=Math.round(w*.442),dy=Math.round(h*.36),dw=Math.round(w*.112),dh=Math.round(h*.195);
 const patch=document.createElement("canvas");patch.width=sw;patch.height=sh;
 patch.getContext("2d").drawImage(image,sx,sy,sw,sh,0,0,sw,sh);
 b.save();b.globalAlpha=.96;b.drawImage(patch,dx,dy,dw,dh);b.restore();
 // Le vrai héros est découpé depuis la maquette, et non remplacé par un personnage générique.
 const crop={x:w*.442,y:h*.36,w:w*.112,h:h*.203};
 const c=sprite.getContext("2d");c.clearRect(0,0,180,190);
 c.save();c.scale(180/crop.w,190/crop.h);
 c.beginPath();
 const poly=[[82,8],[101,15],[113,35],[116,57],[132,82],[158,113],[154,129],[137,126],[122,111],[120,137],[140,160],[130,174],[106,162],[92,143],[82,169],[64,180],[48,172],[58,146],[58,122],[34,111],[12,99],[16,81],[43,61],[55,34],[68,17]];
 c.moveTo(poly[0][0],poly[0][1]);for(const p of poly.slice(1))c.lineTo(p[0],p[1]);c.closePath();c.clip();
 c.drawImage(image,crop.x,crop.y,crop.w,crop.h,0,0,180,190);c.restore();
 image.src=bg.toDataURL("image/jpeg",.91);
}
function openDialogue(which="amelie"){
 activeNpc=npc[which];dialogueStep=0;
 document.querySelector("#dialogue-name").textContent=activeNpc.name;
 dialogueText.textContent=activeNpc.lines[dialogueStep];
 dialogue.hidden=false;interactButton.hidden=true;
}
function nextDialogue(){
 if(!activeNpc)return;
 dialogueStep++;
 if(dialogueStep>=activeNpc.lines.length){
  if(activeNpc===npc.amelie&&state.quest===0){
   state.quest=1;showToast("Quête ajoutée : Le secret de la librairie");
   saveState();
  }
  dialogue.hidden=true;activeNpc=null;updateVisual();return;
 }
 dialogueText.textContent=activeNpc.lines[dialogueStep];
}
function saveState(){
 try{localStorage.setItem("arcadias-save-v1",JSON.stringify(state));showToast("Progression sauvegardée sur cet appareil.");}
 catch{showToast("Sauvegarde indisponible sur ce navigateur.");}
}
function loadState(){
 try{const saved=JSON.parse(localStorage.getItem("arcadias-save-v1")||"null");if(saved&&typeof saved.x==="number"){Object.assign(state,saved);}}
 catch{}
}
function showPanel(kind){
 const panel=document.querySelector("#game-panel"),title=document.querySelector("#panel-title"),content=document.querySelector("#panel-content");
 const views={
  character:["Personnage",`<p>Niveau ${state.level} · Arcadien</p><p>PV : ${state.hp}/820</p><p>PM : ${state.mp}/220</p><p>Or : ${state.gold.toLocaleString("fr-FR")}</p><p>Position : ${Math.round(state.x*100)}, ${Math.round(state.y*100)}</p>`],
  inventory:["Inventaire",`<ul>${state.inventory.map(i=>"<li>"+i+"</li>").join("")}</ul>`],
  quests:["Quêtes",state.quest?'<p><strong>Le secret de la librairie</strong><br>Objectif : rejoindre Lyon et retrouver la librairie.</p>':'<p>Aucune quête active. Parle à Amélie près de la fontaine.</p>'],
  map:["Carte",'<p><strong>Ardencourt</strong> — place centrale.</p><p>Le chemin vers Lyon sera accessible après cette première étape.</p>']
 };
 [title.textContent,content.innerHTML]=views[kind]||views.character;panel.hidden=false;
}
pad.querySelectorAll(".direction").forEach(button=>{
 const dir=button.dataset.dir;
 button.addEventListener("pointerdown",e=>{e.preventDefault();try{button.setPointerCapture(e.pointerId)}catch{}press(dir)});
 const stop=e=>{e.preventDefault();release(dir)};
 button.addEventListener("pointerup",stop);button.addEventListener("pointercancel",stop);
 button.addEventListener("lostpointercapture",()=>release(dir));
 button.addEventListener("contextmenu",e=>e.preventDefault());
});
window.addEventListener("keydown",e=>{
 const dir=keyMap[e.code];
 if(dir){e.preventDefault();if(!e.repeat)press(dir);return;}
 if(e.code==="KeyE"||e.code==="Enter"){if(!interactButton.hidden){e.preventDefault();openDialogue();}}
 if(e.code==="Escape"){dialogue.hidden=true;document.querySelector("#game-panel").hidden=true;activeNpc=null;updateVisual();}
});
window.addEventListener("keyup",e=>{const dir=keyMap[e.code];if(dir){e.preventDefault();release(dir)}});
window.addEventListener("blur",()=>{held.clear();updateVisual()});
document.addEventListener("visibilitychange",()=>{if(document.hidden){held.clear();updateVisual()}});
interactButton.addEventListener("click",()=>openDialogue());
document.querySelector("#dialogue-next").addEventListener("click",nextDialogue);
document.querySelector("#dialogue-close").addEventListener("click",()=>{dialogue.hidden=true;activeNpc=null;updateVisual()});
document.querySelectorAll("[data-panel]").forEach(b=>b.addEventListener("click",()=>showPanel(b.dataset.panel)));
document.querySelector("#panel-close").addEventListener("click",()=>document.querySelector("#game-panel").hidden=true);
document.querySelector("#save-game").addEventListener("click",saveState);

function frame(t){
 const dt=Math.min(.05,(t-(last||t))/1000);last=t;
 let dx=0,dy=0;for(const d of held){dx+=vectors[d][0];dy+=vectors[d][1]}
 if(dx&&dy){dx*=Math.SQRT1_2;dy*=Math.SQRT1_2}
 if(dx||dy){
  const speed=.30,nx=state.x+dx*speed*dt,ny=state.y+dy*speed*dt;let moved=false;
  if(!blocked(nx,state.y)){state.x=nx;moved=true}
  if(!blocked(state.x,ny)){state.y=ny;moved=true}
  if(!moved)showBlocked();
  updateVisual(dx,dy);
 }
 requestAnimationFrame(frame);
}
loadState();
if(scene.complete)buildCharacterLayers();else scene.addEventListener("load",buildCharacterLayers,{once:true});
updateVisual();requestAnimationFrame(frame);
