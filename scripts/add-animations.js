const fs = require('fs');
let c = fs.readFileSync('public/diploma-ppt.html', 'utf8');

// 1. Make slides fullscreen interactive
c = c.replace(
  '.slide{width:297mm;height:210mm;background:var(--bg);position:relative;overflow:hidden;page-break-after:always;display:flex;flex-direction:column;}',
  '.slide{width:100vw;height:100vh;background:var(--bg);position:absolute;top:0;left:0;overflow:hidden;display:flex;flex-direction:column;opacity:0;pointer-events:none;}'
);
c = c.replace('.slide:last-child{page-break-after:avoid;}', '.slide.active{opacity:1;pointer-events:all;}');
c = c.replace(
  'body{background:var(--bg);color:var(--text);font-family:var(--fp);}',
  'body{background:var(--bg);color:var(--text);font-family:var(--fp);overflow:hidden;width:100vw;height:100vh;}'
);
// Remove print media
c = c.replace('@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}\n@page{size:A4 landscape;margin:0;}', '');

// 2. Animation CSS
const anim = `
/* TRANSITIONS */
@keyframes outFade{to{opacity:0;transform:scale(1.03);}}
@keyframes inFade{from{opacity:0;transform:scale(.97);}to{opacity:1;transform:none;}}
@keyframes outLeft{to{opacity:0;transform:translateX(-5%);}}
@keyframes inLeft{from{opacity:0;transform:translateX(5%);}to{opacity:1;transform:none;}}
@keyframes outRight{to{opacity:0;transform:translateX(5%);}}
@keyframes inRight{from{opacity:0;transform:translateX(-5%);}to{opacity:1;transform:none;}}
@keyframes outZoom{to{opacity:0;transform:scale(1.12);}}
@keyframes inZoom{from{opacity:0;transform:scale(.88);}to{opacity:1;transform:scale(1);}}
@keyframes outGlitch{
  0%{opacity:1;filter:none;transform:none;}
  25%{transform:translateX(-4px);filter:hue-rotate(90deg) brightness(1.6);}
  50%{transform:translateX(4px);filter:hue-rotate(-90deg);}
  100%{opacity:0;transform:none;filter:none;}
}
@keyframes inGlitch{
  0%{opacity:0;transform:translateX(8px);filter:hue-rotate(180deg) brightness(2);}
  30%{opacity:1;transform:translateX(-3px);filter:hue-rotate(-60deg);}
  60%{transform:translateX(2px);filter:brightness(1.2);}
  100%{opacity:1;transform:none;filter:none;}
}
.out-fade{animation:outFade .4s ease forwards;}
.in-fade{animation:inFade .4s ease forwards;}
.out-left{animation:outLeft .4s cubic-bezier(.4,0,.2,1) forwards;}
.in-left{animation:inLeft .4s cubic-bezier(.4,0,.2,1) forwards;}
.out-right{animation:outRight .4s ease forwards;}
.in-right{animation:inRight .4s ease forwards;}
.out-zoom{animation:outZoom .38s ease forwards;}
.in-zoom{animation:inZoom .38s ease forwards;}
.out-glitch{animation:outGlitch .32s ease forwards;}
.in-glitch{animation:inGlitch .48s ease forwards;}

/* NAV */
#_prog{position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,var(--cyan),var(--green));z-index:9999;transition:width .4s ease;box-shadow:0 0 10px var(--cyan);}
#_nav{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:10px;background:rgba(4,8,20,.95);padding:8px 18px;border:1px solid rgba(0,212,255,.25);backdrop-filter:blur(16px);}
#_nav button{background:transparent;border:1px solid rgba(0,212,255,.3);color:var(--cyan);font-family:var(--fp);font-size:8px;padding:6px 16px;cursor:pointer;transition:all .15s;letter-spacing:1px;}
#_nav button:hover{background:rgba(0,212,255,.15);border-color:var(--cyan);}
#_nav button:disabled{opacity:.2;cursor:default;}
#_ctr{font-family:var(--fp);font-size:7px;color:var(--dim);min-width:60px;text-align:center;}
#_tb{position:fixed;bottom:18px;left:16px;font-family:var(--fp);font-size:6px;color:var(--dim);cursor:pointer;background:rgba(4,8,20,.85);border:1px solid rgba(0,212,255,.1);padding:6px 10px;z-index:9999;letter-spacing:1px;transition:color .15s;}
#_tb:hover{color:var(--cyan);}
#_fs{position:fixed;top:12px;right:12px;font-family:var(--fp);font-size:6px;color:var(--dim);cursor:pointer;background:rgba(4,8,20,.7);border:1px solid rgba(0,212,255,.08);padding:5px 10px;z-index:9999;transition:color .15s;}
#_fs:hover{color:var(--cyan);}
#_keys{position:fixed;bottom:18px;right:16px;font-family:var(--fp);font-size:5px;color:rgba(0,212,255,.18);z-index:9999;line-height:2;text-align:right;}
`;
c = c.replace('</style>', anim + '\n</style>');

