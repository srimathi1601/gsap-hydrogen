import sys
from playwright.sync_api import sync_playwright
w,h=int(sys.argv[1]),int(sys.argv[2]);tag=sys.argv[3]
with sync_playwright() as p:
  b=p.chromium.launch();m=w<768;pg=b.new_page(viewport={'width':w,'height':h},is_mobile=m,has_touch=m,device_scale_factor=1)
  pg.goto('http://localhost:8823/?qc');pg.wait_for_timeout(3000);H=pg.evaluate('document.documentElement.scrollHeight');i=0
  for y in range(0,H,int(h*.9)):
    pg.evaluate(f'lenis.scrollTo({y},{{immediate:true,force:true}})');pg.wait_for_timeout(700);pg.screenshot(path=f'shots/sw/{tag}_{w}_{i:02d}.png');i+=1
  print(i)
  b.close()
