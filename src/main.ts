import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type SkillGroup = {
  title: string;
  items: string[];
};

type ResumeEntry = {
  title: string;
  organization: string;
  dates: string;
  bullets: string[];
};

type ProjectEntry = {
  title: string;
  stack: string;
  dates: string;
  description: string;
};

type CollarRow = {
  hole_id: string;
  x: number;
  y: number;
  z: number;
  total_depth: number;
};

type SurveyRow = {
  hole_id: string;
  depth: number;
  azimuth: number;
  dip: number;
};

type AssayRow = {
  hole_id: string;
  from_depth: number;
  to_depth: number;
  lithology: string;
  cu_pct: number;
  color_hex: string;
};

type HolePathPoint = {
  depth: number;
  position: THREE.Vector3;
};

type HoleModel = {
  holeId: string;
  collar: CollarRow;
  path: HolePathPoint[];
  assays: AssayRow[];
};

const COLLAR_CSV = `hole_id,x,y,z,total_depth
DH001,500.0,1200.0,250.0,150.0
DH002,580.0,1220.0,255.0,180.0`;

const SURVEY_CSV = `hole_id,depth,azimuth,dip
DH001,0.0,0.0,-90.0
DH001,75.0,5.0,-88.0
DH001,150.0,12.0,-85.0
DH002,0.0,135.0,-60.0
DH002,90.0,138.0,-58.0
DH002,180.0,142.0,-55.0`;

const ASSAY_CSV = `hole_id,from_depth,to_depth,lithology,cu_pct,color_hex
DH001,0.0,25.0,Overburden,0.02,#8B5A2B
DH001,25.0,85.0,Granite,0.15,#CCCCCC
DH001,85.0,120.0,Copper_Porphyry,1.45,#FF4500
DH001,120.0,150.0,Basalt,0.08,#333333
DH002,0.0,15.0,Overburden,0.01,#8B5A2B
DH002,15.0,70.0,Schist,0.22,#708090
DH002,70.0,140.0,Copper_Porphyry,2.10,#FF4500
DH002,140.0,180.0,Granite,0.12,#CCCCCC`;

const skillGroups: SkillGroup[] = [
  {
    title: 'Programming',
    items: ['Python', 'C / C++', 'JavaScript & Node.js', 'TypeScript', 'React.js & React Native', 'Bash', 'Java (JVM & Android)']
  },
  {
    title: 'Data & Analytics',
    items: ['Postgres, MySQL, MariaDB, SQLite', 'T-SQL / SQL Server', 'MongoDB & Firebase', 'SQLAlchemy ORM', 'ODBC, JDBC, OLAP, Oracle', 'R, Tableau, Power BI, Excel']
  },
  {
    title: 'Platforms & Tooling',
    items: ['Docker, Vagrant, Ansible', 'Jenkins, Apache, SonarQube', 'GitHub & GitLab', 'VirtualBox / VMware', 'Wireshark & TCPDump', 'npm, Yarn, pnpm, Webpack, Travis CI']
  }
];

