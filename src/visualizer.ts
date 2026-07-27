import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type HolePathPoint = {
  depth: number;
  position: THREE.Vector3;
};

export type HoleModel = {
  holeId: string;
  collar: CollarRow;
  path: HolePathPoint[];
  assays: AssayRow[];
};

export type CollarRow = {
  hole_id: string;
  x: number;
  y: number;
  z: number;
  total_depth: number;
};

export type SurveyRow = {
  hole_id: string;
  depth: number;
  azimuth: number;
  dip: number;
};

export type AssayRow = {
  hole_id: string;
  from_depth: number;
  to_depth: number;
  lithology: string;
  cu_pct: number;
  color_hex: string;
};

export type DrillholeInputSet = {
  collarCsv: string;
  surveyCsv: string;
  assayCsv: string;
};

let applyVisualizerTheme: (theme: 'light' | 'dark') => void = () => {};

export function setApplyVisualizerTheme(fn: (theme: 'light' | 'dark') => void) {
  applyVisualizerTheme = fn;
}

export function getApplyVisualizerTheme() {
  return applyVisualizerTheme;
}

export function createDrillholeScene(models: HoleModel[]) {
  const mount = document.querySelector<HTMLDivElement>('#visualizer');

  if (!mount || models.length === 0) {
    applyVisualizerTheme = () => {};
    return () => {};
  }

  mount.innerHTML = '';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 2000);
  camera.position.set(75, 65, 95);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const getVisualizerBackground = (theme: 'light' | 'dark') => theme === 'dark' ? '#111118' : '#e5ebf5';
  const activeTheme = document.body.dataset.theme === 'dark' ? 'dark' : 'light';
  renderer.setClearColor(getVisualizerBackground(activeTheme), 1);
  mount.append(renderer.domElement);

  applyVisualizerTheme = (theme: 'light' | 'dark') => {
    renderer.setClearColor(getVisualizerBackground(theme), 1);
  };

  const controls = new OrbitControls(camera, renderer.domElement);
  const reducedMotion = isReducedMotionPreferred();
  controls.enableDamping = !reducedMotion;
  controls.dampingFactor = reducedMotion ? 0 : 0.06;
  controls.target.set(0, 0, 0);

  const ambient = new THREE.AmbientLight(0xffffff, 1.0);
  const directional = new THREE.DirectionalLight(0xffffff, 1.7);
  directional.position.set(90, 120, 60);
  scene.add(ambient, directional);

  const allPoints = models.flatMap((model) => model.path.map((point) => point.position));
  const bounds = new THREE.Box3();
  allPoints.forEach((point) => bounds.expandByPoint(point));
  const size = bounds.getSize(new THREE.Vector3());
  const maxGridExtent = Math.max(size.x, size.z, 100);

  const grid = new THREE.GridHelper(maxGridExtent * 1.6, 24, 0x3a3f52, 0x24283b);
  grid.position.y = bounds.min.y - 2;
  scene.add(grid);

  for (const model of models) {
    const trajectoryPoints = model.path.map((point) => point.position);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(trajectoryPoints);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xaab4d6, transparent: true, opacity: 0.8 });
    const centerLine = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(centerLine);

    const collarMarker = new THREE.Mesh(
      new THREE.SphereGeometry(1.4, 18, 12),
      new THREE.MeshStandardMaterial({ color: 0xd5ddff, emissive: 0x131629, metalness: 0.1, roughness: 0.5 })
    );
    collarMarker.position.copy(trajectoryPoints[0]);
    scene.add(collarMarker);

    const label = makeTextSprite(model.holeId);
    label.position.copy(trajectoryPoints[0]).add(new THREE.Vector3(0, 4.2, 0));
    scene.add(label);

    for (const interval of model.assays) {
      const from = Math.max(0, interval.from_depth);
      const to = Math.min(model.collar.total_depth, interval.to_depth);

      if (to <= from) {
        continue;
      }

      const pathSegment = samplePathSegment(model.path, from, to, 4);
      const radius = 0.8 + interval.cu_pct * 0.35;

      for (let i = 0; i < pathSegment.length - 1; i += 1) {
        const segment = makeCylinderBetween(pathSegment[i], pathSegment[i + 1], radius, interval.color_hex);
        scene.add(segment);
      }
    }
  }

  const resize = () => {
    const { clientWidth, clientHeight } = mount;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
  };

  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(mount);

  let frameId = 0;
  const renderScene = () => {
    renderer.render(scene, camera);
  };

  if (reducedMotion) {
    controls.addEventListener('change', renderScene);
    renderScene();
  }

  const animate = () => {
    controls.update();
    renderScene();
    frameId = window.requestAnimationFrame(animate);
  };

  if (!reducedMotion) {
    animate();
  }

  return () => {
    applyVisualizerTheme = () => {};
    observer.disconnect();
    if (frameId) {
      window.cancelAnimationFrame(frameId);
    }
    if (reducedMotion) {
      controls.removeEventListener('change', renderScene);
    }
    controls.dispose();
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }

      const material = mesh.material;
      if (Array.isArray(material)) {
        material.forEach((item) => item.dispose());
      } else if (material) {
        material.dispose();
      }
    });
    renderer.dispose();
    mount.innerHTML = '';
  };
}

