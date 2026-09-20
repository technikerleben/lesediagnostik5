/* Optional maintenance check. No dependencies, build step, network or real student data.
   Runs the shipped JS in a small DOM/storage test double, NOT a browser engine. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { webcrypto } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(source);
const memory = new Map(), nodes = new Map(), events = {};
let markup = '', capturedExports = [], failWrites = false, focused = null;
function node(id) {
  return { id, value: '', dataset: {}, disabled: false, hidden: false, scrollTop: 0, listeners: {},
    classList: { toggle() {} }, style: { setProperty() {} },
    addEventListener(name, action) { this.listeners[name] = action; },
    setAttribute(name, value) { this[name] = value; },
    focus() { focused = this; } };
}
const app = node('app');
Object.defineProperty(app, 'innerHTML', {
  get() { return markup; },
  set(value) {
    markup = value; nodes.clear(); nodes.set('app', app);
    for (const m of value.matchAll(/<(?:button|input|div|h1|p|form)\b([^>]*)>/g)) {
      const attrs = m[1];
      const id = attrs.match(/\bid="([^"]+)"/)?.[1];
      const option = attrs.match(/\bdata-option="([^"]+)"/)?.[1];
      const example = attrs.match(/\bdata-example="([^"]+)"/)?.[1];
      if (!id && !option && !example) continue;
      const el = node(id || 'option-' + (option || example));
      if (option) el.dataset.option = option;
      if (example) el.dataset.example = example;
      el.dataset.passage = attrs.match(/data-passage="([^"]+)"/)?.[1];
      el.value = attrs.match(/value="([^"]*)"/)?.[1] || '';
      el.disabled = /\bdisabled\b/.test(attrs);
      nodes.set(el.id, el);
    }
  }
});
nodes.set('app', app);
const document = { hidden: false, getElementById: id => nodes.get(id) || null,
  querySelectorAll(selector) {
    return [...nodes.values()].filter(n => selector.includes('[data-option]') && n.dataset.option ||
      selector.includes('[data-example]') && n.dataset.example || selector.includes('#unknown-answer') && n.id === 'unknown-answer');
  },
  addEventListener(name, action) { events[name] = action; },
  documentElement: node('root'), body: node('body') };
const context = vm.createContext({ console, crypto: webcrypto, TextEncoder, Uint8Array, Uint32Array,
  btoa, atob, performance, Date, Math, Blob, URL, setTimeout, confirm: () => true, document,
  window: { addEventListener(name, action) { events[name] = action; } },
  localStorage: {
    getItem: k => memory.get(k) ?? null,
    setItem(k, v) { if (failWrites) throw new Error('QuotaExceededError'); memory.set(k, v); },
    removeItem: k => memory.delete(k)
  }
});
vm.runInContext(source, context);
const run = code => vm.runInContext(code, context);
context.testSets = ['eiche', 'ahorn', 'birke'].map(s => JSON.parse(fs.readFileSync(path.join(root, 'data/sets', s + '.json'))));
context.testRules = JSON.parse(fs.readFileSync(path.join(root, 'data/scoring/pilot-rules.json')));
run('state.sets=testSets;state.rules=testRules');
const tests = [];
function test(name, action) { action(); tests.push(name); }
function click(id) { const el = nodes.get(id); assert.ok(el, id); assert.equal(el.disabled, false, id + ' disabled'); el.listeners.click(); }
function begin(setIndex) {
  run('renderIntro()'); nodes.get('participant-name').value = 'TEST-ONLY'; nodes.get('class-name').value = 'TEST';
  run('state.teacherUnlocked=true;startRun()');
  assert.equal(run('state.teacherUnlocked'), false);
  assert.equal(run('state.stage'), 'example');
  assert.equal(nodes.get('begin-tasks').disabled, true);
  click('option-circle'); click('begin-tasks');
  if (setIndex != null) { context.setIndex = setIndex; run('state.activeSet=state.sets[setIndex];state.queue=flattenSet(state.activeSet);state.optionOrders=prepareOptionOrders(state.queue,state.runSeed);renderTask()'); }
}
function finish(perfect) {
  while (run('state.stage') !== 'result') {
    const type = run('state.queue[state.index].type');
    if (type === 'timed_reading') { click('start-reading'); run('state.fluency.startedAt=performance.now()-60000'); click('finish-reading'); }
    else {
      if (type === 'self_report') click('option-a');
      else if (perfect) click('option-' + run('state.queue[state.index].correctOption'));
      else click('unknown-answer');
      click('confirm-answer');
    }
  }
}
(async function main() {
  test('data contract, all items, IDs, score maxima, exact word counts', () => run('validateProject(testSets,testRules)'));
  test('invalid item fails before start', () => {
    assert.throws(() => run('(()=>{const sets=JSON.parse(JSON.stringify(testSets));sets[0].sections[0].items[0].correctOption="missing";validateProject(sets,testRules)})()'));
  });
  test('all 1170 primary score combinations and boundary values', () => {
    assert.equal(run(`(()=>{let count=0;for(let a=0;a<=9;a++)for(let b=0;b<=12;b++)for(let c=0;c<=8;c++){const result=recommendationFrom({...INITIAL_SCORES,reading_base:a,word_sentence:b,text_basic:c});if(result.primary!==(a<7?'wave':b<9||c<6?'compass':'magnifier'))throw Error('wrong');count++}return count})()`), 1170);
    assert.equal(run('recommendationFrom({}).primary'), null);
    assert.equal(run('recommendationFrom({...INITIAL_SCORES,reading_base:100}).primary'), null);
  });
  test('secondary recommendation cannot mask a weak other domain', () => {
    assert.equal(run('recommendationFrom({...INITIAL_SCORES,reading_base:9,word_sentence:8,text_basic:0,text_deep:5}).secondary'), null);
    assert.equal(run('recommendationFrom({...INITIAL_SCORES,reading_base:9,word_sentence:8,text_basic:6,text_deep:5}).secondary'), 'magnifier');
    assert.equal(run('recommendationFrom({...INITIAL_SCORES,reading_base:9,word_sentence:9,text_basic:5,text_deep:5}).secondary'), 'magnifier');
  });
  test('balanced answer positions for every form across 1000 seeds', () => {
    run(`for(const set of testSets)for(let seed=0;seed<1000;seed++){const q=flattenSet(set),o=prepareOptionOrders(q,seed),groups={};for(const i of q){if(!i.correctOption)continue;const n=i.options.length;groups[n] ||= Array(n).fill(0);groups[n][o[i.id].indexOf(i.correctOption)]++;}for(const g of Object.values(groups))if(Math.max(...g)-Math.min(...g)>1)throw Error('unbalanced')}`);
  });
  await run('setTeacherPin("246810")');
  assert.equal(await run('verifyTeacherPin("246810")'), true);
  assert.equal(await run('verifyTeacherPin("9999")'), false);
  assert.ok(!memory.get('lesediagnostik5:v1:teacher-pin').includes('246810'));
  tests.push('PIN hashed, valid/invalid verification');
  test('all forms: example, selection, confirmation, text, self-report, result, storage', () => {
    for (let index=0; index<3; index++) {
      begin(index);
      const panel = app.innerHTML, heading = nodes.get('task-heading');
      click('option-' + run('state.queue[0].correctOption'));
      assert.equal(app.innerHTML, panel, 'selection must not replace DOM');
      assert.equal(nodes.get('task-heading'), heading);
      assert.equal(run('state.index'), 0); assert.equal(run('state.scores.reading_base'), 0);
      click('confirm-answer'); assert.equal(run('state.scores.reading_base'), 1);
      finish(true);
      assert.equal(run('state.pendingRun'), null);
      assert.equal(run('state.resultData.recommendation.primary'), 'magnifier');
      assert.equal(run('loadRuns().at(-1).itemResults.length'), 46);
      assert.equal(run('loadRuns().at(-1).readingBase.orthographic_discrimination.correct'), 3);
      click('done'); assert.equal(run('state.teacherUnlocked'), false);
    }
  });
  test('unknown answers produce zero scores, not missing/NaN', () => {
    begin(); finish(false); assert.equal(run('state.resultData.recommendation.primary'), 'wave');
    assert.ok(run('Object.values(state.scores).every(v=>v===0)')); click('done');
  });
  test('same participant does not immediately repeat either of last two forms', () => {
    const previous = run('loadRuns().slice(-2).map(r=>r.setId)'); begin(); assert.ok(!previous.includes(run('state.activeSet.setId'))); run('resetToIntro(false)');
  });
  test('text scroll persists across selection and next question', () => {
    begin(0); run('state.index=state.queue.findIndex(i=>i.contextPassage);renderTask()');
    const passage = nodes.get('reading-passage'); passage.scrollTop = 180;
    click('option-a'); assert.equal(nodes.get('reading-passage'), passage); assert.equal(passage.scrollTop, 180);
    click('confirm-answer'); assert.equal(nodes.get('reading-passage').scrollTop, 180); run('resetToIntro(false)');
  });
  test('tab hiding locks teacher area and marks reading interruption', () => {
    begin(); run('state.index=state.queue.findIndex(i=>i.type==="timed_reading");renderTask()'); click('start-reading');
    document.hidden=true; events.visibilitychange(); document.hidden=false;
    assert.equal(run('state.fluency.interrupted'), true);
    click('finish-reading'); run('state.scores.fluency_check=2');
    assert.equal(run('fluencyInterpretation(state.scores,state.fluency)'), 'interrupted_or_missing'); run('resetToIntro(false)');
  });
  test('quota error retains result and retry saves exactly once', () => {
    begin(); failWrites=true; finish(true); assert.ok(run('state.pendingRun')); assert.equal(nodes.has('done'), false);
    const id = run('state.pendingRun.id'); failWrites=false; click('retry-save'); assert.equal(run('state.pendingRun'), null);
    assert.equal(run('loadRuns()').filter(r=>r.id===id).length,1); click('done');
  });
  context.capture = (name, rows) => capturedExports.push({name, rows});
  run('downloadCsv=capture');
  test('locked exports/deletion denied; unlocked exports complete and rectangular', () => {
    run('exportSummaryCsv();exportItemCsv();handleDeleteAll()'); assert.equal(capturedExports.length,0); assert.ok(run('loadRuns().length')>0);
    run('state.teacherUnlocked=true;exportSummaryCsv();exportItemCsv()');
    assert.equal(capturedExports.length,2);
    for(const output of capturedExports) for(const row of output.rows) assert.equal(row.length,output.rows[0].length);
    assert.ok(capturedExports[0].rows[0].includes('lesetempo_einordnung'));
    assert.ok(capturedExports[1].rows[0].includes('durchlauf_id'));
  });
  test('CSV escaping and formula neutralization; HTML escaping', () => {
    assert.equal(run('csvEscape("=1+1")'), "'=1+1");
    assert.equal(run('csvEscape("  @SUM(A1)")'), "'  @SUM(A1)");
    assert.equal(run('csvEscape(\'a;"b\')'), '"a;""b"');
    assert.equal(run('escapeHtml("<img onerror=x>")'), '&lt;img onerror=x&gt;');
  });
  test('legacy run preserved and marked, teacher profile renders', () => {
    run('(()=>{const r=loadRuns()[0];r.id="legacy-test";r.setVersion="0.3";delete r.readingBase;delete r.optionOrders;saveDiagnosticRun(r);renderIntro()})()');
    assert.ok(app.innerHTML.includes('Ältere Aufgabenfassung'));
  });
  test('corrupt storage remains byte-for-byte unchanged; no overwrite', () => {
    const key='lesediagnostik5:v1:runs',saved=memory.get(key); memory.set(key,'{broken');
    assert.throws(()=>run('loadRuns()')); assert.throws(()=>run('saveDiagnosticRun({})')); assert.equal(memory.get(key),'{broken');
    run('renderIntro()'); assert.ok(app.innerHTML.includes('Rohsicherung')); memory.set(key,saved);
  });
  test('delete removes pupil data but retains device PIN', () => {
    run('state.teacherUnlocked=true;handleDeleteAll()'); assert.equal(run('loadRuns().length'),0); assert.equal(run('loadParticipants().length'),0); assert.equal(run('hasTeacherPin()'),true);
  });
  console.log(tests.map(t=>'PASS '+t).join('\n'));
  console.log('\n'+tests.length+' checks passed (DOM/storage test double; real Safari still requires device testing).');
})().catch(error => { console.error(error); process.exitCode=1; });
