/* Material shelf preflight. No dependencies.
   Checks catalog consistency, print paths and basic student-facing print rules. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'data/material-catalog.json'), 'utf8'));

const tests = [];
function test(name, action) { action(); tests.push(name); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }

test('catalog IDs are unique', () => {
  const ids = catalog.items.map(item => item.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('all catalog paths and statuses are known', () => {
  const allowedPaths = new Set(Object.keys(catalog.paths));
  const allowedStatuses = new Set(catalog.statuses);
  for (const item of catalog.items) {
    assert.ok(allowedPaths.has(item.path), item.id + ' unknown path');
    assert.ok(allowedStatuses.has(item.status), item.id + ' unknown status');
  }
});

test('all print-ready entries point to existing files', () => {
  for (const item of catalog.items.filter(item => item.printReady)) {
    assert.ok(item.printPath, item.id + ' missing printPath');
    assert.ok(fs.existsSync(path.join(root, item.printPath)), item.id + ' missing ' + item.printPath);
  }
});

test('bundle and hub paths exist', () => {
  for (const key of ['printHub','studentBundle','solutionBundle']) {
    assert.ok(catalog[key], key + ' missing');
    assert.ok(fs.existsSync(path.join(root, catalog[key])), key + ' file missing');
  }
});

test('student pages contain no visible solution section', () => {
  for (const item of catalog.items.filter(item => item.printPath?.includes('/schueler/'))) {
    const html = read(item.printPath);
    assert.ok(!/<h[1-6][^>]*>\s*Lösung/i.test(html), item.id + ' contains solution heading');
    assert.ok(!/>\s*Lösung:\s*</i.test(html), item.id + ' contains visible solution label');
  }
});

test('student pages use local sprint stylesheet', () => {
  for (const item of catalog.items.filter(item => item.printPath?.includes('/schueler/'))) {
    const html = read(item.printPath);
    assert.ok(html.includes('href="../print.css"'), item.id + ' wrong stylesheet path');
  }
});

test('A5 student base stylesheet uses 14pt minimum text classes', () => {
  const css = read('material/druck/sprint-01/print.css');
  assert.match(css, /html, body[\s\S]*font-size:\s*14pt/);
  assert.match(css, /\.eyebrow[\s\S]*font-size:\s*14pt/);
  assert.match(css, /\.reflection[\s\S]*font-size:\s*14pt/);
  assert.match(css, /\.small\s*\{\s*font-size:\s*14pt/);
});

test('no visible performance labels in student pages', () => {
  const forbidden = [/\bLevel\s*\d/i,/\bBronze\b/i,/\bSilber\b/i,/\bGold\b/i,/\bleicht\b/i,/\bmittel\b/i,/\bschwer\b/i,/\bAnfänger\b/i,/\bProfi\b/i];
  for (const item of catalog.items.filter(item => item.printPath?.includes('/schueler/'))) {
    const html = read(item.printPath).replace(/<style>[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ');
    for (const rule of forbidden) assert.ok(!rule.test(html), item.id + ' contains forbidden visible level label ' + rule);
  }
});

test('all prototype student materials include child goal and reflection', () => {
  for (const item of catalog.items.filter(item => item.printPath?.includes('/schueler/'))) {
    const html = read(item.printPath);
    assert.ok(html.includes('Heute übst du'), item.id + ' missing child goal');
    assert.ok(html.includes('Wie ging es?'), item.id + ' missing reflection');
  }
});

test('teacher material shelf exists and navigator links to it', () => {
  assert.ok(fs.existsSync(path.join(root, 'material/lehrkraft.html')), 'teacher shelf missing');
  const shelf = read('material/lehrkraft.html');
  assert.ok(shelf.includes('../data/material-catalog.json'), 'teacher shelf must load material catalog');
  const navigator = read('index.html');
  assert.ok(navigator.includes('./material/lehrkraft.html'), 'navigator teacher link missing');
  assert.ok(navigator.includes('Materialtheke öffnen'), 'navigator teacher link label missing');
});

console.log(tests.map(t => 'PASS ' + t).join('\n'));
console.log('\n' + tests.length + ' material checks passed.');
