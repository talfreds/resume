import * as fs from 'fs';
import * as path from 'path';

// Read the built HTML
const distPath = path.join(process.cwd(), 'dist');
const htmlContent = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');

console.log('Checking built HTML for accessibility issues...\n');

// Check for prohibited ARIA attributes on generic divs
const ariaLabelOnDiv = /<div[^>]*aria-label[^>]*>/g;
const matches = htmlContent.match(ariaLabelOnDiv);

console.log('✓ Checking for prohibited aria-label on generic divs:');
if (matches) {
  matches.forEach(match => {
    if (match.includes('visualizer-stage')) {
      console.log('  ✗ FAILED: Found aria-label on visualizer-stage div');
      console.log(`    ${match}`);
    }
  });
} else {
  console.log('  ✓ PASSED: No aria-label found on visualizer-stage div');
}

// Check heading order (simplified check)
console.log('\n✓ Checking heading order:');
const headingRegex = /<h([1-6])/g;
let lastLevel = 0;
let headingCount = 0;
let violations = 0;

let match;
while ((match = headingRegex.exec(htmlContent)) !== null) {
  const currentLevel = parseInt(match[1]);
  headingCount++;
  
  // After h1, should go to h2 (not h3+)
  if (lastLevel === 1 && currentLevel > 2) {
    console.log(`  ✗ FAILED: Heading jump from h${lastLevel} to h${currentLevel}`);
    violations++;
  }
  // H5 shouldn't be followed by H4 unless you go through h2 and h3 first
  if (lastLevel === 5 && currentLevel === 4) {
    const context = htmlContent.substring(match.index - 100, match.index + 100);
    // Check if this is part of the visualizer section that we fixed
    if (context.includes('Trajectory')) {
      console.log(`  ✗ FAILED: H5 followed by H4 at Trajectory Data section`);
      violations++;
    }
  }
  lastLevel = currentLevel;
}

if (violations === 0) {
  console.log(`  ✓ PASSED: Heading order is correct (${headingCount} headings found)`);
}

console.log('\n=== Summary ===');
console.log(violations === 0 ? '✓ All accessibility checks PASSED' : `✗ ${violations} issues found`);
