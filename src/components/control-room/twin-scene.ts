/**
 * Gemelo digital del Hero en WebGL (Three.js).
 * Reproduce el plano CSS (mismas coordenadas 520×520) con volumen real:
 * Z01 con alarma de incendio y rociadores descargando agua, Z02 con control
 * de acceso (lector, puerta y persona), Z03 con una cámara CCTV cuya visión
 * queda recortada a la sala, y corriente viajando desde el tablero.
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

// Muro Z01/Z02 con hueco de puerta (170→230) para el control de acceso
const WALLS: [number, number, number, number][] = [
  [300, 0, 300, 520],
  [0, 220, 170, 220],
  [230, 220, 300, 220],
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
  [[440, 440], [440, 270], [320, 270], [320, 60]],
  [[440, 440], [495, 440], [495, 25]],
];
/** Zonas [x, y, ancho, alto] en coordenadas del plano. */
const LOBBY = [0, 0, 300, 220] as const;
const SERVERS = [300, 0, 220, 320] as const;
const DETECTOR: [number, number] = [150, 60];
const SPRINKLERS: [number, number][] = [
  [85, 115],
  [215, 115],
];
const CAMERA_POS: [number, number] = [506, 14];
const PANEL_POS: [number, number] = [428, 428];
const DOOR_HINGE: [number, number] = [170, 220];
const DOOR_LEN = 60;
const READER_POS: [number, number] = [244, 214];
const LABELS: { text: string; x: number; y: number; tone?: "amber" | "signal" }[] = [
  { text: "Z01 · LOBBY", x: 60, y: 30 },
  { text: "ROCIADORES ACTIVOS", x: 70, y: 185, tone: "signal" },
  { text: "Z02 · BODEGA", x: 70, y: 470 },
  { text: "Z03 · SERVIDORES", x: 400, y: 295 },
  { text: "TABLERO 220V", x: 428, y: 490, tone: "amber" },
];

const fract = (x: number) => x - Math.floor(x);
const hash = (i: number) => fract(Math.sin(i * 127.1 + 311.7) * 43758.5453);
const smooth = (a: number, b: number, x: number) => {
  const k = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return k * k * (3 - 2 * k);
};

