const pad = document.querySelector("#psp-pad");
const readout = document.querySelector("#movement-readout");
const scene = document.querySelector("#scene");
const status = document.querySelector("#scene-status");

const held = new Set();
const keyMap = {
  ArrowUp:"up", KeyW:"up",
  ArrowDown:"down", KeyS:"down",
  ArrowLeft:"left", KeyA:"left",
  ArrowRight:"right", KeyD:"right"
};
const vectors = {
  up:[0,-1], down:[0,1], left:[-1,0], right:[1,0]
};
let lastSent = "";

function currentVector(){
  let x=0,y=0;
  for(const dir of held){x+=vectors[dir][0];y+=vectors[dir][1]}
  if(x&&y){const n=Math.SQRT1_2;x*=n;y*=n}
  return {x,y};
}
function render(){
  const {x,y}=currentVector();
  const label = x===0&&y===0 ? "Prêt" :
    (y<0?"Haut":y>0?"Bas":"") + (x&&y?" + ":"") +
    (x<0?"Gauche":x>0?"Droite":"");
  readout.value=label;
  readout.textContent=label;
  pad.querySelectorAll(".direction").forEach(b=>b.classList.toggle("pressed",held.has(b.dataset.dir)));
  window.dispatchEvent(new CustomEvent("arcadias:move",{detail:{x,y,active:!!(x||y)}}));
}
function press(dir){held.add(dir);render()}
function release(dir){held.delete(dir);render()}

pad.querySelectorAll(".direction").forEach(button=>{
  const dir=button.dataset.dir;
  button.addEventListener("pointerdown",event=>{
    event.preventDefault();
    button.setPointerCapture?.(event.pointerId);
    press(dir);
  });
  const stop=event=>{event.preventDefault();release(dir)};
  button.addEventListener("pointerup",stop);
  button.addEventListener("pointercancel",stop);
  button.addEventListener("lostpointercapture",()=>release(dir));
  button.addEventListener("contextmenu",event=>event.preventDefault());
});
window.addEventListener("keydown",event=>{
  const dir=keyMap[event.code];
  if(!dir)return;
  event.preventDefault();
  if(!event.repeat)press(dir);
});
window.addEventListener("keyup",event=>{
  const dir=keyMap[event.code];
  if(dir){event.preventDefault();release(dir)}
});
window.addEventListener("blur",()=>{held.clear();render()});
document.addEventListener("visibilitychange",()=>{if(document.hidden){held.clear();render()}});

scene.addEventListener("load",()=>status.classList.add("hidden"));
scene.addEventListener("error",()=>{
  status.textContent="Image de référence à ajouter : assets/ardencourt-reference.webp";
  status.classList.remove("hidden");
});
render();