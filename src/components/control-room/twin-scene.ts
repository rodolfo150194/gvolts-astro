/**
 * Gemelo digital del Hero en WebGL (Three.js).
 * Reproduce el plano CSS (mismas coordenadas 520×520) con volumen real:
 * muros, cono de visión de la cámara CCTV, corriente viajando por los
 * cables desde el tablero y ondas de los detectores de humo.
 * Se carga en diferido desde Hero.astro; el plano CSS queda como respaldo.
 */
import * as THREE from "three";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";

const PLAN = 520;
const SIZE = 10;
const WALL_H = 1.1;

/** Coordenada del plano SVG (0..520) → mundo (-5..5). */
const px = (v: number) => (v / PLAN - 0.5) * SIZE;
const at = (x: number, y: number, h = 0) => new THREE.Vector3(px(x), h, px(y));

const WALLS: [number, number, number, number][] = [
  [300, 0, 300, 520],
  [0, 220, 300, 220],
  [300, 320, 520, 320],
];
const PERIMETER: [number, number, number, number][] = [
  [0, 0, 520, 0],
  [520, 0, 520, 520],
  [520, 520, 0, 520],
  [0, 520, 0, 0],
];
const WIRES: [number, number][][] = [
  [[440, 440], [440, 400], [150, 400]],
  [[440, 440], [440, 270], [230, 270], [230, 110], [150, 110]],
  [[440, 440], [495, 440], [495, 25]],
];
const DETECTORS: [number, number][] = [
  [136, 96],
  [136, 386],
];
const CAMERA_POS: [number, number] = [485, 15];
const PANEL_POS: [number, number] = [428, 428];
const LABELS: { text: string; x: number; y: number; amber?: boolean }[] = [
  { text: "Z01 · LOBBY", x: 60, y: 30 },
  { text: "Z02 · BODEGA", x: 60, y: 250 },
  { text: "Z03 · SERVIDORES", x: 400, y: 295 },
  { text: "TABLERO 220V", x: 428, y: 490, amber: true },
];

function cssColor(el: Element, name: string, fallback: string) {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return new THREE.Color(v || fallback);
}

