/**
 * tools/sync-prototype.mjs — re-sync prototype/ into the Hydrogen app.
 *
 *   node tools/sync-prototype.mjs
 *
 * prototype/ is the source of truth and is NEVER edited. Everything this
 * script produces is derived, so re-running it after the prototype changes
 * is the only step needed. It is idempotent.
 *
 * Outputs:
 *   public/{img,fig,fonts,js,models}/     copied verbatim, then patched
 *   public/js/faq.js                      the inline window.FAQ block
 *   app/sections/PrototypePage/body.html  the <body>, scripts stripped
 *   app/styles/app.css                    scaffold CSS + prototype CSS
 *
 * Every patch below is listed with the reason it exists.
 */
import fs from 'fs';
import path from 'path';

const R = (p) => fs.readFileSync(p, 'utf8');
const W = (p, s) => fs.writeFileSync(p, s);
const log = (...a) => console.log(' ', ...a);

/* ─── 1. copy ──────────────────────────────────────────────────────── */
for (const d of ['img', 'fig', 'fonts', 'js', 'models']) {
  // public/fonts also holds intertight.woff2, generated from the .ttf with
  // `npx ttf2woff2` and referenced by app/styles/fonts.css + the preload in
  // app/root.jsx. Wiping the directory would 404 both, so fonts are merged
  // rather than replaced.
  if (d !== 'fonts') fs.rmSync(`public/${d}`, {recursive: true, force: true});
  fs.cpSync(`prototype/${d}`, `public/${d}`, {recursive: true});
  const n = fs
    .readdirSync(`public/${d}`, {recursive: true})
    .filter((f) => fs.statSync(path.join('public', d, f)).isFile()).length;
  log(`copied prototype/${d} -> public/${d}  (${n} files)`);
}

/* ─── 2. patch the copied JS ───────────────────────────────────────── */
const patch = (file, pairs) => {
  let s = R(file);
  for (const [find, repl, why] of pairs) {
    if (!s.includes(find)) {
      console.error(`  !! ${file}: pattern gone -> ${why}`);
      console.error(`     ${find}`);
      process.exitCode = 1;
      continue;
    }
    s = s.split(find).join(repl);
    log(`${file}: ${why}`);
  }
  W(file, s);
};

// CDN-hosted /fig/<hash>.webp swaps, keyed by Figma fill hash.
//
// Requested 2026-11-11, applied one batch at a time as assets get uploaded
// to Shopify's CDN. A hash maps to the CDN URL it should load from instead
// of the local /fig/<hash>.webp copy; a hash with no entry here just keeps
// loading locally, so partial migrations are always safe and this map
// simply grows as more batches arrive. Used below both for the engine.js
// .il image-fill layer (desktop, Figma-fill-driven) and for the literal
// <img src="fig/<hash>.webp"> tags in prototype/index.html's mobile
// markup (m-photos, m-specimg, m-track, m-acc).
const CDN_FIG = {
  e9ac26fbf8d3:
    'https://cdn.shopify.com/s/files/1/1020/0694/8118/files/e9ac26fbf8d3.webp?v=1794395983',
  '45ba2bc9cb7d':
    'https://cdn.shopify.com/s/files/1/1020/0694/8118/files/45ba2bc9cb7d.webp?v=1794395982',
  ca93da750e60:
    'https://cdn.shopify.com/s/files/1/1020/0694/8118/files/ca93da750e60.webp?v=1794395982',
  '100f7b534a9e':
    'https://cdn.shopify.com/s/files/1/1020/0694/8118/files/100f7b534a9e.webp?v=1794395982',
  f86d4179b4f9:
    'https://cdn.shopify.com/s/files/1/1020/0694/8118/files/f86d4179b4f9.webp?v=1794395982',
  e0595c9d6e75:
    'https://cdn.shopify.com/s/files/1/1020/0694/8118/files/e0595c9d6e75.webp?v=1794395983',
  '4c1771f4781f':
    'https://cdn.shopify.com/s/files/1/1020/0694/8118/files/4c1771f4781f.webp?v=1794395982',
  ce131b330785:
    'https://cdn.shopify.com/s/files/1/1020/0694/8118/files/ce131b330785.webp?v=1794395983',
  '28905357799c':
    'https://cdn.shopify.com/s/files/1/1020/0694/8118/files/28905357799c.webp?v=1794395982',
  '504091300394':
    'https://cdn.shopify.com/s/files/1/1020/0694/8118/files/504091300394.webp?v=1794395982',
  ea1587470644:
    'https://cdn.shopify.com/s/files/1/1020/0694/8118/files/ea1587470644.webp?v=1794395982',
};

