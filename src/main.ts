import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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

type DrillholeInputSet = {
  collarCsv: string;
  surveyCsv: string;
  assayCsv: string;
};

type SiteRoute = 'resume' | 'lighthouse-results' | 'minesweeper';

type GameStatus = 'ready' | 'playing' | 'won' | 'lost';

type MinesweeperDifficulty = 'beginner' | 'intermediate' | 'expert' | 'custom';

type MinesweeperCell = {
  hasMine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacentMines: number;
};

type MinesweeperState = {
  difficulty: MinesweeperDifficulty;
  rows: number;
  cols: number;
  mines: number;
  board: MinesweeperCell[][];
  status: GameStatus;
  safeCellsRevealed: number;
  elapsedMs: number;
  startedAt: number | null;
  finishedAt: number | null;
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

const FEATURED_VISUALIZER_ORG = 'Imdex Limited';
const GITHUB_PROFILE_URL = 'https://github.com/talfreds';
const LIGHTHOUSE_PATH = '/lighthouse-results';
const MINESWEEPER_PATH = '/minesweeper';
const APP_BASE_PATH = normalizeBasePath(import.meta.env.BASE_URL);
const MINESWEEPER_STORAGE_KEY = 'resume-minesweeper-v1';
const MINESWEEPER_PRESETS: Record<Exclude<MinesweeperDifficulty, 'custom'>, { rows: number; cols: number; mines: number }> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 }
};

const DEFAULT_INPUTS: DrillholeInputSet = {
  collarCsv: COLLAR_CSV,
  surveyCsv: SURVEY_CSV,
  assayCsv: ASSAY_CSV
};

