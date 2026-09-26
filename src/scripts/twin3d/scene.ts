/*
 * three.js renderer for the digital twin lab.
 *
 * It does NOT own the simulation: DigitalTwinLab's script runs the timeline
 * (status card, stepper, log, readouts) and publishes a `lab:draw` event with
 * the semantic state of every frame. This module mirrors that state in a
 * procedural 3D building. Because it only renders on `lab:draw`, it inherits
 * the lab's pausing (off-screen / hidden document) for free.
 *
 * Plan coordinates are the same 520×520 units used by the CSS/SVG version.
 */
import * as THREE from "three";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";

type P = [number, number];
type ScenarioId = "fire" | "intruder" | "access" | "power";
type ZoneId = "Z01" | "Z02" | "Z03" | "Z04";
type ZoneState = "" | "alert" | "warn" | "info" | "ok" | "blue";

interface DrawDetail {
  scenario: ScenarioId;
  t: number;
  dur: number;
  tone: string;
  zones: Partial<Record<ZoneId, ZoneState>>;
  sim: Record<string, unknown>;
}

const PLAN = 520;
const SIZE = 20; // metres
const S = SIZE / PLAN;
const WALL_H = 2.6;
const DEG = Math.PI / 180;

const W = (p: P, y = 0) => new THREE.Vector3((p[0] - PLAN / 2) * S, y, (p[1] - PLAN / 2) * S);

/* Camera azimuth per tab (0° = +X, 90° = +Z): turn the relevant zone toward the viewer. */
const AZIMUTH: Record<ScenarioId, number> = { fire: 24, intruder: 66, access: 34, power: 50 };
const ELEVATION = 36 * DEG;

const ZONES: Record<ZoneId, [number, number, number, number]> = {
  Z01: [0, 0, 300, 220],
  Z02: [0, 220, 300, 300],
  Z03: [300, 0, 220, 320],
  Z04: [300, 320, 220, 200],
};

const INNER_WALLS: [P, P][] = [
  [[300, 0], [300, 78]],
  [[300, 140], [300, 520]],
  [[0, 220], [229, 220]],
  [[281, 220], [300, 220]],
  [[300, 320], [520, 320]],
];

const CABLES: Record<"c1" | "c2" | "c3" | "c3b", P[]> = {
  c1: [[440, 440], [440, 270], [230, 270], [230, 110], [150, 110]],
  c2: [[440, 440], [495, 440], [495, 40], [420, 40]],
  c3: [[440, 440], [440, 400], [230, 400], [230, 488]],
  c3b: [[440, 440], [470, 440], [470, 470], [252, 470], [252, 488]],
};

const num = (v: unknown, fb = 0) => (typeof v === "number" && Number.isFinite(v) ? v : fb);
const pt = (v: unknown, fb: P): P => (Array.isArray(v) && v.length === 2 ? (v as P) : fb);
const fract = (x: number) => x - Math.floor(x);
const hash = (i: number) => fract(Math.sin(i * 127.1 + 311.7) * 43758.5453);