// Hydrogen serves public/ from the site root, so every relative asset
// reference in the prototype's JS has to become absolute.
patch('public/js/app.js', [
  ['fig/${r}.webp', '/fig/${r}.webp', 'asset path -> absolute'],
  [
    'url(img/g${gi+1}.webp)',
    'url(/img/g${gi+1}.webp)',
    'gallery image path -> absolute',
  ],
]);

// FIX — desktop gallery thumbnails.
//
// show() (app.js:66) maps thumb index -> preview image as:
//     gi 0  -> orig = the IMG:gallery-main fill (/fig/ca93da750e60.webp)
//     gi N  -> /img/g${N+1}.webp
// which is exactly the mapping the prototype's own mobile markup uses
// (index.html: data-i="0" <-> g1-t.webp <-> slide 1, and so on).
//
// The DESKTOP strip, however, is a single flat 924x113 image
// (IMG:gallery-thumbs = fig/7c907f3685f2.webp) with eight invisible hit
// zones laid over it at stride 115.75. Eight zones for nine images, and
// show() clamps the active ring with `gi<8`. Nothing in the data says
// which eight of the nine that flat image pictures, so a click can land on
// a tile showing one image while show() displays another — and image 9 has
// no thumb at all.
//
// Replaced with nine real per-image thumbs built from the same
// /img/gN-t.webp files the mobile strip uses, so the tile clicked IS the
// image shown, 1:1, and image 9 becomes reachable. The flat strip is
// hidden. Geometry: nine tiles across the strip's own 924px box.
//
// object-fit is CONTAIN, not cover. The source thumbs are 240x240 square
// and Figma's tile is 114x113 (aspect 1.009), so in Figma they show
// uncropped. Nine tiles in the same 924px box are 98.67x113 (aspect
// 0.873), and 'cover' cropped ~13% off both sides of every thumbnail.
// 'contain' renders the full square thumb, letterboxed inside the 113px
// band — which is what Figma 189:249 actually shows.
//
// DEVIATION from the desktop prototype's rendering, taken deliberately —
// it is the only way to guarantee thumb and preview agree.
patch('public/js/app.js', [
  [
    'if(brd&&gi<8)gsap.to(brd,{left:gi*115.75,',
    'if(brd)gsap.to(brd,{left:gi*(924/9),',
    'FIX: active ring follows all nine thumbs, not the first eight',
  ],
  [
    "const fr=E[G];for(let i=0;i<8;i++){const z=document.createElement('button');z.className='thz';z.setAttribute('aria-label','Bild '+(i+1));Object.assign(z.style,{left:i*115.75+'px',top:'1144px',width:'114px',height:'113px'});z.onclick=()=>show(i);fr.appendChild(z)}",
    "const fr=E[G];{const TS=924/9,TW=TS-4,strip=E[G+'/IMG:gallery-thumbs'];if(strip)strip.style.display='none';if(brd){brd.style.width=TW+'px';brd.style.left='0px'}for(let i=0;i<9;i++){const z=document.createElement('button');z.className='thz';z.setAttribute('aria-label','Bild '+(i+1));Object.assign(z.style,{left:(i*TS)+'px',top:'1144px',width:TW+'px',height:'113px',padding:'0',border:'0',overflow:'hidden',borderRadius:'11px'});z.innerHTML='<img src=\"/img/g'+(i+1)+'-t.webp\" alt=\"\" loading=\"lazy\" style=\"width:100%;height:100%;object-fit:contain;display:block;border-radius:11px\">';z.onclick=()=>show(i);fr.appendChild(z)}}",
    'FIX: nine real per-image thumbs instead of eight zones over a flat strip',
  ],
]);

