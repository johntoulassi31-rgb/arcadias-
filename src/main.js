const stage=document.querySelector("#stage");
const hero=document.querySelector("#hero");
const ring=document.querySelector("#player-ring");
const pad=document.querySelector("#psp-pad");
const status=document.querySelector("#move-state");
const hint=document.querySelector("#collision-hint");

const held=new Set();
const vectors={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const keyMap={ArrowUp:"up",KeyW:"up",ArrowDown:"down",KeyS:"down",ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right"};
let x=.485,y=.485,last=0,hintTimer=0;
const speed=.27; // proportion of stage width per second
// Polygonal walkable plaza, expressed in normalized stage coordinates.
const walkable=[[.23,.32],[.72,.32],[.87,.43],[.96,.65],[.91,.86],[.42,.91],[.19,.79],[.10,.60],[.17,.43]];
function insidePolygon(px,py){
 let inside=false;
 for(let i=0,j=walkable.length-1;i<walkable.length;j=i++){
  const [xi,yi]=walkable[i],[xj,yj]=walkable[j];
  const intersect=((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi+1e-9)+xi);
  if(intersect)inside=!inside;
 }
 return inside;
}
function updateVisual(dx=0,dy=0){
 hero.style.left=(x*100)+"%";hero.style.top=(y*100)+"%";
 ring.style.left=(x*100)+"%";ring.style.top=((y+.032)*100)+"%";
 hero.classList.toggle("walking",!!(dx||dy));
 hero.classList.toggle("facing-left",dx<-.01);
 hero.classList.toggle("facing-up",dy<-.01);
 const dirs=[...held];
 const label=dirs.length?dirs.map(d=>({up:"Haut",down:"Bas",left:"Gauche",right:"Droite"}[d])).join(" + "):"Prêt";
 status.value=label;status.textContent=label;
 pad.querySelectorAll(".direction").forEach(b=>b.classList.toggle("pressed",held.has(b.dataset.dir)));
}
function showBlocked(){
 hint.classList.add("visible");clearTimeout(hintTimer);
 hintTimer=setTimeout(()=>hint.classList.remove("visible"),900);
}
function press(dir){held.add(dir);updateVisual()}
function release(dir){held.delete(dir);updateVisual()}
pad.querySelectorAll(".direction").forEach(button=>{
 const dir=button.dataset.dir;
 button.addEventListener("pointerdown",e=>{e.preventDefault();try{button.setPointerCapture(e.pointerId)}catch{}press(dir)});
 const stop=e=>{e.preventDefault();release(dir)};
 button.addEventListener("pointerup",stop);
 button.addEventListener("pointercancel",stop);
 button.addEventListener("lostpointercapture",()=>release(dir));
 button.addEventListener("contextmenu",e=>e.preventDefault());
});
window.addEventListener("keydown",e=>{
 const dir=keyMap[e.code];if(!dir)return;e.preventDefault();if(!e.repeat)press(dir);
});
window.addEventListener("keyup",e=>{const dir=keyMap[e.code];if(dir){e.preventDefault();release(dir)}});
window.addEventListener("blur",()=>{held.clear();updateVisual()});
document.addEventListener("visibilitychange",()=>{if(document.hidden){held.clear();updateVisual()}});
function frame(t){
 const dt=Math.min(.05,(t-(last||t))/1000);last=t;
 let dx=0,dy=0;for(const d of held){dx+=vectors[d][0];dy+=vectors[d][1]}
 if(dx&&dy){dx*=Math.SQRT1_2;dy*=Math.SQRT1_2}
 if(dx||dy){
  const nx=x+dx*speed*dt,ny=y+dy*speed*dt;
  // Axis-separated collision lets the hero slide along plaza edges.
  let moved=false;
  if(insidePolygon(nx,y)){x=nx;moved=true}
  if(insidePolygon(x,ny)){y=ny;moved=true}
  if(!moved)showBlocked();
  updateVisual(dx,dy);
 }
 requestAnimationFrame(frame);
}
updateVisual();requestAnimationFrame(frame);
