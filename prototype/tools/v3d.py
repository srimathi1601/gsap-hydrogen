from playwright.sync_api import sync_playwright
A=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
with sync_playwright() as p:
  b=p.chromium.launch(args=A)
  for w,h,mob in [(1920,1080,False),(390,844,True)]:
    pg=b.new_page(viewport={'width':w,'height':h},is_mobile=mob,has_touch=mob);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    pg.goto('http://localhost:8823/');pg.wait_for_timeout(2500)
    sel='.m-3d' if mob else None
    if mob: pg.click('.m-3d')
    else: pg.evaluate("[...document.querySelectorAll('.tx')].find(e=>e.textContent.trim()==='3D ansehen').parentElement.click()")
    pg.wait_for_function('window.__v3dReady',timeout=300000);pg.wait_for_timeout(3000);pg.screenshot(path=f'shots/r5/viewer_auto_{w}.png')
    bx=pg.locator('.v3d-box canvas').bounding_box();cx,cy=bx['x']+bx['width']/2,bx['y']+bx['height']/2
    if not mob:
      pg.mouse.move(cx,cy);pg.mouse.down();pg.mouse.move(cx-300,cy+60,steps=10);pg.mouse.up();pg.mouse.wheel(0,-600);pg.wait_for_timeout(1500)
    pg.screenshot(path=f'shots/r5/viewer_drag_{w}.png')
    pg.click('.v3d-r');pg.wait_for_timeout(800);pg.click('.v3d-x');pg.wait_for_timeout(500)
    print(w,'closed',pg.evaluate("!document.querySelector('.v3d').classList.contains('on')"),'errors',errs)
  b.close()