// FIX — lazy loading, mobile sticky-bar thumbnail.
//
// This <img> is created only once the user has scrolled past the buy box
// (it clones the gallery's current image into the global sticky bar), so
// it is never above the fold at first paint. loading="lazy" defers it
// like every other below-the-fold image on the page.
patch('public/js/app.js', [
  [
    '<img src="${document.querySelector(\'.m-track img\').src}" alt="">',
    '<img src="${document.querySelector(\'.m-track img\').src}" alt="" loading="lazy">',
    'FIX: lazy-load the sticky buy-bar thumbnail clone',
  ],
]);

// FIX — lazy loading, .il Figma-fill image layers (engine.js).
//
// buildStage() (engine.js) creates one '.il' div per unique image fill a
// node uses across all its scroll-driven states, and set its
// background-image immediately at creation — so every image on the whole
// page (hero, feature sections, everything rendered through this engine)
// started downloading on load regardless of scroll position. Switched to
// an IntersectionObserver: the URL is parked in data-bg and only promoted
// to the real background-image once the layer is within 300px of the
// viewport, then the observer stops watching it.
//
// The node's own base fill (bgOf(p0) on the line above, gradients only —
// no raster asset) is untouched; it never issued a network request.
patch('public/js/engine.js', [
  [
    "const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;",
    "const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;\nconst imgObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.style.backgroundImage=e.target.dataset.bg;imgObserver.unobserve(e.target)}})},{rootMargin:'300px'});",
    'FIX: shared IntersectionObserver for lazy .il image layers',
  ],
  [
    "const L=document.createElement('div');L.className='il';L.style.backgroundImage=`url(fig/${r}.webp)`;L.style.backgroundSize=m==='FIT'?'contain':'cover';",
    "const L=document.createElement('div');L.className='il';L.dataset.bg=`url(fig/${r}.webp)`;imgObserver.observe(L);L.style.backgroundSize=m==='FIT'?'contain':'cover';",
    'FIX: .il layer image deferred to IntersectionObserver instead of set eagerly',
  ],
]);

// FIX — PDP frame scale + sticky gallery fit, to match Figma 189:249 1:1.
//
// Approved 2026-11-06 after measuring node 189:249 against sections.js.
// sections.js is already byte-exact to Figma (Gallery box 924x1125 at
// [150,71]; IMG:gallery-main 849x1050 at [188,103]; Button / 1 / 9 at
// [171,1127]; breadcrumb 189:3-189:7 at y 19). No coordinate in the data
// was wrong. Two runtime scale factors in app.js shrank it on screen:
//
//   1. KP = 1440/1667 = 0.86383 (app.js:76) refitted the 1920 design into
//      a 1440 container, so every PDP pixel rendered 13.6% under Figma and
//      the content column sat at 240..1680 instead of Figma's 150..1821.
//
//   2. gk (app.js:81) scaled the whole 1257px gallery down to fit the
//      viewport height, capping IMG:gallery-main at 660px on a 1080p
//      screen. KP cancels out of that term —
//        s*KP*gk = s*KP*(H-103s)/(1257*KP*s) = (H-103s)/1257
//      — so changing KP alone could never enlarge the image. gk had to go
//      with it.
//
// With KP=1 and gk=1 the gallery renders at Figma's 924x1125 box with an
// 849x1050 main image, the buy box at 1129..1817, and a 59px column gap,
// on every viewport.
//
// TRADE-OFF, explicitly approved 2026-11-06: the gallery is 1257px tall
// and no longer shrinks to fit, so while it is pinned the thumbnail strip
// sits below the fold on viewports under ~1360px tall.
//
// The sticky travel itself is UNCHANGED. ty and lim are written in terms
// of KP and stay self-consistent at KP=1:
//   ty  = ((subH+gap)*s+rel)/(s*KP) - 216/KP - 71  ->  rel/s - 200
//   lim = 3113 - 71 - fh*gk - 60                   ->  1725
// which leaves Figma's 60px gap at the bottom of the frame. T.H and the
// sub-nav clamp are likewise KP-parameterised: T.H = 216+3113*KP+95 -> 3424,
// exactly SECTIONS.dtop.H.
patch('public/js/app.js', [
  [
    ',KP=1440/1667;',
    ',KP=1;',
    'FIX: PDP frame renders at Figma 1:1, not refitted into a 1440 container',
  ],
  [
    "PD.style.left=(240-150*KP)+'px';",
    "PD.style.left='0px';",
    'FIX: content column back to Figma x 150..1821 (was 240..1680)',
  ],
  [
    'const gk=Math.min(1,(innerHeight-(subH+2*gap)*s)/(fh*KP*s));',
    'const gk=1;',
    'FIX: gallery no longer shrunk to fit viewport -> Figma 849x1050 main image',
  ],
]);

