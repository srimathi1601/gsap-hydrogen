from playwright.sync_api import sync_playwright
A=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
with sync_playwright() as p:
  b=p.chromium.launch(args=A);c=b.new_context(viewport={'width':1280,'height':720},record_video_dir='shots/r3/vid',record_video_size={'width':1280,'height':720});pg=c.new_page()
  pg.goto('http://localhost:8823/');pg.wait_for_timeout(2000);st=pg.evaluate("[S3D.trig.start,S3D.trig.end]")
  pg.evaluate(f"lenis.scrollTo({st[0]-300},{{immediate:true}})");pg.wait_for_function('window.__s3dReady',timeout=300000);pg.wait_for_timeout(1000)
  for i in range(60):pg.mouse.wheel(0,(st[1]-st[0]+600)/60);pg.wait_for_timeout(180)
  pg.wait_for_timeout(1500);c.close();b.close()
