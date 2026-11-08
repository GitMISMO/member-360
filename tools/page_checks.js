// Member 360 Page Checks (Jonna, Nov 7, 2026; moved here from the workflow Nov 8, 2026 so Publish a Version runs the
// very same checks). Fails when:
//   - a script on a page doesn't parse, so the page would break
//   - something that looks like a key or token slipped into a page
//   - the test copy could save, or the live page couldn't
//   - the page safety list (Content-Security-Policy) is missing
//   - index.html isn't a published version (someone uploaded it by hand instead of using Publish a Version)
//
//   node tools/page_checks.js             checks index.html, test/index.html and the published-version rule
//   node tools/page_checks.js LIVE TEST   checks those two files as the live page and the test copy (Publish a Version)
const fs = require("fs"), vm = require("vm"), crypto = require("crypto"), path = require("path");

function checkPage(label, t, isTest) {
  const errs = [];
  const secret = [/ghp_[A-Za-z0-9]{30,}/, /github_pat_[A-Za-z0-9_]{40,}/, /AKIA[0-9A-Z]{16}/, /sk-ant-[A-Za-z0-9_-]{20,}/,
    /xox[bpas]-[A-Za-z0-9-]{10,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/];
  for (const re of secret) { const m = t.match(re); if (m) errs.push("Looks like a key or token: " + m[0].slice(0, 8) + "..."); }
  const re = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi; let m, n = 0;
  while ((m = re.exec(t))) {
    const attrs = m[1] || "";
    if (/\bsrc=/.test(attrs)) continue;
    if (/type=["']?(application\/(ld\+)?json|text\/template|module)/i.test(attrs)) continue;
    n++;
    try { new vm.Script(m[2], { filename: label + " script " + n }); } catch (e) { errs.push("Script " + n + " does not parse: " + e.message); }
  }
  if (isTest && !/var PREVIEW = true/.test(t)) errs.push("The test copy must have saving switched off (PREVIEW = true).");
  if (!isTest && !/var PREVIEW = false/.test(t)) errs.push("The live page has saving switched off (PREVIEW is not false).");
  if (!/Content-Security-Policy/.test(t.slice(0, 4000))) errs.push("The page safety list (Content-Security-Policy) is missing.");
  return { n, errs };
}

const args = process.argv.slice(2);
const pages = args.length === 2 ? [[args[0], false], [args[1], true]] : [["index.html", false], ["test/index.html", true]];
let bad = 0;
for (const [f, isTest] of pages) {
  if (!fs.existsSync(f)) { if (args.length === 2) { console.log("::error::Missing " + f); bad++; } continue; }
  const label = isTest ? "test copy (" + f + ")" : "live page (" + f + ")";
  const r = checkPage(label, fs.readFileSync(f, "utf8"), isTest);
  console.log(label + ": " + r.n + " scripts checked");
  for (const e of r.errs) { console.log("::error file=" + f + "::" + e); bad++; }
}

// index.html must be a version that Publish a Version made live (releases/index.json lists every one).
if (args.length !== 2 && fs.existsSync("releases/index.json") && fs.existsSync("index.html")) {
  const sha = crypto.createHash("sha256").update(fs.readFileSync("index.html")).digest("hex");
  const idx = JSON.parse(fs.readFileSync("releases/index.json", "utf8"));
  const v = (idx.versions || []).find(x => x.sha256 === sha);
  if (!v) {
    console.log("::error file=index.html::index.html was changed by hand. Make changes in test/index.html and use " +
      "Actions > Publish a Version to make them live (that also keeps a copy you can roll back to).");
    bad++;
  } else console.log("The live page is published version " + v.version + ".");
}

if (bad) { console.log(bad + " problem(s) found."); process.exit(1); }
console.log("All checks passed.");