const experience: ResumeEntry[] = [
  {
    title: 'Software Engineer',
    organization: 'Imdex Limited',
    dates: 'Aug 2022 – Present',
    bullets: [
  'Engineered web-based 3D visualizers using Three.js and ParaView across React and Vue to render interactive drillhole pathways, volumetric models, and subsurface spatial data.',
  'Enhanced and expanded frontend applications in Angular for a cloud-based data portal that ingests and validates near-real-time drilling, structural, and downhole survey data streamed directly from field rigs.',
  'Translated complex rock characterization and mineralogy datasets into product-ready user interfaces, streamlining data validation workflows for geoscientists.',
  'Built full-stack web services and APIs (Express/C#) to enable secure end-to-end data transfer between rig-site hardware sensors and cloud analytics platforms.',
]
  },
  {
    title: 'Back End Developer',
    organization: 'Epic Safety',
    dates: 'Jul 2021 – Aug 2022',
    bullets: [
'Engineered a resilient IoT data-processing platform with Node.js and TypeScript, using AWS Lambda and ECS to continuously collect, process, and persist high-volume device data in PostgreSQL.',
'Automated infrastructure as code (IaC) and delivery pipelines via CloudFormation and Docker, accelerating release cycles and simplifying cloud deployment across AWS environments.',
'Drove cross-team collaboration by establishing OpenAPI standard documentation via tsoa/Swagger and integrating core 3rd-party platforms (CRM, subscription accounting, and device management).'  ]
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

let visualizerInputs: DrillholeInputSet = { ...DEFAULT_INPUTS };
let holeModels = buildHoleModels(visualizerInputs);
let applyVisualizerTheme: (theme: 'light' | 'dark') => void = () => {};
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let cleanupScene: () => void = () => {};
let cleanupVisualizerShortcuts: (() => void) | null = null;
let cleanupMinesweeperTicker: (() => void) | null = null;
let themeToggle: HTMLButtonElement | null = null;

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App container not found.');
}

const appRoot = app;

const storedTheme = window.localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : systemPrefersDark ? 'dark' : 'light';

setTheme(initialTheme);
restoreRouteFromRedirect();
document.addEventListener('click', onRouteLinkClick);
window.addEventListener('popstate', () => {
  renderCurrentRoute();
});
renderCurrentRoute();

function onRouteLinkClick(event: MouseEvent) {
  if (event.defaultPrevented) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  const link = target.closest<HTMLAnchorElement>('a[data-route-link]');
  if (!link) {
    return;
  }

  const routePath = link.dataset.routePath ?? link.getAttribute('href');
  if (!routePath || routePath.startsWith('http')) {
    return;
  }

  event.preventDefault();
  navigateTo(routePath);
}

function navigateTo(path: string) {
  const routePath = toRoutePath(path);
  const next = toAppPath(routePath);
  if (window.location.pathname !== next) {
    window.history.pushState({}, '', next);
  }
  renderCurrentRoute();
}

function resolveRoute(pathname: string): SiteRoute {
  const routePath = toRoutePath(pathname);

  if (routePath === LIGHTHOUSE_PATH) {
    return 'lighthouse-results';
  }

  if (routePath === MINESWEEPER_PATH) {
    return 'minesweeper';
  }

  return 'resume';
}

function navLink(routePath: string, label: string, isActive: boolean) {
  const href = toAppPath(routePath);
  return `<a data-route-link="true" data-route-path="${routePath}" href="${href}" class="${isActive ? 'is-active' : ''}" aria-current="${isActive ? 'page' : 'false'}">${label}</a>`;
}

function renderShell(route: SiteRoute, content: string) {
  return `
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <main class="page" id="main-content" tabindex="-1">
      <section class="hero">
        <div class="hero-header">
          <h1 class="hero-name">Tyler Alfreds</h1>
          <nav class="page-links" aria-label="Site pages">
            ${navLink('/', 'Resume', route === 'resume')}
            ${navLink(LIGHTHOUSE_PATH, 'Lighthouse Results', route === 'lighthouse-results')}
            ${navLink(MINESWEEPER_PATH, 'Minesweeper', route === 'minesweeper')}
            <button
              class="theme-toggle"
              type="button"
              aria-label="Toggle light and dark mode"
              aria-keyshortcuts="Alt+T"
            >
              Toggle theme
            </button>
          </nav>
        </div>
      </section>
      ${content}
    </main>
  `;
}

function renderResumePage() {
  return `
    <section class="layout">
      <div class="column">
        <article class="card">
          <div class="section-header">
            <div>
              <div class="eyebrow">Work experience</div>
            </div>
          </div>
          <div class="section-list">
            ${experience.map(renderRole).join('')}
          </div>
        </article>

        <article class="card">
          <div class="section-header">
            <div>
              <div class="eyebrow">Projects</div>
              <h2>Personal and academic work</h2>
            </div>
          </div>
          <div class="project-groups">
            <section class="project-group" aria-label="Personal projects">
              <h3 class="project-group-title">Personal projects</h3>
              <div class="project-list">
                ${personalProjects.map(renderProject).join('')}
              </div>
            </section>
            <section class="project-group" aria-label="Academic projects">
              <h3 class="project-group-title">Academic projects</h3>
              <div class="project-list">
                ${academicProjects.map(renderProject).join('')}
              </div>
            </section>
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderLighthousePlaceholderPage() {
  return `
    <section class="layout page-layout-single">
      <article class="card page-card">
        <div class="section-header">
          <div>
            <div class="eyebrow">Lighthouse Results</div>
            <h1>Performance audit coming soon</h1>
          </div>
        </div>
        <p class="page-copy">Placeholder page ready.</p>
      </article>
    </section>
  `;
}

function renderMinesweeperPage() {
  const state = loadMinesweeperState() ?? createMinesweeperState('beginner', MINESWEEPER_PRESETS.beginner.rows, MINESWEEPER_PRESETS.beginner.cols, MINESWEEPER_PRESETS.beginner.mines);
  const minesLeft = state.mines - countFlags(state.board);
  return `
    <section class="layout page-layout-single">
      <article class="card minesweeper-card">
        <div class="section-header minesweeper-title-row">
          <div>
            <div class="eyebrow">Classic Minesweeper</div>
          </div>
        </div>
        <div class="minesweeper-classic-window" role="application" aria-label="Classic Minesweeper game">
          <fieldset class="minesweeper-settings" aria-label="Game difficulty">
            <legend>Difficulty</legend>
            ${renderDifficultyOption('beginner', state.difficulty)}
            ${renderDifficultyOption('intermediate', state.difficulty)}
            ${renderDifficultyOption('expert', state.difficulty)}
            ${renderDifficultyOption('custom', state.difficulty)}
            <label class="difficulty-custom-field" for="custom-rows">
              Rows
              <input id="custom-rows" type="number" min="9" max="24" value="${state.rows}" />
            </label>
            <label class="difficulty-custom-field" for="custom-cols">
              Cols
              <input id="custom-cols" type="number" min="9" max="30" value="${state.cols}" />
            </label>
            <label class="difficulty-custom-field" for="custom-mines">
              Mines
              <input id="custom-mines" type="number" min="10" max="668" value="${state.mines}" />
            </label>
            <button class="minesweeper-apply" type="button" id="minesweeper-apply-settings">Apply</button>
          </fieldset>
          <div class="minesweeper-hud" role="group" aria-label="Minesweeper controls and counters">
            <div class="digit-display" id="minesweeper-mine-counter" aria-label="Mines left">${formatClassicCounter(minesLeft)}</div>
            <button class="minesweeper-face" type="button" id="minesweeper-new" aria-label="Start new game">${getMinesweeperFace(state.status)}</button>
            <div class="digit-display" id="minesweeper-timer" aria-label="Elapsed time">${formatClassicCounter(getElapsedSeconds(state))}</div>
          </div>
          <div class="minesweeper-board-frame">
            <div class="minesweeper-board" id="minesweeper-board" style="grid-template-columns: repeat(${state.cols}, minmax(0, 1fr));" aria-label="Minesweeper board">
              ${renderMinesweeperBoard(state)}
            </div>
          </div>
        </div>
        <div class="minesweeper-footer">
          <span class="minesweeper-status-text" id="minesweeper-status-text">${buildMinesweeperStatusText(state)}</span>
          <button class="minesweeper-reset-link" type="button" id="minesweeper-reset-save">Reset saved game</button>
        </div>
      </article>
    </section>
  `;
}

function renderDifficultyOption(option: MinesweeperDifficulty, current: MinesweeperDifficulty) {
  const labels: Record<MinesweeperDifficulty, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    expert: 'Expert',
    custom: 'Custom'
  };

  return `
    <label class="difficulty-option" for="difficulty-${option}">
      <input type="radio" id="difficulty-${option}" name="minesweeper-difficulty" value="${option}" ${current === option ? 'checked' : ''} />
      ${labels[option]}
    </label>
  `;
}

function renderCurrentRoute() {
  cleanupScene();
  cleanupScene = () => {};
  cleanupVisualizerShortcuts?.();
  cleanupVisualizerShortcuts = null;
  cleanupMinesweeperTicker?.();
  cleanupMinesweeperTicker = null;
  applyVisualizerTheme = () => {};

  const route = resolveRoute(window.location.pathname);
  if (route === 'resume') {
    appRoot.innerHTML = renderShell(route, renderResumePage());
  } else if (route === 'lighthouse-results') {
    appRoot.innerHTML = renderShell(route, renderLighthousePlaceholderPage());
  } else {
    appRoot.innerHTML = renderShell(route, renderMinesweeperPage());
  }

  themeToggle = document.querySelector<HTMLButtonElement>('.theme-toggle');
  themeToggle?.addEventListener('click', () => {
    setTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark');
  });
  setTheme(document.body.dataset.theme === 'dark' ? 'dark' : 'light');

  if (route === 'resume') {
    cleanupScene = createDrillholeScene(holeModels);
    initializeVisualizerControls();
  }

  if (route === 'minesweeper') {
    initializeMinesweeperPage();
  }
}

function normalizeBasePath(basePath: string) {
  const path = basePath.trim();
  if (!path || path === '/') {
    return '/';
  }

  return `/${path.replace(/^\/+|\/+$/g, '')}`;
}

function toAppPath(routePath: string) {
  const normalizedRoute = routePath === '/' ? '' : routePath.startsWith('/') ? routePath : `/${routePath}`;

  if (APP_BASE_PATH === '/') {
    return normalizedRoute || '/';
  }

  return `${APP_BASE_PATH}${normalizedRoute}${normalizedRoute ? '' : '/'}`;
}

function toRoutePath(pathname: string) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

  if (APP_BASE_PATH === '/') {
    return normalizedPath || '/';
  }

  if (normalizedPath === APP_BASE_PATH || normalizedPath === `${APP_BASE_PATH}/`) {
    return '/';
  }

  if (normalizedPath.startsWith(`${APP_BASE_PATH}/`)) {
    const strippedPath = normalizedPath.slice(APP_BASE_PATH.length);
    return strippedPath || '/';
  }

  return normalizedPath;
}

function restoreRouteFromRedirect() {
  const url = new URL(window.location.href);
  const redirectedPath = url.searchParams.get('p');
  if (!redirectedPath) {
    return;
  }

  const restoredUrl = new URL(redirectedPath, window.location.origin);
  const restoredPath = toAppPath(restoredUrl.pathname);
  window.history.replaceState({}, '', `${restoredPath}${restoredUrl.search}${restoredUrl.hash}`);
}

function renderRole(role: ResumeEntry) {
  const isFeaturedRole = role.organization === FEATURED_VISUALIZER_ORG;

  return `
    <section class="role${isFeaturedRole ? ' role-with-visualizer' : ''}">
      <div class="role-main">
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
      </div>
      ${isFeaturedRole ? renderImdexVisualizer() : ''}
    </section>
  `;
}

function renderImdexVisualizer() {
  return `
    <aside class="role-visualizer">
      <div class="visualizer-layout">
        <section class="visualizer-canvas-panel" aria-label="Drillhole visualizer">
          <div class="visualizer-toolbar">
            <h4>Drillhole Visualizer</h4>
            <div class="visualizer-toolbar-actions">
              <button
                class="toggle-data-button"
                id="toggle-trajectory-data"
                type="button"
                aria-controls="trajectory-data-section"
                aria-expanded="false"
                aria-keyshortcuts="Alt+D"
              >
                Show trajectory data
              </button>
              <button
                class="toggle-legend-button"
                id="toggle-legend"
                type="button"
                aria-controls="legend"
                aria-expanded="false"
                aria-keyshortcuts="Alt+L"
              >
                Show labels
              </button>
            </div>
          </div>
          <div class="visualizer-stage" id="visualizer" aria-label="Three dimensional drillhole visualizer"></div>
          <div id="legend" class="legend-panel collapsible" aria-label="Interval labels">
            <h5>Labels</h5>
            <div id="legend-items" class="legend legend-inline">
              ${buildLithologyLegend(holeModels).map(renderLegendItem).join('')}
            </div>
          </div>
        </section>
        <section id="trajectory-data-section" class="visualizer-data-panel collapsible" aria-label="Trajectory source data editor">
          <div class="editor-header">
            <h4>Trajectory Data</h4>
            <div class="editor-actions">
              <label class="auto-rebuild-toggle" for="auto-rebuild-toggle">
                <input id="auto-rebuild-toggle" type="checkbox" checked />
                Auto-rebuild
              </label>
              <button class="reset-button" id="reset-visualizer" type="button">Reset defaults</button>
              <button class="rebuild-button" id="rebuild-visualizer" type="button">Rebuild visualizer</button>
            </div>
          </div>
          <p class="visualizer-copy">Edit collar, survey, or assay CSV and rebuild to update the trajectory. </p>
          <div class="csv-editors">
            <label class="csv-editor-label" for="collar-csv-input">Collar CSV</label>
            <p class="csv-schema">Columns: hole_id, x, y, z, total_depth</p>
            <textarea id="collar-csv-input" class="csv-editor" spellcheck="false">${escapeHtml(visualizerInputs.collarCsv)}</textarea>
            <label class="csv-editor-label" for="survey-csv-input">Survey CSV</label>
            <p class="csv-schema">Columns: hole_id, depth, azimuth, dip</p>
            <textarea id="survey-csv-input" class="csv-editor" spellcheck="false">${escapeHtml(visualizerInputs.surveyCsv)}</textarea>
            <label class="csv-editor-label" for="assay-csv-input">Assay CSV</label>
            <p class="csv-schema">Columns: hole_id, from_depth, to_depth, lithology, cu_pct, color_hex</p>
            <textarea id="assay-csv-input" class="csv-editor" spellcheck="false">${escapeHtml(visualizerInputs.assayCsv)}</textarea>
          </div>
          <p id="visualizer-status" class="visualizer-status" role="status" aria-live="polite">Loaded default sample data.</p>
          <div id="visualizer-errors" class="visualizer-errors" aria-live="polite" hidden>
            <h5>Could not rebuild visualizer</h5>
            <ul id="visualizer-error-list"></ul>
          </div>
        </section>
      </div>
    </aside>
  `;
}

function renderProject(project: ProjectEntry) {
  return `
    <section class="project">
      <div class="project-top">
        <h4>${project.title}</h4>
        <span class="project-dates">${project.dates}</span>
      </div>
      <p class="project-description">${project.description}</p>
      <div class="project-meta">
        <strong>${project.stack}</strong>
      </div>
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

function createMinesweeperState(difficulty: MinesweeperDifficulty, rows: number, cols: number, mines: number): MinesweeperState {
  const board = createMinesweeperBoard(rows, cols, mines);
  return {
    difficulty,
    rows,
    cols,
    mines,
    board,
    status: 'ready',
    safeCellsRevealed: 0,
    elapsedMs: 0,
    startedAt: null,
    finishedAt: null
  };
}

function getDifficultyConfig(difficulty: MinesweeperDifficulty, custom?: { rows: number; cols: number; mines: number }) {
  if (difficulty === 'custom' && custom) {
    return normalizeCustomSettings(custom.rows, custom.cols, custom.mines);
  }

  return MINESWEEPER_PRESETS[difficulty as Exclude<MinesweeperDifficulty, 'custom'>] ?? MINESWEEPER_PRESETS.beginner;
}

function normalizeCustomSettings(rows: number, cols: number, mines: number) {
  const normalizedRows = clamp(Math.floor(rows), 9, 24);
  const normalizedCols = clamp(Math.floor(cols), 9, 30);
  const maxMines = normalizedRows * normalizedCols - 1;
  const normalizedMines = clamp(Math.floor(mines), 10, maxMines);

  return {
    rows: normalizedRows,
    cols: normalizedCols,
    mines: normalizedMines
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createMinesweeperBoard(rows: number, cols: number, mines: number): MinesweeperCell[][] {
  const board: MinesweeperCell[][] = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({
    hasMine: false,
    revealed: false,
    flagged: false,
    adjacentMines: 0
  })));

  const minePositions = new Set<number>();
  while (minePositions.size < mines) {
    minePositions.add(Math.floor(Math.random() * rows * cols));
  }

  for (const position of minePositions) {
    const row = Math.floor(position / cols);
    const col = position % cols;
    board[row][col].hasMine = true;
  }

  recalculateAdjacentCounts(board);

  return board;
}

function recalculateAdjacentCounts(board: MinesweeperCell[][]) {
  const rows = board.length;
  const cols = rows > 0 ? board[0].length : 0;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (board[row][col].hasMine) {
        board[row][col].adjacentMines = 0;
        continue;
      }

      let adjacentMines = 0;
      for (const [nextRow, nextCol] of getNeighbors(row, col, rows, cols)) {
        if (board[nextRow][nextCol].hasMine) {
          adjacentMines += 1;
        }
      }
      board[row][col].adjacentMines = adjacentMines;
    }
  }
}

