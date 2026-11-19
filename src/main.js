import {createWorld} from "./world.js";
const canvas=document.querySelector("#world3d");
const game=createWorld(canvas);
const held=new Set();
const activePointers=new Map();
const keyboardHeld=new Set();
const vectors={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const keyMap={ArrowUp:"up",KeyW:"up",ArrowDown:"down",KeyS:"down",ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right"};
const status=document.querySelector("#move-state"),hint=document.querySelector("#collision-hint");
const mapTitle=document.querySelector(".map-title"),mapCoords=document.querySelector(".mini-map small");
let lastRegion="";
const interactButton=document.querySelector("#interact"),dialogue=document.querySelector("#dialogue");
const chatToggle=document.querySelector("#chat-toggle"),chatPanel=document.querySelector("#chat-panel");
chatToggle?.addEventListener("click",()=>{
 const open=chatPanel.classList.toggle("chat-open");
 chatPanel.setAttribute("aria-hidden",String(!open));
 chatToggle.setAttribute("aria-expanded",String(open));
 chatToggle.setAttribute("aria-label",open?"Fermer la messagerie":"Ouvrir la messagerie");
 chatToggle.classList.toggle("active",open);
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&chatPanel?.classList.contains("chat-open")){
 chatPanel.classList.remove("chat-open");chatPanel.setAttribute("aria-hidden","true");
 chatToggle?.setAttribute("aria-expanded","false");chatToggle?.classList.remove("active");
}});
const dialogueText=document.querySelector("#dialogue-text"),toast=document.querySelector("#game-toast");
const state={hp:820,mp:220,gold:152750,quest:0,inventory:["Potion de soin × 2"],level:15,mount:null,familiar:null,combat:false,energy:82,hunger:24,social:46,hygiene:78,fun:63,relationships:{amelie:10,guard:0,mage:0,merchant:0}};
let activeNpc=null,dialogueStep=0,last=0,toastTimer=0,hintTimer=0;
const lines=[
 "Bonjour, voyageur. Bienvenue à Ardencourt ! Je suis Amélie, la guide de cette cité.",
 "Une ancienne librairie de Lyon renfermerait un secret oublié. Pour commencer, retrouve-moi lorsque tu seras prêt à quitter Ardencourt.",
 "Nouvelle quête : Le secret de la librairie. Objectif : parler à Amélie à Lyon."
];
function toastMessage(s){toast.textContent=s;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2000)}
function blocked(){hint.classList.add("visible");clearTimeout(hintTimer);hintTimer=setTimeout(()=>hint.classList.remove("visible"),550)}
function syncHeld(){
 if(!dialogue.hidden){keyboardHeld.clear();activePointers.clear();held.clear();game.move(0,0);update();return;}
 held.clear();
 keyboardHeld.forEach(d=>held.add(d));
 activePointers.forEach(d=>held.add(d));
 // Transmettre aussi le vecteur nul : relâcher une touche doit arrêter le héros immédiatement.
 let x=0,y=0;
 for(const d of held){x+=vectors[d][0];y+=vectors[d][1];}
 game.move(x,y);
 update();
}
function update(){
 const player=game.player;
 if(player&&mapTitle){
  const x=player.x,y=player.y,frontier=x>=2560,fx=x-2560;
  const region=!frontier?"Ardencourt":(y<620?(fx>950?"Ruines d’Aster":"Forêt des Murmures"):(y>1120&&fx>1650?"Lac d’Azur":"Vallée d’Émeraude"));
  if(mapTitle.firstChild)mapTitle.firstChild.textContent=region+" ";
  if(mapCoords)mapCoords.textContent="("+Math.floor(x/32)+", "+Math.floor(y/32)+")";
  if(region!==lastRegion&&lastRegion){toastMessage("Nouvelle région : "+region);}
  lastRegion=region;
 }
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
 const releasePointer=e=>{
  if(activePointers.delete(e.pointerId))syncHeld();
 };
 b.addEventListener("pointerup",releasePointer);
 b.addEventListener("pointercancel",releasePointer);
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
const releaseKey=e=>{
 const d=keyMap[e.code];
 if(d&&keyboardHeld.delete(d))syncHeld();
};
window.addEventListener("keyup",releaseKey,true);
document.addEventListener("keyup",releaseKey,true);
window.addEventListener("pointerup",e=>{if(activePointers.delete(e.pointerId))syncHeld()},true);
window.addEventListener("pointercancel",e=>{if(activePointers.delete(e.pointerId))syncHeld()},true);
document.addEventListener("touchend",()=>{if(activePointers.size){activePointers.clear();syncHeld()}},{passive:true});
window.addEventListener("blur",releaseAll);
window.addEventListener("pagehide",releaseAll);
document.addEventListener("visibilitychange",()=>{if(document.hidden)releaseAll()});
document.addEventListener("touchcancel",releaseAll,{passive:true});
interactButton.addEventListener("click",()=>{
 if(game.nearDoor()){
  if(game.insideBuilding){game.exitInterior();toastMessage("Vous quittez l’auberge.");}
  else{game.enterInterior();toastMessage("Auberge du Dragon d’Or");}
  releaseAll();update();return;
 }
 if(game.nearAmelie()||game.nearInnkeeper())openDialogue();
});
function openDialogue(){
 releaseAll();game.pauseNpcMovement(true);
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
  dialogue.hidden=true;activeNpc=null;game.pauseNpcMovement(false);releaseAll();update();return;
 }
 dialogueText.textContent=speech[dialogueStep];
});
document.querySelector("#dialogue-close").addEventListener("click",()=>{dialogue.hidden=true;activeNpc=null;game.pauseNpcMovement(false);releaseAll();update()});
function save(){try{localStorage.setItem("arcadias-3d-save",JSON.stringify(state));toastMessage("Progression sauvegardée.")}catch{toastMessage("Sauvegarde impossible.")}}
function load(){try{Object.assign(state,JSON.parse(localStorage.getItem("arcadias-3d-save")||"{}"))}catch{}}
function panel(kind){
 const views={
 character:["Personnage",`<p>Niveau ${state.level} · Aventurier</p><p>PV : ${state.hp}/820</p><p>PM : ${state.mp}/220</p><p>Or : ${state.gold.toLocaleString("fr-FR")}</p><h3>Vie quotidienne</h3><p>Énergie : ${state.energy}% · Faim : ${state.hunger}%</p><p>Social : ${state.social}% · Hygiène : ${state.hygiene}% · Loisirs : ${state.fun}%</p><p>Relation avec Amélie : ${state.relationships.amelie}%</p><button class="panel-action" data-action="daily-rest">Se reposer</button><button class="panel-action" data-action="daily-eat">Prendre un repas</button><button class="panel-action" data-action="daily-social">Discuter</button><button class="panel-action" data-action="daily-fun">Se divertir</button><button class="panel-action" data-action="daily-wash">Se laver</button>`],
 inventory:["Inventaire",`<ul>${state.inventory.map(x=>"<li>"+x+"</li>").join("")}</ul>`],
 quests:["Quêtes",state.quest?'<p><strong>Le secret de la librairie</strong><br>Retrouver la librairie à Lyon.</p>':'<p>Parle à Amélie sur la place.</p>'],
 map:["Carte",'<p><strong>Royaume d’Asterion — carte d’exploration</strong></p><ul><li><strong>Ardencourt :</strong> capitale royale, marché, auberge et fontaine.</li><li><strong>Forêt des Murmures :</strong> sentiers boisés et clairières à l’est.</li><li><strong>Ruines d’Aster :</strong> vestiges anciens au nord-est.</li><li><strong>Vallée d’Émeraude :</strong> grande zone naturelle au sud-est.</li><li><strong>Lac d’Azur :</strong> rive et pont de bois au sud.</li></ul><p>Quittez Ardencourt par la grande porte à l’est pour découvrir les nouvelles régions.</p>'],
 skills:["Compétences",'<p><strong>Frappe héroïque</strong> — attaque rapprochée.</p><p><strong>Onde arcanique</strong> — compétence magique.</p><p><strong>Roulade</strong> — esquive rapide.</p>'],
 mount:["Monture",'<p>Aucune monture équipée.</p><p>Débloquez votre première monture auprès du maître des écuries.</p>'],
 familiars:["Familiers",'<p>Aucun familier invoqué.</p><p>Les familiers vous accompagneront dans vos aventures.</p>'],
 shop:["Boutique",'<p>Marchandises disponibles :</p><ul><li>Potion de soin — 120 or</li><li>Potion de mana — 150 or</li><li>Clé de coffre — 500 or</li></ul>'],
 events:["Événements",'<p><strong>Festival d’Ardencourt</strong></p><p>Participez aux activités de la cité pour gagner des récompenses.</p>'],
 rewards:["Récompenses",'<p>Récompense de connexion : en attente.</p><p>Récompense quotidienne : 100 pièces d’or.</p>'],
 menu:["Menu du jeu",'<p>Profil · Paramètres · Aide · Sauvegarde</p><p>ARCADIAS — Royaume d’Asterion</p>'],
 mode:["Mode de jeu",'<p><strong>Exploration</strong> — déplacements libres dans Ardencourt.</p><p>Le mode combat sera activé lors des rencontres avec des monstres.</p>']
 };
 let [title,body]=views[kind];
 if(kind==="mount") body=state.mount?'<p>Monture équipée : Cheval d’Ardencourt</p><button class="panel-action" data-action="mount-off">Ranger la monture</button>':'<p>Aucune monture équipée.</p><button class="panel-action" data-action="mount-equip">Équiper le cheval d’Ardencourt</button>';
 if(kind==="familiars") body=state.familiar?'<p>Familier actif : Petit esprit-loup</p><button class="panel-action" data-action="familiar-off">Renvoyer le familier</button>':'<p>Aucun familier invoqué.</p><button class="panel-action" data-action="familiar-summon">Invoquer le petit esprit-loup</button>';
 if(kind==="combat") body='<p>'+ (state.combat?'Mode combat actif':'Mode exploration') +'</p><button class="panel-action" data-action="combat-toggle">'+(state.combat?'Quitter le combat':'Activer le combat')+'</button><button class="panel-action" data-action="skill-strike">Frappe héroïque</button><button class="panel-action" data-action="skill-magic">Onde arcanique (35 PM)</button>';
 document.querySelector("#panel-title").textContent=title;document.querySelector("#panel-content").innerHTML=body;document.querySelector("#game-panel").hidden=false;
}
document.querySelectorAll("[data-panel]").forEach(b=>b.addEventListener("click",()=>panel(b.dataset.panel)));
document.querySelector("#panel-close").addEventListener("click",()=>document.querySelector("#game-panel").hidden=true);
document.querySelector("#save-game").addEventListener("click",save);
document.querySelector("#combat-button").addEventListener("click",()=>panel("combat"));
document.querySelector("#panel-content").addEventListener("click",e=>{
 const b=e.target.closest("[data-action]");if(!b)return;
 switch(b.dataset.action){
  case "daily-rest":state.energy=Math.min(100,state.energy+25);toastMessage("Repos terminé : énergie restaurée.");panel("character");break;
  case "daily-eat":state.hunger=Math.max(0,state.hunger-30);toastMessage("Repas pris : la faim diminue.");panel("character");break;
  case "daily-social":state.social=Math.min(100,state.social+15);state.relationships.amelie=Math.min(100,state.relationships.amelie+5);toastMessage("Discussion : votre relation progresse.");panel("character");break;
  case "daily-fun":state.fun=Math.min(100,state.fun+20);toastMessage("Vous avez pris du bon temps.");panel("character");break;
  case "daily-wash":state.hygiene=Math.min(100,state.hygiene+30);toastMessage("Vous êtes maintenant propre.");panel("character");break;
  case "mount-equip":state.mount="Cheval d’Ardencourt";toastMessage("Monture équipée.");panel("mount");break;
  case "mount-off":state.mount=null;toastMessage("Monture rangée.");panel("mount");break;
  case "familiar-summon":state.familiar="Petit esprit-loup";toastMessage("Ton familier te rejoint.");panel("familiars");break;
  case "familiar-off":state.familiar=null;toastMessage("Familier renvoyé.");panel("familiars");break;
  case "combat-toggle":state.combat=!state.combat;toastMessage(state.combat?"Mode combat activé.":"Mode exploration activé.");panel("combat");break;
  case "skill-strike":toastMessage(state.combat?"Frappe héroïque : aucune cible à portée.":"Active d’abord le mode combat.");break;
  case "skill-magic":if(!state.combat)toastMessage("Active d’abord le mode combat.");else if(state.mp<35)toastMessage("Mana insuffisant.");else{state.mp-=35;toastMessage("Onde arcanique lancée !");panel("combat");}break;
 }
 save();
});
function frame(t){
 const dt=Math.min(.05,(t-(last||t))/1000);last=t;
 let x=0,z=0;for(const d of held){x+=vectors[d][0];z+=vectors[d][1]}
 if((x||z)&&dialogue.hidden){
  const moved=game.move(x,z,dt);
  if(!moved)blocked();
 }
 update();requestAnimationFrame(frame);
}
// Demander le paysage sur les navigateurs mobiles qui autorisent le verrouillage.
const requestLandscape=()=>{
 try{if(screen.orientation?.lock)screen.orientation.lock("landscape").catch(()=>{});}catch{}
};
document.querySelector("#game")?.addEventListener("pointerdown",requestLandscape,{once:true});
load();update();requestAnimationFrame(frame);
if("serviceWorker" in navigator){window.addEventListener("load",()=>{navigator.serviceWorker.register("./service-worker.js").catch(error=>console.warn("ARCADIAS offline mode unavailable:",error));});}
