sTread Pro 3D scroll page — static files

This folder is a plain HTML/CSS/JS/images/GLB package (same layout style as the earlier sTread PDP handoff).

How to open
- Do not double-click index.html (file://). ES modules and the 3D model will not load in most browsers.
- Serve this folder with any static server, then open the URL it prints:

  VS Code: install "Live Server", right-click index.html → Open with Live Server
  Node:    npx serve .
  Python:  python -m http.server 5500
           then open http://localhost:5500/

Optional one-click (Windows): double-click start-preview.bat
(or run: node server.cjs) — opens http://localhost:5300

Folder
  index.html
  css/style.css
  js/main.js
  img/
  vid/
  models/stread-pro.glb
  fonts/
  draco/          (GLB decoder)
  studio.hdr
  server.cjs, start-preview.bat, README.txt
