import sys,json
from playwright.sync_api import sync_playwright
sizes=[(1024,514),(1366,657),(1280,720),(1920,1080),(390,844)]
with sync_playwright() as p:
  b=p.chromium.launch()
  for w,h in sizes:
    pg=b.new_page(viewport={'width':w,'height':h});pg.goto('http://localhost:8823/?qc');pg.wait_for_timeout(2500)
    for sec in ['s3d','kf','live','vid']:
      top,H=pg.evaluate(f"(()=>{{const e=document.getElementById('{sec}');return [e.getBoundingClientRect().top+scrollY,e.offsetHeight]}})()")
      n=5 if sec=='s3d' else 1
      for i in range(n):
        y=top+(H-h)*(i/(n-1) if n>1 else .5)+ (2 if sec=='s3d' else 0)
        pg.evaluate(f"lenis.scrollTo({y},{{immediate:true}})");pg.wait_for_timeout(900)
        r=pg.evaluate("""(()=>{const g=document.getElementById('gbar');const gv=g.classList.contains('show');
          const nav=[...document.querySelectorAll('#s3d [data-k]')].filter(e=>/^\\/Navigator$/.test(e.dataset.k))[0];
          const nb=nav?nav.getBoundingClientRect():null;
          const tabs=[...document.querySelectorAll('#s3d [data-k]')].filter(e=>/^\\/Navigator\\/Row\\/Tabs\\/Tab 0\\d$/.test(e.dataset.k)).map(e=>{const r=e.getBoundingClientRect();return [r.left,r.right]});
          return {gbar:gv,navBottomGap:nb&&innerHeight-nb.bottom,tabs}})()""")
        pg.screenshot(path=f'shots/r3/{sec}_{i+1}_{w}x{h}.png')
        print(w,h,sec,i+1,json.dumps(r))
  b.close()