function ensureSafeFirstClick(state: MinesweeperState, row: number, col: number) {
  const clicked = state.board[row]?.[col];
  if (!clicked || !clicked.hasMine) {
    return;
  }

  for (let targetRow = 0; targetRow < state.rows; targetRow += 1) {
    for (let targetCol = 0; targetCol < state.cols; targetCol += 1) {
      if (targetRow === row && targetCol === col) {
        continue;
      }

      const target = state.board[targetRow][targetCol];
      if (!target.hasMine) {
        target.hasMine = true;
        clicked.hasMine = false;
        recalculateAdjacentCounts(state.board);
        return;
      }
    }
  }
}

function getNeighbors(row: number, col: number, rows: number, cols: number): Array<[number, number]> {
  const neighbors: Array<[number, number]> = [];
  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) {
        continue;
      }

      const nextRow = row + rowOffset;
      const nextCol = col + colOffset;
      if (nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols) {
        neighbors.push([nextRow, nextCol]);
      }
    }
  }

  return neighbors;
}

function buildMinesweeperStatusText(state: MinesweeperState) {
  if (state.status === 'won') {
    return 'You cleared the board.';
  }

  if (state.status === 'lost') {
    return 'Mine triggered.';
  }

  if (state.status === 'playing') {
    return 'In progress.';
  }

  return 'Ready. Left click reveal. Right click flag.';
}