export function makeTextSprite(text: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Unable to create canvas context for label sprite.');
  }

  context.fillStyle = 'rgba(17,17,24,0.85)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#7ea7ff';
  context.lineWidth = 4;
  context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
  context.fillStyle = '#f3f7ff';
  context.font = 'bold 34px Inter, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(13, 4.8, 1);
  return sprite;
}

function makeCylinderBetween(start: THREE.Vector3, end: THREE.Vector3, radius: number, colorHex: string) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();

  const geometry = new THREE.CylinderGeometry(radius, radius, length, 16, 1, false);
  const color = new THREE.Color(colorHex);
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color.clone().multiplyScalar(0.14),
    metalness: 0.08,
    roughness: 0.42
  });

  const segment = new THREE.Mesh(geometry, material);
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  segment.position.copy(midpoint);
  segment.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());

  return segment;
}

function samplePathSegment(path: HolePathPoint[], fromDepth: number, toDepth: number, step = 4) {
  const points: THREE.Vector3[] = [];

  let depth = fromDepth;
  while (depth < toDepth) {
    points.push(interpolatePathPoint(path, depth));
    depth = Math.min(depth + step, toDepth);
    if (depth === toDepth) {
      points.push(interpolatePathPoint(path, toDepth));
      break;
    }
  }

  if (points.length < 2) {
    points.push(interpolatePathPoint(path, fromDepth), interpolatePathPoint(path, toDepth));
  }

  return points;
}

function interpolatePathPoint(path: HolePathPoint[], depth: number) {
  if (depth <= path[0].depth) {
    return path[0].position.clone();
  }

  const finalPoint = path[path.length - 1];
  if (depth >= finalPoint.depth) {
    return finalPoint.position.clone();
  }

  for (let i = 0; i < path.length - 1; i += 1) {
    const current = path[i];
    const next = path[i + 1];

    if (depth >= current.depth && depth <= next.depth) {
      const range = next.depth - current.depth;
      const t = range === 0 ? 0 : (depth - current.depth) / range;
      return current.position.clone().lerp(next.position, t);
    }
  }

  return finalPoint.position.clone();
}

export function buildHoleModels(inputs: DrillholeInputSet): HoleModel[] {
  const collars = parseCollars(inputs.collarCsv);
  const surveys = parseSurveyRows(inputs.surveyCsv);
  const assays = parseAssayRows(inputs.assayCsv);

  const center = computeCollarCenter(collars);
  const surveyByHole = groupBy(surveys, (row) => row.hole_id);
  const assayByHole = groupBy(assays, (row) => row.hole_id);

  const models: HoleModel[] = [];

  for (const collar of collars) {
    const holeSurvey = (surveyByHole.get(collar.hole_id) ?? []).slice().sort((a, b) => a.depth - b.depth);
    const holeAssays = (assayByHole.get(collar.hole_id) ?? []).slice().sort((a, b) => a.from_depth - b.from_depth);

    if (holeSurvey.length === 0 || holeAssays.length === 0) {
      continue;
    }

    const collarPosition = mapCollarToThree(collar, center);
    const path = buildTrajectory(collarPosition, holeSurvey, collar.total_depth);

    if (path.length < 2) {
      continue;
    }

    models.push({
      holeId: collar.hole_id,
      collar,
      path,
      assays: holeAssays
    });
  }

  return models;
}

function buildTrajectory(collar: THREE.Vector3, surveyRows: SurveyRow[], totalDepth: number) {
  const stations = normalizeSurveyRows(surveyRows, totalDepth);
  const points: HolePathPoint[] = [{ depth: 0, position: collar.clone() }];

  const current = collar.clone();
  const stepSize = 2;

  for (let i = 0; i < stations.length - 1; i += 1) {
    const from = stations[i];
    const to = stations[i + 1];

    if (to.depth <= from.depth) {
      continue;
    }

    let depth = from.depth;
    while (depth < to.depth) {
      const nextDepth = Math.min(depth + stepSize, to.depth);
      const midpointDepth = (depth + nextDepth) / 2;
      const factor = (midpointDepth - from.depth) / (to.depth - from.depth);
      const azimuth = interpolateAngle(from.azimuth, to.azimuth, factor);
      const dip = lerp(from.dip, to.dip, factor);
      const distance = nextDepth - depth;

      current.add(surveyStep(distance, azimuth, dip));
      points.push({ depth: nextDepth, position: current.clone() });
      depth = nextDepth;
    }
  }

  return points;
}

