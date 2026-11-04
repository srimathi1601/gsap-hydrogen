import json,sys
from playwright.sync_api import sync_playwright
ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
sizes=[tuple(map(int,s.split('x'))) for s in sys.argv[1].split(',')]
out={}
with sync_playwright() as p:
  b=p.chromium.launch(args=ARGS)
  for w,h in sizes:
    pg=b.new_page(viewport={'width':w,'height':h});errs=[];pg.on('console',lambda m:m.type=='error' and errs.append(m.text));pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8823/?qc');pg.wait_for_timeout(2000)
    st=pg.evaluate("[S3D.trig.start,S3D.trig.end]")
    pg.evaluate(f"lenis.scrollTo({st[0]},{{immediate:true}})");pg.wait_for_function('window.__s3dReady',timeout=300000);pg.wait_for_timeout(500)
    for k in [0,.5,1,1.5,2,2.5,3,3.5,4]:
      y=st[0]+(st[1]-st[0])*k/4+1;pg.evaluate(f"lenis.scrollTo({y},{{immediate:true}})");pg.wait_for_timeout(1800)
      m=pg.evaluate("""(()=>{const E=S3D.els,q=k=>E[k]&&E[k].getBoundingClientRect();const st=q(innerWidth<768?'/Image wrap':'/Stage'),ti=q(innerWidth<768?'/Copy/Title':'/Stage/Frame 17/Title'),tg=q(innerWidth<768?'/Copy/Tags':'/Stage/Frame 17/Tags'),c=q(innerWidth<768?'/Copy/Counter':'/Stage/Counter');const sc=st.width/(innerWidth<768?350:1440);
       return {scale:+sc.toFixed(3),counterTop:+((c.top-st.top)/sc).toFixed(1),titleTop:+((ti.top-st.top)/sc).toFixed(1),chipGap:+((st.bottom-tg.bottom)/sc).toFixed(1),dots:document.querySelectorAll('.hs3d.on').length,ft:(()=>{const a=window.__s3dFT||[];const s=[...a].sort((x,y)=>x-y);return s.length?[+(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1),+s[Math.floor(s.length*.95)].toFixed(1)]:null})()}})()""")
      tag='mid' if k%1 else 'step'
      pg.screenshot(path=f'shots/r3/glb_{tag}{k}_{w}x{h}.png');print(w,h,k,json.dumps(m))
    print(w,h,'errors',errs)
  b.close()