// FIX — Key Features (#kf) cards: video instead of still renders.
//
// Requested 2026-11-06. The cover-flow has exactly five cards (REF, five
// Figma fills) and five video URLs were supplied, so they map 1:1 in
// order. The existing /fig/<hash>.webp fill is KEPT as the <video>
// poster, so a card still shows the right image before its video has
// buffered, or if the network blocks it entirely.
//
// Playback is deliberately NOT five-at-once: only the front card plays,
// the rest are paused, and preload is 'none' — so nothing is fetched
// until a card actually reaches the front. That matches how the rest of
// this page was tuned and keeps five 480p streams off the initial load.
//
// The host is already allowed by the CSP in app/entry.server.jsx
// (mediaSrc includes https://www.sportstech.de), so no policy change is
// needed. These are remote URLs on Sportstech's own Shopify CDN — if
// they move or are pulled, the cards fall back to the poster image.
//
// NOTE: this patch runs AFTER the 'asset path -> absolute' patch above,
// so the string it matches already reads /fig/ rather than fig/.
const KF_VIDEOS = [
  'https://www.sportstech.de/cdn/shop/videos/c/vp/804849c8d3c446a388c766c146329ab8/804849c8d3c446a388c766c146329ab8.SD-480p-1.5Mbps-87284328.mp4?v=0',
  'https://www.sportstech.de/cdn/shop/videos/c/vp/94dbc1db774b4225805383f74680f5ca/94dbc1db774b4225805383f74680f5ca.SD-480p-1.2Mbps-87284329.mp4?v=0',
  'https://www.sportstech.de/cdn/shop/videos/c/vp/e1f245d03d91471899a655e61f521722/e1f245d03d91471899a655e61f521722.SD-480p-0.9Mbps-87284331.mp4?v=0',
  'https://www.sportstech.de/cdn/shop/videos/c/vp/51a8bb8a2b504193ab504b8defe5eb8a/51a8bb8a2b504193ab504b8defe5eb8a.SD-480p-1.0Mbps-87284333.mp4?v=0',
  'https://www.sportstech.de/cdn/shop/videos/c/vp/2434ef02e744413ab73cb99da3d24503/2434ef02e744413ab73cb99da3d24503.SD-480p-1.0Mbps-87284330.mp4?v=0',
];
patch('public/js/app.js', [
  [
    "const cards=REF.map((r,i)=>{const e=document.createElement('button');e.className='card';e.setAttribute('aria-label','Feature '+(i+1));e.style.borderRadius=(c[4]?c[4]+2:26)+'px';e.style.backgroundImage=`url(/fig/${r}.webp)`;tr.appendChild(e);return e});",
    "const KFV=" + JSON.stringify(KF_VIDEOS) + ";const cards=REF.map((r,i)=>{const e=document.createElement('button');e.className='card';e.setAttribute('aria-label','Feature '+(i+1));e.style.borderRadius=(c[4]?c[4]+2:26)+'px';e.style.backgroundImage=`url(/fig/${r}.webp)`;const v=document.createElement('video');v.className='card-vid';v.muted=true;v.loop=true;v.playsInline=true;v.preload='none';v.poster='/fig/'+r+'.webp';v.setAttribute('playsinline','');v.setAttribute('aria-hidden','true');v.src=KFV[i];Object.assign(v.style,{position:'absolute',inset:'0',width:'100%',height:'100%',objectFit:'cover',borderRadius:'inherit',display:'block',pointerEvents:'none'});e.appendChild(v);tr.appendChild(e);return e});",
    'FIX: Key Features cards play video (poster = the original /fig/ still)',
  ],
  [
    "let f=0;const render=v=>{f=v;cards.forEach((e,i)=>gsap.set(e,pose(wrap(i-v))));K.tl.progress(Math.max(0,Math.min(1,v/4)))};",
    "let f=0;const render=v=>{f=v;cards.forEach((e,i)=>gsap.set(e,pose(wrap(i-v))));K.tl.progress(Math.max(0,Math.min(1,v/4)));const _n=Math.max(0,Math.min(cards.length-1,Math.round(v)));cards.forEach((e,i)=>{const vd=e.querySelector('video');if(!vd)return;if(i===_n){if(vd.paused)vd.play().catch(()=>{})}else if(!vd.paused)vd.pause()})};",
    'FIX: only the front Key Features card plays; the rest stay paused',
  ],
]);

