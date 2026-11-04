import asyncio,json,sys
from playwright.async_api import async_playwright
JS="""(args)=>{const [sid,key]=args;const S=window.SECTIONS[key];const host=document.getElementById(sid);const st=host.querySelector('.stage');const sr=st.getBoundingClientRect();const s=sr.width/S.W;
const abs={};const out=[];S.nodes.forEach(n=>{const p=n.st[0];if(!p)return;const pa=abs[n.p]||[0,0];const a=[pa[0]+p.x,pa[1]+p.y];abs[n.k]=a;if(p.o===0)return;
 const el=st.querySelector(`[data-k="${CSS.escape(n.k)}"]`);if(!el)return;const r=el.getBoundingClientRect();
 let ch=null,cw=null;if(n.t==='TEXT'){const rg=document.createRange();rg.selectNodeContents(el);const rr=rg.getBoundingClientRect();ch=rr.height/s;cw=rr.width/s;}
 out.push({k:n.k,t:n.t,fx:a[0],fy:a[1],fw:p.w,fh:p.h,mx:(r.left-sr.left)/s,my:(r.top-sr.top)/s,mw:r.width/s,mh:r.height/s,ch,cw,txt:p.txt})});
return {s,left:sr.left,top:sr.top,W:S.W,out}}"""
async def run(w,h,pre):
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':w,'height':h})
    await pg.goto('http://localhost:8823/?qc',wait_until='networkidle');await pg.wait_for_timeout(800);res={}
    for sid,key in [('s3d','3d'),('kf','kf'),('live','live'),('vid','vid')]+([('rev-d','rev'),('faq-d','faq'),('tech-d','tech'),('svc-d','svc'),('foot-d','foot')] if pre=='d' else []):
      top=await pg.evaluate(f"document.getElementById('{sid}').offsetTop");await pg.evaluate(f"lenis.scrollTo({top},{{immediate:true}})");await pg.wait_for_timeout(1400 if sid in ("s3d","kf","live","vid") else 3500)
      res[sid]=await pg.evaluate(JS,[sid,pre+key])
    res['static']=await pg.evaluate("[...document.querySelectorAll('section.static img')].map(i=>[i.alt,i.getBoundingClientRect().left,i.getBoundingClientRect().width,i.getBoundingClientRect().height])")
    json.dump(res,open(f'shots/qc_{pre}.json','w'));await b.close()
import sys
asyncio.run(run(int(sys.argv[1]),int(sys.argv[2]),sys.argv[3]))