const experience: ResumeEntry[] = [
  {
    title: 'Software Engineer',
    organization: 'Imdex Limited',
    dates: 'Aug 2022 – Present',
    bullets: [
      'Build software that helps technical teams work with operational and geological data in mining workflows.',
      'Translate complex drillhole information into product-ready interfaces and visualization concepts for faster interpretation.',
      'Iterating on a TypeScript + Three.js drillhole visualizer that highlights inferred mineral intervals inspired by public Flin Flon exploration data.'
    ]
  },
  {
    title: 'Back End Developer',
    organization: 'Epic Safety',
    dates: 'Jul 2021 – Aug 2022',
    bullets: [
      'Developed a backend API for collating and presenting IoT device data output.',
      'Generated OpenAPI documentation with tsoa, hosted services on AWS, and used Postgres for persistence.',
      'Integrated third-party APIs for accounting, device management, and account workflows.'
    ]
  },
  {
    title: 'Full Stack Web Developer',
    organization: 'Edufunder Technologies Inc.',
    dates: 'Mar 2020 – May 2021',
    bullets: [
      'Implemented features on a mobile-friendly tuition crowdfunding platform using React, Node.js, MySQL, and AWS Elastic Beanstalk.',
      'Added Stripe payment processing and automated deployment via GitHub Actions.',
      'Integrated HubSpot marketing workflows for customized tracking and mailing lists.'
    ]
  },
  {
    title: 'Product Support Engineer iXp Intern',
    organization: 'SAP',
    dates: 'May 2019 – Dec 2019',
    bullets: [
      'Supported SAP Web Intelligence and BI Semantic Layer tooling for enterprise customers.',
      'Troubleshot issues through structured analysis, screen sharing, and knowledge-base article creation.',
      'Finished 2nd in the annual intern hackathon with a sustainability-focused React app concept for SAP clients.'
    ]
  },
  {
    title: 'IT Services Proctor',
    organization: 'BCIT',
    dates: 'Jun 2018 – Jun 2019',
    bullets: [
      'Provided front-line IT support in a ticketing environment.',
      'Maintained computer labs with course-specific software and coordinated event support with AV Services.',
      'Patched network drops and supported day-to-day campus technology operations.'
    ]
  }
];

const personalProjects: ProjectEntry[] = [
  {
    title: 'Linked Lists',
    stack: 'Java & C++',
    dates: 'Jun 2018 – Sep 2018',
    description: 'Built doubly linked lists with sentinel nodes in Java and singly linked lists with bubble sort in C++.'
  },
  {
    title: 'Decision Trees',
    stack: 'C++',
    dates: 'Oct 2018 – Dec 2018',
    description: 'Created a self-balancing AA tree and implemented decision-tree logic using the C4.5 algorithm.'
  },
  {
    title: 'Automated Data Scraping',
    stack: 'Node.js',
    dates: 'Oct 2021',
    description: 'Scheduled Puppeteer flows to log in, navigate, download content, and save organized output files.'
  }
];

const academicProjects: ProjectEntry[] = [
  {
    title: 'Jenkins Pipeline',
    stack: 'Enterprise System Integration',
    dates: 'Jan 2020 – May 2020',
    description: 'Built a prototype Azure CI/CD pipeline integrating Jenkins, SonarQube, Nexus, Maven, GitHub, and GitLab for Java and Python repositories.'
  },
  {
    title: 'Virtual Network',
    stack: 'Principles of Enterprise Networking',
    dates: 'Sep 2018 – Nov 2018',
    description: 'Configured a CentOS VM network with multiple routers, IPv6, dynamic routing, DHCP, DNS, IPTables, and httpd.'
  },
  {
    title: 'RESTful API and Tkinter GUI',
    stack: 'Object Oriented Programming',
    dates: 'Nov 2018',
    description: 'Developed a sensor logging REST API and a Tkinter MVC front end for interacting with the service.'
  }
];

const holeModels = buildHoleModels();
const lithologyLegend = buildLithologyLegend(holeModels);

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App container not found.');
}