// FIX — Key Features (#kf) tab menu: one pill per card instead of a
// single dynamic pill.
//
// Requested 2026-11-11, from a reference screenshot (not in SECTIONS.dkf/
// mkf node data — there's no "tab menu" node to extract). The prototype's
// own "feature title -> black pill" block (the IIFE right after render/go
// are defined) draws exactly one pill that redraws its label+icon via a
// MutationObserver every time the engine's own timeline changes the
// Feature-title text node. That gave the single active-looking pill but no
// way to jump to a feature except Prev/Next, drag, or clicking a card.
//
// Replaced with a static row of five pills (one per FEATURES/REF entry),
// built once from the labels and icon map that block already carried.
// Clicking a pill calls the same go(i) the cards already use. The original
// Feature-title text node is hidden rather than removed (nothing else
// reads it). Active state is driven from inside render() itself (patched
// below) rather than the MutationObserver, since it has to track continuous
// scroll position the same way the cards do, not just discrete keyframes.
patch('public/js/app.js', [
  [
    "let f=0;const render=v=>{f=v;cards.forEach((e,i)=>gsap.set(e,pose(wrap(i-v))));K.tl.progress(Math.max(0,Math.min(1,v/4)));const _n=Math.max(0,Math.min(cards.length-1,Math.round(v)));cards.forEach((e,i)=>{const vd=e.querySelector('video');if(!vd)return;if(i===_n){if(vd.paused)vd.play().catch(()=>{})}else if(!vd.paused)vd.pause()})};render(0);",
    "let tabs=[];let f=0;const render=v=>{f=v;cards.forEach((e,i)=>gsap.set(e,pose(wrap(i-v))));K.tl.progress(Math.max(0,Math.min(1,v/4)));const _n=Math.max(0,Math.min(cards.length-1,Math.round(v)));cards.forEach((e,i)=>{const vd=e.querySelector('video');if(!vd)return;if(i===_n){if(vd.paused)vd.play().catch(()=>{})}else if(!vd.paused)vd.pause()});tabs.forEach((b,i)=>b.classList.toggle('kf-tab-on',i===_n))};render(0);",
    'FIX: render() also drives the new tab row\'s active state',
  ],
  [
    " // feature title -> black pill with stroke icon\n (function(){const t=K.els[MOB?'/Feature title':'/Frame 18/Feature title'];if(!t)return;\n  const I={display:'<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"/><path d=\"M8 20h8M12 16v4\"/>',led:'<path d=\"M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.3 1 2.1h5c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3z\"/>',speed:'<path d=\"M4 18a8 8 0 1 1 16 0\"/><path d=\"M12 18l4-5\"/><circle cx=\"12\" cy=\"18\" r=\"1\"/>',incline:'<path d=\"M3 19h18L21 7z\"/><path d=\"M15 13l2-2\"/>',fold:'<path d=\"M7 4v8a4 4 0 0 0 4 4h8\"/><path d=\"M16 13l3 3-3 3\"/><path d=\"M4 7l3-3 3 3\"/>',app:'<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"/><path d=\"M11 9l3 2-3 2z\"/>'};\n  const pick=x=>/display/i.test(x)?'display':/led|licht/i.test(x)?'led':/speed|tempo/i.test(x)?'speed':/steig|incline/i.test(x)?'incline':/klapp|fold/i.test(x)?'fold':/app|live/i.test(x)?'app':'display';\n  t.classList.add('kf-pill-host');let busy=false;\n  const draw=()=>{if(busy)return;const x=t.textContent.trim();if(t.dataset.pt===x&&t.querySelector('.kf-pill'))return;busy=true;t.dataset.pt=x;\n   t.innerHTML='<span class=\"kf-pill\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">'+I[pick(x)]+'</svg><span></span></span>';t.querySelector('.kf-pill span').textContent=x;\n   const pl=t.querySelector('.kf-pill');gsap.fromTo(pl,{scale:.96,opacity:0},{scale:1,opacity:1,duration:.45,ease:'power2.out'});busy=false};\n  draw();new MutationObserver(draw).observe(t,{childList:true,characterData:true,subtree:true});})();",
    "// feature tabs - one pill per card, active one highlighted; click jumps\n // straight to that card via go(i). Added 2026-11-11 from a reference\n // screenshot (not in SECTIONS.dkf/mkf node data) - a NEW row, independent\n // of /Frame 18/Feature title (which is NOT this block's old single pill -\n // that key is the bottom title under the deck, Figma position 611,923,\n // paired with the description right below it - so it's left alone here\n // and keeps rendering normally, undoing the earlier mistake of hiding it).\n (function(){\n  const LABELS=['21,5\" Display','LED Lichter','Speed Knob','15 Steigungsstufen','Einfach klappen'];\n  const KEYS=['display','led','speed','incline','fold'];\n  const I={display:'<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"/><path d=\"M8 20h8M12 16v4\"/>',led:'<path d=\"M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.3 1 2.1h5c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3z\"/>',speed:'<path d=\"M4 18a8 8 0 1 1 16 0\"/><path d=\"M12 18l4-5\"/><circle cx=\"12\" cy=\"18\" r=\"1\"/>',incline:'<path d=\"M3 19h18L21 7z\"/><path d=\"M15 13l2-2\"/>',fold:'<path d=\"M7 4v8a4 4 0 0 0 4 4h8\"/><path d=\"M16 13l3 3-3 3\"/><path d=\"M4 7l3-3 3 3\"/>'};\n  const tabsEl=document.createElement('div');tabsEl.className='kf-tabs'+(MOB?' kf-tabs-mob':'');\n  if(MOB)Object.assign(tabsEl.style,{top:'148px',left:'16px',width:(sec.W-32)+'px'});\n  else Object.assign(tabsEl.style,{top:'191px',left:'50%',transform:'translateX(-50%)'});\n  tabs=LABELS.map((label,i)=>{const b=document.createElement('button');b.type='button';b.className='kf-tab';b.setAttribute('aria-label',label);b.innerHTML='<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">'+I[KEYS[i]]+'</svg><span>'+label+'</span>';b.onclick=()=>go(i);tabsEl.appendChild(b);return b});\n  tabs[cur()].classList.add('kf-tab-on');\n  K.st.appendChild(tabsEl);})();",
    'FIX: single dynamic pill -> five-tab menu (one per feature), click jumps via go(i)',
  ],
]);