function normalizeSurveyRows(rows: SurveyRow[], totalDepth: number) {
  const sorted = rows.slice().sort((a, b) => a.depth - b.depth);
  const normalized = sorted.slice();

  if (normalized[0].depth > 0) {
    normalized.unshift({ ...normalized[0], depth: 0 });
  }

  const last = normalized[normalized.length - 1];
  if (last.depth < totalDepth) {
    normalized.push({ ...last, depth: totalDepth });
  }

  return normalized;
}

function surveyStep(distance: number, azimuthDegrees: number, dipDegrees: number) {
  const azimuth = THREE.MathUtils.degToRad(azimuthDegrees);
  const dip = THREE.MathUtils.degToRad(dipDegrees);

  const dx = distance * Math.cos(dip) * Math.sin(azimuth);
  const dy = distance * Math.sin(dip);
  const dz = distance * Math.cos(dip) * Math.cos(azimuth);

  return new THREE.Vector3(dx, dy, -dz);
}

function interpolateAngle(start: number, end: number, factor: number) {
  let delta = (end - start + 540) % 360 - 180;
  if (delta < -180) {
    delta += 360;
  }
  return start + delta * factor;
}

function mapCollarToThree(collar: CollarRow, center: { x: number; y: number; z: number }) {
  return new THREE.Vector3(
    collar.x - center.x,
    collar.z - center.z,
    -(collar.y - center.y)
  );
}

function computeCollarCenter(collars: CollarRow[]) {
  const xValues = collars.map((row) => row.x);
  const yValues = collars.map((row) => row.y);
  const zValues = collars.map((row) => row.z);

  return {
    x: (Math.min(...xValues) + Math.max(...xValues)) / 2,
    y: (Math.min(...yValues) + Math.max(...yValues)) / 2,
    z: (Math.min(...zValues) + Math.max(...zValues)) / 2
  };
}

export function buildLithologyLegend(models: HoleModel[]) {
  const map = new Map<string, { lithology: string; color: string; maxCu: number; intervalCount: number }>();

  for (const model of models) {
    for (const assay of model.assays) {
      const existing = map.get(assay.lithology);
      if (existing) {
        existing.maxCu = Math.max(existing.maxCu, assay.cu_pct);
        existing.intervalCount += 1;
      } else {
        map.set(assay.lithology, {
          lithology: assay.lithology,
          color: assay.color_hex,
          maxCu: assay.cu_pct,
          intervalCount: 1
        });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.maxCu - a.maxCu);
}

function parseCollars(csv: string): CollarRow[] {
  return parseCSV(csv).map((row) => ({
    hole_id: row.hole_id,
    x: parseNumber(row.x),
    y: parseNumber(row.y),
    z: parseNumber(row.z),
    total_depth: parseNumber(row.total_depth)
  }));
}

function parseSurveyRows(csv: string): SurveyRow[] {
  return parseCSV(csv).map((row) => ({
    hole_id: row.hole_id,
    depth: parseNumber(row.depth),
    azimuth: parseNumber(row.azimuth),
    dip: parseNumber(row.dip)
  }));
}

function parseAssayRows(csv: string): AssayRow[] {
  return parseCSV(csv).map((row) => ({
    hole_id: row.hole_id,
    from_depth: parseNumber(row.from_depth),
    to_depth: parseNumber(row.to_depth),
    lithology: row.lithology,
    cu_pct: parseNumber(row.cu_pct),
    color_hex: row.color_hex
  }));
}

function parseCSV(csv: string) {
  if (!csv.trim()) {
    throw new Error('CSV input cannot be empty.');
  }

  const lines = csv.trim().split(/\r?\n/);
  const header = lines[0].split(',').map((cell) => cell.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(',').map((cell) => cell.trim());
    const row: Record<string, string> = {};

    header.forEach((key, index) => {
      row[key] = values[index] ?? '';
    });

    return row;
  });
}

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Unable to parse numeric value: ${value}`);
  }

  return parsed;
}

function groupBy<T>(items: T[], keySelector: (item: T) => string) {
  const map = new Map<string, T[]>();

  for (const item of items) {
    const key = keySelector(item);
    const group = map.get(key);

    if (group) {
      group.push(item);
    } else {
      map.set(key, [item]);
    }
  }

  return map;
}

function lerp(start: number, end: number, factor: number) {
  return start + (end - start) * factor;
}

function isReducedMotionPreferred() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
