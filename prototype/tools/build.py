import json,re
d=json.load(open('/workspace/p/full.json'))['nodes'];d.update(json.load(open('/workspace/p/st.json'))['nodes'])
def col(c,o=1):
  a=c.get('a',1)*o; return f"rgba({round(c['r']*255)},{round(c['g']*255)},{round(c['b']*255)},{round(a,3)})"
def paint(fills):
  out=[]
  for f in fills or []:
    if f.get('visible',True)==False: continue
    t=f['type'];o=f.get('opacity',1)
    if t=='SOLID': out.append(('s',col(f['color'],o)))
    elif t.startswith('GRADIENT'):
      st=','.join(f"{col(s['color'],o)} {round(s['position']*100,1)}%" for s in f['gradientStops'])
      h=f.get('gradientHandlePositions');ang=180
      if h:
        import math;dx=h[1]['x']-h[0]['x'];dy=h[1]['y']-h[0]['y'];ang=round(math.degrees(math.atan2(dx,-dy)))
      out.append(('g',f"linear-gradient({ang}deg,{st})" if t=='GRADIENT_LINEAR' else f"radial-gradient({st})"))
    elif t=='IMAGE': out.append(('i',f['imageRef'][:12],f.get('scaleMode','FILL')))
  return out
VEC=('VECTOR','BOOLEAN_OPERATION','STAR','POLYGON','LINE','REGULAR_POLYGON')
def section(ids,skip=lambda n:False):
  frames=[d[i]['document'] for i in ids]
  nodes={};order=[]
  for si,fr in enumerate(frames):
    ob=fr['absoluteBoundingBox']
    def w(n,pk,pb,sib):
      nm=n['name'];sib[nm]=sib.get(nm,0)+1;k=pk+'/'+nm+('#%d'%sib[nm] if sib[nm]>1 else '')
      if skip(n): return
      b=n.get('absoluteBoundingBox') or pb
      vis=n.get('visible',True)
      if k not in nodes:
        e={'k':k,'p':pk,'t':n['type'],'st':[None]*len(frames),'css':{}};nodes[k]=e;order.append(k)
        css=e['css']
        if n['type']=='TEXT':
          s=n['style'];css['font-size']=s['fontSize'];css['font-weight']=s.get('fontWeight',400)
          css['line-height']=f"{s.get('lineHeightPx',s['fontSize']*1.2):.2f}px";css['letter-spacing']=f"{s.get('letterSpacing',0):.2f}px"
          css['text-align']={'LEFT':'left','CENTER':'center','RIGHT':'right','JUSTIFIED':'justify'}[s.get('textAlignHorizontal','LEFT')]
          if s.get('textCase')=='UPPER':css['text-transform']='uppercase'
          if s.get('italic'):css['font-style']='italic'
          if s.get('textAutoResize')=='WIDTH_AND_HEIGHT':css['white-space']='pre'
          va=s.get('textAlignVertical','TOP');css['va']=va
        else:
          r=n.get('cornerRadius');rr=n.get('rectangleCornerRadii')
          if rr:css['border-radius']=' '.join(f'{x}px' for x in rr)
          elif r:css['border-radius']=f'{r}px'
          if n['type']=='ELLIPSE':css['border-radius']='50%'
          if n.get('clipsContent'):css['overflow']='hidden'
          sk=[f for f in n.get('strokes',[]) if f.get('visible',True) and f['type']=='SOLID']
          if sk and n['type'] not in VEC:
            sw=n.get('strokeWeight',1);css['box-shadow']=f"inset 0 0 0 {sw}px {col(sk[0]['color'],sk[0].get('opacity',1))}"
          for ef in n.get('effects',[]):
            if ef.get('visible',True) and ef['type']=='DROP_SHADOW':
              sh=f"{ef['offset']['x']}px {ef['offset']['y']}px {ef['radius']}px {ef.get('spread',0)}px {col(ef['color'])}"
              css['box-shadow']=(css['box-shadow']+','+sh) if 'box-shadow' in css else sh
            if ef.get('visible',True) and ef['type']=='BACKGROUND_BLUR':css['backdrop-filter']=f"blur({ef['radius']/2}px)"
          if n['type'] in VEC:
            fp=paint(n.get('fills'));sp=[f for f in n.get('strokes',[]) if f.get('visible',True) and f['type']=='SOLID']
            ps=''
            for g in n.get('fillGeometry',[]):
              if fp and fp[0][0]=='s':ps+=f'<path d="{g["path"]}" fill="{fp[0][1]}" fill-rule="{g.get("windingRule","NONZERO").lower()}"/>'
            for g in n.get('strokeGeometry',[]):
              if sp:ps+=f'<path d="{g["path"]}" fill="{col(sp[0]["color"],sp[0].get("opacity",1))}"/>'
            e['svg']=ps;e['vb']=[0,0,n.get('size',{}).get('x',b['width']),n.get('size',{}).get('y',b['height'])]
      e=nodes[k]
      p={'x':round(b['x']-pb['x'],2),'y':round(b['y']-pb['y'],2),'w':round(b['width'],2),'h':round(b['height'],2),'o':round(n.get('opacity',1),3) if vis else 0}
      if n['type']=='TEXT':
        p['txt']=n['characters'];f=[x for x in n.get('fills',[]) if x['type']=='SOLID' and x.get('visible',True)]
        p['c']=col(f[0]['color'],f[0].get('opacity',1)) if f else 'rgba(0,0,0,1)'
        p['fs']=n['style']['fontSize']
      elif n['type'] not in VEC:
        pt=paint(n.get('fills'));p['bg']=[x for x in pt if x[0]=='s'][-1][1] if any(x[0]=='s' for x in pt) else 'rgba(0,0,0,0)'
        p['gr']=[x[1] for x in pt if x[0]=='g'];p['img']=[[x[1],x[2]] for x in pt if x[0]=='i']
      e['st'][si]=p
      if n['type'] not in VEC:
        s2={}
        for c in n.get('children',[]): w(c,k,b,s2)
    s0={}
    for c in fr.get('children',[]): w(c,'',ob,s0)
  pf=[x for x in paint(frames[0].get('fills')) if x[0]=='s']
  return {'W':frames[0]['absoluteBoundingBox']['width'],'H':max(f['absoluteBoundingBox']['height'] for f in frames),'bg':pf[-1][1] if pf else '#fff','nodes':[nodes[k] for k in order]}
