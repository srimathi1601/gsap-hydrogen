(function(){
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const imgObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.style.backgroundImage=e.target.dataset.bg;imgObserver.unobserve(e.target)}})},{rootMargin:'300px'});
const CDN_FIG={"e9ac26fbf8d3":"https://cdn.shopify.com/s/files/1/1020/0694/8118/files/e9ac26fbf8d3.webp?v=1794395983","45ba2bc9cb7d":"https://cdn.shopify.com/s/files/1/1020/0694/8118/files/45ba2bc9cb7d.webp?v=1794395982","ca93da750e60":"https://cdn.shopify.com/s/files/1/1020/0694/8118/files/ca93da750e60.webp?v=1794395982","100f7b534a9e":"https://cdn.shopify.com/s/files/1/1020/0694/8118/files/100f7b534a9e.webp?v=1794395982","f86d4179b4f9":"https://cdn.shopify.com/s/files/1/1020/0694/8118/files/f86d4179b4f9.webp?v=1794395982","e0595c9d6e75":"https://cdn.shopify.com/s/files/1/1020/0694/8118/files/e0595c9d6e75.webp?v=1794395983","4c1771f4781f":"https://cdn.shopify.com/s/files/1/1020/0694/8118/files/4c1771f4781f.webp?v=1794395982","ce131b330785":"https://cdn.shopify.com/s/files/1/1020/0694/8118/files/ce131b330785.webp?v=1794395983","28905357799c":"https://cdn.shopify.com/s/files/1/1020/0694/8118/files/28905357799c.webp?v=1794395982","504091300394":"https://cdn.shopify.com/s/files/1/1020/0694/8118/files/504091300394.webp?v=1794395982","ea1587470644":"https://cdn.shopify.com/s/files/1/1020/0694/8118/files/ea1587470644.webp?v=1794395982"};
const near=(st,i)=>{if(st[i])return st[i];for(let d=1;d<st.length;d++){if(st[i-d])return Object.assign({},st[i-d],{o:0});if(st[i+d])return Object.assign({},st[i+d],{o:0});}};
function bgOf(p){const l=[];(p.gr||[]).forEach(g=>l.push(g));return l.join(',')}
window.buildStage=function(sec,host){
  const st=document.createElement('div');st.className='stage';st.style.width=sec.W+'px';st.style.height=sec.H+'px';st.style.background=sec.bg;host.appendChild(st);
  const els={'':st},items=[];const N=sec.nodes[0].st.length;
  sec.nodes.forEach(n=>{
    const p0=near(n.st,0);const el=document.createElement('div');el.className='n';el.dataset.k=n.k;
    const c=n.css;for(const k in c){if(k!=='va')el.style.setProperty(k,typeof c[k]==='number'&&k==='font-size'?c[k]+'px':c[k])}
    if(n.t==='TEXT'){el.classList.add('tx');el.textContent=p0.txt;if(p0.h<parseFloat(c['line-height'])*1.5&&!p0.txt.includes('\n'))el.style.whiteSpace='nowrap';if(c.va==='CENTER'){el.style.display='flex';el.style.alignItems='center';el.style.justifyContent=c['text-align']==='center'?'center':c['text-align']==='right'?'flex-end':'flex-start'}}
    else if(n.svg!==undefined){el.innerHTML=`<svg viewBox="${n.vb.join(' ')}" width="100%" height="100%" preserveAspectRatio="none" overflow="visible">${n.svg}</svg>`}
    else{const g=bgOf(p0);if(g)el.style.backgroundImage=g;}
    const layers={};
    if(n.t!=='TEXT'&&n.svg===undefined){n.st.forEach(p=>p&&(p.img||[]).forEach(([r,m])=>{if(!layers[r]){const L=document.createElement('div');L.className='il';L.dataset.bg=CDN_FIG[r]?`url(${CDN_FIG[r]})`:`url(/fig/${r}.webp)`;imgObserver.observe(L);L.style.backgroundSize=m==='FIT'?'contain':'cover';L.style.borderRadius='inherit';el.appendChild(L);layers[r]=L}}))}
    Object.assign(el.style,{left:p0.x+'px',top:p0.y+'px',width:p0.w+'px',height:p0.h+'px',opacity:p0.o});
    if(p0.bg)el.style.backgroundColor=p0.bg;if(p0.c)el.style.color=p0.c;
    (els[n.p]||st).appendChild(el);els[n.k]=el;
    for(const r in layers)layers[r].style.opacity=(p0.img||[]).some(x=>x[0]===r)?1:0;
    items.push({n,el,layers});
  });
  // timeline
  const tl=gsap.timeline({paused:true});
  for(let i=1;i<N;i++){items.forEach(({n,el,layers})=>{
    const a=near(n.st,i-1),b=near(n.st,i);if(!a||!b)return;
    const v={};if(a.x!==b.x)v.left=b.x;if(a.y!==b.y)v.top=b.y;if(a.w!==b.w)v.width=b.w;if(a.h!==b.h)v.height=b.h;
    if(a.bg&&a.bg!==b.bg)v.backgroundColor=b.bg;if(a.c&&a.c!==b.c)v.color=b.c;if(a.fs!==b.fs&&b.fs)v.fontSize=b.fs;
    const txtChange=n.t==='TEXT'&&a.txt!==b.txt;
    if(a.o!==b.o&&!txtChange)v.opacity=b.o;
    if(Object.keys(v).length)tl.to(el,Object.assign(v,{duration:1,ease:'power2.inOut'}),i-1);
    if(txtChange){tl.to(el,{opacity:0,y:-14,duration:.35,ease:'power2.in'},i-1+.1);tl.set(el,{y:16},i-.5);tl.call(()=>{},null,i-.5);tl.to(el,{opacity:b.o,y:0,duration:.4,ease:'power2.out'},i-.5);}
    for(const r in layers){const oa=(a.img||[]).some(x=>x[0]===r)?1:0,ob=(b.img||[]).some(x=>x[0]===r)?1:0;
      if(oa!==ob)tl.fromTo(layers[r],{opacity:oa,scale:ob?1.04:1},{opacity:ob,scale:1,duration:.8,ease:'power2.inOut'},i-1+.1);}
  })}
  // text content follows nearest state
  let last=-1;const setTexts=pr=>{const idx=pr*(N-1);items.forEach(({n,el})=>{if(n.t!=='TEXT')return;const s=Math.min(N-1,Math.floor(idx+.5));const p=near(n.st,s);if(p&&el.textContent!==p.txt)el.textContent=p.txt})};
  tl.eventCallback('onUpdate',()=>setTexts(tl.progress()));
  return {st,tl,N,items,els};
};
window.mountPinned=function(host,sec,opt={}){
  const S=buildStage(sec,host.querySelector('.pinbox'));
  const fit=()=>{const vw=innerWidth,vh=innerHeight;let s=opt.fit?Math.min(vw/sec.W,vh/sec.H):vw/sec.W;if(opt.nav)s=Math.min(vw/sec.W,(vh-24)/(opt.nav[1]-opt.nav[0]));const h=sec.H*s;
    S.st.style.transform=`scale(${s})`;S.st.style.left=((vw-sec.W*s)/2)+'px';
    const box=host.querySelector('.pinbox');box.style.height=h+'px';const top=opt.nav?Math.min(0,vh-24-opt.nav[1]*s):Math.min(0,vh-h);box.style.top=top+'px';
    host.style.height=(RM?h:h+(S.N-1)*vh*(opt.per||0.9))+'px';host._top=top;host._h=h;};
  fit();addEventListener('resize',fit);
  if(RM){S.tl.progress(1);return S}
  S.trig=ScrollTrigger.create({trigger:host,start:()=>`top ${host._top}`,end:()=>`bottom ${host._top+host._h}`,scrub:0.6,animation:S.tl,invalidateOnRefresh:true,
    onUpdate:opt.onUpdate});
  return S;
};
})();
window.fitTexts=()=>{document.querySelectorAll('.tx').forEach(el=>{if(el.style.whiteSpace!=='nowrap'&&!el.textContent.includes('\n'))el.style.whiteSpace='normal';if(1){const rg=document.createRange();rg.selectNodeContents(el);const tw=rg.getBoundingClientRect().width/((el.closest('.stage').getBoundingClientRect().width/el.closest('.stage').offsetWidth)||1);const cw=el.offsetWidth;if(tw>cw+.5&&el.getClientRects().length){const lines=Math.round(rg.getClientRects().length);if(true){const n=Math.max(1,el.textContent.length-1),fs=parseFloat(getComputedStyle(el).fontSize);const ls=parseFloat(getComputedStyle(el).letterSpacing)||0;el.style.letterSpacing=(ls-Math.min((tw-cw+.6)/n,fs*.05))+'px'}}}if(el.style.whiteSpace==='nowrap'&&el.scrollWidth>el.clientWidth+1&&(el.style.textAlign==='center'||el.style.justifyContent==='center')){const d=el.scrollWidth-el.clientWidth;el.style.left=(parseFloat(el.style.left)-d/2)+'px';el.style.width=el.scrollWidth+'px';return}if(el.style.whiteSpace==='nowrap'&&el.scrollWidth>el.clientWidth+8){el.style.overflow='hidden';el.style.textOverflow='ellipsis'}})};