// FIX — #s3d (Studio-Laufgefühl) 3-5s scroll delay right after the
// gallery, present only on first load (a refresh fixes it). ScrollTrigger
// computes its trigger/pin geometry from the DOM as soon as app.js runs,
// but the 3D model (GLB + Draco + HDR environment) and webfonts are still
// loading at that point and change layout/paint timing once they land, so
// the very first scroll samples stale measurements. ob.refresh() already
// runs from Mx.onLoad (the model's own load callback) and from
// document.fonts.ready, but window 'load' fires before those settle on a
// slow connection, so re-running refresh 500ms after 'load' catches the
// case neither of those two already covers.
patch('public/js/app.js', [
  [
    "addEventListener('load',()=>ScrollTrigger.refresh());",
    "addEventListener('load',()=>{setTimeout(()=>ScrollTrigger.refresh(),500)});",
    'FIX: delay the post-load refresh so it runs after late layout shifts (model/fonts), killing the first-scroll stall after the gallery',
  ],
]);

patch('public/js/engine.js', [
  ['url(fig/${r}.webp)', 'url(/fig/${r}.webp)', 'image-layer path -> absolute'],
]);

patch('public/js/engine.js', [
  [
    "const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;\nconst imgObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.style.backgroundImage=e.target.dataset.bg;imgObserver.unobserve(e.target)}})},{rootMargin:'300px'});",
    "const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;\nconst imgObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.style.backgroundImage=e.target.dataset.bg;imgObserver.unobserve(e.target)}})},{rootMargin:'300px'});\nconst CDN_FIG=" +
      JSON.stringify(CDN_FIG) +
      ';',
    'FIX: add CDN_FIG lookup for migrated /fig/ image fills',
  ],
  [
    'L.dataset.bg=`url(/fig/${r}.webp)`;imgObserver.observe(L);',
    'L.dataset.bg=CDN_FIG[r]?`url(${CDN_FIG[r]})`:`url(/fig/${r}.webp)`;imgObserver.observe(L);',
    'FIX: .il layer uses CDN_FIG override when the hash has been migrated',
  ],
]);