function getElapsedMs(state: MinesweeperState) {
  if (state.status === 'playing' && state.startedAt) {
    return state.elapsedMs + (Date.now() - state.startedAt);
  }

  return state.elapsedMs;
}

function getElapsedSeconds(state: MinesweeperState) {
  return Math.max(0, Math.floor(getElapsedMs(state) / 1000));
}

function formatClassicCounter(value: number) {
  const bounded = Math.max(-99, Math.min(999, value));
  if (bounded < 0) {
    return `-${Math.abs(bounded).toString().padStart(2, '0')}`;
  }
  return bounded.toString().padStart(3, '0');
}

function inferDifficulty(rows: number, cols: number, mines: number): MinesweeperDifficulty {
  if (rows === MINESWEEPER_PRESETS.beginner.rows && cols === MINESWEEPER_PRESETS.beginner.cols && mines === MINESWEEPER_PRESETS.beginner.mines) {
    return 'beginner';
  }

  if (rows === MINESWEEPER_PRESETS.intermediate.rows && cols === MINESWEEPER_PRESETS.intermediate.cols && mines === MINESWEEPER_PRESETS.intermediate.mines) {
    return 'intermediate';
  }

  if (rows === MINESWEEPER_PRESETS.expert.rows && cols === MINESWEEPER_PRESETS.expert.cols && mines === MINESWEEPER_PRESETS.expert.mines) {
    return 'expert';
  }

  return 'custom';
}

function getMinesweeperFace(status: GameStatus, isPressed = false) {
  if (isPressed && status !== 'won' && status !== 'lost') {
    return '😮';
  }

  if (status === 'won') {
    return '😎';
  }

  if (status === 'lost') {
    return '😵';
  }

  return '🙂';
}

function formatElapsedTime(state: MinesweeperState) {
  const runningMs = state.status === 'playing' && state.startedAt
    ? state.elapsedMs + (Date.now() - state.startedAt)
    : state.elapsedMs;
  const totalSeconds = Math.max(0, Math.floor(runningMs / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function countFlags(board: MinesweeperCell[][]) {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell.flagged) {
        count += 1;
      }
    }
  }
  return count;
}

function renderMinesweeperBoard(state: MinesweeperState) {
  const cells: string[] = [];

  for (let row = 0; row < state.rows; row += 1) {
    for (let col = 0; col < state.cols; col += 1) {
      const cell = state.board[row][col];
      const revealed = cell.revealed || (state.status === 'lost' && cell.hasMine);
      let label = '';

      if (revealed && cell.hasMine) {
        label = '*';
      } else if (cell.flagged && !revealed) {
        label = '⚑';
      } else if (revealed && cell.adjacentMines > 0) {
        label = String(cell.adjacentMines);
      }

      const classes = [
        'mine-cell',
        revealed ? 'is-revealed' : 'is-hidden',
        cell.flagged ? 'is-flagged' : '',
        revealed && cell.hasMine ? 'is-mine' : '',
        revealed && cell.adjacentMines > 0 ? `mine-count-${cell.adjacentMines}` : ''
      ].filter(Boolean).join(' ');

      cells.push(`<button class="${classes}" type="button" data-mine-row="${row}" data-mine-col="${col}" aria-label="Cell ${row + 1},${col + 1}">${label}</button>`);
    }
  }

  return cells.join('');
}

function cloneMinesweeperState(state: MinesweeperState): MinesweeperState {
  return {
    ...state,
    board: state.board.map((row) => row.map((cell) => ({ ...cell })))
  };
}

