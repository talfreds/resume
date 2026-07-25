import './styles.css';
import * as THREE from 'three';

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

type DrillholeInterval = {
  from: number;
  to: number;
  mineral: string;
  note: string;
  color: string;
};

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

const drillholeIntervals: DrillholeInterval[] = [
  { from: 0, to: 34, mineral: 'Overburden and casing', note: 'Surface interval with limited conductivity and setup depth.', color: '#94a3b8' },
  { from: 34, to: 112, mineral: 'Stringer sulphides', note: 'Trace chalcopyrite and zinc stringers suggest a mineralized approach zone.', color: '#38bdf8' },
  { from: 112, to: 168, mineral: 'Massive sulphide lens', note: 'Primary inferred copper-zinc interval, shown as the key ore target.', color: '#f97316' },
  { from: 168, to: 220, mineral: 'Pyrite-rich halo', note: 'A sulphide halo frames the denser ore lens and supports nearby alteration interpretation.', color: '#a855f7' },
  { from: 220, to: 280, mineral: 'Footwall volcanics', note: 'The drillhole exits into lower-grade host rock with deformation markers.', color: '#22c55e' }
];

const totalDepth = drillholeIntervals[drillholeIntervals.length - 1]?.to ?? 0;
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
        This TypeScript portfolio condenses resume highlights and starts a Three.js concept for mining drillhole visualization.
      </p>
      <div class="quick-facts">
        <span class="pill">TypeScript portfolio build</span>
        <span class="pill">Light / dark mode</span>
        <span class="pill">Three.js drillhole concept</span>
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
            <h2>Drillhole mineral inference starter</h2>
          </div>
          <p class="visualizer-copy">
            This scene is a first iteration for the newest Imdex role: a simplified drillhole view that maps depth intervals to inferred
            mineral content. It is intentionally compact so the next iteration can layer in assay values, lithology, labels, and user-driven filtering.
          </p>
          <div class="visualizer-stage" id="visualizer" aria-label="Three dimensional drillhole visualizer"></div>
          <div class="legend">
            ${drillholeIntervals.map(renderInterval).join('')}
          </div>
          <p class="source-note">
            Dataset inspiration:
            <a href="https://osdp-psdo.canada.ca/dp/en/search/metadata/NRCAN-GEOSCAN-1-288062">NRCan Flin Flon exploration metadata</a>.
            The intervals shown here are representative portfolio content for visualization planning, not a reproduced assay table.
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

createDrillholeScene();

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

function renderInterval(interval: DrillholeInterval) {
  return `
    <div class="legend-item">
      <span class="legend-swatch" style="background:${interval.color}"></span>
      <div>
        <strong>${interval.mineral} · ${interval.from}m–${interval.to}m</strong>
        <p>${interval.note}</p>
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

function createDrillholeScene() {
  const mount = document.querySelector<HTMLDivElement>('#visualizer');

  if (!mount) {
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, mount.clientWidth / mount.clientHeight, 0.1, 100);
  camera.position.set(6.8, 5.2, 8.8);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  mount.append(renderer.domElement);

  const group = new THREE.Group();
  group.rotation.z = Math.PI / 7;
  scene.add(group);

  const ambient = new THREE.AmbientLight(0xffffff, 1.7);
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(6, 8, 10);
  const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.7);
  fillLight.position.set(-4, -3, 5);
  scene.add(ambient, keyLight, fillLight);

  const holeHeight = 8.8;
  const casing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.34, holeHeight, 24),
    new THREE.MeshStandardMaterial({
      color: 0x42536d,
      transparent: true,
      opacity: 0.3,
      metalness: 0.12,
      roughness: 0.48
    })
  );
  group.add(casing);

  drillholeIntervals.forEach((interval) => {
    const intervalHeight = ((interval.to - interval.from) / totalDepth) * holeHeight;
    const centerDepth = (interval.from + interval.to) / 2;
    const y = holeHeight / 2 - (centerDepth / totalDepth) * holeHeight;

    const segment = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, intervalHeight, 24),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(interval.color),
        emissive: new THREE.Color(interval.color).multiplyScalar(0.16),
        metalness: 0.08,
        roughness: 0.4
      })
    );
    segment.position.y = y;
    group.add(segment);
  });

  const guide = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.85, holeHeight / 2, 0), new THREE.Vector3(0.85, -holeHeight / 2, 0)]),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28 })
  );
  group.add(guide);

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
    group.rotation.y += 0.004;
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };

  animate();
}