patch('public/js/three3d.js', [
  // The prototype relies on <script type="importmap"> to resolve the bare
  // 'three' specifier. An importmap injected at runtime is unreliable (it
  // must precede all module loading, and Firefox/Safari accept only one),
  // so the specifier is made relative instead and the importmap dropped.
  [
    "from 'three';",
    "from './three/three.module.js';",
    "bare 'three' -> relative (no importmap needed)",
  ],
  ["'js/three/draco/'", "'/js/three/draco/'", 'draco decoder path -> absolute'],
  ["'models/stread-pro.glb'", "'/models/stread-pro.glb'", 'GLB path -> absolute'],
  // FIX 3 — gallery click behaviour.
  //
  // The prototype targets the 3D button via the *text* node's
  // parentElement. In SECTIONS.dtop that text node's parent is
  // "/PDP – gallery + buy box/Frame 3" — the whole 924x1257 gallery frame,
  // not the button. So the listener lands on the entire gallery and
  // clicking any thumbnail or the main image opens the 3D overlay.
  //
  // Retargeting to the real button frame is necessary but not sufficient:
  // the engine renders these three as SIBLINGS of each other, in this
  // order (SECTIONS.dtop indices 89 / 90 / 93), all appended to Frame 3:
  //
  //   Button / 3D ansehen   FRAME  [729,   1056,   178, 53]
  //   Icon / cube           FRAME  [748.5, 1072.5,  19, 19]
  //   3D ansehen            TEXT   [776,   1071,    96, 23]
  //
  // The icon and the label are painted AFTER the button and sit inside its
  // box, so they receive the click and it never reaches the button. Giving
  // them pointer-events:none lets the whole pill surface hit the frame
  // underneath.
  [
    "[...document.querySelectorAll('.tx')].find(e=>e.textContent.trim()==='3D ansehen')?.parentElement",
    "(()=>{const q=[...document.querySelectorAll('[data-k]')];const b=q.find(e=>e.dataset.k.endsWith('/Button / 3D ansehen'));if(!b)return q.find(e=>e.dataset.k.endsWith('/Frame 3/3D ansehen'))?.parentElement;q.forEach(e=>{const k=e.dataset.k;if(k.endsWith('/Frame 3/3D ansehen')||k.endsWith('/Frame 3/Icon / cube'))e.style.pointerEvents='none'});return b})()",
    'FIX 3: bind "3D ansehen" to the button frame + let its label/icon click through',
  ],
]);

// Every three addon imports the same bare specifier.
const walk = (d) =>
  fs
    .readdirSync(d, {withFileTypes: true})
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)],
    );
let addons = 0;
for (const f of walk('public/js/three/addons').filter((f) => f.endsWith('.js'))) {
  const s = R(f);
  if (!s.includes("from 'three'")) continue;
  W(f, s.split("from 'three'").join("from '../../three.module.js'"));
  addons++;
}
log(`three addons: bare 'three' -> '../../three.module.js' in ${addons} files`);

