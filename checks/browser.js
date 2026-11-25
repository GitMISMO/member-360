// Member 360 browser checks (Change Notice CN-033, Jonna, Nov 25, 2026). Run from this folder:
//   npm install && npx playwright install chromium && npm test            checks the test copy (test/index.html)
//   node browser.js ../index.html                                         checks another copy of the page
// Opens the page in a headless browser with a pretend sign-in and a pretend save relay holding two made-up
// companies, so nothing real is read or changed and nothing reaches MISMO. The shared Back-button helper
// (resources.mismo.org/assets/back.js) is served as it is live; MISMO_BACK=<file> tries a local copy instead.
// Fails (exit code 1) if any check fails; GitHub then emails whoever saved.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const FILE = path.resolve(process.argv[2] || path.join(ROOT, 'test', 'index.html'));
const RELAY = 'lambda-url.us-east-1.on.aws/member-360/data/';

const SESSION = `window.ResourcesSession={current:()=>({email:'tester@example.org',name:'Test Person'}),
  token:()=>'t',isAdmin:()=>true,canEdit:()=>true,role:()=>'admin',requireAccess:()=>Promise.resolve(),
  signIn:()=>Promise.resolve(),onChange:()=>{},ready:Promise.resolve()};`;

/* two made-up companies: never real member data (this repository is public) */
const iy = () => ({ inv: 0, units: 0, rank: 0, ch: '', st: '', cs: '', paid: 0, pd: '', invSt: '', lvl: '' });
const org = (k, cid, name, life, level) => ({ k, cid, row: 1, name, sector: 'Lender', market: '', cu: false, addr: '',
  joined: '2024-01-01', thru: '2026-12-31', created: '2024-01-01', life, stage: '', type: 'Lender', level, lossReason: '',
  hist: [{ y: '2026', status: life === 'Active' ? 'Member' : '', level }], twoYear: false, viaForm: false,
  people: [{ email: 'pat@' + k + '.example', name: 'Pat Example', title: 'VP', phone: '', roles: [] }],
  advisors: [], hand: [], notes: [], dupId: false, noId: false,
  iif: { y26: iy(), y25: iy(), mers: '', mba: '', bod: false, state: '', row: 1 }, sector5: 'Lender', sectorSrc: '' });
const DATA = JSON.stringify({ meta: { source: 'made-up test data', asOf: '2026-11-01', count: 2, iifYear: '2026', stageYear: '2027' },
  orgs: [org('tst-alpha', '900001', 'Alpha Test Lending', 'Active', 'Corporate'), org('tst-beta', '900002', 'Beta Test Bank', 'Prospect', '')] });
const STORE = { orgsdata: { chunked: { ver: 'vtest', n: 1 } }, 'orgsdata--vtest-0': { s: DATA } };

let BACK = null;
async function backJs() {
  if (BACK !== null) return BACK;
  if (process.env.MISMO_BACK) BACK = fs.readFileSync(process.env.MISMO_BACK, 'utf8');
  else { const r = await fetch('https://resources.mismo.org/assets/back.js'); if (!r.ok) throw new Error('could not fetch the live back.js: ' + r.status); BACK = await r.text(); }
  return BACK;
}

async function open(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  const back = await backJs();
  await page.route('**/*', async r => {
    const u = r.request().url();
    if (u.startsWith('http://m360.test/member-360/')) return r.fulfill({ body: fs.readFileSync(FILE), contentType: 'text/html' });
    if (u.includes('/assets/session.js')) return r.fulfill({ contentType: 'application/javascript', body: SESSION });
    if (u.includes('/assets/back.js')) return r.fulfill({ contentType: 'application/javascript', body: back });
    if (u.includes(RELAY) && r.request().method() === 'GET') {
      const name = decodeURIComponent(u.split(RELAY)[1].split('?')[0]);
      return r.fulfill({ contentType: 'application/json', body: JSON.stringify(STORE[name] ? { data: STORE[name], sha: 's0' } : { data: null }) });
    }
    if (u.includes('lambda-url')) return r.fulfill({ status: 403, contentType: 'application/json', body: '{"error":"NO_ACCESS"}' });
    if (u.startsWith('http://m360.test')) return r.fulfill({ status: 404, body: '' });
    return r.abort();
  });
  await page.goto('http://m360.test/member-360/');
  await page.waitForFunction(() => document.querySelectorAll('.hq nav button[data-hq][aria-current]').length === 1, null, { timeout: 30000 });
  /* the "Opening Member 360" cover waits for every source; with the pretend relay some never come, so it lifts
     after its own 60 seconds at most */
  await page.waitForFunction(() => !document.getElementById('m3o'), null, { timeout: 80000 });
  await page.waitForTimeout(1500);
  return { page, errs };
}