// 3. Interactive HTML + JS
const html = `
<div id="_prog" style="width:0"></div>
<div id="_nav">
  <button id="_p">◀ PREV</button>
  <span id="_ctr">1/1</span>
  <button id="_n">NEXT ▶</button>
</div>
<button id="_tb">✦ FADE</button>
<button id="_fs">⛶ FULL</button>
<div id="_keys">← → NAVIGATE<br/>SPACE NEXT<br/>F FULLSCREEN<br/>T TRANSITION</div>
<script>
(function(){
const sl=document.querySelectorAll('.slide');
const TR=['fade','left','zoom','glitch'];
const TL={fade:'FADE',left:'SLIDE',zoom:'ZOOM',glitch:'GLITCH'};
let cur=0,ti=0,busy=false;

function go(d){
  if(busy||cur+d<0||cur+d>=sl.length)return;
  busy=true;
  const t=TR[ti];
  const isDir=t==='left';
  const oc='out-'+(isDir?(d>0?'left':'right'):t);
  const ic='in-'+(isDir?(d>0?'left':'right'):t);
  sl[cur].classList.add(oc);
  setTimeout(()=>{
    sl[cur].classList.remove('active',oc);
    cur+=d;
    sl[cur].classList.add('active',ic);
    setTimeout(()=>{sl[cur].classList.remove(ic);busy=false;},500);
    upd();
  },380);
}
function upd(){
  document.getElementById('_ctr').textContent=(cur+1)+'/'+sl.length;
  document.getElementById('_prog').style.width=((cur+1)/sl.length*100)+'%';
  document.getElementById('_p').disabled=cur===0;
  document.getElementById('_n').disabled=cur===sl.length-1;
}
function ct(){ti=(ti+1)%TR.length;document.getElementById('_tb').textContent='✦ '+TL[TR[ti]];}
function fs(){!document.fullscreenElement?document.documentElement.requestFullscreen():document.exitFullscreen();}

document.getElementById('_p').onclick=()=>go(-1);
document.getElementById('_n').onclick=()=>go(1);
document.getElementById('_tb').onclick=ct;
document.getElementById('_fs').onclick=fs;
document.addEventListener('keydown',e=>{
  if(['ArrowRight','Space',' '].includes(e.key)||e.code==='Space')go(1);
  else if(e.key==='ArrowLeft')go(-1);
  else if(e.key.toLowerCase()==='f')fs();
  else if(e.key.toLowerCase()==='t')ct();
  if([' ','ArrowRight','ArrowLeft'].includes(e.key))e.preventDefault();
});
sl[0].classList.add('active');
upd();
})();
</script>`;

c = c.replace('</body>', html + '\n</body>');
fs.writeFileSync('public/diploma-ppt.html', c, 'utf8');
console.log('done, slides:', (c.match(/class="slide/g)||[]).length);