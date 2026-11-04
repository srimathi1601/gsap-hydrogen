from playwright.sync_api import sync_playwright
import shutil,os
with sync_playwright() as p:
  b=p.chromium.launch()
  for name,vp,mob in [('desktop',{'width':1920,'height':1080},False),('mobile',{'width':390,'height':844},True)]:
    c=b.new_context(viewport=vp,record_video_dir='shots/vid',record_video_size={'width':vp['width']//(2 if not mob else 1),'height':vp['height']//(2 if not mob else 1)},is_mobile=mob,has_touch=mob)
    pg=c.new_page();pg.goto('http://localhost:8823/');pg.wait_for_timeout(2000)
    H=pg.evaluate('document.body.scrollHeight-innerHeight');y=0
    while y<H:y+=60;pg.evaluate(f'window.lenis&&lenis.scrollTo({y})');pg.wait_for_timeout(33)
    pg.wait_for_timeout(1000);v=pg.video.path();c.close();shutil.move(v,f'shots/scroll_{name}_r2.webm')
