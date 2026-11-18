const stage=document.querySelector("#stage");
const hero=document.querySelector("#hero");
const ring=document.querySelector("#player-ring");
const pad=document.querySelector("#psp-pad");
const status=document.querySelector("#move-state");
const hint=document.querySelector("#collision-hint");

const held=new Set();
const vectors={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const keyMap={ArrowUp:"up",KeyW:"up",ArrowDown:"down",KeyS:"down",ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right"};
// Position du héros sur la place, exprimée en pourcentage de la scène.
let x=.50,y=.68,last=0,hintTimer=0;
const speed=.30;
// Zone pavée praticable autour de la fontaine et des échoppes.
const walkable=[[.22,.28],[.75,.28],[.88,.40],[.96,.63],[.91,.88],[.43,.93],[.18,.82],[.08,.61],[.14,.42]];
// Obstacles fixes : fontaine, échoppe, bâtiment de droite et escalier du palais.
const obstacles=[
 {x:.50,y:.385,rx:.105,ry:.135},
 {x:.105,y:.405,rx:.075,ry:.145},
 {x:.925,y:.48,rx:.065,ry:.205},
 {x:.50,y:.105,rx:.145,ry:.075}
];
const facingClasses=["facing-left","facing-up","facing-up-left","facing-up-right","facing-down-left"];
function insidePolygon(px,py){
 let inside=false;
 for(let i=0,j=walkable.length-1;i<walkable.length;j=i++){
  const [xi,yi]=walkable[i],[xj,yj]=walkable[j];
  const intersect=((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi+1e-9)+xi);
  if(intersect)inside=!inside;
 }
 return inside;
}
function blocked(px,py){
 if(!insidePolygon(px,py))return true;
 return obstacles.some(o=>((px-o.x)/o.rx)**2+((py-o.y)/o.ry)**2<1);
}
function updateVisual(dx=0,dy=0){
 hero.style.left=(x*100)+"%";
 hero.style.top=(y*100)+"%";
 hero.style.zIndex=String(5+Math.round(y*100));
 ring.style.left=(x*100)+"%";
 ring.style.top=((y+.032)*100)+"%";
 hero.classList.toggle("walking",!!(dx||dy));
 facingClasses.forEach(c=>hero.classList.remove(c));
 if(dx<-.01&&dy<-.01)hero.classList.add("facing-up-left");
 else if(dx>.01&&dy<-.01)hero.classList.add("facing-up-right");
 else if(dx<-.01&&dy>.01)hero.classList.add("facing-down-left");
 else if(dx<-.01)hero.classList.add("facing-left");
 else if(dy<-.01)hero.classList.add("facing-up");
 const labels={up:"Haut",down:"Bas",left:"Gauche",right:"Droite"};
 const dirs=[...held];
 const label=dirs.length?dirs.map(d=>labels[d]).join(" + "):"Prêt";
 status.value=label;status.textContent=label;
 pad.querySelectorAll(".direction").forEach(b=>b.classList.toggle("pressed",held.has(b.dataset.dir)));
}
function showBlocked(){
 hint.classList.add("visible");
 clearTimeout(hintTimer);
 hintTimer=setTimeout(()=>hint.classList.remove("visible"),850);
}
function press(dir){held.add(dir);updateVisual()}
function release(dir){held.delete(dir);updateVisual()}
pad.querySelectorAll(".direction").forEach(button=>{
 const dir=button.dataset.dir;
 button.addEventListener("pointerdown",e=>{
  e.preventDefault();
  try{button.setPointerCapture(e.pointerId)}catch{}
  press(dir);
 });
 const stop=e=>{e.preventDefault();release(dir)};
 button.addEventListener("pointerup",stop);
 button.addEventListener("pointercancel",stop);
 button.addEventListener("lostpointercapture",()=>release(dir));
 button.addEventListener("contextmenu",e=>e.preventDefault());
});
window.addEventListener("keydown",e=>{
 const dir=keyMap[e.code];
 if(!dir)return;
 e.preventDefault();
 if(!e.repeat)press(dir);
});
window.addEventListener("keyup",e=>{
 const dir=keyMap[e.code];
 if(dir){e.preventDefault();release(dir)}
});
window.addEventListener("blur",()=>{held.clear();updateVisual()});
document.addEventListener("visibilitychange",()=>{if(document.hidden){held.clear();updateVisual()}});
function frame(t){
 const dt=Math.min(.05,(t-(last||t))/1000);
 last=t;
 let dx=0,dy=0;
 for(const d of held){dx+=vectors[d][0];dy+=vectors[d][1]}
 if(dx&&dy){dx*=Math.SQRT1_2;dy*=Math.SQRT1_2}
 if(dx||dy){
  const nx=x+dx*speed*dt,ny=y+dy*speed*dt;
  let moved=false;
  // Collision sur les deux axes séparément : le héros peut longer les obstacles.
  if(!blocked(nx,y)){x=nx;moved=true}
  if(!blocked(x,ny)){y=ny;moved=true}
  if(!moved)showBlocked();
  updateVisual(dx,dy);
 }
 requestAnimationFrame(frame);
}
updateVisual();
requestAnimationFrame(frame);
