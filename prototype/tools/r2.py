from playwright.sync_api import sync_playwright
O='shots/r2/'
def go(pg,y):pg.evaluate(f'lenis.scrollTo({y},{{immediate:true}})');pg.wait_for_timeout(900)
with sync_playwright() as p:
  b=p.chromium.launch()
  for w,h in [(1920,1080),(1440,900),(1920,1200)]:
    pg=b.new_page(viewport={'width':w,'height':h});pg.goto('http://localhost:8823/');pg.wait_for_timeout(2500)
    for y in [0,700,1400,2100]:go(pg,y);pg.screenshot(path=f'{O}d{w}x{h}_top_{y}.png')
    if (w,h)==(1920,1080):
      m=pg.evaluate('''()=>[...document.querySelectorAll('#top .tx')].filter(e=>e.parentElement.dataset.k&&e.parentElement.dataset.k.includes('/Button ')).map(e=>{const a=e.getBoundingClientRect(),r=document.createRange();r.selectNodeContents(e);const t=r.getBoundingClientRect(),q=e.parentElement.getBoundingClientRect();return [e.dataset.k.split('/').slice(-2).join('/'),+((t.top+t.bottom)/2-(q.top+q.bottom)/2).toFixed(2)]})''');print('pill dy',m)
      go(pg,0);el=pg.locator('[data-k="/PDP – gallery + buy box/Frame 4/Button / Neu"]');pg.evaluate('lenis.scrollTo(document.querySelector(\'[data-k="/PDP – gallery + buy box/Frame 4/Button / Neu"]\').getBoundingClientRect().top+scrollY-400,{immediate:true})');pg.wait_for_timeout(900)
      bb=el.bounding_box();pg.screenshot(path=O+'pills_closeup_1920.png',clip={'x':bb['x']-20,'y':bb['y']-60,'width':520,'height':160})
      top=pg.evaluate("document.getElementById('kf').offsetTop");st=pg.evaluate("innerHeight*.7")
      for i in range(5):go(pg,top+i*st+5);pg.wait_for_timeout(700);pg.screenshot(path=f'{O}kf_state{i+1}.png')
      go(pg,top);pg.wait_for_timeout(700);pg.screenshot(path=O+'kf_centre_edge.png',clip={'x':560,'y':200,'width':300,'height':260})
      print('cards',pg.evaluate("document.querySelectorAll('#kf .card').length"))
      for s in ['s3d','live','vid','rev-d','faq-d','tech-d','svc-d','foot-d']:
        y=pg.evaluate(f"document.getElementById('{s}').offsetTop");go(pg,y+(300 if s in('s3d','live','vid') else 0));pg.screenshot(path=f'{O}d_{s}.png')
      y=pg.evaluate("document.getElementById('rev-d').offsetTop");go(pg,y+400);print('gbar',pg.evaluate("document.getElementById('gbar').className"));pg.screenshot(path=O+'d_gbar.png')
  pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,is_mobile=True);pg.goto('http://localhost:8823/');pg.wait_for_timeout(2500)
  H=pg.evaluate('document.body.scrollHeight');i=0
  for y in range(0,H,1600):go(pg,y);pg.screenshot(path=f'{O}m_{i:02d}.png');i+=1
  print('mob issues',pg.evaluate('''()=>{const o=[];document.querySelectorAll('.mob *').forEach(e=>{const r=e.getBoundingClientRect();const fs=parseFloat(getComputedStyle(e).fontSize);if(r.width&&e.childNodes[0]&&e.childNodes[0].nodeType==3&&e.textContent.trim()&&fs<13)o.push('fs '+fs+' '+e.className+e.tagName);if(r.right>391&&!e.closest('.m-track,.m-thumbs,.m-nav,.m-sub,.m-photos'))o.push('ovf '+e.className+e.tagName);if(e.matches('button,a,summary')&&r.width&&(r.height<44)&&!e.closest('.m-crumb'))o.push('tap '+Math.round(r.height)+' '+e.className+e.tagName+' '+e.textContent.slice(0,20))});return [...new Set(o)].slice(0,40)}'''), pg.evaluate('document.documentElement.scrollWidth'))
  pg.evaluate("lenis.scrollTo(document.querySelector('.m-opts').getBoundingClientRect().top+scrollY-200,{immediate:true})");pg.wait_for_timeout(800)
  bb=pg.locator('.m-opts').bounding_box();pg.screenshot(path=O+'pills_closeup_390.png',clip={'x':0,'y':bb['y']-50,'width':390,'height':bb['height']+100})
  print('mob pill dy',pg.evaluate("[...document.querySelectorAll('.m-opt,.m-dopt b,.m-cart')].map(e=>{const p=e.closest('button');const r=document.createRange();r.selectNodeContents(e);const t=r.getBoundingClientRect(),q=p.getBoundingClientRect();return +((t.top+t.bottom)/2-(q.top+q.bottom)/2).toFixed(2)})"))