app.innerHTML = `
  <main class="page">
    <section class="hero">
      <div class="hero-top">
        <div>
          <div class="eyebrow">Resume Portfolio</div>
          <h1>Taylor Alfreds</h1>
        </div>
        <button class="theme-toggle" type="button" aria-label="Toggle light and dark mode">Toggle theme</button>
      </div>
      <p class="summary">
        Software engineer with a background spanning data-heavy backend systems, customer-facing product work, and infrastructure tooling.
        This TypeScript portfolio condenses resume highlights and now includes a CSV-driven Three.js drillhole prototype.
      </p>
      <div class="quick-facts">
        <span class="pill">TypeScript portfolio build</span>
        <span class="pill">Light / dark mode</span>
        <span class="pill">CSV drillhole geometry</span>
      </div>
    </section>

    <section class="layout">
      <div class="column">
        <article class="card">
          <div class="section-header">
            <div>
              <div class="eyebrow">Work experience</div>
              <h2>Recent roles</h2>
            </div>
          </div>
          <div class="section-list">
            ${experience.map(renderRole).join('')}
          </div>
        </article>

        <article class="card visualizer">
          <div>
            <div class="eyebrow">Imdex visualization concept</div>
            <h2>3D drillhole from collar/survey/assay CSV</h2>
          </div>
          <p class="visualizer-copy">
            This iteration computes 3D trajectories from azimuth and dip survey stations, recenters collars around the scene origin,
            and renders assay intervals as color-coded cylindrical segments with copper-grade radius scaling.
          </p>
          <div class="visualizer-stage" id="visualizer" aria-label="Three dimensional drillhole visualizer"></div>
          <div class="legend">
            ${lithologyLegend.map(renderLegendItem).join('')}
          </div>
          <p class="source-note">
            Dataset inspiration:
            <a href="https://osdp-psdo.canada.ca/dp/en/search/metadata/NRCAN-GEOSCAN-1-288062">NRCan Flin Flon exploration metadata</a>.
            Demo data includes 2 drillholes (DH001, DH002) using representative collar, survey, and assay interval structure.
          </p>
        </article>

        <article class="card">
          <div class="section-header">
            <div>
              <div class="eyebrow">Projects</div>
              <h2>Personal and academic work</h2>
            </div>
          </div>
          <div class="project-list">
            ${personalProjects.map(renderProject).join('')}
            ${academicProjects.map(renderProject).join('')}
          </div>
        </article>
      </div>

      <aside class="column">
        <article class="card">
          <div class="eyebrow">Technical skills</div>
          <h2>Core stack</h2>
          <div class="skills-groups">
            ${skillGroups.map(renderSkillGroup).join('')}
          </div>
        </article>
      </aside>
    </section>
  </main>
`;

const themeToggle = document.querySelector<HTMLButtonElement>('.theme-toggle');
const storedTheme = window.localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : systemPrefersDark ? 'dark' : 'light';

setTheme(initialTheme);
themeToggle?.addEventListener('click', () => {
  setTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark');
});

createDrillholeScene(holeModels);

function renderRole(role: ResumeEntry) {
  return `
    <section class="role">
      <div class="job-header">
        <div>
          <h3>${role.title}</h3>
          <div class="meta">${role.organization}</div>
        </div>
        <div class="meta">${role.dates}</div>
      </div>
      <ul>
        ${role.bullets.map((bullet) => `<li>${bullet}</li>`).join('')}
      </ul>
    </section>
  `;
}

function renderProject(project: ProjectEntry) {
  return `
    <section class="project">
      <div class="project-header">
        <div>
          <h3>${project.title}</h3>
          <p>${project.description}</p>
        </div>
        <div class="project-meta">
          <strong>${project.stack}</strong>
          <span>${project.dates}</span>
        </div>
      </div>
    </section>
  `;
}

function renderSkillGroup(group: SkillGroup) {
  return `
    <section class="skills-group">
      <h3>${group.title}</h3>
      <p>${group.items.join(' • ')}</p>
    </section>
  `;
}

function renderLegendItem(item: { lithology: string; color: string; maxCu: number; intervalCount: number }) {
  return `
    <div class="legend-item">
      <span class="legend-swatch" style="background:${item.color}"></span>
      <div>
        <strong>${item.lithology}</strong>
        <p>${item.intervalCount} interval(s) · up to ${item.maxCu.toFixed(2)}% Cu</p>
      </div>
    </div>
  `;
}

function setTheme(theme: 'light' | 'dark') {
  document.body.dataset.theme = theme;
  window.localStorage.setItem('theme', theme);

  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }
}

function createDrillholeScene(models: HoleModel[]) {
  const mount = document.querySelector<HTMLDivElement>('#visualizer');

  if (!mount || models.length === 0) {
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 2000);
  camera.position.set(75, 65, 95);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor('#111118', 1);
  mount.append(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
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

  const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };

  animate();
}

function makeTextSprite(text: string) {
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

function buildHoleModels(): HoleModel[] {
  const collars = parseCollars(COLLAR_CSV);
  const surveys = parseSurveyRows(SURVEY_CSV);
  const assays = parseAssayRows(ASSAY_CSV);

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

function buildLithologyLegend(models: HoleModel[]) {
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