function revealMinesweeperCell(state: MinesweeperState, row: number, col: number): MinesweeperState {
  const next = cloneMinesweeperState(state);
  const cell = next.board[row]?.[col];

  if (!cell || cell.flagged || cell.revealed || next.status === 'won' || next.status === 'lost') {
    return next;
  }

  if (next.status === 'ready') {
    ensureSafeFirstClick(next, row, col);
    next.status = 'playing';
    next.startedAt = Date.now();
  }

  if (cell.hasMine) {
    cell.revealed = true;
    next.status = 'lost';
    if (next.startedAt) {
      next.elapsedMs += Date.now() - next.startedAt;
      next.startedAt = null;
    }
    next.finishedAt = Date.now();
    return next;
  }

  const queue: Array<[number, number]> = [[row, col]];
  while (queue.length > 0) {
    const [currentRow, currentCol] = queue.shift() as [number, number];
    const current = next.board[currentRow][currentCol];

    if (current.revealed || current.flagged) {
      continue;
    }

    current.revealed = true;
    next.safeCellsRevealed += 1;

    if (current.adjacentMines === 0) {
      for (const [neighborRow, neighborCol] of getNeighbors(currentRow, currentCol, next.rows, next.cols)) {
        const neighbor = next.board[neighborRow][neighborCol];
        if (!neighbor.revealed && !neighbor.hasMine) {
          queue.push([neighborRow, neighborCol]);
        }
      }
    }
  }

  if (next.safeCellsRevealed >= next.rows * next.cols - next.mines) {
    next.status = 'won';
    if (next.startedAt) {
      next.elapsedMs += Date.now() - next.startedAt;
      next.startedAt = null;
    }
    next.finishedAt = Date.now();
  }

  return next;
}

function toggleMinesweeperFlag(state: MinesweeperState, row: number, col: number): MinesweeperState {
  const next = cloneMinesweeperState(state);
  const cell = next.board[row]?.[col];

  if (!cell || cell.revealed || next.status === 'won' || next.status === 'lost') {
    return next;
  }

  cell.flagged = !cell.flagged;
  return next;
}

function chordReveal(state: MinesweeperState, row: number, col: number): MinesweeperState {
  const cell = state.board[row]?.[col];
  if (!cell || !cell.revealed || cell.adjacentMines <= 0 || state.status === 'won' || state.status === 'lost') {
    return state;
  }

  const neighbors = getNeighbors(row, col, state.rows, state.cols);
  const flaggedCount = neighbors.filter(([neighborRow, neighborCol]) => state.board[neighborRow][neighborCol].flagged).length;

  if (flaggedCount !== cell.adjacentMines) {
    return state;
  }

  let next = state;
  for (const [neighborRow, neighborCol] of neighbors) {
    const neighbor = next.board[neighborRow][neighborCol];
    if (!neighbor.flagged && !neighbor.revealed) {
      next = revealMinesweeperCell(next, neighborRow, neighborCol);
      if (next.status === 'lost') {
        break;
      }
    }
  }

  return next;
}

function saveMinesweeperState(state: MinesweeperState) {
  window.localStorage.setItem(MINESWEEPER_STORAGE_KEY, JSON.stringify(state));
}

function loadMinesweeperState() {
  const raw = window.localStorage.getItem(MINESWEEPER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as MinesweeperState;
    if (!Array.isArray(parsed.board) || typeof parsed.rows !== 'number' || typeof parsed.cols !== 'number' || typeof parsed.mines !== 'number') {
      return null;
    }

    const safeRows = Math.floor(parsed.rows);
    const safeCols = Math.floor(parsed.cols);
    const safeMines = Math.floor(parsed.mines);

    if (safeRows <= 0 || safeCols <= 0 || safeMines <= 0) {
      return null;
    }

    if (parsed.board.length !== safeRows || parsed.board.some((row) => row.length !== safeCols)) {
      return null;
    }

    const maxMines = safeRows * safeCols - 1;
    if (safeMines > maxMines) {
      return null;
    }

    const safeRevealed = parsed.board.flat().filter((cell) => cell.revealed && !cell.hasMine).length;

    return {
      ...parsed,
      difficulty: parsed.difficulty ?? inferDifficulty(safeRows, safeCols, safeMines),
      rows: safeRows,
      cols: safeCols,
      mines: safeMines,
      safeCellsRevealed: safeRevealed
    };
  } catch {
    return null;
  }
}

