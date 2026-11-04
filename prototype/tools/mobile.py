import json,html
d=json.load(open('/workspace/p/st.json'))['nodes'];ID={}
def idx(n):
  ID[n['id']]=n
  for c in n.get('children',[]):idx(c)
for v in d.values():idx(v['document'])
FAQ=json.load(open('/workspace/stread-pdp-site/tools/faq_answers.json'))
import re
def T(i):
  s=re.sub(r'^Voraussichtl\. Lieferdatum: [^·]*· ','',ID[i]['characters']);s=s[0].upper()+s[1:]
  return html.escape(s).replace('\n','<br>')
def ref(i):
  for f in ID[i].get('fills',[]):
    if f.get('type')=='IMAGE':return 'fig/'+f['imageRef'][:12]+'.webp'
def col(c):return f"rgb({round(c['r']*255)},{round(c['g']*255)},{round(c['b']*255)})"
def icon(i,cls='ic'):
  n=ID[i];ob=n['absoluteBoundingBox'];ps=''
  def w(m):
    nonlocal ps
    b=m['absoluteBoundingBox'];dx=b['x']-ob['x'];dy=b['y']-ob['y']
    f=[x for x in m.get('fills',[]) if x['type']=='SOLID' and x.get('visible',True)];s=[x for x in m.get('strokes',[]) if x['type']=='SOLID' and x.get('visible',True)]
    for g in m.get('fillGeometry',[]) if f else []:ps+=f'<path transform="translate({dx:.2f} {dy:.2f})" d="{g["path"]}" fill="currentColor"/>'
    for g in m.get('strokeGeometry',[]) if s else []:ps+=f'<path transform="translate({dx:.2f} {dy:.2f})" d="{g["path"]}" fill="currentColor"/>'
    for c in m.get('children',[]):w(c)
  w(n);return f'<svg class="{cls}" viewBox="0 0 {ob["width"]:.1f} {ob["height"]:.1f}" aria-hidden="true">{ps}</svg>'
