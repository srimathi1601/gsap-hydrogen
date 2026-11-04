import json,sys
from playwright.sync_api import sync_playwright
JS=r"""(()=>{const out={clip:[],ell:[],tiny:[],lowc:[],time:[]};
const lum=c=>{const m=c.match(/[\d.]+/g);if(!m)return null;const [r,g,b]=m.slice(0,3).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return [.2126*r+.7152*g+.0722*b,m[3]===undefined?1:+m[3]]};
const bgOf=el=>{for(let e=el;e;e=e.parentElement){const s=getComputedStyle(e);const b=s.backgroundColor;const l=lum(b);if(l&&l[1]>.5)return l[0];if(s.backgroundImage!=='none')return null}return 1};
document.querySelectorAll('.tx, .mob p, .mob a, .mob span, .mob b, .mob button, .mob h1,.mob h2,.mob h3,.mob li').forEach(e=>{const r=e.getBoundingClientRect();if(!r.width||getComputedStyle(e).visibility==='hidden')return;let o=1;for(let x=e;x;x=x.parentElement)o*=+getComputedStyle(x).opacity;if(o<.9)return;
 const t=(e.textContent||'').trim().slice(0,40);if(!t)return;
 if(e.classList.contains('tx')){if(e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).overflow==='hidden')out.ell.push(t);
  if(e.scrollHeight>e.clientHeight+4&&getComputedStyle(e).whiteSpace!=='nowrap')out.clip.push([t,e.scrollHeight,e.clientHeight,e.dataset.k])}
 const c=lum(getComputedStyle(e).color),b=bgOf(e);if(c&&b!=null&&e.children.length===0){const cr=(Math.max(c[0],b)+.05)/(Math.min(c[0],b)+.05);const fs=parseFloat(getComputedStyle(e).fontSize);if(cr<(fs>=24?3:4.5))out.lowc.push([t,+cr.toFixed(2),fs])}
 if(/\b(heute|today|nur noch|countdown|endet|\d{1,2}:\d{2}:\d{2}|bis \d{1,2}\.\d{1,2}\.|ends)\b/i.test(t))out.time.push(t)});
return out})()"""
with sync_playwright() as p:
  b=p.chromium.launch()
  for w,h in [(1920,1080),(1366,768),(1280,720),(390,844)]:
    m=w<768;pg=b.new_page(viewport={'width':w,'height':h},is_mobile=m,has_touch=m);errs=[];pg.on('console',lambda x:x.type in('error','warning') and errs.append(x.text));pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('requestfailed',lambda r:errs.append('FAIL '+r.url))
    pg.goto('http://localhost:8823/?qc');pg.wait_for_timeout(3000)
    H=pg.evaluate('document.documentElement.scrollHeight')
    for y in range(0,H,h):pg.evaluate(f'lenis.scrollTo({y},{{immediate:true,force:true}})');pg.wait_for_timeout(120)
    pg.wait_for_timeout(1000);r=pg.evaluate(JS);r['errs']=errs
    print(w,json.dumps({k:(v if k!='lowc' else sorted(set(map(tuple,v)))) for k,v in r.items()},ensure_ascii=False))
  b.close()
