import {createWorld} from "./world.js";
const canvas=document.querySelector("#world3d");
const game=createWorld(canvas);
const held=new Set();
const activePointers=new Map();
const keyboardHeld=new Set();
const vectors={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const keyMap={ArrowUp:"up",KeyW:"up",ArrowDown:"down",KeyS:"down",ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right"};
const status=document.querySelector("#move-state"),hint=document.querySelector("#collision-hint");
const interactButton=document.querySelector("#interact"),dialogue=document.querySelector("#dialogue");
const dialogueText=document.querySelector("#dialogue-text"),toast=document.querySelector("#game-toast");
const state={hp:820,mp:220,gold:152750,quest:0,inventory:["Potion de soin × 2"],level:15};
let activeNpc=null,dialogueStep=0,last=0,toastTimer=0,hintTimer=0;
const lines=[
 "Bonjour, voyageur. Bienvenue à Ardencourt ! Je suis Amélie, la guide de cette cité.",
 "Une ancienne librairie de Lyon renfermerait un secret oublié. Pour commencer, retrouve-moi lorsque tu seras prêt à quitter Ardencourt.",
 "Nouvelle quête : Le secret de la librairie. Objectif : parler à Amélie à Lyon."
];
function toastMessage(s){toast.textContent=s;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2000)}
function blocked(){hint.classList.add("visible");clearTimeout(hintTimer);hintTimer=setTimeout(()=>hint.classList.remove("visible"),550)}
function syncHeld(){
 held.clear();keyboardHeld.forEach(d=>held.add(d));activePointers.forEach(d=>held.add(d));update();
}
function update(){
 const labels={up:"Haut",down:"Bas",left:"Gauche",right:"Droite"};
 const label=held.size?[...held].map(d=>labels[d]).join(" + "):"Prêt";
 if(status){status.value=label;status.textContent=label;}
 document.querySelectorAll(".direction").forEach(b=>b.classList.toggle("pressed",held.has(b.dataset.dir)));
 const atDoor=game.nearDoor(),atGuide=game.nearAmelie(),atInnkeeper=game.nearInnkeeper();
 interactButton.hidden=!(atDoor||atGuide||atInnkeeper)||!dialogue.hidden;
 interactButton.textContent=atDoor?(game.insideBuilding?"Sortir":"Entrer dans l auberge"):atInnkeeper?"Parler au tavernier":"Parler · E";
}
function releaseAll(){
 keyboardHeld.clear();activePointers.clear();syncHeld();
}
document.querySelectorAll(".direction").forEach(b=>{
 const d=b.dataset.dir;
 b.addEventListener("pointerdown",e=>{
  e.preventDefault();if(activePointers.has(e.pointerId))return;
  activePointers.set(e.pointerId,d);
  try{b.setPointerCapture(e.pointerId)}catch{}
  syncHeld();
 });
 b.addEventListener("contextmenu",e=>e.preventDefault());
 b.addEventListener("lostpointercapture",e=>{
  if(activePointers.delete(e.pointerId))syncHeld();
 });
});
window.addEventListener("pointerup",e=>{if(activePointers.delete(e.pointerId))syncHeld()},{passive:true});
window.addEventListener("pointercancel",e=>{if(activePointers.delete(e.pointerId))syncHeld()},{passive:true});
window.addEventListener("keydown",e=>{
 const d=keyMap[e.code];if(d){e.preventDefault();keyboardHeld.add(d);syncHeld();return}
 if(e.code==="KeyE"||e.code==="Enter"){if(!interactButton.hidden)interactButton.click()}
 if(e.code==="Escape"){dialogue.hidden=true;document.querySelector("#game-panel").hidden=true;activeNpc=null;releaseAll();update()}
});
window.addEventListener("keyup",e=>{const d=keyMap[e.code];if(d&&keyboardHeld.delete(d))syncHeld()});
window.addEventListener("blur",releaseAll);
window.addEventListener("pagehide",releaseAll);
document.addEventListener("visibilitychange",()=>{if(document.hidden)releaseAll()});
document.addEventListener("touchcancel",releaseAll,{passive:true});
function openDialogue(){
 activeNpc=true;dialogueStep=0;
 const inside=game.insideBuilding;
 const speech=inside?["Bienvenue au Dragon d Or ! Installe-toi près du feu, voyageur.","Les routes vers Lyon sont longues. Une vieille librairie y cacherait un secret.","Tu peux consulter le tableau des contrats près du comptoir."]:lines;
 document.querySelector("#dialogue-name").textContent=inside?"Tavernier":"Amélie";
 dialogueText.textContent=speech[0];dialogue.hidden=false;interactButton.hidden=true;
 dialogue.dataset.speech=JSON.stringify(speech);
}
document.querySelector("#dialogue-next").addEventListener("click",()=>{
 if(!activeNpc)return;dialogueStep++;
 const speech=JSON.parse(dialogue.dataset.speech||"[]");
 if(dialogueStep>=speech.length){
  if(!state.quest){state.quest=1;toastMessage("Quête ajoutée : Le secret de la librairie");save()}
  dialogue.hidden=true;activeNpc=null;update();return;
 }
 dialogueText.textContent=speech[dialogueStep];
});
document.querySelector("#dialogue-close").addEventListener("click",()=>{dialogue.hidden=true;activeNpc=null;update()});
interactButton.addEventListener("click",()=>{
 if(game.nearDoor()){
  if(game.insideBuilding){game.exitInterior();toastMessage("Tu es sorti de l auberge.");}
  else{game.enterInterior();toastMessage("Bienvenue au Dragon d Or.");}
  update();return;
 }
 openDialogue();
});
function save(){try{localStorage.setItem("arcadias-3d-save",JSON.stringify(state));toastMessage("Progression sauvegardée.")}catch{toastMessage("Sauvegarde impossible.")}}
function load(){try{Object.assign(state,JSON.parse(localStorage.getItem("arcadias-3d-save")||"{}"))}catch{}}
function panel(kind){
 const views={
 character:["Personnage",`<p>Niveau ${state.level} · Aventurier</p><p>PV : ${state.hp}/820</p><p>PM : ${state.mp}/220</p><p>Or : ${state.gold.toLocaleString("fr-FR")}</p>`],
 inventory:["Inventaire",`<ul>${state.inventory.map(x=>"<li>"+x+"</li>").join("")}</ul>`],
 quests:["Quêtes",state.quest?'<p><strong>Le secret de la librairie</strong><br>Retrouver la librairie à Lyon.</p>':'<p>Parle à Amélie sur la place.</p>'],
 map:["Carte",'<p>Ardencourt — place centrale.</p><p>Les maisons sont maintenant des bâtiments 3D avec collisions.</p>']
 };
 const [title,body]=views[kind];document.querySelector("#panel-title").textContent=title;document.querySelector("#panel-content").innerHTML=body;document.querySelector("#game-panel").hidden=false;
}
document.querySelectorAll("[data-panel]").forEach(b=>b.addEventListener("click",()=>panel(b.dataset.panel)));
document.querySelector("#panel-close").addEventListener("click",()=>document.querySelector("#game-panel").hidden=true);
document.querySelector("#save-game").addEventListener("click",save);
function frame(t){
 const dt=Math.min(.05,(t-(last||t))/1000);last=t;
 let x=0,z=0;for(const d of held){x+=vectors[d][0];z+=vectors[d][1]}
 if(x||z){
  const moved=game.move(x,z,dt);
  if(!moved)blocked();
 }
 update();requestAnimationFrame(frame);
}
load();update();requestAnimationFrame(frame);
