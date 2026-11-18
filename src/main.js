import {createWorld} from "./world.js";
const canvas=document.querySelector("#world3d");
const game=createWorld(canvas);
const held=new Set();
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
function update(){
 const labels={up:"Haut",down:"Bas",left:"Gauche",right:"Droite"};
 const label=held.size?[...held].map(d=>labels[d]).join(" + "):"Prêt";
 status.value=label;status.textContent=label;
 document.querySelectorAll(".direction").forEach(b=>b.classList.toggle("pressed",held.has(b.dataset.dir)));
 interactButton.hidden=!game.nearAmelie()||!dialogue.hidden;
}
function press(d){held.add(d);update()}function release(d){held.delete(d);update()}
document.querySelectorAll(".direction").forEach(b=>{
 const d=b.dataset.dir;
 b.addEventListener("pointerdown",e=>{e.preventDefault();b.setPointerCapture(e.pointerId);press(d)});
 const stop=e=>{e.preventDefault();release(d)};
 b.addEventListener("pointerup",stop);b.addEventListener("pointercancel",stop);
 b.addEventListener("lostpointercapture",()=>release(d));
});
window.addEventListener("keydown",e=>{
 const d=keyMap[e.code];if(d){e.preventDefault();press(d);return}
 if(e.code==="KeyE"||e.code==="Enter"){if(!interactButton.hidden)openDialogue()}
 if(e.code==="Escape"){dialogue.hidden=true;document.querySelector("#game-panel").hidden=true;activeNpc=null;update()}
});
window.addEventListener("keyup",e=>{const d=keyMap[e.code];if(d)release(d)});
window.addEventListener("blur",()=>{held.clear();update()});
document.addEventListener("visibilitychange",()=>{if(document.hidden){held.clear();update()}});
function openDialogue(){
 activeNpc=true;dialogueStep=0;document.querySelector("#dialogue-name").textContent="Amélie";
 dialogueText.textContent=lines[0];dialogue.hidden=false;interactButton.hidden=true;
}
document.querySelector("#dialogue-next").addEventListener("click",()=>{
 if(!activeNpc)return;dialogueStep++;
 if(dialogueStep>=lines.length){
  if(!state.quest){state.quest=1;toastMessage("Quête ajoutée : Le secret de la librairie");save()}
  dialogue.hidden=true;activeNpc=null;update();return;
 }
 dialogueText.textContent=lines[dialogueStep];
});
document.querySelector("#dialogue-close").addEventListener("click",()=>{dialogue.hidden=true;activeNpc=null;update()});
interactButton.addEventListener("click",openDialogue);
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