card=lambda n:bool(re.match(r'Card \d$',n['name']))
S={
 'd3d':section(['34:2','34:54','34:106','34:159','34:211']),
 'm3d':section(['34:308','34:353','34:398','34:444','34:489']),
 'dkf':section(['42:2','42:31','42:60','42:89','42:118'],card),
 'mkf':section(['43:2','43:26','43:50','43:74','43:98'],card),
 'dlive':section(['49:2','49:82','49:162','49:242','49:322','49:402','49:482','49:562','49:642']),
 'mlive':section(['49:42','49:122','49:202','49:282','49:362','49:442','49:522','49:602','49:682']),
 'dvid':section(['63:2','63:51','63:100','63:149']),
 'mvid':section(['63:26','63:75','63:124','63:173']),
}
for k,i in [('top','35:722'),('rev','41:1041'),('faq','41:1361'),('tech','41:1388'),('svc','41:1437'),('foot','41:1494')]: S['d'+k]=section([i])
# kf card slots from state 1
def cards(fid):
  fr=d[fid]['document'];ob=fr['absoluteBoundingBox'];out={}
  def w(n):
    if card(n):
      b=n['absoluteBoundingBox'];out[n['name']]=[b['x']-ob['x'],b['y']-ob['y'],b['width'],b['height'],n.get('cornerRadius',0)]
    for c in n.get('children',[]):w(c)
  w(fr);return out
S['dkf']['cards']=cards('42:2');S['mkf']['cards']=cards('43:2')
open('/workspace/stread-pdp-site/js/sections.js','w').write('window.SECTIONS='+json.dumps(S,separators=(',',':'))+';')
for k,v in S.items():print(k,v['W'],v['H'],v['bg'],len(v['nodes']))
print(S['dkf']['cards'],S['mkf']['cards'])