stars=lambda i:icon(i,'stars')
H=[]
# promo + header + subnav
H.append(f'''<div class="m-promo"><p><b>{T('35:724')}</b> · {T('35:726')}</p><div class="m-promo-row"><span class="m-code">{T('35:729')}</span></div></div>
<header class="m-head"><a class="m-logo" href="#" aria-label="Sportstech">{icon('35:745','logo')}</a><div class="m-icons"><button aria-label="Suche">{icon('35:764')}</button><button aria-label="Konto">{icon('35:767')}</button><button aria-label="Warenkorb">{icon('35:770')}</button></div>
<nav class="m-nav"><a href="#">{T('35:749')}</a><a href="#">{T('35:752')}</a><a href="#">{T('35:755')}</a><a href="#">{T('35:756')}</a><a href="#">{T('35:757')}</a></nav></header>
<nav class="m-sub"><a href="#kf">{T('35:776')}</a><a href="#live">{T('35:777')}</a><a href="#rev">{T('35:778')}</a><a href="#faq">{T('35:779')}</a><a href="#tech">{T('35:780')}</a></nav>
<nav class="m-crumb">{T('35:792')} / {T('35:794')} / <span>{T('35:796')}</span></nav>''')
g=''.join(f'<li><img src="{ref("35:799") if i==1 else f"img/g{i}.webp"}" alt="sTread Pro Bild {i}" {"" if i==1 else "loading=lazy"}></li>' for i in range(1,10))
th=''.join(f'<button class="m-th{" on" if i==1 else ""}" data-i="{i-1}" aria-label="Bild {i}"><img src="img/g{i}-t.webp" alt="" loading="lazy"></button>' for i in range(1,10))
H.append(f'''<section class="m-gal"><ul class="m-track">{g}</ul><span class="m-count">1 / 9</span><button class="m-3d">{icon('35:813')} {T('35:816')}</button></section><div class="m-thumbs">{th}</div>''')
acc=[('35:896','35:902','35:903','35:908','35:909'),('35:911','35:917','35:918','35:919','35:920'),('35:922','35:928','35:929','35:930',None)]
accH=''.join(f'''<label class="m-acc"><input type="checkbox"><img src="{ref(a)}" alt="" loading="lazy"><b>{T(b)}</b><span>{T(c)}</span>{'<span class="m-sel">'+T('35:905')+'</span>' if a=='35:896' else ''}<span class="m-pr"><b>{T(p)}</b>{' <s>'+T(o)+'</s>' if o else ''}</span></label>''' for a,b,c,p,o in acc)
H.append(f'''<section class="m-buy" id="buybox"><p class="m-eyebrow">{T('35:820')}</p><h1>{T('35:821')}</h1><p class="m-rate">{stars('35:822')} <b>{T('35:853')}</b> {T('35:854')}</p><p class="m-desc">{T('35:855')}</p>
<div class="m-price"><b>{T('35:856')}</b><s>{T('35:857')}</s><span class="m-save">{T('35:860')}</span></div><p class="m-note">{T('35:861')}<br>{T('35:862')}<br>{T('35:863')} <a href="#">{T('35:864')}</a></p>
<div class="m-card m-links"><a href="#">{T('35:866')}{icon('35:867')}</a><a href="#tech">{T('35:870')}{icon('35:871')}</a><a href="#svc">{T('35:874')}{icon('35:875')}</a></div>
<h2><i>{T('35:877')}</i>{T('35:878')}</h2><div class="m-opts" role="radiogroup"><button class="m-opt on" role="radio" aria-checked="true">{T('35:881')}</button><button class="m-opt" role="radio" aria-checked="false">{T('35:884')}</button></div>
<h2><i>{T('35:885')}</i>{T('35:886')}</h2><p class="m-sub2">{T('35:887')}</p><div class="m-accs">{accH}</div>
<h2><i>{T('35:932')}</i>{T('35:933')}</h2><p class="m-sub2">{T('35:934')}</p>
<div class="m-del" role="radiogroup"><button class="m-dopt on" role="radio"><span class="m-dic">{icon('35:937')}</span><span><b>{T('35:941')}</b><small>{T('35:942')}</small></span><em class="g">{T('35:943')}</em></button><button class="m-dopt" role="radio"><span class="m-dic">{icon('35:946')}</span><span><b>{T('35:948')}</b><small>{T('35:949')}</small></span><em>{T('35:950')}<small>{T('35:951')}</small></em></button></div>
<a class="m-more" href="#svc">{T('35:952')} ›</a>
<h2><i>{T('35:955')}</i>{T('35:956')}</h2><p class="m-sub2">{T('35:957')}</p><div class="m-card m-fin"><span>{T('35:959')} <b>{T('35:960')}</b> {T('35:961')}<small>{T('35:962')}</small></span><a href="#">{T('35:963')} ›</a></div>
<div class="m-total"><div class="m-trow"><b>{T('35:967')}</b><strong>{T('35:968')}</strong></div><div class="m-trow sm"><span class="m-g">{T('35:969')}</span><span>{T('35:970')}</span></div><button class="m-cart">{T('35:973') if '35:973' in ID else 'In den Warenkorb'}</button></div>
<ul class="m-usp"><li>{icon('35:977')}{T('35:981')}</li><li>{icon('35:982')}{T('35:985')}</li><li>{icon('35:986')}{T('35:989')}</li><li>{icon('35:990')}{T('35:995')}</li></ul><p class="m-secure">{icon('35:996')} {T('35:999')}</p>
<div class="m-card m-tp"><div class="m-tph"><span class="m-dic">{icon('35:1002')}</span><span><b>{T('35:1005')}</b><small>{T('35:1006')}</small></span></div><p>{stars('35:1011')} <b>{T('35:1027')}</b> {T('35:1028')} <span class="m-tpl">{T('35:1029')}</span></p></div>
<details class="m-card m-room"><summary><span class="m-dic">{icon('35:1032')}</span><span><b>{T('35:1035')}</b><small>{T('35:1036')}</small></span></summary></details><p class="m-call">{T('35:1039')}</p></section>''')
# reviews
cards=[('41:1117','41:1118','41:1119',None,'41:1155','41:1156','41:1154'),('41:1158','41:1159','41:1160',None,'41:1195','41:1196',None),('41:1198','41:1199','41:1200',None,'41:1235','41:1236',None),('41:1238','41:1239','41:1240',None,'41:1275','41:1276',None),('41:1278','41:1279','41:1280',None,'41:1315','41:1316',None),('41:1318','41:1319','41:1320',None,'41:1355','41:1356',None)]
rc=''.join(f'''<article class="m-rc"><header><b>{T(a)}</b></header><p class="m-ver">{stars(c)} <span>{icon('41:1150')}{T('41:1153')}</span></p>{'<h4>'+T(h)+'</h4>' if h else ''}<p>{T(t)}</p><img src="{ref(im)}" alt="Kundenfoto" loading="lazy"></article>''' for a,b,c,_,t,im,h in cards)
bars=''.join(f'<li><span>{T(a)}</span><i><em style="width:{w}%"></em></i><span>{T(b)}</span></li>' for a,w,b in [('41:1077',87,'41:1080'),('41:1081',9,'41:1084'),('41:1085',3,'41:1088')])
chips=''.join(f'<button class="m-chip">{T(i)}</button>' for i in ['41:1097','41:1100','41:1103','41:1106','41:1109'])
H2=[]
H2.append(f'''<section class="m-sec" id="rev"><h2 class="m-h">{T('41:1042')}</h2><div class="m-score"><b>{T('41:1044')}</b><span>{stars('41:1045')}<small>{T('41:1076')}</small></span></div><ul class="m-bars">{bars}</ul><p class="m-src">{T('41:1089')}</p>
<h3>{T('41:1090')}</h3><div class="m-photos"><img src="{ref('41:1091')}" alt="Fotos von Kundinnen und Kunden" loading="lazy"></div><h3>{T('41:1094')}</h3><div class="m-chips">{chips}</div>
<div class="m-search"><input placeholder="{T('41:1111')}" aria-label="Bewertungen durchsuchen"><button class="m-sort">{T('41:1113')}</button></div>{rc}<button class="m-pill">{T('41:1359')}</button><p class="m-src c">{T('41:1360')}</p></section>''')
qa=[('41:1364',T('41:1367')),('41:1369',html.escape(FAQ[1])),('41:1373',html.escape(FAQ[2])),('41:1377',html.escape(FAQ[3])),('41:1381',html.escape(FAQ[4]))]
H2.append(f'''<section class="m-sec" id="faq"><h2 class="m-h">{T('41:1362')}</h2><div class="m-faq">'''+''.join(f'<details{" open" if i==0 else ""}><summary>{T(q)}<i></i></summary><p>{a}</p></details>' for i,(q,a) in enumerate(qa))+f'''</div><button class="m-pill o">{T('41:1387')}</button></section>''')
specs=''.join(f'<li><b>{T(a)}</b><span>{T(b)}</span></li>' for a,b in [('41:1391','41:1392'),('41:1394','41:1395'),('41:1397','41:1398'),('41:1400','41:1401'),('41:1403','41:1404'),('41:1406','41:1407')])
rows=''.join(f'<tr><th>{T(a)}</th><td>{T(b)}</td></tr>' for a,b in [('41:1409','41:1410'),('41:1412','41:1413'),('41:1415','41:1416'),('41:1418','41:1419'),('41:1421','41:1422'),('41:1424','41:1425'),('41:1427','41:1428'),('41:1430','41:1431')])
H2.append(f'''<section class="m-sec" id="tech"><h2 class="m-h">{T('41:1389')}</h2><ul class="m-specs">{specs}</ul><img class="m-specimg" src="{ref('41:1569')}" alt="sTread Pro" loading="lazy"><table class="m-tbl">{rows}</table><button class="m-pill o">{T('41:1436')}</button></section>''')
def it(ic,a,b,extra=''):return f'<div class="m-it"><span class="m-tile">{icon(ic)}</span><div><b>{T(a)}</b><p>{T(b)}</p>{extra}</div></div>'
H2.append(f'''<section class="m-sec" id="svc"><h2 class="m-h">{T('41:1438')}</h2><p class="m-lead">{T('41:1439')}</p>
<div class="m-box"><span class="m-badge">{T('41:1441')}</span>{it('41:1443','41:1447','41:1448','<div class="m-optbox"><small>'+T('41:1450')+'</small><b>'+T('41:1451')+' <em>'+T('41:1452')+'</em></b><small>'+T('41:1453')+'</small></div>')}{it('41:1456','41:1459','41:1460','<a href="#">'+T('41:1461')+'</a>')}{it('41:1464','41:1467','41:1468')}{it('41:1471','41:1474','41:1475')}</div>
<div class="m-box"><span class="m-badge">{T('41:1477')}</span>{it('41:1479','41:1483','41:1484')}{it('41:1487','41:1490','41:1491','<a href="#">'+T('41:1492')+'</a> <a href="#">'+T('41:1493')+'</a>')}</div></section>''')
cols=[('41:1522',['41:15%02d'%i for i in range(23,39)]),('41:1539',['41:1540','41:1541']),('41:1542',['41:1543','41:1544','41:1545'])]
fc=''.join(f'<details class="m-fcol"><summary>{T(h)}</summary><ul>'+''.join(f'<li><a href="#">{T(x)}</a></li>' for x in xs)+'</ul></details>' for h,xs in cols)
legal=T('41:1551').replace('   ','</a><a href="#">')
H2.append(f'''<footer class="m-foot"><p class="m-fbig">{T('41:1495')}</p><a class="m-news" href="#">{T('41:1496')} <span>→</span></a>
<p class="m-fl">{T('41:1499')}</p><a class="m-tel" href="tel:03088626444">{T('41:1500')}</a><p>{T('41:1501')}</p><p class="m-tpf"><b>{T('41:1502')}</b> {icon('41:1503','stars')}<br>{T('41:1519')} · {T('41:1520')}</p>{fc}
<p class="m-fl">{T('41:1547')}</p><img src="{ref('41:1552')}" alt="Zahlungsarten" loading="lazy"><p class="m-fl">{T('41:1548')}</p><img class="m-soc" src="{ref('41:1553')}" alt="Social Media" loading="lazy"><p class="m-legal"><a href="#">{legal}</a></p><p class="m-copy">{T('41:1550')}</p></footer>''')
idx_=open('/workspace/stread-pdp-site/index.html').read()
import re
def put(tag,content):
  global idx_
  idx_=re.sub(rf'<!--{tag}-->.*?<!--/{tag}-->',lambda m:f'<!--{tag}-->'+content+f'<!--/{tag}-->',idx_,flags=re.S)
put('MTOP','<div class="mob">'+'\n'.join(H)+'</div>');put('MBOT','<div class="mob">'+'\n'.join(H2)+'</div>')
open('/workspace/stread-pdp-site/index.html','w').write(idx_);print('ok')