function initializeMinesweeperPage() {
  const board = document.querySelector<HTMLDivElement>('#minesweeper-board');
  const faceButton = document.querySelector<HTMLButtonElement>('#minesweeper-new');
  const resetButton = document.querySelector<HTMLButtonElement>('#minesweeper-reset-save');
  const applySettingsButton = document.querySelector<HTMLButtonElement>('#minesweeper-apply-settings');
  const difficultyInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="minesweeper-difficulty"]'));
  const customRowsInput = document.querySelector<HTMLInputElement>('#custom-rows');
  const customColsInput = document.querySelector<HTMLInputElement>('#custom-cols');
  const customMinesInput = document.querySelector<HTMLInputElement>('#custom-mines');
  const mineCounter = document.querySelector<HTMLDivElement>('#minesweeper-mine-counter');
  const status = document.querySelector<HTMLSpanElement>('#minesweeper-status-text');
  const timer = document.querySelector<HTMLDivElement>('#minesweeper-timer');

  if (!board || !faceButton || !resetButton || !applySettingsButton || !customRowsInput || !customColsInput || !customMinesInput || !mineCounter || !status || !timer) {
    return;
  }

  let state = loadMinesweeperState() ?? createMinesweeperState('beginner', MINESWEEPER_PRESETS.beginner.rows, MINESWEEPER_PRESETS.beginner.cols, MINESWEEPER_PRESETS.beginner.mines);
  let chordPreviewCells: HTMLButtonElement[] = [];

  const syncFace = (isPressed = false) => {
    faceButton.textContent = getMinesweeperFace(state.status, isPressed);
    faceButton.classList.toggle('is-pressed', isPressed);
  };

  const syncDifficultyInputs = () => {
    difficultyInputs.forEach((input) => {
      input.checked = input.value === state.difficulty;
    });

    customRowsInput.value = String(state.rows);
    customColsInput.value = String(state.cols);
    customMinesInput.value = String(state.mines);

    const customActive = state.difficulty === 'custom';
    customRowsInput.disabled = !customActive;
    customColsInput.disabled = !customActive;
    customMinesInput.disabled = !customActive;
  };

  const updateCustomMinesLimit = () => {
    const rows = Number(customRowsInput.value);
    const cols = Number(customColsInput.value);

    if (!Number.isFinite(rows) || !Number.isFinite(cols)) {
      customMinesInput.max = '668';
      return;
    }

    const maxMines = Math.max(10, Math.floor(rows) * Math.floor(cols) - 1);
    customMinesInput.max = String(maxMines);
  };

  const validateCustomInputs = (showTooltip = false) => {
    updateCustomMinesLimit();

    const maxMines = Number(customMinesInput.max);
    const checks: Array<{ input: HTMLInputElement; label: string; min: number; max: number }> = [
      { input: customRowsInput, label: 'Rows', min: 9, max: 24 },
      { input: customColsInput, label: 'Cols', min: 9, max: 30 },
      { input: customMinesInput, label: 'Mines', min: 10, max: Number.isFinite(maxMines) ? maxMines : 668 }
    ];

    let isValid = true;
    for (const check of checks) {
      const numericValue = Number(check.input.value);

      if (!Number.isFinite(numericValue)) {
        check.input.setCustomValidity(`${check.label} must be a number.`);
        isValid = false;
      } else if (Math.floor(numericValue) < check.min) {
        check.input.setCustomValidity(`${check.label} must be at least ${check.min}.`);
        isValid = false;
      } else if (Math.floor(numericValue) > check.max) {
        check.input.setCustomValidity(`${check.label} must be no more than ${check.max}.`);
        isValid = false;
      } else {
        check.input.setCustomValidity('');
      }
    }

    if (showTooltip && !isValid) {
      const firstInvalid = checks.find((check) => !check.input.checkValidity());
      firstInvalid?.input.reportValidity();
    }

    return isValid;
  };

  const updateView = () => {
    chordPreviewCells = [];
    board.innerHTML = renderMinesweeperBoard(state);
    board.style.gridTemplateColumns = `repeat(${state.cols}, minmax(0, 1fr))`;
    status.textContent = buildMinesweeperStatusText(state);
    timer.textContent = formatClassicCounter(getElapsedSeconds(state));
    mineCounter.textContent = formatClassicCounter(state.mines - countFlags(state.board));
    syncFace();
    syncDifficultyInputs();

    saveMinesweeperState(state);
  };

  const clearChordPreview = () => {
    for (const cell of chordPreviewCells) {
      cell.classList.remove('is-chord-preview');
    }
    chordPreviewCells = [];
  };

  const showChordPreview = (row: number, col: number) => {
    clearChordPreview();

    const source = state.board[row]?.[col];
    if (!source || !source.revealed || source.adjacentMines <= 0 || state.status === 'won' || state.status === 'lost') {
      return;
    }

    for (const [nextRow, nextCol] of getNeighbors(row, col, state.rows, state.cols)) {
      const neighbor = state.board[nextRow][nextCol];
      if (neighbor.revealed || neighbor.flagged) {
        continue;
      }

      const button = board.querySelector<HTMLButtonElement>(`button[data-mine-row="${nextRow}"][data-mine-col="${nextCol}"]`);
      if (!button) {
        continue;
      }

      button.classList.add('is-chord-preview');
      chordPreviewCells.push(button);
    }
  };

  const setFreshGame = () => {
    if (state.difficulty === 'custom' && !validateCustomInputs(true)) {
      return;
    }

    const config = getDifficultyConfig(state.difficulty, {
      rows: Number(customRowsInput.value),
      cols: Number(customColsInput.value),
      mines: Number(customMinesInput.value)
    });
    state = createMinesweeperState(state.difficulty, config.rows, config.cols, config.mines);
    updateView();
  };

  const applySelectedDifficulty = () => {
    const selected = difficultyInputs.find((input) => input.checked)?.value as MinesweeperDifficulty | undefined;
    const nextDifficulty: MinesweeperDifficulty = selected ?? 'beginner';

    if (nextDifficulty === 'custom' && !validateCustomInputs(true)) {
      return;
    }

    const config = getDifficultyConfig(nextDifficulty, {
      rows: Number(customRowsInput.value),
      cols: Number(customColsInput.value),
      mines: Number(customMinesInput.value)
    });
    state = createMinesweeperState(nextDifficulty, config.rows, config.cols, config.mines);
    updateView();
  };

  const onBoardClick = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const row = Number(target.dataset.mineRow);
    const col = Number(target.dataset.mineCol);
    if (!Number.isFinite(row) || !Number.isFinite(col)) {
      return;
    }

    const selectedCell = state.board[row]?.[col];
    if (selectedCell?.revealed) {
      state = chordReveal(state, row, col);
    } else {
      state = revealMinesweeperCell(state, row, col);
    }

    clearChordPreview();
    updateView();
  };

  const onBoardContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const row = Number(target.dataset.mineRow);
    const col = Number(target.dataset.mineCol);
    if (!Number.isFinite(row) || !Number.isFinite(col)) {
      return;
    }

    state = toggleMinesweeperFlag(state, row, col);
    updateView();
  };

  board.addEventListener('click', onBoardClick);
  board.addEventListener('contextmenu', onBoardContextMenu);
  faceButton.addEventListener('click', setFreshGame);
  applySettingsButton.addEventListener('click', applySelectedDifficulty);

  const onCustomInputBlur = (event: FocusEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    validateCustomInputs(true);
  };

  const onCustomInputChange = () => {
    validateCustomInputs(false);
  };

  customRowsInput.addEventListener('input', onCustomInputChange);
  customColsInput.addEventListener('input', onCustomInputChange);
  customMinesInput.addEventListener('input', onCustomInputChange);
  customRowsInput.addEventListener('blur', onCustomInputBlur);
  customColsInput.addEventListener('blur', onCustomInputBlur);
  customMinesInput.addEventListener('blur', onCustomInputBlur);

  difficultyInputs.forEach((input) => {
    input.addEventListener('change', () => {
      const selected = input.value as MinesweeperDifficulty;
      if (selected !== 'custom') {
        const config = getDifficultyConfig(selected);
        customRowsInput.value = String(config.rows);
        customColsInput.value = String(config.cols);
        customMinesInput.value = String(config.mines);
      }

      updateCustomMinesLimit();

      if (state.status === 'ready') {
        applySelectedDifficulty();
        return;
      }

      state = {
        ...state,
        difficulty: selected
      };
      updateView();
    });
  });

  const onBoardMouseDown = (event: MouseEvent) => {
    if (event.button !== 0) {
      return;
    }

    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      syncFace(true);
      return;
    }

    const row = Number(target.dataset.mineRow);
    const col = Number(target.dataset.mineCol);
    if (!Number.isFinite(row) || !Number.isFinite(col)) {
      syncFace(true);
      return;
    }

    showChordPreview(row, col);
    syncFace(true);
  };
  const onBoardMouseUp = () => {
    clearChordPreview();
    syncFace();
  };
  const onBoardMouseLeave = () => {
    clearChordPreview();
    syncFace();
  };

  const onFaceMouseDown = () => {
    syncFace(true);
  };

  const onFaceMouseUp = () => {
    syncFace();
  };

  const onFaceMouseLeave = () => {
    syncFace();
  };

  board.addEventListener('mousedown', onBoardMouseDown);
  board.addEventListener('mouseup', onBoardMouseUp);
  board.addEventListener('mouseleave', onBoardMouseLeave);
  faceButton.addEventListener('mousedown', onFaceMouseDown);
  faceButton.addEventListener('mouseup', onFaceMouseUp);
  faceButton.addEventListener('mouseleave', onFaceMouseLeave);

  resetButton.addEventListener('click', () => {
    window.localStorage.removeItem(MINESWEEPER_STORAGE_KEY);
    state = createMinesweeperState('beginner', MINESWEEPER_PRESETS.beginner.rows, MINESWEEPER_PRESETS.beginner.cols, MINESWEEPER_PRESETS.beginner.mines);
    updateView();
  });

  const intervalId = window.setInterval(() => {
    if (state.status === 'playing') {
      timer.textContent = formatClassicCounter(getElapsedSeconds(state));
    }
  }, 1000);

  cleanupMinesweeperTicker = () => {
    clearChordPreview();
    board.removeEventListener('click', onBoardClick);
    board.removeEventListener('contextmenu', onBoardContextMenu);
    board.removeEventListener('mousedown', onBoardMouseDown);
    board.removeEventListener('mouseup', onBoardMouseUp);
    board.removeEventListener('mouseleave', onBoardMouseLeave);
    faceButton.removeEventListener('mousedown', onFaceMouseDown);
    faceButton.removeEventListener('mouseup', onFaceMouseUp);
    faceButton.removeEventListener('mouseleave', onFaceMouseLeave);
    customRowsInput.removeEventListener('input', onCustomInputChange);
    customColsInput.removeEventListener('input', onCustomInputChange);
    customMinesInput.removeEventListener('input', onCustomInputChange);
    customRowsInput.removeEventListener('blur', onCustomInputBlur);
    customColsInput.removeEventListener('blur', onCustomInputBlur);
    customMinesInput.removeEventListener('blur', onCustomInputBlur);
    window.clearInterval(intervalId);
  };

  updateCustomMinesLimit();
  validateCustomInputs(false);
  updateView();
}

