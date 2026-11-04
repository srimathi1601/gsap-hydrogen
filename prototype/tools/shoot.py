import sys,asyncio
from playwright.async_api import async_playwright
async def run(w,h,tag,video=False):
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':w,'height':h},record_video_dir='shots/vid' if video else None,record_video_size={'width':w//2,'height':h//2} if video else None)
    pg=await ctx.new_page();errs=[];pg.on('console',lambda m:m.type=='error' and errs.append(m.text));pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://localhost:8823/',wait_until='networkidle');await pg.wait_for_timeout(800)
    secs=await pg.evaluate("[...document.querySelectorAll('section')].map(s=>[s.id,s.offsetTop,s.offsetHeight])")
    for sid,top,hh in secs:
      if not sid: continue
      fr=[0,.25,.5,.75,1] if sid in('s3d','live','vid') else [0]
      for f in fr:
        y=top+max(0,hh-h)*f
        await pg.evaluate(f"window.lenis?lenis.scrollTo({y},{{immediate:true}}):scrollTo(0,{y})");await pg.wait_for_timeout(1300)
        await pg.screenshot(path=f'shots/{tag}_{sid}_{int(f*100)}.png')
    if video:
      tot=await pg.evaluate('document.body.scrollHeight')
      await pg.evaluate('scrollTo(0,0)');y=0
      while y<tot: y+=60;await pg.mouse.wheel(0,60);await pg.wait_for_timeout(30)
    print(tag,secs,errs)
    await ctx.close();await b.close()
asyncio.run(run(int(sys.argv[1]),int(sys.argv[2]),sys.argv[3],len(sys.argv)>4))
