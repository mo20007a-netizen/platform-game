const game = document.getElementById("game");
const player = document.getElementById("player");
const platformEls = Array.from(document.querySelectorAll(".platform"));
const coinsEls = Array.from(document.querySelectorAll(".coin"));
const scoreText = document.getElementById("score");
const statusText = document.getElementById("status");

let x = 50;
let y = 50;
const width = 50;
const height = 65;
let vx = 0;
let vy = 0;

const speed = 4;
const gravity = 0.7;
const jumpPower = 14;

let onGround = false;
let score = 0;
let gameOver = false;

const keys = { ArrowLeft:false, ArrowRight:false, ArrowUp:false };

const platforms = platformEls.map(el=>{
  const px = parseInt(el.dataset.x,10)||0;
  const py = parseInt(el.dataset.y,10)||0;
  const pw = parseInt(el.dataset.w,10)||el.offsetWidth||100;
  el.style.left = px+"px";
  el.style.bottom = py+"px";
  el.style.width = pw+"px";
  return {x:px,y:py,w:pw,h:15};
});

coinsEls.forEach(c=>{
  const cx = parseInt(c.dataset.x,10)||0;
  const cy = parseInt(c.dataset.y,10)||0;
  c.style.left = cx+"px";
  c.style.bottom = cy+"px";
  c.dataset.cx = cx;
  c.dataset.cy = cy;
});

// كيبورد
window.addEventListener("keydown", e => { if(keys[e.key]!==undefined) keys[e.key]=true; });
window.addEventListener("keyup", e => { if(keys[e.key]!==undefined) keys[e.key]=false; });

// دعم اللمس / pointer
const pointerStates = new Map();

function recomputeKeysFromPointers(){
  let left=false, right=false;
  for(const st of pointerStates.values()){
    if(st.left) left=true;
    if(st.right) right=true;
  }
  keys.ArrowLeft = left;
  keys.ArrowRight = right;
}

// لمس / pointer
game.addEventListener("pointerdown", e=>{
  e.preventDefault();
  const rect = game.getBoundingClientRect();
  const lx = e.clientX-rect.left;
  const ly = e.clientY-rect.top;
  const w = rect.width;
  const h = rect.height;

  const leftZone = lx<w*0.33;
  const rightZone = lx>w*0.66;
  const jumpZone = ly<h*0.4;

  pointerStates.set(e.pointerId, {left:leftZone,right:rightZone,jump:jumpZone});

  if(jumpZone && onGround){ vy=jumpPower; onGround=false; }
  recomputeKeysFromPointers();
});

game.addEventListener("pointermove", e=>{
  if(!pointerStates.has(e.pointerId)) return;
  e.preventDefault();
  const rect = game.getBoundingClientRect();
  const lx = e.clientX-rect.left;
  const ly = e.clientY-rect.top;
  const w = rect.width;
  const h = rect.height;
  const leftZone = lx<w*0.33;
  const rightZone = lx>w*0.66;
  const jumpZone = ly<h*0.4;
  pointerStates.set(e.pointerId, {left:leftZone,right:rightZone,jump:jumpZone});
  recomputeKeysFromPointers();
});

function removePointer(id){ pointerStates.delete(id); recomputeKeysFromPointers(); }

game.addEventListener("pointerup", e=>{ e.preventDefault(); removePointer(e.pointerId); });
game.addEventListener("pointercancel", e=>{ removePointer(e.pointerId); });
game.addEventListener("pointerout", e=>{ removePointer(e.pointerId); });
game.addEventListener("pointerleave", e=>{ removePointer(e.pointerId); });

// حلقة اللعبة
let lastTime = performance.now();
function loop(now){
  if(gameOver) return;
  const dt = (now-lastTime)/16.67; lastTime=now;

  vx=0;
  if(keys.ArrowLeft) vx=-speed;
  if(keys.ArrowRight) vx=speed;
  if(keys.ArrowUp && onGround){ vy=jumpPower; onGround=false; }

  vy-=gravity*dt;
  const prevY=y;
  x+=vx*dt; y+=vy*dt;

  if(x<0) x=0;
  if(x+width>game.clientWidth) x=game.clientWidth-width;

  onGround=false;
  platforms.forEach(p=>{
    if(x+width>p.x && x<p.x+p.w && prevY>=p.y+p.h && y<=p.y+p.h && vy<=0){
      y=p.y+p.h; vy=0; onGround=true;
    }
  });

  coinsEls.forEach(c=>{
    if(c.style.display==="none") return;
    const cx=parseInt(c.dataset.cx,10);
    const cy=parseInt(c.dataset.cy,10);
    if(x<cx+22 && x+width>cx && y<cy+22 && y+height>cy){
      c.style.display="none"; score++; scoreText.textContent="Score: "+score;
    }
  });

  player.style.left=Math.round(x)+"px";
  player.style.bottom=Math.round(y)+"px";

  if(y<-120){ statusText.textContent="💀 GAME OVER"; gameOver=true; return; }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
