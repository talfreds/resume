import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const options = {
      logLevel: 'info',
      output: 'json',
      port: new URL(browser.wsEndpoint()).port,
      onlyCategories: ['accessibility'],
    };
    const runnerResult = await lighthouse('http://localhost:4173/', options);
    
    // Extract key metrics
    const score = runnerResult.lhr.categories.accessibility.score * 100;
    const audits = runnerResult.lhr.audits;
    
    console.log(`\n✓ Accessibility Score: ${Math.round(score)}`);
    console.log('\nAudit Results:');
    
    for (const [auditId, audit] of Object.entries(audits)) {
      if (audit.score !== undefined && !audit.score) {
        console.log(`  ✗ ${audit.title}`);
        if (audit.details?.items?.length) {
          audit.details.items.slice(0, 3).forEach(item => {
            console.log(`    - ${item.node?.snippet || item.url || ''}`);
          });
        }
      }
    }
  } finally {
    await browser.close();
  }
})();
