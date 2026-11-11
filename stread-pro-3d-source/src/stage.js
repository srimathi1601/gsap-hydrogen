// #pcard showroom turntable: own lightweight renderer, reuses the already-loaded GLB (cloned), renders only while visible
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

export function initStage(src, sel = '#pcard .pc-stage', main = true) {
  const host = document.querySelector(sel); if (!host) return;
  let renderer;
  try {
    const cv = document.createElement('canvas'); cv.className = 'pc-gl';
    const MOB = matchMedia('(max-width:760px)').matches, DPR = Math.min(devicePixelRatio || 1, MOB ? 1.5 : 2);
    renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: !(MOB && DPR >= 1.5), alpha: true, powerPreference: 'low-power' });
    if (!renderer.getContext()) throw 0;
    host.insertBefore(cv, host.querySelector('.pc-cap'));
  } catch (e) { host.classList.add('pc-nogl'); return; }
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.setClearColor(0, 0);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(26, 1, .05, 50);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .6;

  // model: clone, independent LED materials, ground on podium
  const m = src.clone(true), maxAn = renderer.capabilities.getMaxAnisotropy();
  m.traverse(o => { if (!o.isMesh) return; o.castShadow = true; o.receiveShadow = false;
    for (const k of ['map', 'emissiveMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap']) { const t = o.material[k]; if (t) { t.anisotropy = maxAn; t.minFilter = THREE.LinearMipmapLinearFilter; t.needsUpdate = true; } }
    if (o.material.map) o.material.map.colorSpace = THREE.SRGBColorSpace;
    if (o.material.name === 'light_mat') { o.material = o.material.clone(); o.material.emissive = new THREE.Color('#3a6dff'); o.material.color = new THREE.Color('#3a6dff'); o.material.emissiveIntensity = .5; o.castShadow = false; } });
  const bb = new THREE.Box3().setFromObject(m), c = bb.getCenter(new THREE.Vector3()), sz = bb.getSize(new THREE.Vector3());
  const POD = main, L = Math.max(sz.x, sz.z), R = POD ? Math.hypot(sz.x, sz.z) / 2 * 1.06 : L * .62, H = POD ? L * .05 : 0; // podium radius / height
  m.position.set(-c.x, H - bb.min.y, -c.z);
  const turn = new THREE.Group(); turn.add(m); scene.add(turn);

  // podium: light satin stone, soft bevel (lathe profile), thin mild light ring
  const prof = [], bev = H * .35;
  prof.push(new THREE.Vector2(0, 0), new THREE.Vector2(R * .97, 0));
  for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI / 2; prof.push(new THREE.Vector2(R - bev + Math.sin(a) * bev, H - bev - Math.cos(a) * 0 + (Math.sin(a - Math.PI / 2) + 1) * 0)); }
  // simple: straight side then rounded top edge
  const p2 = [new THREE.Vector2(0, 0), new THREE.Vector2(R, 0), new THREE.Vector2(R, H - bev)];
  for (let i = 1; i <= 10; i++) { const a = i / 10 * Math.PI / 2; p2.push(new THREE.Vector2(R - bev + Math.cos(a) * bev, H - bev + Math.sin(a) * bev)); }
  p2.push(new THREE.Vector2(0, H));
  const stone = new THREE.MeshPhysicalMaterial({ color: 0xE4E1DC, roughness: .42, clearcoat: .35, clearcoatRoughness: .5, envMapIntensity: .7 });
  const pod = new THREE.Mesh(new THREE.LatheGeometry(p2, 96), stone); pod.receiveShadow = true; if (POD) scene.add(pod);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R * 1.002, H * .028, 8, 160), new THREE.MeshBasicMaterial({ color: 0xBFD8FF, transparent: true, opacity: .9, toneMapped: false }));
  ring.rotation.x = Math.PI / 2; ring.position.y = H * .32; if (POD) scene.add(ring);
  // mild reflection on podium top (radially faded)
  const refl = new Reflector(new THREE.CircleGeometry(R - bev, 96), { textureWidth: 512, textureHeight: 512, clipBias: .003 });
  refl.material.transparent = true; refl.material.depthWrite = false; refl.material.uniforms.refl = { value: .1 };
  refl.material.vertexShader = refl.material.vertexShader.replace('void main() {', 'varying vec2 vUv2;\nvoid main() { vUv2 = uv;');
  refl.material.fragmentShader = refl.material.fragmentShader.replace('void main() {', 'varying vec2 vUv2; uniform float refl;\nvoid main() {')
    .replace('gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );', 'float r = length((vUv2 - .5) * 2.); float fd = pow(clamp(1. - r, 0., 1.), 1.5); float lum = max(base.r, max(base.g, base.b)); gl_FragColor = vec4(base.rgb * .6, refl * fd * (1. - .6 * clamp(lum, 0., 1.)));');
  refl.rotation.x = -Math.PI / 2; refl.position.y = H + .001; if (POD) scene.add(refl);
  // contact shadow: shadow-catcher + soft blob, rotate with the model
  const sc = new THREE.Mesh(new THREE.CircleGeometry(R - bev, 64), new THREE.ShadowMaterial({ opacity: POD ? .36 : .14 })); sc.rotation.x = -Math.PI / 2; sc.position.y = H + .002; sc.receiveShadow = true; scene.add(sc);
  const bc = document.createElement('canvas'); bc.width = bc.height = 128; const g = bc.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(.6, 'rgba(0,0,0,.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bc), transparent: true, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2; blob.position.y = H + .003; blob.scale.set(sz.x * 1.08, sz.z * 1.0, 1); blob.renderOrder = 2; if (!POD) blob.material.opacity = .45; turn.add(blob);
  // floor shadow under podium (on the CSS backdrop)
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blob.material.map, transparent: true, opacity: .7, depthWrite: false }));
  fl.rotation.x = -Math.PI / 2; fl.position.y = .001; fl.scale.setScalar(R * 2.6); if (POD) scene.add(fl);

  // lights: soft showroom spot from above-front, gentle fill + rim
  const spot = new THREE.SpotLight(0xffffff, 0, 0, .42, 1, 0); spot.intensity = 16; spot.position.set(POD ? L * .5 : L * .08, L * 2.6, POD ? L * 1.1 : L * .25); spot.target.position.set(0, H + sz.y * .35, 0);
  spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.radius = 8; spot.shadow.bias = -.0004; spot.shadow.camera.near = L; spot.shadow.camera.far = L * 6;
  scene.add(spot, spot.target, new THREE.HemisphereLight(0xffffff, 0xd8d4cf, .55));
  const rim = new THREE.DirectionalLight(0xffffff, 1.1); rim.position.set(-L * 2, L * 1.5, -L * 2); scene.add(rim); const rim2 = new THREE.DirectionalLight(0xEAF2FF, .7); rim2.position.set(L * 2.2, L * 1.1, -L * 1.6); scene.add(rim2);

  // framing: fit podium + rotating model (bounding cylinder) into the viewport
  const topY = H + sz.y, rad = Math.hypot(sz.x, sz.z) / 2;
  let elev = .2, dist = 1, look = new THREE.Vector3(0, topY * .4, 0);
  function fit() {
    const w = renderer.domElement.clientWidth || host.clientWidth, h = renderer.domElement.clientHeight || host.clientHeight; renderer.setPixelRatio(Math.min(devicePixelRatio || 1, matchMedia('(max-width:760px)').matches ? 1.5 : 2)); renderer.setSize(w, h, false); cam.aspect = w / h;
    const vf = THREE.MathUtils.degToRad(cam.fov) / 2, hf = Math.atan(Math.tan(vf) * cam.aspect);
    const needV = (topY * .64 + R * Math.sin(elev) + .03) / Math.tan(vf), needH = Math.max(R, rad) / Math.tan(hf);
    dist = POD ? fitDist() : Math.max(needV, needH) * (cam.aspect < 1.05 ? 1.04 : .98) + Math.max(R, rad) * .42; cam.updateProjectionMatrix();
  }
  // podium stage: iterate distance so the rotating machine (all 8 angles) + podium fill ~90% of the frame without clipping
  function fitDist() {
    const pts = []; for (let a = 0; a < 8; a++) { const ca = Math.cos(a * Math.PI / 4), sa = Math.sin(a * Math.PI / 4);
      for (const x of [bb.min.x - c.x, bb.max.x - c.x]) for (const z of [bb.min.z - c.z, bb.max.z - c.z]) for (const y of [H, H + sz.y]) pts.push(new THREE.Vector3(x * ca + z * sa, y, -x * sa + z * ca)); }
    for (let a = 0; a < 16; a++) pts.push(new THREE.Vector3(Math.cos(a / 16 * Math.PI * 2) * R, 0, Math.sin(a / 16 * Math.PI * 2) * R));
    let d = 4; for (let k = 0; k < 60; k++) { cam.position.set(0, look.y + d * Math.sin(elev), d * Math.cos(elev)); cam.lookAt(look); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
      let mx = 0, my0 = 0, my1 = 0; for (const p of pts) { const q = p.clone().project(cam); mx = Math.max(mx, Math.abs(q.x)); my1 = Math.max(my1, q.y); my0 = Math.min(my0, q.y); }
      look.y += (my1 + my0) / 2 * d * Math.tan(cam.fov * Math.PI / 360) * .8; const need = Math.max(mx / .99, (my1 - my0) / 2 / .99); d *= Math.pow(need, .9); if (Math.abs(need - 1) < .004) break; }
    return d;
  }
  if (POD) look.set(0, H + sz.y * .5, 0);
  new ResizeObserver(fit).observe(host); fit();

  // motion: ~22 s per turn, scroll speed-up + tilt, drag to rotate with inertia
  let ang = -.6, vel = 0, drag = null, scrollBoost = 0, lastY = scrollY, tilt = 0, visible = false, raf = 0, last = 0, frames = [];
  const BASE = Math.PI * 2 / 22;
  addEventListener('scroll', () => { const d = scrollY - lastY; lastY = scrollY; scrollBoost = Math.min(3, scrollBoost + Math.abs(d) * .004);
    const r = host.getBoundingClientRect(); tilt = THREE.MathUtils.clamp((innerHeight / 2 - (r.top + r.height / 2)) / innerHeight, -.5, .5); }, { passive: true });
  const cv = renderer.domElement; cv.style.touchAction = 'pan-y';
  cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, a: ang, t: performance.now() }; cv.setPointerCapture(e.pointerId); host.classList.add('grab'); });
  cv.addEventListener('pointermove', e => { if (!drag) return; const na = drag.a + (e.clientX - drag.x) * .008, now = performance.now(); vel = (na - ang) / Math.max(1, now - (drag.t2 || drag.t)) * 1000; drag.t2 = now; ang = na; });
  const up = () => { drag = null; host.classList.remove('grab'); }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  function tick(t) {
    if (!visible) { raf = 0; return; } raf = requestAnimationFrame(tick); const dt = Math.min(.05, (t - (last || t)) / 1000); last = t;
    frames.push(t); while (frames.length && t - frames[0] > 1000) frames.shift();
    if (!drag) { ang += (BASE * (1 + scrollBoost) + vel) * dt; vel *= Math.pow(.04, dt); }
    scrollBoost *= Math.pow(.15, dt);
    turn.rotation.y = ang;
    elev = .2 + tilt * .12;
    cam.position.set(Math.sin(.0) * dist * Math.cos(elev), look.y + dist * Math.sin(elev), dist * Math.cos(elev)); cam.lookAt(look);
    renderer.render(scene, cam); RC[key]++;
  }
  const RC = (window.__rc = window.__rc || { main: 0, stage: 0, g360: 0 }), key = main ? 'stage' : 'g360';
  let ioVis = false, gate = true;
  const sync = () => { visible = ioVis && gate && !document.hidden; if (visible && !raf) { last = 0; raf = requestAnimationFrame(tick); } else if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; } };
  new IntersectionObserver(([en]) => { ioVis = en.isIntersecting; sync(); }, { threshold: 0 }).observe(host);
  document.addEventListener('visibilitychange', sync);
  host.classList.add('pc-3d');
  const api = { scene, cam, turn, m, H, sz, setActive: b => { gate = !!b; sync(); }, setAngle: a => { ang = a; vel = 0; scrollBoost = 0; }, fps: () => frames.length, running: () => !!raf, render: () => { turn.rotation.y = ang; cam.position.set(0, look.y + dist * Math.sin(elev), dist * Math.cos(elev)); cam.lookAt(look); renderer.render(scene, cam); } };
  if (main) window.__stage = api; else window.__g360 = api; return api;
}