const results = [];
async function check(name, fn) {
  try { await fn(); results.push(true); console.log('  PASS  ' + name); }
  catch (e) { results.push(false); console.log('  FAIL  ' + name + '\n        ' + String(e.message).split('\n').join('\n        ')); }
}
function expect(c, msg) { if (!c) throw new Error(msg); }

(async () => {
  console.log('Member 360 browser checks on ' + path.relative(ROOT, FILE));
  const browser = await chromium.launch();

  /* 1. The browser's Back button: it closes what is open, then goes to the last page you were on (CN-033) */
  await check('Back button: closes the panel, then returns to the last page', async () => {
    const s = await open(browser), P = s.page;
    const state = () => P.evaluate(() => ({
      tab: ((document.querySelector('.hq nav button[data-hq][aria-current]') || {}).dataset || {}).hq || '',
      pane: document.body.classList.contains('paneon'), dialog: !!document.querySelector('dialog[open]'),
      helper: !!window.MismoBack, url: location.pathname + location.hash }));
    let st = await state();
    expect(st.helper, 'the shared Back helper (/assets/back.js) did not load');
    const start = st.tab, url0 = st.url;
    const go = async tab => { await P.click('.hq nav button[data-hq="' + tab + '"]'); await P.waitForTimeout(1200); };
    const back = async () => { await P.evaluate(() => history.back()); await P.waitForTimeout(1200); };
    const openRow = async () => {
      const row = await P.$('#v-members .rowbtn[data-k]');
      expect(row, 'Members and Prospects has no rows to open');
      await row.click(); await P.waitForTimeout(1200);
      expect((await state()).pane, 'a company did not open in the right-hand panel');
    };
    expect(start === 'home', 'Member 360 should open on Home: ' + JSON.stringify(st));

    await go('renewals'); await go('stats'); await go('help');
    st = await state(); expect(st.tab === 'help', 'Help did not open: ' + JSON.stringify(st));
    expect(st.url === url0, 'the address bar changed: ' + st.url);
    await back(); st = await state(); expect(st.tab === 'stats', 'Back from Help should land on Membership Stats: ' + JSON.stringify(st));
    await back(); st = await state(); expect(st.tab === 'renewals', 'Back again should land on Renewals: ' + JSON.stringify(st));
    await P.evaluate(() => history.forward()); await P.waitForTimeout(1200);
    st = await state(); expect(st.tab === 'stats', 'Forward should go to Membership Stats again: ' + JSON.stringify(st));
    await back(); await back(); st = await state(); expect(st.tab === start, 'Back to where the page opened (' + start + '): ' + JSON.stringify(st));

    /* a record's panel: Back closes it first and stays on the page */
    await go('members'); await openRow();
    await back(); st = await state();
    expect(!st.pane && st.tab === 'members', 'Back should close the panel and stay on Members and Prospects: ' + JSON.stringify(st));
    await back(); st = await state(); expect(st.tab === start, 'Back after the panel should go to the page before: ' + JSON.stringify(st));

    /* closing the panel with its X doesn't leave a step behind */
    await go('members'); await openRow();
    await P.click('#m360-pane-x'); await P.waitForTimeout(800);
    expect(!(await state()).pane, 'the X did not close the panel');
    await back(); st = await state(); expect(st.tab === start, 'after closing the panel with X, Back should go straight to the page before: ' + JSON.stringify(st));

    /* a pop-up over the page closes first too (made up here, since which pop-ups show depends on the data) */
    await go('members');
    await P.evaluate(() => { const d = document.createElement('dialog'); d.id = 'tst-dlg'; d.textContent = 'test';
      d.addEventListener('close', () => d.remove()); document.body.appendChild(d); d.showModal(); });
    await P.waitForTimeout(800);
    expect((await state()).dialog, 'the test pop-up did not open');
    await back(); st = await state();
    expect(!st.dialog && st.tab === 'members', 'Back should close the pop-up and stay on Members and Prospects: ' + JSON.stringify(st));

    expect(!s.errs.length, 'Page errors:\n' + s.errs.join('\n'));
    await P.close();
  });

  await browser.close();
  const failed = results.filter(r => !r).length;
  console.log('\n' + (results.length - failed) + ' of ' + results.length + ' checks passed.');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