/** Textura radial para halos (sustituye un bloom de post-proceso, mucho más barato). */
function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function mountTwin(container: HTMLElement, root: HTMLElement) {
  const signal = cssColor(root, "--cr-signal", "#e0605a");
  const ok = cssColor(root, "--cr-ok", "#7ee2a8");
  const amber = cssColor(root, "--cr-amber", "#ffd66b");
  const bone = cssColor(root, "--cr-bone", "#ede8e0");
  const ink3 = cssColor(root, "--cr-ink-3", "#232126");

  const isSmall = window.matchMedia("(max-width: 640px)").matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = "twin__gl";
  container.appendChild(renderer.domElement);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.className = "twin__gl-labels";
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.inset = "0";
  labelRenderer.domElement.style.pointerEvents = "none";
  container.appendChild(labelRenderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 200);
  const target = new THREE.Vector3(0, 0.6, 1.2);

  const glow = glowTexture();
  const disposables: { dispose(): void }[] = [glow];
  const track = <T extends { dispose(): void }>(o: T) => (disposables.push(o), o);

  // ── Suelo + retícula ──────────────────────────────────────────────
  const floor = new THREE.Mesh(
    track(new THREE.PlaneGeometry(SIZE, SIZE)),
    track(new THREE.MeshBasicMaterial({ color: ink3, transparent: true, opacity: 0.92 })),
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const grid = new THREE.GridHelper(SIZE, 20, bone, bone);
  const gridMat = grid.material as THREE.LineBasicMaterial;
  gridMat.transparent = true;
  gridMat.opacity = 0.09;
  grid.position.y = 0.002;
  track(grid.geometry);
  track(gridMat);
  scene.add(grid);

  // ── Muros ─────────────────────────────────────────────────────────
  const wallFill = track(new THREE.MeshBasicMaterial({ color: ink3, transparent: true, opacity: 0.55, depthWrite: false }));
  const wallFillOuter = track(new THREE.MeshBasicMaterial({ color: ink3, transparent: true, opacity: 0.22, depthWrite: false }));
  const wallEdge = track(new THREE.LineBasicMaterial({ color: bone, transparent: true, opacity: 0.4 }));
  const wallEdgeOuter = track(new THREE.LineBasicMaterial({ color: bone, transparent: true, opacity: 0.22 }));

  function addWall([x1, y1, x2, y2]: number[], outer: boolean) {
    const a = at(x1, y1);
    const b = at(x2, y2);
    const len = a.distanceTo(b);
    const h = outer ? WALL_H * 0.55 : WALL_H;
    const geo = track(new THREE.BoxGeometry(len, h, 0.05));
    const mesh = new THREE.Mesh(geo, outer ? wallFillOuter : wallFill);
    mesh.position.set((a.x + b.x) / 2, h / 2, (a.z + b.z) / 2);
    mesh.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
    const edges = new THREE.LineSegments(track(new THREE.EdgesGeometry(geo)), outer ? wallEdgeOuter : wallEdge);
    mesh.add(edges);
    scene.add(mesh);
  }
  WALLS.forEach((w) => addWall(w, false));
  PERIMETER.forEach((w) => addWall(w, true));

  // ── Cables + corriente ───────────────────────────────────────────
  const wireMat = track(new THREE.LineBasicMaterial({ color: amber, transparent: true, opacity: 0.6 }));
  const curves: THREE.CurvePath<THREE.Vector3>[] = [];
  WIRES.forEach((pts) => {
    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 0; i < pts.length - 1; i++) {
      path.add(new THREE.LineCurve3(at(pts[i][0], pts[i][1], 0.03), at(pts[i + 1][0], pts[i + 1][1], 0.03)));
    }
    curves.push(path);
    const line = new THREE.Line(track(new THREE.BufferGeometry().setFromPoints(path.getSpacedPoints(64))), wireMat);
    scene.add(line);
  });

  const PER_WIRE = isSmall ? 6 : 10;
  const sparkGeo = track(new THREE.BufferGeometry());
  const sparkPos = new Float32Array(curves.length * PER_WIRE * 3);
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
  const sparks = new THREE.Points(
    sparkGeo,
    track(
      new THREE.PointsMaterial({
        color: amber,
        size: 0.6,
        map: glow,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  scene.add(sparks);
  const tmp = new THREE.Vector3();

  // ── Detectores de humo (techo) con ondas ─────────────────────────
  const ringGeo = track(new THREE.RingGeometry(0.92, 1, 64));
  const detectors = DETECTORS.map(([x, y], i) => {
    const g = new THREE.Group();
    g.position.copy(at(x, y, WALL_H));
    const body = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.16, 0.2, 0.08, 24)),
      track(new THREE.MeshBasicMaterial({ color: signal })),
    );
    g.add(body);
    const halo = new THREE.Sprite(
      track(new THREE.SpriteMaterial({ map: glow, color: signal, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })),
    );
    halo.scale.setScalar(1.3);
    g.add(halo);
    const rings = [0, 0.5].map((phase) => {
      const m = new THREE.Mesh(
        ringGeo,
        track(new THREE.MeshBasicMaterial({ color: signal, transparent: true, side: THREE.DoubleSide, depthWrite: false })),
      );
      m.rotation.x = -Math.PI / 2;
      g.add(m);
      return { m, phase };
    });
    // Haz tenue hacia el suelo: marca la zona que vigila
    const beam = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.05, 0.9, WALL_H, 32, 1, true)),
      track(new THREE.MeshBasicMaterial({ color: signal, transparent: true, opacity: 0.06, depthWrite: false, side: THREE.DoubleSide })),
    );
    beam.position.y = -WALL_H / 2;
    g.add(beam);
    scene.add(g);
    return { rings, halo, offset: i * 0.37 };
  });

  // ── Cámara CCTV con cono de visión ───────────────────────────────
  const cctv = new THREE.Group();
  cctv.position.copy(at(CAMERA_POS[0], CAMERA_POS[1], WALL_H + 0.1));
  const cctvBody = new THREE.Mesh(track(new THREE.BoxGeometry(0.34, 0.16, 0.16)), track(new THREE.MeshBasicMaterial({ color: ok })));
  cctv.add(cctvBody);
  const cctvHalo = new THREE.Sprite(
    track(new THREE.SpriteMaterial({ map: glow, color: ok, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })),
  );
  cctvHalo.scale.setScalar(1.1);
  cctv.add(cctvHalo);

  const coneLen = 7.2;
  const coneGeo = track(new THREE.ConeGeometry(2.1, coneLen, 40, 1, true));
  coneGeo.translate(0, -coneLen / 2, 0); // vértice en el origen
  coneGeo.rotateZ(Math.PI / 2); // apunta hacia +X
  const pitch = new THREE.Group();
  pitch.rotation.z = -0.2;
  const cone = new THREE.Mesh(
    coneGeo,
    track(
      new THREE.MeshBasicMaterial({
        color: ok,
        transparent: true,
        opacity: 0.17,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  const coneEdge = new THREE.LineSegments(
    track(new THREE.EdgesGeometry(coneGeo, 30)),
    track(new THREE.LineBasicMaterial({ color: ok, transparent: true, opacity: 0.45 })),
  );
  pitch.add(cone, coneEdge);
  const yaw = new THREE.Group();
  yaw.add(pitch);
  // Huella del barrido sobre el suelo (el "radar" del plano CSS)
  const sweep = new THREE.Mesh(
    track(new THREE.CircleGeometry(6.4, 40, -0.3, 0.6)),
    track(
      new THREE.MeshBasicMaterial({
        color: ok,
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  sweep.rotation.x = -Math.PI / 2;
  sweep.position.y = -(WALL_H + 0.1) + 0.01;
  yaw.add(sweep);
  cctv.add(yaw);
  scene.add(cctv);

  // ── Tablero eléctrico ─────────────────────────────────────────────
  const panelMat = track(new THREE.MeshBasicMaterial({ color: amber }));
  const panel = new THREE.Mesh(track(new THREE.BoxGeometry(0.46, 0.62, 0.14)), panelMat);
  panel.position.copy(at(PANEL_POS[0], PANEL_POS[1], 0.31));
  scene.add(panel);
  const panelHalo = new THREE.Sprite(
    track(new THREE.SpriteMaterial({ map: glow, color: amber, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })),
  );
  panelHalo.scale.setScalar(2);
  panelHalo.position.copy(panel.position);
  scene.add(panelHalo);

  // ── Marcos flotantes + plano de escaneo ──────────────────────────
  const frameGeo = track(
    new THREE.BufferGeometry().setFromPoints([at(0, 0), at(520, 0), at(520, 520), at(0, 520), at(0, 0)]),
  );
  const dashed = new THREE.Line(
    frameGeo,
    track(new THREE.LineDashedMaterial({ color: bone, dashSize: 0.18, gapSize: 0.14, transparent: true, opacity: 0.3 })),
  );
  dashed.computeLineDistances();
  dashed.position.y = 2.1;
  const redFrame = new THREE.Line(frameGeo, track(new THREE.LineBasicMaterial({ color: signal, transparent: true, opacity: 0.4 })));
  redFrame.position.y = 3.6;
  scene.add(dashed, redFrame);

  const scanMat = track(
    new THREE.MeshBasicMaterial({
      color: signal,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  const scan = new THREE.Mesh(track(new THREE.PlaneGeometry(SIZE, SIZE)), scanMat);
  scan.rotation.x = -Math.PI / 2;
  const scanEdge = new THREE.Line(frameGeo, track(new THREE.LineBasicMaterial({ color: signal, transparent: true, opacity: 0.5 })));
  scanEdge.rotation.x = Math.PI / 2; // compensa la rotación del plano padre
  scan.add(scanEdge);
  scene.add(scan);

  // ── Etiquetas HTML (nítidas a cualquier resolución) ──────────────
  LABELS.forEach(({ text, x, y, amber: isAmber }) => {
    const el = document.createElement("p");
    el.textContent = text;
    el.style.cssText = `margin:0;font-family:var(--cr-mono);font-size:${isSmall ? 9.5 : 11}px;letter-spacing:.08em;white-space:nowrap;color:${
      isAmber ? "var(--cr-amber)" : "var(--cr-bone-dim)"
    };text-shadow:0 1px 6px rgba(0,0,0,.8)`;
    const obj = new CSS2DObject(el);
    obj.position.copy(at(x, y, 0.05));
    scene.add(obj);
  });

  // ── Interacción: ratón + scroll ──────────────────────────────────
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const onPointer = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  let scrollP = 0;
  const hero = container.closest("section") ?? container;
  const onScroll = () => {
    const r = hero.getBoundingClientRect();
    scrollP = THREE.MathUtils.clamp(-r.top / Math.max(r.height, 1), 0, 1);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ── Tamaño ───────────────────────────────────────────────────────
  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    labelRenderer.setSize(w, h);
    camera.aspect = w / h;
    // Encaja el plano en retratos estrechos alejando la cámara
    camera.userData.dist = (isSmall ? 33 : 30) / Math.min(1, camera.aspect / 0.82);
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // ── Bucle ────────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let raf = 0;
  let running = false;

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const t = clock.getElapsedTime();

    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;

    // Órbita: vaivén lento (como el twin-sway CSS) + paralaje + scroll
    const az = THREE.MathUtils.degToRad(-36 + Math.sin((t / 18) * Math.PI * 2) * 8 + pointer.sx * 7);
    const polar = THREE.MathUtils.degToRad(40 - Math.sin((t / 18) * Math.PI * 2) * 3 + pointer.sy * 4 - scrollP * 14);
    const dist = (camera.userData.dist as number) * (1 - scrollP * 0.18);
    camera.position.set(
      target.x + dist * Math.sin(polar) * Math.sin(az),
      target.y + dist * Math.cos(polar),
      target.z + dist * Math.sin(polar) * Math.cos(az),
    );
    camera.lookAt(target);

    // Corriente: del tablero hacia cada zona
    let k = 0;
    curves.forEach((c, ci) => {
      for (let i = 0; i < PER_WIRE; i++) {
        const u = (i / PER_WIRE + t * 0.16 + ci * 0.13) % 1;
        c.getPointAt(u, tmp);
        sparkPos[k++] = tmp.x;
        sparkPos[k++] = tmp.y;
        sparkPos[k++] = tmp.z;
      }
    });
    sparkGeo.attributes.position.needsUpdate = true;

    // Ondas de los detectores
    detectors.forEach(({ rings, halo, offset }) => {
      rings.forEach(({ m, phase }) => {
        const p = (t / 2.6 + phase + offset) % 1;
        const s = 0.2 + p * 1.8;
        m.scale.set(s, s, s);
        (m.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.85;
      });
      halo.scale.setScalar(1.1 + Math.sin(t * 3 + offset * 10) * 0.2);
    });

    // Barrido de la cámara CCTV sobre la planta (hacia abajo-izquierda)
    yaw.rotation.y = Math.PI + 0.62 + Math.sin(t * 0.55) * 0.55;
    cctvHalo.scale.setScalar(0.9 + Math.sin(t * 4) * 0.12);

    // Tablero: parpadeo tipo cr-blink
    const on = t % 1.4 < 0.8;
    panelMat.opacity = on ? 1 : 0.35;
    panelMat.transparent = !on;
    panelHalo.material.opacity = on ? 0.9 : 0.25;

    // Marcos que respiran + escaneo vertical
    dashed.position.y = 2.1 + Math.sin(t * 0.8) * 0.12;
    redFrame.position.y = 3.6 + Math.sin(t * 0.8 + 1.2) * 0.16;
    const sp = (t / 7) % 1;
    scan.position.y = sp * 4.2;
    scanMat.opacity = Math.sin(sp * Math.PI) * 0.1;

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  };

  const start = () => {
    if (running) return;
    running = true;
    clock.start();
    frame();
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  // Solo renderiza cuando el Hero es visible y la pestaña está activa
  let inView = true;
  const io = new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    inView && !document.hidden ? start() : stop();
  });
  io.observe(container);
  const onVisibility = () => (inView && !document.hidden ? start() : stop());
  document.addEventListener("visibilitychange", onVisibility);

  // Primer frame síncrono para poder hacer el fundido sin parpadeo
  frame();
  cancelAnimationFrame(raf);
  start();

  return () => {
    stop();
    io.disconnect();
    ro.disconnect();
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisibility);
    disposables.forEach((d) => d.dispose());
    renderer.dispose();
    renderer.domElement.remove();
    labelRenderer.domElement.remove();
  };
}
