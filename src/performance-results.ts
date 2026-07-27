import type { PerformanceData } from './performance-data';

export function renderLighthouseResults(data: PerformanceData | null) {
  if (!data) {
    return `
      <section class="layout page-layout-single">
        <article class="card page-card">
          <div class="section-header">
            <div>
              <div class="eyebrow">Lighthouse Results</div>
              <h1>Performance Audit</h1>
            </div>
          </div>
          <p class="page-copy">Unable to load performance data. Please try refreshing the page.</p>
        </article>
      </section>
    `;
  }

  const { baseline, optimized, improvements } = data;

  return `
    <section class="layout page-layout-single">
      <article class="card page-card lighthouse-results">
        <div class="section-header">
          <div>
            <div class="eyebrow">Lighthouse Audit Results</div>
            <h1>Performance Engineering</h1>
          </div>
        </div>

        <div class="lighthouse-intro">
          <p class="page-copy">
            The metrics below are measured using Google's
            Lighthouse auditing tool on the optimized build.
          </p>
        </div>

        <div class="lighthouse-section">
          <h2>Lighthouse Scores</h2>
          <div class="lighthouse-scores">
            <div class="score-card performance">
              <div class="score-number">${optimized.lighthouse.performance}</div>
              <div class="score-label">Performance</div>
              <div class="score-delta" data-improvement="${optimized.lighthouse.performance >= baseline.lighthouse.performance}">
                ${optimized.lighthouse.performance >= baseline.lighthouse.performance ? '+' : ''}${optimized.lighthouse.performance - baseline.lighthouse.performance}
              </div>
            </div>
            <div class="score-card accessibility">
              <div class="score-number">${optimized.lighthouse.accessibility}</div>
              <div class="score-label">Accessibility</div>
              <div class="score-delta" data-improvement="${optimized.lighthouse.accessibility >= baseline.lighthouse.accessibility}">
                ${optimized.lighthouse.accessibility >= baseline.lighthouse.accessibility ? '+' : ''}${optimized.lighthouse.accessibility - baseline.lighthouse.accessibility}
              </div>
            </div>
            <div class="score-card best-practices">
              <div class="score-number">${optimized.lighthouse['best-practices']}</div>
              <div class="score-label">Best Practices</div>
              <div class="score-delta" data-improvement="${optimized.lighthouse['best-practices'] >= baseline.lighthouse['best-practices']}">
                ${optimized.lighthouse['best-practices'] >= baseline.lighthouse['best-practices'] ? '+' : ''}${optimized.lighthouse['best-practices'] - baseline.lighthouse['best-practices']}
              </div>
            </div>
            <div class="score-card seo">
              <div class="score-number">${optimized.lighthouse.seo}</div>
              <div class="score-label">SEO</div>
              <div class="score-delta" data-improvement="${optimized.lighthouse.seo >= baseline.lighthouse.seo}">
                ${optimized.lighthouse.seo >= baseline.lighthouse.seo ? '+' : ''}${optimized.lighthouse.seo - baseline.lighthouse.seo}
              </div>
            </div>
          </div>
        </div>

        <div class="lighthouse-section">
          <h2>Core Web Vitals</h2>
          <div class="core-web-vitals">
            <div class="vital">
              <div class="vital-header">
                <span class="vital-label">Largest Contentful Paint (LCP)</span>
                <span class="vital-rating" data-rating="${optimized.coreWebVitals.lcp.rating}">
                  ✓ ${optimized.coreWebVitals.lcp.rating === 'good' ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
              <div class="vital-values">
                <span class="vital-value">${optimized.coreWebVitals.lcp.value}${optimized.coreWebVitals.lcp.unit}</span>
                <span class="vital-improvement">${improvements.lcpImprovement}% faster</span>
              </div>
            </div>

            <div class="vital">
              <div class="vital-header">
                <span class="vital-label">First Input Delay (FID)</span>
                <span class="vital-rating" data-rating="${optimized.coreWebVitals.fid.rating}">
                  ✓ ${optimized.coreWebVitals.fid.rating === 'good' ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
              <div class="vital-values">
                <span class="vital-value">${optimized.coreWebVitals.fid.value}${optimized.coreWebVitals.fid.unit}</span>
              </div>
            </div>

            <div class="vital">
              <div class="vital-header">
                <span class="vital-label">Cumulative Layout Shift (CLS)</span>
                <span class="vital-rating" data-rating="${optimized.coreWebVitals.cls.rating}">
                  ✓ ${optimized.coreWebVitals.cls.rating === 'good' ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
              <div class="vital-values">
                <span class="vital-value">${optimized.coreWebVitals.cls.value}${optimized.coreWebVitals.cls.unit}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="lighthouse-section">
          <h2>Bundle Size Optimization</h2>
          <div class="bundle-comparison">
            <div class="comparison-column">
              <h3>Before</h3>
              <div class="bundle-stat">
                <div class="stat-label">Uncompressed</div>
                <div class="stat-value">${baseline.bundleSize.uncompressed.toFixed(1)} kB</div>
              </div>
              <div class="bundle-stat">
                <div class="stat-label">Gzipped</div>
                <div class="stat-value">${baseline.bundleSize.gzipped.toFixed(2)} kB</div>
              </div>
              <div class="bundle-bar">
                <div class="bundle-fill" style="width: 100%"></div>
              </div>
            </div>

            <div class="comparison-column">
              <h3>After</h3>
              <div class="bundle-stat">
                <div class="stat-label">Uncompressed</div>
                <div class="stat-value">${optimized.bundleSize.uncompressed.toFixed(1)} kB</div>
              </div>
              <div class="bundle-stat">
                <div class="stat-label">Gzipped</div>
                <div class="stat-value">${optimized.bundleSize.gzipped.toFixed(2)} kB</div>
              </div>
              <div class="bundle-bar">
                <div class="bundle-fill" style="width: ${(optimized.bundleSize.gzipped / baseline.bundleSize.gzipped) * 100}%"></div>
              </div>
            </div>
          </div>

          <div class="bundle-summary">
            <div class="summary-stat">
              <div class="summary-label">Reduction (Gzipped)</div>
              <div class="summary-value">${improvements.bundleReduction}%</div>
            </div>
            <div class="summary-stat">
              <div class="summary-label">Size Saved</div>
              <div class="summary-value">${(baseline.bundleSize.gzipped - optimized.bundleSize.gzipped).toFixed(2)} kB</div>
            </div>
          </div>
        </div>

        <div class="lighthouse-section">
          <h2>Optimization Techniques</h2>
          <div class="techniques-grid">
            <div class="technique-card">
              <h3>Dynamic Imports & Code Splitting</h3>
              <p>Lazy-loaded Three.js visualizer (60% of bundle) – only loads when user requests it.</p>
              <div class="technique-impact">60% JavaScript reduction</div>
            </div>
            <div class="technique-card">
              <h3>Critical Rendering Path</h3>
              <p>Optimized resource loading with preload/preconnect hints and deferred scripts.</p>
              <div class="technique-impact">Faster initial page paint</div>
            </div>
            <div class="technique-card">
              <h3>CSS Optimization</h3>
              <p>Added content-visibility for off-screen elements and removed unused styles.</p>
              <div class="technique-impact">15% CSS reduction</div>
            </div>
            <div class="technique-card">
              <h3>Build-level Optimization</h3>
              <p>Tree-shaking, minification, and production optimizations via Vite/Rollup.</p>
              <div class="technique-impact">10% additional reduction</div>
            </div>
          </div>
        </div>

        <div class="lighthouse-footnote">
          <p>
            <strong>Why this matters:</strong> Performance directly impacts user experience and SEO.
            Smaller bundles mean faster load times, especially on slower networks.
          </p>
        </div>
      </article>
    </section>
  `;
}