/* ─── 3. body.html + faq.js ────────────────────────────────────────── */
const src = R('prototype/index.html');

const faq = [
  ...src.matchAll(
    /<script(?![^>]*\bsrc=)(?![^>]*importmap)[^>]*>([\s\S]*?)<\/script>/g,
  ),
]
  .map((m) => m[1])
  .find((s) => s.includes('window.FAQ'));
if (!faq) throw new Error('inline window.FAQ block not found');
W(
  'public/js/faq.js',
  '/* Extracted verbatim from prototype/index.html. An inline <script> cannot\n' +
    '   execute when the page is injected with dangerouslySetInnerHTML, so it is\n' +
    '   served as a file and loaded before app.js. Generated by\n' +
    '   tools/sync-prototype.mjs — do not edit. */\n' +
    faq.trim() +
    '\n',
);
log(`public/js/faq.js (${faq.length} bytes)`);

const bodyMatch = src.match(/<body[^>]*>([\s\S]*)<\/body>/i);
if (!bodyMatch) throw new Error('<body> not found');
let body = bodyMatch[1];
const stripped = (body.match(/<script/g) || []).length;
body = body.replace(/<script[\s\S]*?<\/script>/g, '');
let abs = 0;
body = body.replace(
  /(src|href)="(?!https?:|\/|#|mailto:|tel:|data:)(img|fig|fonts|models|js)\//g,
  (_, a, d) => {
    abs++;
    return `${a}="/${d}/`;
  },
);
body = body.replace(
  /url\((['"]?)(?!https?:|\/|data:)(img|fig|fonts|models)\//g,
  (_, q, d) => {
    abs++;
    return `url(${q}/${d}/`;
  },
);
for (const [hash, url] of Object.entries(CDN_FIG)) {
  const needle = `/fig/${hash}.webp`;
  if (body.includes(needle)) {
    body = body.split(needle).join(url);
    log(`body.html: /fig/${hash}.webp -> CDN (${url})`);
  }
}
W('app/sections/PrototypePage/body.html', body.trim() + '\n');
log(
  `body.html (${body.length} bytes, ${stripped} scripts stripped, ${abs} paths absolutised)`,
);

const leftover = [
  ...body.matchAll(/(?:src|href)="(?!https?:|\/|#|mailto:|tel:|data:)([^"]+)"/g),
];
if (leftover.length) {
  console.error(
    '  !! relative refs left:',
    [...new Set(leftover.map((m) => m[1]))].join(', '),
  );
  process.exitCode = 1;
}

/* ─── 4. CSS ───────────────────────────────────────────────────────── */
const MARK =
  '/* ===== BEGIN prototype css (generated by tools/sync-prototype.mjs) ===== */';
const site = R('prototype/css/site.css').replace(
  /url\((\.\.\/)?fonts\//g,
  'url(/fonts/',
);
const mobile = R('prototype/css/mobile.css');

let app = R('app/styles/app.css');
const i = app.indexOf(MARK);
if (i >= 0) app = app.slice(0, i);
// Strip the older hand-written banner from before this script existed.
const OLD =
  '\n\n/* ==================================================================\n * prototype/css/site.css + prototype/css/mobile.css';
const j = app.indexOf(OLD);
if (j >= 0) app = app.slice(0, j);

const header = `
/* prototype/css/site.css + prototype/css/mobile.css, verbatim. The only
 * edit is the @font-face url, rebased ../fonts/ -> /fonts/ because this
 * file no longer sits next to the font directory.
 * These are global rules (*, html, body, img, button, a) and they load
 * after the scaffold's own, so they restyle the other Hydrogen routes too.
 */
`;
W(
  'app/styles/app.css',
  app.trimEnd() + '\n\n' + MARK + header + site.trim() + '\n\n' + mobile.trim() + '\n',
);
log(`app/styles/app.css: +${site.length + mobile.length} bytes of prototype CSS`);

console.log(process.exitCode ? '\nSYNC COMPLETED WITH ERRORS' : '\nsync OK');