function radialTexture(stops: [number, string][], size = 128) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => grad.addColorStop(o, col));
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function dashTexture() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 8;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 128, 0);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(0.2, "rgba(255,255,255,1)");
  grad.addColorStop(0.45, "rgba(255,255,255,1)");
  grad.addColorStop(0.6, "rgba(255,255,255,0)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 8);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

export function mountTwin3D(root: HTMLElement, mount: HTMLElement): () => void {
  const css = getComputedStyle(root);
  const tok = (name: string, fb: string) => {
    const v = css.getPropertyValue(name).trim();
    return new THREE.Color(/^#[0-9a-f]{3,8}$/i.test(v) ? v : fb);
  };
  const C = {
    ink: tok("--cr-ink", "#111012"),
    ink3: tok("--cr-ink-3", "#232126"),
    bone: tok("--cr-bone", "#ede8e0"),
    signal: tok("--cr-signal", "#e0605a"),
    amber: tok("--cr-amber", "#ffd66b"),
    ok: tok("--cr-ok", "#7ee2a8"),
    blue: tok("--lab-blue", "#4da8ff"),
    water: tok("--lab-water", "#7ecbe2"),
    fire: new THREE.Color("#ff8a4c"),
    wall: new THREE.Color("#4a4650"),
    dim: new THREE.Color("#3a373d"),
  };

  // Show the mount first so it has a size; undone if WebGL fails below.
  root.classList.add("is-3d");
  const mobile = () => mount.clientWidth < 640 || window.matchMedia("(pointer: coarse)").matches;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !mobile(), alpha: true, powerPreference: "high-performance" });
  } catch (err) {
    root.classList.remove("is-3d");
    throw err;
  }
  renderer.setPixelRatio(mobile() ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.localClippingEnabled = true;
  renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  renderer.domElement.setAttribute("aria-hidden", "true");
  mount.appendChild(renderer.domElement);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden";
  mount.appendChild(labelRenderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 400);
  const textures: THREE.Texture[] = [];
  const tex = <T extends THREE.Texture>(t: T) => (textures.push(t), t);

  const softTex = tex(radialTexture([[0, "rgba(255,255,255,1)"], [0.4, "rgba(255,255,255,0.55)"], [1, "rgba(255,255,255,0)"]]));
  const glowTex = tex(radialTexture([[0, "rgba(255,255,255,1)"], [0.25, "rgba(255,255,255,0.6)"], [1, "rgba(255,255,255,0)"]]));
  const coneTex = tex(radialTexture([[0, "rgba(255,255,255,0.9)"], [0.7, "rgba(255,255,255,0.25)"], [1, "rgba(255,255,255,0)"]]));
  const baseDash = tex(dashTexture());

  /* ---------------- Lights ---------------- */
  scene.add(new THREE.HemisphereLight(0xd9d3ff, 0x111012, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(-8, 16, 6);
  scene.add(key);

  /* ---------------- Building ---------------- */
  const slabGeo = new THREE.BoxGeometry(SIZE + 0.6, 0.4, SIZE + 0.6);
  slabGeo.translate(0, -0.2, 0);
  const slab = new THREE.Mesh(slabGeo, new THREE.MeshStandardMaterial({ color: C.ink3, roughness: 0.95 }));
  scene.add(slab);
  slab.add(new THREE.LineSegments(new THREE.EdgesGeometry(slabGeo), new THREE.LineBasicMaterial({ color: C.bone, transparent: true, opacity: 0.3 })));

  const grid = new THREE.GridHelper(SIZE, 20, C.bone, C.bone);
  (grid.material as THREE.LineBasicMaterial).transparent = true;
  (grid.material as THREE.LineBasicMaterial).opacity = 0.1;
  (grid.material as THREE.LineBasicMaterial).depthWrite = false;
  grid.position.y = 0.004;
  scene.add(grid);

  // Zone decals (polygonOffset + tiny lift: never z-fight with the slab)
  const zoneMeshes = {} as Record<ZoneId, THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>;
  (Object.keys(ZONES) as ZoneId[]).forEach((id) => {
    const [x, y, w, h] = ZONES[id];
    const geo = new THREE.PlaneGeometry(w * S - 0.1, h * S - 0.1);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: C.ok, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(W([x + w / 2, y + h / 2], 0.01));
    m.renderOrder = 1;
    zoneMeshes[id] = m;
    scene.add(m);
  });

  const wallMesh = (a: P, b: P, h: number, opacity: number, thick = 0.14) => {
    const A = W(a);
    const B = W(b);
    const len = A.distanceTo(B);
    const geo = new THREE.BoxGeometry(len + thick, h, thick);
    geo.translate(0, h / 2, 0);
    const mat = new THREE.MeshStandardMaterial({ color: C.wall, transparent: true, opacity, depthWrite: false, roughness: 0.7 });
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(A).lerp(B, 0.5);
    m.rotation.y = -Math.atan2(B.z - A.z, B.x - A.x);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: C.bone, transparent: true, opacity: 0.4 }));
    m.add(edges);
    m.renderOrder = 3;
    scene.add(m);
    return m;
  };

  INNER_WALLS.forEach(([a, b]) => wallMesh(a, b, WALL_H, 0.28));
  // Outer walls: the ones facing the camera drop to a low cutaway sill.
  const outer = [
    { m: wallMesh([0, 0], [520, 0], WALL_H, 0.3), n: new THREE.Vector3(0, 0, -1) },
    { m: wallMesh([0, 520], [520, 520], WALL_H, 0.3), n: new THREE.Vector3(0, 0, 1) },
    { m: wallMesh([0, 0], [0, 520], WALL_H, 0.3), n: new THREE.Vector3(-1, 0, 0) },
    { m: wallMesh([520, 0], [520, 520], WALL_H, 0.3), n: new THREE.Vector3(1, 0, 0) },
  ];

  const stdMat = (color: THREE.Color | number, extra: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.2, ...extra });
  const box = (w: number, h: number, d: number, mat: THREE.Material, at: THREE.Vector3) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    geo.translate(0, h / 2, 0);
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(at);
    scene.add(m);
    return m;
  };

  // Lobby desk, bodega shelving, server racks
  box(2.4, 1, 0.8, stdMat(0x2c2a31), W([110, 90]));
  box(3.2, 1.8, 0.6, stdMat(0x2c2a31), W([90, 242]));
  box(3.2, 1.8, 0.6, stdMat(0x2c2a31), W([190, 242]));
  const ledMat = new THREE.MeshBasicMaterial({ color: C.ok });
  [335, 375, 415, 455, 495].forEach((x) => {
    const r = box(0.85, 2, 0.95, stdMat(0x1c1b20, { metalness: 0.5 }), W([x, 36]));
    for (let i = 0; i < 4; i++) {
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.02), ledMat);
      led.position.set(0, 0.45 + i * 0.4, 0.48);
      r.add(led);
    }
  });

  /* ---------------- Labels (HTML) ---------------- */
  type Tag = ScenarioId | "all";
  const labelObjs: { obj: CSS2DObject; tag: Tag }[] = [];
  const labelEls: { el: HTMLElement; full: string; short: string }[] = [];
  const label = (text: string, at: THREE.Vector3, tag: Tag, color = "var(--cr-bone-dim)", short = text) => {
    const el = document.createElement("span");
    labelEls.push({ el, full: text, short });
    el.textContent = text;
    el.style.cssText = `font-family:var(--cr-mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:${color};background:color-mix(in srgb,var(--cr-ink) 72%,transparent);border:1px solid var(--cr-line);padding:2px 6px;white-space:nowrap;line-height:1.3`;
    const obj = new CSS2DObject(el);
    obj.position.copy(at);
    scene.add(obj);
    labelObjs.push({ obj, tag });
    return el;
  };
  // Textos traducidos que DigitalTwinLab deja en data-twin3d-labels (src/i18n → lab.scene3d)
  const L = {
    z01: "Z01 · Lobby",
    z02: "Z02 · Warehouse",
    z03: "Z03 · Servers",
    z04: "Z04 · Electrical",
    panel: "220V Panel",
    reader: "Reader L-02",
    ...(JSON.parse(root.dataset.twin3dLabels ?? "{}") as Record<string, string>),
  };
  label(L.z01, W([190, 40], 0.1), "all", undefined, "Z01");
  label(L.z02, W([60, 310], 0.1), "all", undefined, "Z02");
  label(L.z03, W([470, 130], 0.1), "all", undefined, "Z03");
  label(L.z04, W([495, 495], 0.1), "all", undefined, "Z04");
  label(L.panel, W([440, 440], 2.15), "all", "var(--cr-amber)", "220V");
  label("DET-07", W([410, 150], 3), "fire");
  label("CAM-03", W([285, 232], 3), "intruder");
  label(L.reader, W([300, 175], 3.1), "access");
  label("C1", W([150, 110], 1), "power", "var(--cr-amber)");
  label("C2", W([420, 40], 2.4), "power", "var(--cr-amber)");
  label("C3", W([230, 500], 1.3), "power", "var(--cr-amber)");

  /* ---------------- 01 · Fire ---------------- */
  const fire = new THREE.Group();
  scene.add(fire);
  const FIRE_AT: P = [430, 190];
  const fireLight = new THREE.PointLight(C.fire, 0, 9, 1.6);
  fireLight.position.copy(W(FIRE_AT, 1.1));
  scene.add(fireLight);

  const decal = (texture: THREE.Texture, color: THREE.Color, size: number, at: THREE.Vector3, order = 2) => {
    const geo = new THREE.PlaneGeometry(size, size);
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ map: texture, color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    );
    m.position.copy(at);
    m.renderOrder = order;
    return m;
  };
  const fireFloor = decal(glowTex, C.fire, 1, W(FIRE_AT, 0.02));
  fire.add(fireFloor);
  const flames = [0, 1, 2].map((i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: i === 0 ? C.amber : C.fire, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    s.position.copy(W([FIRE_AT[0] + (i - 1) * 12, FIRE_AT[1] + (i % 2) * 10], 0.6));
    fire.add(s);
    return s;
  });

  const detector = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 20), new THREE.MeshBasicMaterial({ color: C.ok }));
  detector.position.copy(W([410, 150], 2.6));
  fire.add(detector);
  const alarmRing = (() => {
    const geo = new THREE.RingGeometry(0.9, 1.05, 48);
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: C.signal, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
    m.position.copy(W([410, 150], 0.03));
    m.renderOrder = 2;
    return m;
  })();
  fire.add(alarmRing);

  const SPRINKLERS: P[] = [[350, 70], [480, 70], [470, 270]];
  const sprinklerHeads = SPRINKLERS.map((p) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), new THREE.MeshBasicMaterial({ color: C.bone }));
    m.position.copy(W(p, 2.6));
    fire.add(m);
    return m;
  });

  const makePoints = (n: number, color: THREE.Color, blending: THREE.Blending) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const mat = new THREE.PointsMaterial({ map: softTex, color, size: 10, transparent: true, opacity: 0, depthWrite: false, blending, sizeAttenuation: true });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    pts.renderOrder = 5;
    fire.add(pts);
    return pts;
  };
  const SMOKE_N = 90;
  const WATER_N = 180;
  const smoke = makePoints(SMOKE_N, new THREE.Color("#8d8892"), THREE.NormalBlending);
  const water = makePoints(WATER_N, C.water, THREE.AdditiveBlending);

  /* ---------------- 02 · Intruder ---------------- */
  const intruder = new THREE.Group();
  scene.add(intruder);
  const CAM: P = [285, 232];
  const camBase = W(CAM, 2.45);
  const cctv = new THREE.Group();
  cctv.position.copy(camBase);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.22), stdMat(0xd8d3cc));
  body.position.x = 0.15;
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 16), new THREE.MeshBasicMaterial({ color: C.ok }));
  lens.rotation.z = Math.PI / 2;
  lens.position.x = 0.42;
  const tilt = new THREE.Group();
  tilt.rotation.z = -0.45;
  tilt.add(body, lens);
  cctv.add(tilt);
  intruder.add(cctv);

  const spot = new THREE.SpotLight(C.ok, 0, 16, 20 * DEG, 0.5, 1.2);
  spot.position.copy(camBase);
  scene.add(spot, spot.target);

  // Visible cone footprint: a sector decal lifted above the floor and clipped to Z02.
  const z02 = ZONES.Z02;
  const clip = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), -W([z02[0], 0]).x),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), W([z02[0] + z02[2], 0]).x),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), -W([0, z02[1]]).z),
    new THREE.Plane(new THREE.Vector3(0, 0, -1), W([0, z02[1] + z02[3]]).z),
  ];
  const coneGroup = new THREE.Group();
  coneGroup.position.copy(W(CAM, 0.03));
  const coneMat = new THREE.MeshBasicMaterial({ map: coneTex, color: C.ok, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, clippingPlanes: clip, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, side: THREE.DoubleSide });
  const coneGeo = new THREE.CircleGeometry(330 * S * 0.92, 40, -20 * DEG, 40 * DEG);
  coneGeo.rotateX(-Math.PI / 2);
  const coneDecal = new THREE.Mesh(coneGeo, coneMat);
  coneDecal.renderOrder = 4;
  coneGroup.add(coneDecal);
  intruder.add(coneGroup);

  const capsule = (color: THREE.Color, emissive = 0.35) => {
    const geo = new THREE.CapsuleGeometry(0.22, 0.75, 4, 12);
    geo.translate(0, 0.6, 0);
    const m = new THREE.Mesh(geo, stdMat(color, { emissive: color, emissiveIntensity: emissive, transparent: true }));
    return m;
  };
  const intr = capsule(C.signal, 0.6);
  intruder.add(intr);
  const intrRing = (() => {
    const geo = new THREE.RingGeometry(0.4, 0.5, 32);
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: C.signal, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
    m.position.y = 0.03;
    m.renderOrder = 2;
    return m;
  })();
  intr.add(intrRing);
  const guard = capsule(C.ok, 0.5);
  intruder.add(guard);
  const routeMat = new THREE.LineDashedMaterial({ color: C.ok, dashSize: 0.3, gapSize: 0.25, transparent: true, opacity: 0 });
  const route = new THREE.Line(new THREE.BufferGeometry(), routeMat);
  intruder.add(route);
  let routeKey = "";

  /* ---------------- 03 · Access ---------------- */
  const access = new THREE.Group();
  scene.add(access);
  const DOOR_HINGE: P = [300, 78];
  const doorLen = 62 * S;
  const door = new THREE.Group();
  door.position.copy(W(DOOR_HINGE));
  const leafGeo = new THREE.BoxGeometry(0.08, 2.2, doorLen - 0.04);
  leafGeo.translate(0, 1.1, doorLen / 2);
  const leaf = new THREE.Mesh(leafGeo, stdMat(0x24344a, { emissive: C.blue, emissiveIntensity: 0.12, transparent: true, opacity: 0.9 }));
  leaf.add(new THREE.LineSegments(new THREE.EdgesGeometry(leafGeo), new THREE.LineBasicMaterial({ color: C.blue })));
  door.add(leaf);
  scene.add(door); // the door is part of the building, visible on every tab

  const readerPos = W([296, 160], 1.3);
  const readerMat = new THREE.MeshBasicMaterial({ color: C.blue });
  const reader = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.18), readerMat);
  reader.position.copy(readerPos);
  scene.add(reader);
  const readerGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: C.blue, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
  readerGlow.position.copy(readerPos);
  access.add(readerGlow);
  const readerLight = new THREE.PointLight(C.blue, 0, 4, 1.5);
  readerLight.position.copy(readerPos).add(new THREE.Vector3(-0.3, 0, 0));
  scene.add(readerLight);
  const personA = capsule(C.bone, 0.15);
  const personB = capsule(C.blue, 0.45);
  access.add(personA, personB);

  /* ---------------- 04 · Power ---------------- */
  const power = new THREE.Group();
  scene.add(power);
  const panelMat = stdMat(0x2a2830, { emissive: C.amber, emissiveIntensity: 0.18 });
  box(1.1, 1.8, 0.45, panelMat, W([440, 440]));
  const panelLamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 10), new THREE.MeshBasicMaterial({ color: C.amber }));
  panelLamp.position.copy(W([440, 440], 1.95));
  scene.add(panelLamp);
  const nodeMats = {
    c1: new THREE.MeshStandardMaterial({ color: 0x2a2830, emissive: C.amber, emissiveIntensity: 0.4 }),
    c3: new THREE.MeshStandardMaterial({ color: 0x2a2830, emissive: C.amber, emissiveIntensity: 0.4 }),
  };
  box(0.5, 0.5, 0.5, nodeMats.c1, W([150, 110]));
  box(1.1, 0.8, 0.45, nodeMats.c3, W([230, 500]));

  interface Cable { base: THREE.Mesh; flow: THREE.Mesh<THREE.TubeGeometry, THREE.MeshBasicMaterial>; map: THREE.Texture; speed: number }
  const cables = {} as Record<keyof typeof CABLES, Cable>;
  (Object.keys(CABLES) as (keyof typeof CABLES)[]).forEach((id) => {
    const path = new THREE.CurvePath<THREE.Vector3>();
    const pts = CABLES[id].map((p) => W(p, 0.1));
    for (let i = 1; i < pts.length; i++) path.add(new THREE.LineCurve3(pts[i - 1], pts[i]));
    const len = path.getLength();
    const segs = Math.max(24, Math.round(len * 6));
    const base = new THREE.Mesh(new THREE.TubeGeometry(path, segs, 0.055, 6, false), new THREE.MeshBasicMaterial({ color: C.dim }));
    const map = tex(baseDash.clone());
    map.wrapS = THREE.RepeatWrapping;
    map.repeat.set(len / 0.9, 1);
    map.needsUpdate = true;
    const flow = new THREE.Mesh(
      new THREE.TubeGeometry(path, segs, 0.08, 6, false),
      new THREE.MeshBasicMaterial({ map, color: id === "c3b" ? C.ok : C.amber, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    flow.renderOrder = 6;
    power.add(base, flow);
    cables[id] = { base, flow, map, speed: 1.2 };
  });
  const tripRing = (() => {
    const geo = new THREE.RingGeometry(0.9, 1.05, 48);
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: C.signal, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
    m.position.copy(W([440, 440], 0.03));
    m.renderOrder = 2;
    return m;
  })();
  power.add(tripRing);

  const groups: Record<ScenarioId, THREE.Group> = { fire, intruder, access, power };

  /* ---------------- Camera fit ---------------- */
  const corners: THREE.Vector3[] = [];
  for (const x of [-SIZE / 2 - 0.3, SIZE / 2 + 0.3]) for (const y of [-0.4, 3.1]) for (const z of [-SIZE / 2 - 0.3, SIZE / 2 + 0.3]) corners.push(new THREE.Vector3(x, y, z));
  const v = new THREE.Vector3();
  let vw = 1;
  let vh = 1;
  const fit = () => {
    camera.updateMatrixWorld();
    const inv = camera.matrixWorldInverse;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const c of corners) {
      v.copy(c).applyMatrix4(inv);
      minX = Math.min(minX, v.x);
      maxX = Math.max(maxX, v.x);
      minY = Math.min(minY, v.y);
      maxY = Math.max(maxY, v.y);
    }
    const aspect = vw / vh;
    let cw = (maxX - minX) * 1.06;
    let ch = (maxY - minY) * 1.1;
    if (cw / ch > aspect) ch = cw / aspect;
    else cw = ch * aspect;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2 + ch * 0.03; // leave room for the status chip
    camera.left = cx - cw / 2;
    camera.right = cx + cw / 2;
    camera.top = cy + ch / 2;
    camera.bottom = cy - ch / 2;
    camera.updateProjectionMatrix();
    return vh / ch; // CSS px per metre
  };

  /* ---------------- Frame ---------------- */
  let state: DrawDetail | null = null;
  let az = AZIMUTH[(root.dataset.scenario as ScenarioId) ?? "fire"] ?? 45;
  let prev = performance.now();
  const zoneColor: Record<Exclude<ZoneState, "">, THREE.Color> = { alert: C.signal, warn: C.amber, info: C.water, ok: C.ok, blue: C.blue };
  const place = (m: THREE.Object3D, p: P) => m.position.copy(W(p));
  const setOpacity = (m: THREE.Mesh, o: number) => {
    const mat = m.material as THREE.MeshStandardMaterial;
    mat.opacity = o;
    m.visible = o > 0.01;
  };

  const frame = () => {
    const now = performance.now();
    const dt = Math.min(0.1, (now - prev) / 1000);
    prev = now;
    const time = now / 1000;
    const id = (state?.scenario ?? (root.dataset.scenario as ScenarioId)) || "fire";
    const t = state?.t ?? 0;
    const sim = state?.scenario === id ? state.sim : {};
    const zones = state?.scenario === id ? state.zones : {};

    // Camera: ease toward the tab's azimuth, with a slow sway
    const target = AZIMUTH[id];
    az += (target - az) * (1 - Math.exp(-dt * 2.6));
    const a = (az + Math.sin(time * 0.25) * 3) * DEG;
    const dist = 60;
    camera.position.set(Math.cos(a) * Math.cos(ELEVATION) * dist, Math.sin(ELEVATION) * dist, Math.sin(a) * Math.cos(ELEVATION) * dist);
    camera.lookAt(0, 0.8, 0);
    const ppm = fit();

    // Cutaway outer walls facing the camera
    const camDir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    outer.forEach(({ m, n }) => {
      const facing = n.dot(camDir) > 0.1;
      const k = 1 - Math.exp(-dt * 6);
      m.scale.y += ((facing ? 0.14 : 1) - m.scale.y) * k;
    });

    (Object.keys(groups) as ScenarioId[]).forEach((g) => (groups[g].visible = g === id));
    labelObjs.forEach(({ obj, tag }) => (obj.visible = tag === "all" || tag === id));

    // Zone tints
    (Object.keys(zoneMeshes) as ZoneId[]).forEach((z) => {
      const st = zones[z] ?? "";
      const m = zoneMeshes[z];
      if (!st) {
        m.material.opacity += (0 - m.material.opacity) * 0.2;
      } else {
        m.material.color.copy(zoneColor[st]);
        const goal = st === "alert" ? 0.2 + 0.14 * (0.5 + 0.5 * Math.sin(time * 7)) : 0.2;
        m.material.opacity += (goal - m.material.opacity) * 0.35;
      }
      m.visible = m.material.opacity > 0.005;
    });

    // Lights default off; each tab turns on its own (no shader recompiles on tab switch)
    fireLight.intensity = 0;
    spot.intensity = 0;
    readerLight.intensity = 0;

    // Door + reader are shared building parts
    const open = id === "access" ? num(sim.open) : 0;
    door.rotation.y = open * 78 * DEG;
    const denied = id === "access" && sim.denied === true;
    const granted = id === "access" && sim.granted === true;
    const scanning = id === "access" && sim.scanning === true;
    readerMat.color.copy(denied ? C.signal : granted ? C.ok : C.blue);

    if (id === "fire") {
      const fireK = num(sim.fireK);
      const smokeK = num(sim.smokeK);
      const waterK = num(sim.waterK);
      const flick = 0.75 + 0.25 * Math.sin(time * 23) * Math.sin(time * 7.3 + 1);
      fireLight.intensity = fireK * 38 * flick;
      fireFloor.scale.setScalar(Math.max(0.001, fireK * 7));
      (fireFloor.material as THREE.MeshBasicMaterial).opacity = fireK * 0.9;
      flames.forEach((s, i) => {
        const k = fireK * (1.4 + 0.5 * i) * (0.85 + 0.15 * Math.sin(time * (11 + i * 4) + i));
        s.scale.set(k * 0.9, k * 1.5, 1);
        s.position.y = 0.2 + k * 0.55;
        s.material.opacity = Math.min(1, fireK * 1.2);
        s.visible = fireK > 0.01;
      });
      const det = String(sim.det ?? "ok");
      (detector.material as THREE.MeshBasicMaterial).color.copy(det === "signal" ? C.signal : det === "amber" ? C.amber : C.ok);
      const ringK = fract(time * 0.8);
      alarmRing.scale.setScalar(0.4 + ringK * 3.2);
      (alarmRing.material as THREE.MeshBasicMaterial).opacity = sim.alarm === true ? (1 - ringK) * 0.9 : 0;
      sprinklerHeads.forEach((h) => (h.material as THREE.MeshBasicMaterial).color.copy(sim.spraying === true ? C.water : C.bone));

      const origin = W(FIRE_AT);
      const sp = smoke.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < SMOKE_N; i++) {
        const life = fract(time * 0.28 + hash(i));
        const ang = hash(i + 50) * Math.PI * 2;
        const r = 0.2 + life * (0.6 + hash(i + 90) * 1.6);
        sp.setXYZ(i, origin.x + Math.cos(ang) * r, 0.4 + life * 3.2, origin.z + Math.sin(ang) * r);
      }
      sp.needsUpdate = true;
      smoke.material.opacity = smokeK * 0.55;
      smoke.material.size = 1.2 * ppm;
      smoke.visible = smokeK > 0.01;

      const wp = water.geometry.getAttribute("position") as THREE.BufferAttribute;
      const per = WATER_N / SPRINKLERS.length;
      for (let i = 0; i < WATER_N; i++) {
        const head = W(SPRINKLERS[Math.floor(i / per)], 2.55);
        const life = fract(time * 1.3 + hash(i + 7));
        const ang = hash(i + 13) * Math.PI * 2;
        const r = life * (0.5 + hash(i + 29) * 1.6);
        wp.setXYZ(i, head.x + Math.cos(ang) * r, head.y - life * life * 2.5, head.z + Math.sin(ang) * r);
      }
      wp.needsUpdate = true;
      water.material.opacity = waterK * 0.9;
      water.material.size = Math.max(2, 0.14 * ppm);
      water.visible = waterK > 0.01;
    }

    if (id === "intruder") {
      const ang = num(sim.angle, 148) * DEG;
      const alert = sim.detected === true && sim.resolved !== true;
      const col = alert ? C.signal : C.ok;
      coneGroup.rotation.y = -ang;
      coneMat.color.copy(col);
      coneMat.opacity = alert ? 0.7 : 0.5;
      cctv.rotation.y = -ang;
      (lens.material as THREE.MeshBasicMaterial).color.copy(col);
      spot.color.copy(col);
      spot.intensity = 140;
      spot.target.position.copy(W(CAM)).add(new THREE.Vector3(Math.cos(ang) * 6, 0, Math.sin(ang) * 6));
      spot.target.updateMatrixWorld();

      place(intr, pt(sim.intr, [4, 470]));
      setOpacity(intr, num(sim.intrOpacity));
      (intr.material as THREE.MeshStandardMaterial).color.copy(sim.resolved === true ? C.dim : C.signal);
      (intr.material as THREE.MeshStandardMaterial).emissive.copy(sim.resolved === true ? C.dim : C.signal);
      const rk = fract(time * 1.2);
      intrRing.scale.setScalar(1 + rk * 2.5);
      (intrRing.material as THREE.MeshBasicMaterial).opacity = alert ? 1 - rk : 0;
      place(guard, pt(sim.guard, [120, 120]));

      const routePts = Array.isArray(sim.route) ? (sim.route as P[]) : [];
      const key = JSON.stringify(routePts);
      if (key !== routeKey && routePts.length > 1) {
        routeKey = key;
        route.geometry.dispose();
        route.geometry = new THREE.BufferGeometry().setFromPoints(routePts.map((p) => W(p, 0.05)));
        route.computeLineDistances();
      }
      routeMat.opacity += ((sim.routeOn === true ? 0.9 : 0) - routeMat.opacity) * 0.25;
    }

    if (id === "access") {
      const glowCol = denied ? C.signal : granted ? C.ok : C.blue;
      const pulse = scanning ? 0.7 + 0.3 * Math.sin(time * 12) : denied || granted ? 1 : 0.35;
      readerGlow.material.color.copy(glowCol);
      readerGlow.material.opacity = pulse;
      readerGlow.scale.setScalar(0.4 + pulse * 0.6);
      readerLight.color.copy(glowCol);
      readerLight.intensity = pulse * 6;
      place(personA, pt(sim.aPos, [40, 190]));
      setOpacity(personA, num(sim.aOpacity));
      place(personB, pt(sim.bPos, [40, 190]));
      setOpacity(personB, num(sim.bOpacity));
    }

    const tripped = id === "power" && sim.tripped === true;
    (panelLamp.material as THREE.MeshBasicMaterial).color.copy(tripped ? C.signal : C.amber);
    // Power hardware only glows on its own tab
    panelMat.emissiveIntensity = id === "power" ? 0.18 : 0.03;
    if (id !== "power") {
      nodeMats.c1.emissive.copy(C.dim);
      nodeMats.c3.emissive.copy(C.dim);
    } else nodeMats.c1.emissive.copy(C.amber);
    if (id === "power") {
      const c3 = String(sim.c3 ?? "");
      const backup = sim.backup === true;
      const set = (c: Cable, state: "on" | "hot" | "off", color: THREE.Color) => {
        c.flow.visible = state !== "off";
        c.flow.material.color.copy(state === "hot" ? C.signal : color);
        (c.base.material as THREE.MeshBasicMaterial).color.copy(state === "hot" ? C.signal : C.dim).multiplyScalar(state === "hot" ? 0.6 : 1);
        c.speed = state === "hot" ? 5.5 : 1.2;
        c.map.offset.x -= dt * c.speed;
      };
      set(cables.c1, "on", C.amber);
      set(cables.c2, "on", C.amber);
      set(cables.c3, c3 === "hot" ? "hot" : c3 === "off" ? "off" : "on", C.amber);
      set(cables.c3b, backup ? "on" : "off", C.ok);
      nodeMats.c3.emissive.copy(c3 === "hot" ? C.signal : c3 === "off" && !backup ? C.dim : backup ? C.ok : C.amber);
      const rk = fract(time * 1.1);
      tripRing.scale.setScalar(0.5 + rk * 3);
      (tripRing.material as THREE.MeshBasicMaterial).opacity = sim.trip === true ? 1 - rk : 0;
    }

    // Rack LEDs go red while the server room is burning
    ledMat.color.copy(id === "fire" && num(sim.fireK) > 0.2 ? C.signal : C.ok);

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  };

  const resize = () => {
    vw = Math.max(1, mount.clientWidth);
    vh = Math.max(1, mount.clientHeight);
    renderer.setPixelRatio(mobile() ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(vw, vh, false);
    labelRenderer.setSize(vw, vh);
    const small = vw < 520;
    labelEls.forEach(({ el, full, short }) => {
      el.textContent = small ? short : full;
      el.style.fontSize = small ? "8.5px" : "10px";
      el.style.padding = small ? "1px 4px" : "2px 6px";
    });
    frame();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(mount);

  const onDraw = (e: Event) => {
    state = (e as CustomEvent<DrawDetail>).detail;
    frame();
  };
  root.addEventListener("lab:draw", onDraw);

  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    ro.disconnect();
    root.removeEventListener("lab:draw", onDraw);
    renderer.domElement.removeEventListener("webglcontextlost", onLost);
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      mats.forEach((mat) => mat.dispose());
    });
    textures.forEach((t) => t.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
    labelRenderer.domElement.remove();
    root.classList.remove("is-3d");
  };
  // Losing the GPU context falls back to the CSS plan
  const onLost = (e: Event) => {
    e.preventDefault();
    dispose();
  };
  renderer.domElement.addEventListener("webglcontextlost", onLost);

  resize();
  return dispose;
}