function setTheme(theme: 'light' | 'dark') {
  document.body.dataset.theme = theme;
  window.localStorage.setItem('theme', theme);
  applyVisualizerTheme(theme);

  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }
}

function initializeVisualizerControls() {
  const toggleDataButton = document.querySelector<HTMLButtonElement>('#toggle-trajectory-data');
  const trajectoryDataSection = document.querySelector<HTMLElement>('#trajectory-data-section');
  const toggleLegendButton = document.querySelector<HTMLButtonElement>('#toggle-legend');
  const legendSection = document.querySelector<HTMLElement>('#legend');
  const rebuildButton = document.querySelector<HTMLButtonElement>('#rebuild-visualizer');
  const resetButton = document.querySelector<HTMLButtonElement>('#reset-visualizer');
  const autoRebuildToggle = document.querySelector<HTMLInputElement>('#auto-rebuild-toggle');
  const collarInput = document.querySelector<HTMLTextAreaElement>('#collar-csv-input');
  const surveyInput = document.querySelector<HTMLTextAreaElement>('#survey-csv-input');
  const assayInput = document.querySelector<HTMLTextAreaElement>('#assay-csv-input');
  const status = document.querySelector<HTMLParagraphElement>('#visualizer-status');
  const errorPanel = document.querySelector<HTMLDivElement>('#visualizer-errors');
  const errorList = document.querySelector<HTMLUListElement>('#visualizer-error-list');

  if (!toggleDataButton || !trajectoryDataSection || !toggleLegendButton || !legendSection || !rebuildButton || !resetButton || !autoRebuildToggle || !collarInput || !surveyInput || !assayInput || !status || !errorPanel || !errorList) {
    return;
  }

  const setToggleLabel = (button: HTMLButtonElement, expanded: boolean, visibleLabel: string, hiddenLabel: string) => {
    button.textContent = expanded ? visibleLabel : hiddenLabel;
    button.setAttribute('aria-expanded', String(expanded));
  };

  const setCollapsibleState = (
    target: HTMLElement,
    button: HTMLButtonElement,
    expanded: boolean,
    expandedLabel: string,
    collapsedLabel: string
  ) => {
    if (isReducedMotionPreferred()) {
      target.classList.toggle('is-open', expanded);
      target.classList.toggle('is-collapsed', !expanded);
      target.style.maxHeight = expanded ? 'none' : '0px';
      target.style.opacity = expanded ? '1' : '0';
      setToggleLabel(button, expanded, expandedLabel, collapsedLabel);
      return;
    }

    if (expanded) {
      target.classList.remove('is-collapsed');
      target.classList.add('is-open');
      target.style.maxHeight = `${target.scrollHeight}px`;
      target.style.opacity = '1';
      window.setTimeout(() => {
        if (target.classList.contains('is-open')) {
          target.style.maxHeight = 'none';
        }
      }, 260);
    } else {
      target.classList.remove('is-collapsed');
      const currentHeight = target.scrollHeight;
      target.style.maxHeight = `${currentHeight}px`;
      window.requestAnimationFrame(() => {
        target.classList.remove('is-open');
        target.style.maxHeight = '0px';
        target.style.opacity = '0';
      });

      window.setTimeout(() => {
        if (!target.classList.contains('is-open')) {
          target.classList.add('is-collapsed');
        }
      }, 250);
    }

    setToggleLabel(button, expanded, expandedLabel, collapsedLabel);
  };

  let isTrajectoryDataOpen = false;
  let isLegendOpen = false;

  setCollapsibleState(trajectoryDataSection, toggleDataButton, isTrajectoryDataOpen, 'Hide trajectory data', 'Show trajectory data');
  setCollapsibleState(legendSection, toggleLegendButton, isLegendOpen, 'Hide labels', 'Show labels');

  const autoRebuildDelayMs = 700;
  let autoRebuildTimer: number | undefined;

  const getCurrentInputs = (): DrillholeInputSet => ({
    collarCsv: collarInput.value.trim(),
    surveyCsv: surveyInput.value.trim(),
    assayCsv: assayInput.value.trim()
  });

  const clearErrors = () => {
    errorPanel.hidden = true;
    errorList.innerHTML = '';
  };

  const setErrors = (messages: string[]) => {
    errorList.innerHTML = messages.map((message) => `<li>${escapeHtml(message)}</li>`).join('');
    errorPanel.hidden = false;
    status.textContent = 'Fix the data issues and rebuild again.';
    status.dataset.state = 'error';
  };

  const setSuccess = (message: string) => {
    clearErrors();
    status.textContent = message;
    status.dataset.state = 'success';
  };

  const validateAndBuildModels = (inputs: DrillholeInputSet) => {
    const errors: string[] = [];

    try {
      parseCollars(inputs.collarCsv);
    } catch (error) {
      errors.push(`Collar CSV: ${error instanceof Error ? error.message : 'Invalid data.'}`);
    }

    try {
      parseSurveyRows(inputs.surveyCsv);
    } catch (error) {
      errors.push(`Survey CSV: ${error instanceof Error ? error.message : 'Invalid data.'}`);
    }

    try {
      parseAssayRows(inputs.assayCsv);
    } catch (error) {
      errors.push(`Assay CSV: ${error instanceof Error ? error.message : 'Invalid data.'}`);
    }

    if (errors.length > 0) {
      return { errors };
    }

    try {
      const models = buildHoleModels(inputs);

      if (models.length === 0) {
        return { errors: ['No valid drillholes were generated from the input rows.'] };
      }

      return { models, errors: [] as string[] };
    } catch (error) {
      return { errors: [error instanceof Error ? error.message : 'Unable to rebuild visualizer.'] };
    }
  };

  const rebuild = (source: 'manual' | 'auto' = 'manual') => {
    if (autoRebuildTimer) {
      window.clearTimeout(autoRebuildTimer);
      autoRebuildTimer = undefined;
    }

    const nextInputs = getCurrentInputs();
    const result = validateAndBuildModels(nextInputs);

    if (result.errors.length > 0 || !result.models) {
      setErrors(result.errors);
      return false;
    }

    visualizerInputs = nextInputs;
    holeModels = result.models;
    cleanupScene();
    cleanupScene = createDrillholeScene(holeModels);
    renderLegend(holeModels);
    const message = source === 'auto'
      ? `Auto-rebuilt from ${holeModels.length} hole model(s).`
      : `Visualizer rebuilt from ${holeModels.length} hole model(s).`;
    setSuccess(message);
    return true;
  };

  const scheduleAutoRebuild = () => {
    if (!autoRebuildToggle.checked) {
      status.textContent = 'Auto-rebuild is off. Press Rebuild visualizer to apply changes.';
      status.dataset.state = 'idle';
      return;
    }

    if (autoRebuildTimer) {
      window.clearTimeout(autoRebuildTimer);
    }

    status.textContent = 'Changes detected. Rebuilding shortly...';
    status.dataset.state = 'pending';

    autoRebuildTimer = window.setTimeout(() => {
      rebuild('auto');
    }, autoRebuildDelayMs);
  };

  const onEditorKeydown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      rebuild('manual');
    }
  };

  const onEditorInput = () => {
    scheduleAutoRebuild();
  };

  const onGlobalShortcut = (event: KeyboardEvent) => {
    if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || isTypingTarget(event.target)) {
      return;
    }

    const key = event.key.toLowerCase();

    if (key === 't') {
      event.preventDefault();
      setTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark');
      return;
    }

    if (key === 'd') {
      event.preventDefault();
      toggleDataButton.click();
      return;
    }

    if (key === 'l') {
      event.preventDefault();
      toggleLegendButton.click();
    }
  };

  rebuildButton.addEventListener('click', () => {
    rebuild('manual');
  });
  toggleDataButton.addEventListener('click', () => {
    isTrajectoryDataOpen = !isTrajectoryDataOpen;
    setCollapsibleState(trajectoryDataSection, toggleDataButton, isTrajectoryDataOpen, 'Hide trajectory data', 'Show trajectory data');
  });
  toggleLegendButton.addEventListener('click', () => {
    isLegendOpen = !isLegendOpen;
    setCollapsibleState(legendSection, toggleLegendButton, isLegendOpen, 'Hide labels', 'Show labels');
  });
  resetButton.addEventListener('click', () => {
    collarInput.value = DEFAULT_INPUTS.collarCsv;
    surveyInput.value = DEFAULT_INPUTS.surveyCsv;
    assayInput.value = DEFAULT_INPUTS.assayCsv;

    if (autoRebuildToggle.checked) {
      rebuild('manual');
      status.textContent = 'Defaults restored and visualizer rebuilt.';
      status.dataset.state = 'success';
    } else {
      clearErrors();
      status.textContent = 'Defaults restored. Press Rebuild visualizer to apply changes.';
      status.dataset.state = 'idle';
    }
  });
  autoRebuildToggle.addEventListener('change', () => {
    if (autoRebuildToggle.checked) {
      scheduleAutoRebuild();
    } else {
      if (autoRebuildTimer) {
        window.clearTimeout(autoRebuildTimer);
        autoRebuildTimer = undefined;
      }
      status.textContent = 'Auto-rebuild is off. Press Rebuild visualizer to apply changes.';
      status.dataset.state = 'idle';
    }
  });
  collarInput.addEventListener('keydown', onEditorKeydown);
  surveyInput.addEventListener('keydown', onEditorKeydown);
  assayInput.addEventListener('keydown', onEditorKeydown);
  collarInput.addEventListener('input', onEditorInput);
  surveyInput.addEventListener('input', onEditorInput);
  assayInput.addEventListener('input', onEditorInput);

  cleanupVisualizerShortcuts?.();
  document.addEventListener('keydown', onGlobalShortcut);
  cleanupVisualizerShortcuts = () => {
    document.removeEventListener('keydown', onGlobalShortcut);
  };
}

function renderLegend(models: HoleModel[]) {
  const legendContainer = document.querySelector<HTMLDivElement>('#legend-items');

  if (!legendContainer) {
    return;
  }

  legendContainer.innerHTML = buildLithologyLegend(models).map(renderLegendItem).join('');
}

function createDrillholeScene(models: HoleModel[]) {
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

function isReducedMotionPreferred() {
  return prefersReducedMotion.matches;
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  return target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement;
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

function buildHoleModels(inputs: DrillholeInputSet): HoleModel[] {
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