/** Planos de recorte que encierran un objeto dentro de una habitación. */
function roomClip([x, y, w, h]: readonly number[]) {
  return [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), -px(x)),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), px(x + w)),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), -px(y)),
    new THREE.Plane(new THREE.Vector3(0, 0, -1), px(y + h)),
    new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
  ];
}

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
  renderer.localClippingEnabled = true;
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
  const target = new THREE.Vector3(0, 0.4, 0);

  const glow = glowTexture();
  const disposables: { dispose(): void }[] = [glow];
  const track = <T extends { dispose(): void }>(o: T) => (disposables.push(o), o);

  // ── Suelo + retícula ──────────────────────────────────────────────
  const floor = new THREE.Mesh(
    track(new THREE.PlaneGeometry(SIZE, SIZE)),
    track(new THREE.MeshBasicMaterial({ color: ink3, transparent: true, opacity: 0.92 })),
  );
  floor.rotation.x = -Math.PI / 2;
  // El suelo semitransparente se pinta primero: si no, tapa el agua y el cono que quedan detrás
  floor.renderOrder = -2;
  scene.add(floor);

  const grid = new THREE.GridHelper(SIZE, 20, bone, bone);
  const gridMat = grid.material as THREE.LineBasicMaterial;
  gridMat.transparent = true;
  gridMat.opacity = 0.09;
  grid.position.y = 0.002;
  grid.renderOrder = -1;
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

  const water = cssColor(root, "--lab-water", "#7ecbe2");
  const blue = cssColor(root, "--lab-blue", "#4da8ff");
  const glowSprite = (color: THREE.Color, scale: number) => {
    const s = new THREE.Sprite(
      track(new THREE.SpriteMaterial({ map: glow, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })),
    );
    s.scale.setScalar(scale);
    return s;
  };
  /** Mancha plana sobre el suelo (luz, agua…) sin z-fighting. */
  const floorDecal = (color: THREE.Color, w: number, d: number, opacity: number) => {
    const m = new THREE.Mesh(
      track(new THREE.PlaneGeometry(w, d)),
      track(
        new THREE.MeshBasicMaterial({
          map: glow,
          color,
          transparent: true,
          opacity,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2,
        }),
      ),
    );
    m.rotation.x = -Math.PI / 2;
    return m;
  };
  const solid = (color: THREE.ColorRepresentation, w: number, h: number, d: number, pos: THREE.Vector3) => {
    const geo = track(new THREE.BoxGeometry(w, h, d));
    const m = new THREE.Mesh(geo, track(new THREE.MeshBasicMaterial({ color })));
    m.position.copy(pos).setY(pos.y + h / 2);
    m.add(new THREE.LineSegments(track(new THREE.EdgesGeometry(geo)), wallEdge));
    scene.add(m);
    return m;
  };

  // ── Z01 · Incendio: detector en alarma + rociadores descargando ──
  const lobbyClip = roomClip(LOBBY);
  const alarmTint = new THREE.Mesh(
    track(new THREE.PlaneGeometry(px(LOBBY[2]) - px(0) - 0.06, px(LOBBY[3]) - px(0) - 0.06)),
    track(new THREE.MeshBasicMaterial({ color: signal, transparent: true, opacity: 0.1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })),
  );
  alarmTint.rotation.x = -Math.PI / 2;
  alarmTint.position.copy(at(LOBBY[0] + LOBBY[2] / 2, LOBBY[1] + LOBBY[3] / 2, 0.004));
  scene.add(alarmTint);

  const ringGeo = track(new THREE.RingGeometry(0.92, 1, 64));
  const detector = new THREE.Group();
  detector.position.copy(at(DETECTOR[0], DETECTOR[1], WALL_H));
  detector.add(
    new THREE.Mesh(track(new THREE.CylinderGeometry(0.13, 0.16, 0.07, 24)), track(new THREE.MeshBasicMaterial({ color: signal }))),
  );
  const detectorHalo = glowSprite(signal, 1.2);
  detector.add(detectorHalo);
  const detectorRings = [0, 0.5].map((phase) => {
    const m = new THREE.Mesh(
      ringGeo,
      track(new THREE.MeshBasicMaterial({ color: signal, transparent: true, side: THREE.DoubleSide, depthWrite: false })),
    );
    m.rotation.x = -Math.PI / 2;
    detector.add(m);
    return { m, phase };
  });
  scene.add(detector);

  // Tubería de agua bajo el techo que alimenta los rociadores
  const pipeMat = track(new THREE.MeshBasicMaterial({ color: 0x8d99a6 }));
  const pipeA = at(0, SPRINKLERS[0][1], WALL_H - 0.04);
  const pipeB = at(SPRINKLERS[1][0], SPRINKLERS[1][1], WALL_H - 0.04);
  const pipe = new THREE.Mesh(track(new THREE.CylinderGeometry(0.025, 0.025, pipeA.distanceTo(pipeB), 8)), pipeMat);
  pipe.rotation.z = Math.PI / 2;
  pipe.position.copy(pipeA).lerp(pipeB, 0.5);
  scene.add(pipe);

  const DROPS_PER_HEAD = isSmall ? 70 : 120;
  const DROPS = DROPS_PER_HEAD * SPRINKLERS.length;
  const heads = SPRINKLERS.map(([x, y]) => {
    const head = new THREE.Mesh(track(new THREE.CylinderGeometry(0.07, 0.035, 0.06, 16)), pipeMat);
    head.position.copy(at(x, y, WALL_H - 0.07));
    scene.add(head);
    const halo = glowSprite(water, 0.45);
    halo.position.copy(head.position);
    scene.add(halo);
    // Charco que crece bajo cada rociador
    const puddle = floorDecal(water, 2.4, 1.9, 0.32);
    puddle.position.copy(at(x, y, 0.006));
    scene.add(puddle);
    return { pos: head.position.clone(), puddle };
  });
  // Cada gota es un trazo corto (estela) + un punto brillante en la cabeza
  const streakPos = new Float32Array(DROPS * 6);
  const streakGeo = track(new THREE.BufferGeometry());
  streakGeo.setAttribute("position", new THREE.BufferAttribute(streakPos, 3));
  const streaks = new THREE.LineSegments(
    streakGeo,
    track(new THREE.LineBasicMaterial({ color: water, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending, clippingPlanes: lobbyClip })),
  );
  streaks.frustumCulled = false;
  scene.add(streaks);
  const dropPos = new Float32Array(DROPS * 3);
  const dropGeo = track(new THREE.BufferGeometry());
  dropGeo.setAttribute("position", new THREE.BufferAttribute(dropPos, 3));
  const drops = new THREE.Points(
    dropGeo,
    track(new THREE.PointsMaterial({ color: water, size: 0.07, map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, clippingPlanes: lobbyClip })),
  );
  drops.frustumCulled = false;
  scene.add(drops);
  // Salpicaduras en el suelo
  const SPLASHES = isSmall ? 8 : 14;
  const splashes = Array.from({ length: SPLASHES }, (_, i) => {
    const m = new THREE.Mesh(
      ringGeo,
      track(new THREE.MeshBasicMaterial({ color: water, transparent: true, side: THREE.DoubleSide, depthWrite: false })),
    );
    m.rotation.x = -Math.PI / 2;
    scene.add(m);
    return { m, i };
  });
  const dropAt = (i: number, t: number, out: THREE.Vector3) => {
    const head = heads[Math.floor(i / DROPS_PER_HEAD)].pos;
    const u = fract(t * 1.15 + hash(i));
    const a = hash(i + 13) * Math.PI * 2;
    const r = (0.25 + hash(i + 29) * 0.85) * u;
    return out.set(head.x + Math.cos(a) * r, head.y - 0.02 - (WALL_H - 0.05) * u * u, head.z + Math.sin(a) * r * 0.85);
  };

  // ── Z02 · Control de acceso: lector, puerta y persona ────────────
  const doorLen = px(DOOR_LEN) - px(0);
  const door = new THREE.Group();
  door.position.copy(at(DOOR_HINGE[0], DOOR_HINGE[1]));
  const leafGeo = track(new THREE.BoxGeometry(doorLen - 0.03, WALL_H * 0.82, 0.035));
  leafGeo.translate(doorLen / 2, (WALL_H * 0.82) / 2, 0);
  const leaf = new THREE.Mesh(leafGeo, track(new THREE.MeshBasicMaterial({ color: 0x24344a, transparent: true, opacity: 0.85 })));
  leaf.add(new THREE.LineSegments(track(new THREE.EdgesGeometry(leafGeo)), track(new THREE.LineBasicMaterial({ color: blue }))));
  door.add(leaf);
  scene.add(door);

  const reader = solid(0x1a191c, 0.09, 0.15, 0.03, at(READER_POS[0], READER_POS[1], 0.42));
  const readerLed = glowSprite(blue, 0.32);
  readerLed.position.copy(reader.position).add(new THREE.Vector3(0, 0.03, -0.03));
  scene.add(readerLed);
  const doorway = floorDecal(ok, doorLen * 1.3, 1.2, 0);
  doorway.position.copy(at(DOOR_HINGE[0] + DOOR_LEN / 2, DOOR_HINGE[1], 0.007));
  scene.add(doorway);

  const personMat = track(new THREE.MeshBasicMaterial({ color: blue, transparent: true }));
  const person = new THREE.Group();
  const torso = new THREE.Mesh(track(new THREE.CapsuleGeometry(0.075, 0.26, 4, 12)), personMat);
  torso.position.y = 0.21;
  const headMesh = new THREE.Mesh(track(new THREE.SphereGeometry(0.065, 16, 10)), track(new THREE.MeshBasicMaterial({ color: bone, transparent: true })));
  headMesh.position.y = 0.46;
  const shadow = floorDecal(new THREE.Color(0x000000), 0.45, 0.45, 0);
  (shadow.material as THREE.MeshBasicMaterial).blending = THREE.NormalBlending;
  shadow.position.y = 0.005;
  person.add(torso, headMesh, shadow);
  scene.add(person);

  const accessLabel = document.createElement("p");
  accessLabel.style.cssText = `margin:0;font-family:var(--cr-mono);font-size:${isSmall ? 10 : 12}px;letter-spacing:.08em;white-space:nowrap;padding:2px 6px;border:1px solid var(--cr-line);background:color-mix(in srgb,var(--cr-ink) 75%,transparent);transition:color .2s`;
  const accessObj = new CSS2DObject(accessLabel);
  accessObj.position.copy(at(READER_POS[0] + 30, READER_POS[1] - 10, WALL_H + 0.25));
  scene.add(accessObj);

  // Estantería de la bodega
  [
    [40, 330, 0.42],
    [40, 410, 0.55],
    [115, 470, 0.3],
  ].forEach(([x, y, h]) => solid(0x3a3129, 0.9, h, 0.6, at(x + 23, y)));

  // ── Z03 · CCTV: cámara en esquina, visión recortada a la sala ────
  const serverClip = roomClip(SERVERS);
  [110, 170, 230].forEach((y) => {
    const rack = solid(0x1c1b20, 0.42, 0.82, 0.5, at(488, y));
    const leds = new THREE.Mesh(
      track(new THREE.PlaneGeometry(0.3, 0.6)),
      track(new THREE.MeshBasicMaterial({ color: ok, transparent: true, opacity: 0.35 })),
    );
    leds.rotation.y = -Math.PI / 2;
    leds.position.set(-0.215, 0, 0);
    rack.add(leds);
  });

  const cctv = new THREE.Group();
  cctv.position.copy(at(CAMERA_POS[0], CAMERA_POS[1], WALL_H - 0.08));
  const bracket = new THREE.Mesh(track(new THREE.BoxGeometry(0.08, 0.14, 0.08)), track(new THREE.MeshBasicMaterial({ color: 0x77736d })));
  bracket.position.y = 0.06;
  cctv.add(bracket);
  const yaw = new THREE.Group();
  const pitch = new THREE.Group();
  pitch.rotation.z = -0.52;
  const camBody = new THREE.Mesh(track(new THREE.BoxGeometry(0.3, 0.12, 0.13)), track(new THREE.MeshBasicMaterial({ color: 0xd8d3cc })));
  camBody.position.x = 0.1;
  const lens = new THREE.Mesh(track(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 16)), track(new THREE.MeshBasicMaterial({ color: ok })));
  lens.rotation.z = Math.PI / 2;
  lens.position.x = 0.26;
  const lensHalo = glowSprite(ok, 0.5);
  lensHalo.position.x = 0.28;
  pitch.add(camBody, lens, lensHalo);

  const coneLen = 5.2;
  const coneGeo = track(new THREE.ConeGeometry(1.45, coneLen, 40, 1, true));
  coneGeo.translate(0, -coneLen / 2, 0); // vértice en el origen
  coneGeo.rotateZ(Math.PI / 2); // apunta hacia +X
  const cone = new THREE.Mesh(
    coneGeo,
    track(
      new THREE.MeshBasicMaterial({ color: ok, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, clippingPlanes: serverClip }),
    ),
  );
  const coneEdge = new THREE.LineSegments(
    track(new THREE.EdgesGeometry(coneGeo, 30)),
    track(new THREE.LineBasicMaterial({ color: ok, transparent: true, opacity: 0.4, clippingPlanes: serverClip })),
  );
  pitch.add(cone, coneEdge);
  yaw.add(pitch);
  // Huella de la vista sobre el suelo, recortada por los muros de la sala
  const footprint = new THREE.Mesh(
    track(new THREE.CircleGeometry(5, 40, -0.3, 0.6)),
    track(
      new THREE.MeshBasicMaterial({ color: ok, transparent: true, opacity: 0.26, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, clippingPlanes: serverClip }),
    ),
  );
  footprint.rotation.x = -Math.PI / 2;
  footprint.position.y = -(WALL_H - 0.08) + 0.008;
  yaw.add(footprint);
  cctv.add(yaw);
  scene.add(cctv);

  // Técnico que la cámara sigue con una caja de detección
  const tech = new THREE.Group();
  const techTorso = new THREE.Mesh(track(new THREE.CapsuleGeometry(0.075, 0.26, 4, 12)), track(new THREE.MeshBasicMaterial({ color: 0x8d8892 })));
  techTorso.position.y = 0.21;
  const techHead = new THREE.Mesh(track(new THREE.SphereGeometry(0.065, 16, 10)), track(new THREE.MeshBasicMaterial({ color: amber })));
  techHead.position.y = 0.46;
  tech.add(techTorso, techHead);
  scene.add(tech);
  const box = document.createElement("div");
  box.style.cssText = `width:${isSmall ? 22 : 30}px;height:${isSmall ? 34 : 46}px;border:1.5px solid var(--cr-ok);box-shadow:0 0 12px color-mix(in srgb,var(--cr-ok) 50%,transparent);position:relative;transition:opacity .25s`;
  const boxTag = document.createElement("span");
  boxTag.textContent = "PERSONAL · 97%";
  boxTag.style.cssText = `position:absolute;left:-1.5px;bottom:100%;font-family:var(--cr-mono);font-size:${isSmall ? 8 : 9.5}px;letter-spacing:.06em;white-space:nowrap;color:var(--cr-ink);background:var(--cr-ok);padding:1px 4px`;
  box.appendChild(boxTag);
  const boxObj = new CSS2DObject(box);
  boxObj.position.y = 0.3;
  tech.add(boxObj);

  // ── Tablero eléctrico ─────────────────────────────────────────────
  const panelMat = track(new THREE.MeshBasicMaterial({ color: amber }));
  const panel = new THREE.Mesh(track(new THREE.BoxGeometry(0.46, 0.62, 0.14)), panelMat);
  panel.position.copy(at(PANEL_POS[0], PANEL_POS[1], 0.31));
  scene.add(panel);
  const panelHalo = glowSprite(amber, 2);
  panelHalo.position.copy(panel.position);
  scene.add(panelHalo);

  // ── Etiquetas HTML (nítidas a cualquier resolución) ──────────────
  LABELS.forEach(({ text, x, y, tone }) => {
    const el = document.createElement("p");
    el.textContent = text;
    el.style.cssText = `margin:0;font-family:var(--cr-mono);font-size:${isSmall ? 11 : 13}px;letter-spacing:.08em;white-space:nowrap;color:${
      tone === "amber" ? "var(--cr-amber)" : tone === "signal" ? "var(--cr-signal)" : "var(--cr-bone-dim)"
    };text-shadow:0 1px 6px rgba(0,0,0,.8)`;
    if (tone === "signal") el.style.animation = "cr-blink 1.2s steps(2, jump-none) infinite";
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

  // ── Encuadre: el edificio completo siempre cabe en el lienzo ────
  const corners: THREE.Vector3[] = [];
  for (const x of [-SIZE / 2, SIZE / 2]) for (const y of [0, WALL_H]) for (const z of [-SIZE / 2, SIZE / 2]) corners.push(new THREE.Vector3(x, y, z));
  const ndc = new THREE.Vector3();
  let dist = 28;
  const place = (az: number, polar: number, d: number) => {
    camera.position.set(
      target.x + d * Math.sin(polar) * Math.sin(az),
      target.y + d * Math.cos(polar),
      target.z + d * Math.sin(polar) * Math.cos(az),
    );
    camera.lookAt(target);
    camera.updateMatrixWorld();
  };
  /** Distancia a la que la esquina más saliente queda dentro del margen. */
  const fitDist = (az: number, polar: number, d: number) => {
    for (let k = 0; k < 4; k++) {
      place(az, polar, d);
      let m = 0;
      for (const c of corners) {
        ndc.copy(c).project(camera);
        m = Math.max(m, Math.abs(ndc.x) / 0.94, Math.abs(ndc.y) / 0.9);
      }
      d *= 1 + (m - 1) * 0.95;
    }
    return d;
  };

  // ── Tamaño ───────────────────────────────────────────────────────
  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    labelRenderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // ── Bucle ────────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let raf = 0;
  let running = false;
  let firstFrame = true;
  const tmpA = new THREE.Vector3();
  const tmpB = new THREE.Vector3();
  const camDir = new THREE.Vector3();
  const lerp2 = (a: [number, number], b: [number, number], k: number): [number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const t = clock.getElapsedTime();

    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;

    // Órbita: vaivén lento + paralaje; el zoom se ajusta para no cortar el edificio
    const az = THREE.MathUtils.degToRad(-36 + Math.sin((t / 18) * Math.PI * 2) * 8 + pointer.sx * 7);
    const polar = THREE.MathUtils.degToRad(42 - Math.sin((t / 18) * Math.PI * 2) * 3 + pointer.sy * 4 - scrollP * 12);
    const need = fitDist(az, polar, dist);
    dist = firstFrame ? need : dist + (need - dist) * 0.2;
    firstFrame = false;
    place(az, polar, dist * (1 - scrollP * 0.12));

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

    // Z01 · alarma: estrobo rojo, ondas del detector y agua cayendo
    const strobe = t % 0.9 < 0.45;
    (alarmTint.material as THREE.MeshBasicMaterial).opacity = strobe ? 0.16 : 0.05;
    detectorHalo.scale.setScalar(strobe ? 1.5 : 0.8);
    detectorRings.forEach(({ m, phase }) => {
      const p = (t / 1.6 + phase) % 1;
      m.scale.setScalar(0.2 + p * 1.4);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.85;
    });
    for (let i = 0; i < DROPS; i++) {
      dropAt(i, t, tmpA);
      dropAt(i, t - 0.05, tmpB);
      if (tmpB.y > tmpA.y + 0.4) tmpB.copy(tmpA); // la estela no cruza el reinicio del ciclo
      dropPos.set([tmpA.x, tmpA.y, tmpA.z], i * 3);
      streakPos.set([tmpB.x, tmpB.y, tmpB.z, tmpA.x, tmpA.y, tmpA.z], i * 6);
    }
    dropGeo.attributes.position.needsUpdate = true;
    streakGeo.attributes.position.needsUpdate = true;
    splashes.forEach(({ m, i }) => {
      const cyc = t * 1.3 + hash(i + 71);
      const p = fract(cyc);
      const seed = i * 17 + Math.floor(cyc) * 31;
      const head = heads[i % heads.length].pos;
      const a = hash(seed) * Math.PI * 2;
      const r = 0.2 + hash(seed + 5) * 0.9;
      m.position.set(head.x + Math.cos(a) * r, 0.01, head.z + Math.sin(a) * r * 0.85);
      m.scale.setScalar(0.03 + p * 0.14);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.7;
    });
    heads.forEach(({ puddle }, i) => {
      puddle.scale.setScalar(0.95 + Math.sin(t * 2 + i) * 0.05);
    });

    // Z02 · ciclo de acceso (9 s): llega, lee tarjeta, abre, pasa, cierra
    const c = (t % 9) / 9;
    const open = smooth(0.36, 0.46, c) * (1 - smooth(0.68, 0.78, c));
    door.rotation.y = -open * 1.4;
    const scanning = c >= 0.22 && c < 0.34;
    const granted = c >= 0.34 && c < 0.72;
    const ledCol = granted ? ok : scanning && t % 0.3 < 0.15 ? bone : blue;
    readerLed.material.color.copy(ledCol);
    readerLed.scale.setScalar(granted ? 0.5 : 0.32);
    (doorway.material as THREE.MeshBasicMaterial).opacity = open * 0.45;
    const text = granted ? "ACCESO CONCEDIDO" : scanning ? "LEYENDO TARJETA…" : "LECTOR L-02";
    if (accessLabel.textContent !== text) accessLabel.textContent = text;
    accessLabel.style.color = granted ? "var(--cr-ok)" : scanning ? "var(--cr-bone)" : "var(--cr-bone-dim)";
    let pp: [number, number];
    if (c < 0.22) pp = lerp2([200, 110], [200, 190], smooth(0, 0.22, c));
    else if (c < 0.44) pp = [200, 190];
    else if (c < 0.62) pp = lerp2([200, 190], [200, 300], smooth(0.44, 0.62, c));
    else pp = lerp2([200, 300], [110, 360], smooth(0.62, 0.76, c));
    person.position.copy(at(pp[0], pp[1]));
    const fade = smooth(0, 0.04, c) * (1 - smooth(0.76, 0.84, c));
    personMat.opacity = fade;
    (headMesh.material as THREE.MeshBasicMaterial).opacity = fade;
    (shadow.material as THREE.MeshBasicMaterial).opacity = fade * 0.5;
    person.visible = fade > 0.01;

    // Z03 · la cámara barre solo el interior de la sala de servidores
    yaw.rotation.y = Math.PI + 0.8 + Math.sin(t * 0.5) * 0.42;
    lensHalo.scale.setScalar(0.45 + Math.sin(t * 4) * 0.06);
    const tk = (Math.sin(t * 0.35) + 1) / 2;
    const tp = at(360 + tk * 50, 90 + tk * 190);
    tech.position.copy(tp);
    tech.rotation.y = Math.cos(t * 0.35) > 0 ? 0 : Math.PI;
    // ¿Está el técnico dentro del cono? (ángulo en planta respecto al eje de la cámara)
    camDir.set(Math.cos(yaw.rotation.y), 0, -Math.sin(yaw.rotation.y));
    tmpA.copy(tp).sub(cctv.position).setY(0).normalize();
    const seen = camDir.dot(tmpA) > Math.cos(0.3);
    box.style.opacity = seen ? "1" : "0";

    // Tablero: parpadeo tipo cr-blink
    const on = t % 1.4 < 0.8;
    panelMat.opacity = on ? 1 : 0.35;
    panelMat.transparent = !on;
    panelHalo.material.opacity = on ? 0.9 : 0.25;

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
