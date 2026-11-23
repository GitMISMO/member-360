# Developing Member 360

How Member 360 works, for whoever changes it next, whether that's a new Claude or a person. Read this whole file
before changing anything. It's the developer guide. The guide for the people who *use* Member 360 is **Help**,
inside the page (https://resources.mismo.org/member-360/#help); don't treat Help as this guide.

**When a feature changes, update Help and this file in the same change**, and add a line to CHANGELOG.md.

Every MISMO system follows the rules in the `mismo-connected-systems` skill (stay in your lane, connections are
contracts, never overwrite newer work, the same safety net everywhere). This file is how those rules apply here.

Contents: What It Is · Where Everything Lives · How a Change Goes Live · Scheduled Jobs · Connections · Rules and
Decisions · System Health · Safety Net · Working Safely

---

## What It Is

Member 360 is MISMO's member and prospect CRM. It shows each member's and prospect's whole relationship with
MISMO in one place: membership level and history, Innovation Investment Fee (IIF) payments, contacts, touchpoints,
the sales pipeline, renewals, certifications, webinars, summits, logos and email.

**Who uses it**

| Who | What they do |
|---|---|
| Kelly Bradshaw (Director of Strategic Growth) | Prospects, pipeline, renewals, targeted email lists |
| Amy Moses | Memberships, renewals, playbook emails |
| Brian Vieaux (possibly) | Memberships |
| Jonna Critchley (admin) | Everything, plus Settings, the Issues Log and System Health |
| Everyone else on staff | View only |

The membership team (membership@mismo.org) does **not** use Member 360. They have the Membership Desk, their own
page, which Member 360 feeds. Never send them into Member 360.

Main parts of the page (left menu): Home, Outreach Planner, Renewals, Members and Prospects, Targeted Lists,
Membership Stats, Monthly Report, Membership Desk (link), IIF Cycle, Logo Review, Issues Log, System Health
(Jonna only), Activity, Playbooks, Settings, Help.

---

## Where Everything Lives

| What | Where |
|---|---|
| Live page | https://resources.mismo.org/member-360/ (GitHub Pages from this repo, `GitMISMO/member-360`, file `index.html`). Sign-in required (the shared resources.mismo.org sign-in, `/assets/session.js`). |
| Test copy | https://resources.mismo.org/member-360/test/ (file `test/index.html`). Reads the real data, saves nothing, sends no email. Every change goes here first. |
| Published versions | `releases/` (every version ever made live, never deleted) and `releases/index.json` (the list, plus the publish and rollback history) |
| Publishing tools | `tools/test_copy.py`, `tools/publish.py`, `tools/page_checks.js`, `tools/test-copy-head.txt`, `tools/test-copy-tail.txt` |
| Other pages in this repo | `apply/` (the membership application form), `applied/` (Member Setup, after applying), `meet.html` (Schedule a Membership Engagement Meeting), `outlook/` (the Outlook add-in for logging emails from classic Outlook), `badges/` (member and champion badges), `mismo-logo-email.png` |
| Change log | `CHANGELOG.md`: one line per change people would notice, newest first |
| Member data | The **private** repo `GitMISMO/member-360-data`, folder `data/`. Never in this repo. |
| Save relay | `https://rgvdi67cg27o5kcmiytcqbqnrm0hmztx.lambda-url.us-east-1.on.aws/member-360/…`, project key **`member-360`**. The one door to `member-360-data`: it checks who is signed in. `…/member-360/data/<name>` reads and saves a data file, and `…/member-360/file/<path>` reads any file, such as a logo or the weekly Aptify workbook. Perry Williams owns the relay (`relay-config`). |
| Technical guide (Claude Doc) | https://claude.ai/artifact/UJDU19Nwhz2TzQwKqvkjrV: runbook and background |
| Connections Map (Claude Doc) | https://claude.ai/artifact/UcBYh3aakukXcjYvjnWBY7: the contract for every hand-off |

**No token, key, password or member data ever goes in this repo or the page.** The page is public; the data
arrives only after sign-in.

### The data repo (`GitMISMO/member-360-data`)

- `data/<collection>.json`: one file per collection, shaped `{"docs": {"<collection>/<id>": {...}}}`. The page reads
  and writes them through the relay with `db.doc("collection/id")` and `db.collection("…")`. Collections include
  orgs, touchpoints, plans, aptify, sends, templates, engage, prospects, deals, sync, settings, issues, outbox,
  outbox-sent, regs, speakers, leaders, bootcamp, meetings, activity, lists, listsends, health, healthcheck,
  directory, aptifypull, iifinv (read only) and iifinvx.
- Large collections are saved in numbered parts (`name-0.json`, `name-1.json`…) with an index, and the Aptify
  data is split into its own files (`aptify-main`, `aptify-terms`, `aptify-ordermap`), because **the relay saves at
  most about 1 MB a file**. System Health › Storage watches this.
- `data/aptify-pull/<date>.xlsx`: every weekly Aptify workbook (archive).
- `data/logos/`: company logos.
- `scripts/`: the Python behind the scheduled jobs. `.github/workflows/`: the jobs themselves (below).
- Files other systems write here, which Member 360 only reads: `mismo-money-paid.json` and
  `mismo-money-square.json` (MISMO Money).

---

## How a Change Goes Live

**Nobody uploads `index.html` by hand.** Page Checks fails if anyone does.

1. **Start from the newest test copy.** Fetch `test/index.html` as it is on GitHub right now. Other Claude sessions
   save to these repos too, so never start from an old copy.
2. **Make the change in `test/index.html` only**, as small exact edits to that fresh copy (a three-way merge), and
   save it to GitHub. Leave the test copy's three test-only parts alone (see below).
3. **Page Checks runs on its own** for every save (`.github/workflows/page-checks.yml`). It checks that:
   - every script parses
   - there are no keys or tokens
   - the test copy can't save and the live page can
   - the page safety list (Content-Security-Policy) is there
   - `index.html` is a published version
   - the test copy can be published

   If it fails, GitHub emails whoever saved. Fix it before going on.
4. **Try it** at https://resources.mismo.org/member-360/test/ (GitHub Pages takes about a minute). Check the browser
   console for errors and click through the part you changed.
5. **Make it live:** Jonna runs **Actions › Publish a Version › Run workflow** and leaves "test copy" as it is. The
   workflow:
   - takes the three test-only parts back out
   - runs the same Page Checks on the result, and stops with the live page unchanged if anything fails
   - saves the result as `releases/<version>.html` (for example `20261108-1530`) and makes it `index.html`
   - asks GitHub Pages to rebuild

   Going live needs Jonna's OK, so ask her to run it, or run it only when she has said to.
6. **Update CHANGELOG.md**, and Help and this file if a feature changed.

The first time Publish a Version runs, it also saves the live page as it stood as a version (named `…-before`), so
there's always something to roll back to. Until that first run there's no `releases/index.json`, so the
"published version" check is skipped.

**Rolling back:** run Publish a Version again and type an earlier version from `releases/index.json` instead of
"test copy". That version becomes live again, and the test copy is reset to match it. The changes that were in the
test copy are still in the repo's history.

**The test copy's three test-only parts** (`tools/test_copy.py` adds and removes them):

1. Right after `<meta charset="utf-8">` comes `tools/test-copy-head.txt`. It keeps search engines out and blocks
   every save, upload and email (any non-GET request to the relay, GitHub or Microsoft Graph).
2. `var PREVIEW = true;` replaces the live page's `var PREVIEW = false;`.
3. Right before the last `</body></html>` comes `tools/test-copy-tail.txt`, the "Test copy" banner and ribbon.

If you ever need to change one of those parts, change the matching `tools/` file in the same commit, or the test copy
can't be published.

The **version stamp**: the page shows its own fingerprint (SHA-256 of the page file) and its last-modified time
under Settings and on System Health. A bar asks open copies to reload when a newer version is out (it checks every
15 minutes).

---

## Scheduled Jobs (`member-360-data/.github/workflows`)

GitHub's clock is UTC and doesn't change for daylight saving, so a job runs an hour earlier, Eastern time, in winter than in summer. Times below are Eastern in winter (Eastern Standard Time), with the UTC schedule in brackets. GitHub often starts timers late, which is why several jobs have more than one try; the scripts make sure each one acts only once.

| Workflow | What it does | When |
|---|---|---|
| **Daily Health Check** (`daily-health.yml`, `scripts/m360_health.py`) | Checks the feeds, the email flow, storage and restore points even when nobody has Member 360 open. Saves `data/healthcheck.json`, emails Jonna when something is red (at most once a day, and the same problem not again for 3 days), and fails the run if emails are stuck. "Run workflow" by hand only sends a test email. | 7:23 AM, second try 9:53 AM (12:23 and 14:53 UTC) |
| **Aptify Weekly Pull** (`aptify-pull.yml`, `scripts/m360_aptify_pull.py`) | Checks the newest emailed workbook in `data/aptify-pull/` (sheets, columns, row counts) and writes `data/aptifypull.json`. A bad workbook fails the run and isn't loaded. | Whenever the flow saves a workbook (Mondays) |
| **IIF Invoice Copies** (`iif-invoices.yml`, `scripts/m360_iif_invoices.py`) | Reads the IIF invoice copies index workbook in `data/iif-invoices/` and writes `data/iifinv.json` and its parts for the IIF Cycle page. A workbook without the required columns fails the run. | Whenever the flow saves the workbook (every 30 minutes during the cycle) |
| **New IIF Members Email** (`iif-new-members.yml`) | Queues the Wednesday New IIF Members email to Kelly (Jonna on Cc), sent even when nobody is new. | Wednesday afternoons, with retries into the evening (from 19:41 UTC) |
| **Membership Applications Report** (`applications-report.yml`) | Queues the end-of-day applications report to Amy, Kelly and Brian. | Weekdays, once, between 4:30 PM and midnight (several tries from 20:37 UTC) |
| **Deals Quoted to Prospects** (`quotes.yml`) | Builds `data/quotes.json` from the pipeline's forecast amounts, which the membership application flow puts in the membership team's set-up email. | Hourly on weekdays, 6:17 AM to 6:17 PM, and daily at about 5:17 AM; not on each save, to save Actions minutes |
| **Website Champions** (`website-champions.yml`) | Publishes champion members and logos to resources.mismo.org/champions/champions.json. | Each time Member 360 saves `champions.json` |
| **Member Directory Categories** (`directory-categories.yml`, `scripts/m360_directory.py`) | Publishes Lender or Industry per member company to resources.mismo.org/member-directory/categories.json, built from the same saved member list as members.json (`data/directory.json`), so the website's Lender and Industry always match Membership Stats. Individuals are left out. | Each save of `data/directory.json`, and daily at about 5:41 AM (10:41 UTC) |
| **Member Directory Members** (`directory-members.yml`, `scripts/m360_members.py`) | Publishes every current member (name, level, Lender or Industry, state, city, website; nothing else) to resources.mismo.org/member-directory/members.json. Won't publish fewer than 300 members, or a drop of more than a fifth. | Each save of `data/directory.json`, and daily at about 5:51 AM (10:51 UTC) |
| **Champion Logo Import** (`champion-logo-import.yml`) | Downloads the website's champion logos into `data/logos/` for Member 360 to place. | When its script changes, or by hand |
| **Logo Finder** (`logo-finder.yml`) | Looks for missing logos on each company's site and Wikipedia and saves candidates for review in Logo Review. Nothing goes on a company by itself. | When Member 360 asks (`data/logo-fetch.json`) |
| **Member 360 Reading Copy** - reading-copy.yml, tools/reading-copy.mjs, tools/reading-copy/extract.js, test/reading-copy.mjs | Writes reading-copy/: plain CSV files and a README about members, renewals, engagement and people, for the president's Claude project in MISMO's Team account. Opens the live index.html from this repo in a headless browser with data/, runs this page's own functions, then checks the files against what Home and Membership Stats show. If anything differs, or the folder would pass 500 KB, it writes nothing and fails, and GitHub emails Jonna. Read only. Run it by hand after publishing a change to functions it calls or to Home or Membership Stats. | Daily at about 6:07 AM, 11:07 UTC, after each Aptify Weekly Pull, and by hand |

The public feeds are written to `GitMISMO.github.io` with the repository secret `DIRECTORY_PUBLISH_TOKEN`. Secrets
live only in GitHub's settings, never in a file.

In **this** repo: **Page Checks** (every save of a page) and **Publish a Version** (by hand, above).

---

## Connections

The Connections Map (https://claude.ai/artifact/UcBYh3aakukXcjYvjnWBY7) is the contract. Read it before changing
any hand-off, update it in the same session, and add fields rather than renaming or removing them. The list below
mirrors it as of Nov 8, 2026; **if they disagree, the map wins.**

### Coming in

| From | What | Where | How often |
|---|---|---|---|
| Aptify (Reporting Services report `Member360_AptifyPull`) | One workbook: Membership Terms, Companies, Orders (this year's MISMO orders), Member Contacts (shipped in the last 45 days), MISMO Cases, All Contacts, Webinar Registrants (everyone registered for a MISMO webinar held on or after Nov 18, 2026; from `vwOrderMeetDetail`, meeting type Webinar, product category MISMO or a name with MISMO, cancelled ones left out by Member 360). Sheet and column names are the contract. | Emailed to Jonna and 360@mba.org. The flow **Member 360 - Aptify Weekly Pull** saves it to `data/aptify-pull/`, the GitHub job writes `aptifypull/main`, and Member 360 loads it as an upload in Settings › Aptify would (`aptify/main`, `aptify/terms`, `aptify/ordermap`). | Mondays 6:00 AM ET; loaded the next time someone who can save opens Member 360 |
| Aptify, by hand (backup) | The same files, uploaded in Settings › Aptify Member Data | same | Only if the email stops |
| MISMO Money | Paid Aptify orders, to count payments by company | `member-360-data/data/mismo-money-paid.json` (MISMO Money writes) | Each morning, plus changes; read every 30 minutes |
| MISMO Money | Square special members set up (TMC, Broker, ACUMA) | `data/mismo-money-square.json` (MISMO Money writes) | As set-ups happen; read every 5 minutes |
| Membership Desk | Finished set-ups with term dates; company address, phone and website | `membership-desk/data/done` and `setupinfo` (Member 360 reads; matched by Aptify Company ID first) | When the team marks one done |
| Website membership application (`apply/`) | Applications | `member-360/data/applications` | As people apply |
| 360 mailbox (360@mismo.org / 360@mba.org) | Emails forwarded or copied in, logged as touchpoints. Never creates prospects: an email is logged only when exactly one company matches. It skips the "Member 360 Aptify Pull" email. | Flow **Member 360 - 360 Mailbox** → `member-360/data/mailin` | As emails arrive |
| IIF invoice copies (MERS’s invoice emails copied to invfee@, spread over iifcopies1@ to iifcopies5@) | One row per copy: received, mailbox, to, subject, body, invoice number, amount, PDF name, PDF link (Q Drive), message ID. Never the PDF. | Flows **Member 360 - IIF Invoice Copies** (index workbook) and **Member 360 - IIF Invoice Index to GitHub** → `data/iif-invoices/` → GitHub job → `member-360/data/iifinv` (read only). Bounce reports: uploaded on the IIF Cycle page → `iifinvx` | As copies arrive (saved every 30 minutes) |
| Kelly's Smartsheet tracker (Jonna uploads it) | Notes, contacts and new companies only, **never** statuses, levels or dates | `member-360/data/trkpatch` | Weekly, by hand |
| Team HQ (Industry Events) | Contacts the team meets at industry events: each event `{id, name, start, end, city, status, gone?, example?, contacts:[{id, name, company, title, email, phone, by, follow, note}]}` | Member 360 reads `team-hq/data/events` (read only, the signed-in person's own sign-in); kept in `engage/events`; new companies become `prospects/ie<key>` (CN-003, Nov 23, 2026) | Each time Member 360 opens, then every 30 minutes |
| IIF Planning HQ | Due dates and Done marks of the nine key IIF cycle tasks (keep those task IDs) | Member 360 reads `iif-hq/data/tasks` (read only) | Each time Member 360 opens |
| MISMO email template | The one MISMO email look (`resources.mismo.org/assets/email-shell.html`) | Fetched at send time; nothing is sent without it | Each send |

### Going out

| To | What | Where | How often |
|---|---|---|---|
| Members, prospects and staff (email) | Playbook, Targeted List, mention, report and System Health alert emails, from each sender's own mailbox (Send As) | `member-360/data/outbox` → flow **Member 360 - Send Emails** (on Jonna's account) → `data/outbox-sent` | Within minutes |
| Membership team (email, through the same flow) | MISMO Money's Square set-up emails (step `mm-square`) and Member 360's new member set-ups | `data/outbox` | When sent |
| Membership Desk | To-dos: Square and new member set-ups, IIF lenders to turn on, Payment in Process | `membership-desk/data/todos` (Member 360 writes) | Whenever Member 360 is open |
| Membership Desk | The MISMO Cases sheet of the weekly workbook (the Desk reads it itself) | Desk reads `member-360/data/aptifypull` and the workbook | First Desk admin visit after the Monday email |
| Email flow and Membership Desk | **Shared Rules**: who can send, the IIF amount that makes a lender a member when there's no deal, the start-date cutoff day, champion levels | `data/settings.json`, `settings/main` → `shared` | Each flow run; each time the Desk opens |
| MISMO Media | New member logos, for the New Member Welcome section and a LinkedIn post request | `member-360/data/mm-newmembers`, logos under `member-360/file/` | MISMO Media reads on open |
| Summit HQ | The organizations list (which are lenders), to highlight lender presenters | `member-360/data/orgsdata`, in parts (read only) | Summit HQ reads on open |
| CMS | Member companies by Aptify ID with their terms, Sole memberships and name aliases, for member pricing | The CMS reads `aptify/main` and `sync/aliases` | At most every 6 hours |
| MISMO website: champions | Champion members, Lender and Industry by level (name, level, category, website, logo) | `data/champions.json` + `data/logos/` → Website Champions job | Each change |
| MISMO website: member directory | Lender or Industry per company; every current member `{updated, count, members:[{n,t,c,s,a,u}]}` | `data/aptify-main.json` and `directory/main` → the two directory jobs | Each change and daily |
| Membership application flow | Deals quoted to prospects | `data/quotes.json` (Deals Quoted job) | Daily and on change |
| The president's Claude project, MISMO's Team account | The reading copy: CSV files and a README of members, renewals, engagement and people. No emails, phones, addresses, sign-in links or private notes; payments stay in MISMO Money's reading copy | member-360-data/reading-copy/, written by the Member 360 Reading Copy job | Daily |

---

## Rules and Decisions (Jonna's)

- **Webinar registrants (Jonna, Nov 18, 2026).** Each load of the weekly pull reads the Webinar Registrants sheet (`webRegImport`). Every registrant's company is found by Aptify company ID, then email, company name, then email domain; a company not in Member 360 becomes a prospect (`prospects/wr<CompanyID>`, source "Webinar registration"). The whole list is saved in one doc, `engage/webreg`, and each registration shows on the company's Activity as a note built at load time (`rebuildIdx`, `virtual: true`), so no touchpoint is written per person. Those notes never count as the team's Last Touch, never complete a plan and never count as a reply. Removing one adds it to `engage/webreg` `hide`. MBA and MISMO staff are left out. The Activity Snapshot counts them too (`webOf`: the Webinar Registrations tile and the MISMO Webinars section; webinars before Nov 18, 2026 come from `APT.orders.w`, by company, and a webinar in `engage/webreg` is never counted twice).
- **Tidying prospects (Jonna, Nov 18, 2026).** A prospect added by hand or automatically has Belongs to Another Company (`prosTidy`: folds it in with `mergedInto`, Undo puts it back) and Remove This Prospect (sets `archived` on its prospects doc; `mergeProspects` leaves archived ones out and the webinar import never re-adds them). A prospect Member 360 added on its own never counts as the team's Last Touch.

- **Industry Events contacts (CN-003, approved by Jonna, Nov 23, 2026).** Team HQ's Industry Events page keeps the people the team meets at each event. `ievRun` reads `team-hq/data/events` (read only, like `loadKeyDates` reads IIF Planning HQ) about 20 seconds after Member 360 opens and every 30 minutes. Events set aside (`gone`) or marked `example` are skipped, and so are people with no name and MBA and MISMO staff. Each contact's company is found with `wrMatcher` (email, company name, email domain); when nothing matches and the contact has a real company name, someone who can save adds one prospect per company, `prospects/ie<key>` (`ievKey`: the normalized name plus a hash; source "Industry event"). A prospect that was removed (`PRARCH`) is never added again. The list is kept in one doc, `engage/events` (`ev: {eventId: [name, start, end, city]}`, `rows: [eventId, contactId, record key, name, title, company, follow 1/0, note]`, `last`, `hide`), saved only when it changes. Each row shows on the company's Activity as a note built at load time (`rebuildIdx` is wrapped; `virtual: true`, `src: "event"`), so it never counts as Last Touch, never completes a plan and never counts as a reply. Removing one adds it to `engage/events` `hide` (`ievHide`). A person without access to Team HQ's data just gets a yellow Team HQ Industry Events row on System Health; nothing else changes. Member 360 never writes to Team HQ.

These were decided on purpose. Don't change them without Jonna.

**Where the truth is**

- **Aptify is the source of truth** for membership: levels, term dates and whether a membership is current.
  Member 360 isn't a one-to-one rebuild of the old Smartsheet tracker.
- Past-year membership history comes from Aptify, not the Smartsheet tracker.
- Kelly's tracker brings in notes, contacts and new companies only, never statuses, levels or dates.
- In Aptify's Companies table, Join Date, Dues Paid Thru, Status and Member Type are **MBA's** membership, not
  MISMO's, and "MISMO Member Type Name" is a sticky flag. Only the term dates decide whether a membership is live.
  Member 360 never marks a member Former on its own; it lists the question in the Issues Log.

**Shared Rules** (Settings › Shared Rules, saved in `settings/main` → `shared`; the defaults in `RULE_DEF` apply until
something is saved)

- The **IIF amount** that makes a lender a member when there's no deal comes from Shared Rules (default $1,000).
  **Never hard-code 1000**; use `iifMin()`.
- Lenders on a deal (dues deals, Square specials) count as IIF lender members even when they pay less.
- IIF lenders count as **new** only the first time they reach the IIF amount.
- The membership **start-date cutoff day** comes from Shared Rules (default the 15th; use `startCutoff()`). Paid on
  or before it, the membership starts that month; after it, the next month. For IIF lenders, membership starts the
  month they pay.
- **Champion levels** are Associate, Executive and Chair (`championLevels()`). Champions get the Champion Member
  badge; everyone else gets the member badge.
- **Who can send email:** the senders list (Amy, Kelly, Jonna by default). The email flow reads the same list.

**Who can do what**

- Roles are set per person in People & Access: Admin and Staff can change records, View is read-only.
- Only Amy, Kelly and possibly Brian work memberships; everyone else views.
- System Health and the Issues Log are for Jonna. Keep the Issues Log off the team's Home page.

**Membership**

- New members are counted by join date from Aptify and Square, not only deals logged. The Monthly Membership Report
  shows new members only, no renewals.
- Subsidiaries get a free Corporate membership through their parent and count as members, as **Subsidiary**, not
  Free: First Funding, Docutech and ServiceMac (First American); DataVerify (Factual Data); Firstline Compliance
  (Evolve Mortgage).
- Sole memberships are offered only on request after an eligibility check.
- Match payments to companies by an ID tied to the payment (Aptify Company ID or order number), never by payer names.
  Placeholder IDs count as no ID. Match by Aptify ID first.
- A company name resolved in Member 360, the CMS or the Sponsorship Portal should resolve in all of them (for
  example Innovis = Factual Data).

**Email**

- Emails go from each sender's own mailbox, in her own voice (Send As). The Power Automate email connection runs on
  Jonna's account.
- Every test email also goes to Jonna.
- Member 360 does **not** send Square set-up emails (MISMO Money does). Its only emails to membership@ are new member
  set-ups.
- Membership engagement meeting requests go to scheduling@mismo.org.

**Safety**

- **Archive, never delete.** Anything that removes records should set them aside where they can be brought back.
  Permanent deletions are Jonna's call.
- Going live, sending to a list or posting publicly needs Jonna's OK.
- Never put a token, key or password in a page, repo or doc, and never type credentials. Jonna signs in herself.

---

## System Health (left menu; Jonna only)

Every open copy of Member 360 checks every 30 minutes, and the Daily Health Check on GitHub checks every morning
even when nobody has it open. When something turns red, Jonna gets one email: at most once a day, and the same
problem not again for 3 days. Gray dots are feeds that only change when something happens, so they never show late.

| Row | What it watches |
|---|---|
| Aptify Upload | The weekly Aptify data; late after 8 days, red after 14 |
| Aptify Weekly Email | The Monday workbook arrived, passed its check and was loaded |
| MISMO Money Payments | Payments MISMO Money matches to companies |
| Square Specials | Square payments and set-ups from MISMO Money |
| Membership Desk To-Dos | What the membership team sees on their desk |
| Kelly's Tracker Upload | Notes, contacts and new companies from her sheet |
| MISMO Matters New Members | New members handed to MISMO Media |
| Website Champion Logos | The public champions feed the website reads |
| Team HQ Industry Events | Contacts from Team HQ's industry events: when they were last read, yellow if they couldn't be read |
| Membership Applications | Applications from the website form |
| 360@ Mailbox | Emails forwarded or copied to 360@mismo.org |
| Email Flow | Power Automate picking up emails Member 360 queues (stuck after 30 minutes) |
| Failed Emails, Last 7 Days | Batches Power Automate couldn't send, real and test counted apart |
| Wednesday New IIF Members Email | Kelly's weekly email |
| Failed Saves, Last 7 Days | Changes someone made that didn't save |
| Storage | The biggest data file against the relay's 1 MB limit; whole files only, not numbered parts |
| Daily Check on GitHub | The morning check ran, with its restore-point result |
| This Page | The version stamp |
| Rule Checks | 21+ automatic checks that the rules above hold, such as start dates, IIF tiers, the IIF amount from Shared Rules, champion levels, senders, level prices, duplicate Company IDs and broken merges |

When you add an incoming connection, add a row here so a failed hand-off shows up on its own.

---

## Safety Net (what's in place)

- Source in this repo; `CHANGELOG.md`; this guide; Help in the page.
- Automatic checks on every save (Page Checks), and the same checks before anything goes live (Publish a Version).
- Every published version kept in `releases/`, with one-button rollback.
- Version stamp on the page, and a reload bar when a newer version is out.
- System Health, the Daily Health Check on GitHub, and the Issues Log.
- Page safety list (Content-Security-Policy). If you add a new place the page loads code from or sends data to, add
  it to the list in the test copy; it goes live with the next publish.
- Archive, never delete: build anything that removes records so it sets them aside where they can be brought back,
  never so it deletes them for good.

---

## Working Safely

- **Stay in your lane.** Edit only Member 360 (this repo and `member-360-data`). Never edit another system's page or
  code, even for a small hand-off. Put what another system needs where it already reads, or tell Jonna which
  system's Claude needs to make the matching change. That includes the Membership Desk, which is its own page in
  `GitMISMO.github.io/membership-desk`.
- **Never overwrite newer work.** Fetch the newest copy right before every save, and apply only your own edits.
- **The relay saves about 1 MB a file at most.** Watch file sizes when a collection grows, and split it into parts
  or its own file (see `aptify/terms`).
- Functions are inside one big script (an IIFE). Later blocks are added just before the boot line
  (`if(document.readyState==="loading")…boot…`) and may wrap earlier functions.
- The page and this repo are public: test only with made-up records, and never commit member data.
- Plain language with Jonna. Do the work rather than handing her steps.


## Contacts Who Leave a Company (Nov 20, 2026)

In a contact's edit form, No Longer with This Company calls `ctFormer(o,p,box)`. The contact comes off the list the same way Remove Contact does it (`contacts.removed` for Aptify contacts, out of `contacts.added` for added ones), and a snapshot goes in `contacts.former[key]` = `{name,title,email,phone,roles,src,at,by,edit|added}`. `contactsOv` carries `former`, so every contacts save keeps it. `fillContacts` lists them under a collapsed Former Contacts section. Bring Back (and Undo right after marking) calls `ctBack(o,key,box)`, which restores the edit or the added row and drops the snapshot. Former contacts are not in `o.people`, so they get no emails, are left out of targeted lists and hold no roles.


## Forwarded Email Files Kept Small (Nov 21, 2026)

The relay saves and reads back a file of about 1 MB at most. The whole text of a logged 360@ email goes in `mailfull-YYYY-MM-wN` (one file a week; older emails stay in their monthly `mailfull-YYYY-MM` file and `m360ShowFull` looks in both). `data/mailin` (written by the 360 Mailbox flow) keeps every forwarded email; once a logged or skipped email is a week old (by `received`), `m360Archive` copies its `m.body` to `mailarch-YYYY-MM-wN` and then clears it from mailin, marking the email `arch` with that file name. It runs at most once a day per person, 30 seconds after `m360Run`, up to 150 emails a run, and re-reads mailin before saving so nothing the flow just added is lost. `m360ShowMail` and `m360ShowFull` load the text back with `m360ArchBody`. Emails that still need a company are never archived. The mailin stubs still grow by about 4 KB a day, so check the file size every few months.


The relay refuses a single save that takes too much out of a file at once (a safety rule), so `m360Archive` clears two emails a save with a short pause, re-reading mailin each time, and stops for the day if a save is still refused after three tries. It also marks its daily run before starting, so a refusal never repeats all day (Jonna chose this over changing the relay, Nov 21, 2026). Archive copies are saved under `m360ArchId(id)` because mailin ids contain a slash.


## New Members Report by Join Date (Nov 21, 2026)

Jonna: the New Members page should be the new members for the month she picks, not the deals the team logged ("committed"). `nmRows(useFilters, month)` builds one row per new member from `memberJoins()` for the month in `dl-month` (or the twelve months through this one when none is picked, `nmBack()`). A join with a New Member deal within 120 days (`nmDeal`) uses the deal: price, terms, term dates, `dealPaid`, `by` and its AP status. A join with no deal gets its amount from the Financial System (`nmPay`: membership or Square payments near the join date; for IIF lenders every IIF payment that calendar year), or the level's price (`listPrice`, or `iifMin()` for IIF) when nothing has come in, and AP status "No AP Needed". `renderDeals`, the tiles, the headline, `m3dDress` (Dollars by Level, Paid in the Financial System) and `paidNotReported` all read `nmRows`, and `dealsShown()` is now the deals among those rows, so Download for AP and Mark Shown as Sent to AP still only touch deals. `m3jDress` keeps the month chart but no longer draws the separate Joined In list.

## IIF Invoice Copies (Nov 22, 2026)

From the FY27 cycle, MERS emails each lender its IIF invoice (about 3,500 on Jan 27, 2027) and copies invfee@. MBA IT
spreads the copies over five shared mailboxes (iifcopies1@ to iifcopies5@) so none bounce. Member 360 owns the
intake; nothing else hooks into Member 360. **Only the index comes in, never a PDF, and nothing is sent.**

How the copies get here (the contract is in the Connections Map):

1. Flow **Member 360 - IIF Invoice Copies** (one copy per mailbox, on Jonna's license; concurrency 1) saves each PDF
   to the Q Drive folder "IIF FY27 Invoices" and adds one row per PDF to the table **Copies** in its own mailbox's
   workbook, `fy27-index-1.xlsx` to `fy27-index-5.xlsx` in the OneDrive folder "IIF FY27 Invoice Index" (one workbook per
   mailbox, so the five flows never write to the same file). Columns, read by name (add, never rename): Received, Mailbox,
   To, Subject, Body, Invoice Number, Amount, PDF Name, PDF Link, Message ID. Received, To and PDF Link are required.
   Invoice Number and Amount may be left blank: Member 360 reads them from Subject and Body.
2. Flow **Member 360 - IIF Invoice Index to GitHub** (every 30 minutes, on its own GitHub key, member-360-data only)
   saves each workbook changed since its last run to `member-360-data/data/iif-invoices/<same name>` (a few
   saves an hour, not one per email, so GitHub's limits are never hit).
3. GitHub job **IIF Invoice Copies** (`iif-invoices.yml`, `scripts/m360_iif_invoices.py`) reads every workbook in
   `data/iif-invoices/` and writes `data/iifinv.json` (doc `iifinv/main`: parts, rows, updatedAt, files, mailboxes,
   problems) and `data/iifinv-p0.json`, `-p1` and so on (`{rows:[{id, r, mb, to, s, b, inv, amt, fn, url, mid}]}`,
   under 600 KB each). A workbook without the required columns fails the run (GitHub emails Jonna).
4. Member 360 reads `iifinv/main` and its parts (straight through the relay, read only).

In Member 360 (`IIV`, `iiv…` functions in the page):

- **Expected** comes from the Aptify pull: every Innovation Investment Fee order (Quotation or Regular, not
  cancelled) in the Orders sheet, kept in `aptify/iifq` (`q: {orderId: [companyId, amount, orderDate, Q|R, name]}`)
  and replaced with each pull. The cycle is the order date's year.
- **Invoice number (confirmed Nov 22, 2026):** the email body says "Innovation Investment Fee (IIF) invoice #" and a
  7-digit number, which is the Aptify order ID of the lender's IIF quotation. Checked: 6208839 (Erin's sample) is PHH
  Mortgage's FY26 IIF quotation in the Aptify pull; 34 of the 35 FY26 invoice PDFs on the Q Drive
  (MISMO/Active Documents/Innovation Investment Fee/2026) that show "Invoice No" are IIF orders in the pull (the 35th
  is a 2025 order); and 97 of 98 FY26 IIF payments in MISMO Money carry an IIF order number in the pull (the 98th was
  paid after that pull). The PDF reads "Invoice No : 6208839 … Current Invoice Amount" and also shows the 7-digit MERS
  ORG ID, so a bare 7-digit number is only trusted when it is one of the quotations (`IIV_PARSE`).
- **Matching:** invoice number first; then the To address to a contact here to one company and that company's
  quotation for the year; then the PDF's name (an Aptify company ID, then the lender's exact name; last cycle's were
  "<Lender> 2026 MISMO IIF Invoice" and "<Lender> - 2026 IIF Invoice - <company ID>"). Run against last cycle's 3,376
  IIF orders: invoice number 3,376 of 3,376; with the number removed, email 3,041 right and none wrong.
- **Test copies:** a workbook with "test" in its name (for example `fy27-test-index.xlsx` for IT's end-to-end test)
  marks its rows `t: 1`, and so does every copy received before `IIV_LIVE` (2027-01-26), since IT's end-to-end test
  (by Jan 8, 2027) runs through the real mailboxes. They stay out of the counts and payment matching unless Show Test
  Copies is selected. Move `IIV_LIVE` only if MERS's send date moves.
- **Payments:** matched invoice numbers feed payment matching (`iivOrgOf`, used by `mmMatcher` and
  `payerResolved`), so a payment against the invoice is credited to the lender and the IIF benefits apply.
- **Bounce reports:** Upload Bounce Report on the IIF Cycle page reads IT's export (CSV or Excel; placeholder
  columns: Recipient/To/Email, Subject, Status, Date; only failed rows). Bounces are kept in `iifinvx/main`
  (`b`, never deleted, and `ups`, the last 50 uploads) and matched by invoice number, then the copy sent to that
  address, then the address's company.
- **On the IIF Cycle page:** the FY27 Invoice Copies panel (tiles Expected, Received, Missing, Bounced, Not Matched;
  each lender with its status, invoice, amount, received date, mailbox and a link to the PDF, or Copy Q Drive Path
  when the link isn't a web address; Download This List). On This Year it shows the newest cycle from FY27 on once
  its quotations or copies arrive (`IIV_FROM`).

## Membership Applications (Nov 22, 2026)

The chain, end to end (an application is never lost: it is saved before anything else runs):

1. resources.mismo.org/member-360/apply/ posts to the flow **MISMO Membership Application - Submission**.
2. The flow saves it to `data/applications.json` (one doc per reference; a resubmit replaces it, never duplicates), then the logo to `data/logos/<id>.<ext>`, reads `data/quotes.json` for a dues deal, sends the branded email to membership@ (copied: Amy, Kelly, Jonna, Vanessa), then answers the page. Read quotes, Deal rows and Build the rows run even if the step before failed, so the logo or the deal lookup can never stop the email. Lesson (Nov 20 to 22): `createArray()` with no arguments is invalid in Power Automate and failed every application; use `json('[]')`.
3. GitHub job **Membership Application PDFs** (`member-360-data`, `application-pdfs.yml`, `scripts/m360_application_pdfs.py`) writes `data/application-pdfs/<id>.pdf` (with the logo) and `index.json` on each application or logo save. A run that loses the race to the other save resets to the newest main and makes the PDFs again.
4. Member 360 (`m360AppRun`) matches the application to a company (never by MISMO's or MBA's domains) or adds a new prospect (`appNewProspect`: last 60 days, only when nothing could be the company), sets 7 - Application Submitted, brings over the website and logo. `appPdfOpen` opens the PDF.
5. The Membership Desk's To Do is written by Member 360 (`deskSync`) whenever someone has Member 360 open; the set-up shows Open the Application (PDF) (`deskAppPdf`). The email to membership@ is the immediate notice.

To take a test application out of Member 360 and the Desk, set `test: true` and `withdrawn: true` on it in `data/applications.json`; the record and its PDF stay.

**Complimentary memberships:** `comp: {why, years, by, at}` on the record's overrides (Complimentary Membership in Stage, owner and outreach settings). `curStatus` returns FREE for those years, so `memKind` is Free everywhere; `nmRows` shows them as Complimentary, $0; the Desk says Complimentary: no invoice. Older free members carry FREE from the Smartsheet tracker.

Later on Nov 22, 2026:

- Applicant email: the flow's Compose **Applicant email** builds it from the application. **Email the applicant** sends it after Response (Jonna's Outlook connection, Reply To membership@). It runs only when Response succeeded, so a resubmit never re-emails the applicant. **Is this an applicant email resend** (right after the Compose): a POST of a saved application with `action: "applicant-email"` sends only that email, answers and stops. That's how one applicant gets it again.
- Failure alert: **Did the submission have a problem** runs after Email the applicant on any status. If Save the application or the membership@ email (Send an email (V2)) didn't succeed, **Alert Jonna** emails Jonna only, with a link to the run.
- Desk copy: the last step of `application-pdfs.yml` copies `data/applications.json` (tests removed with jq) and their PDFs to `membership-desk-data` with the secret DESK_DATA_KEY (Jonna's fine-grained key, Contents read and write on that repo only, expires Nov 23, 2027). With no secret it skips with a warning.
- Old Smartsheet form entries: docs with `oldForm: true` (ids `OLD-...`) are counted on Home's New Applications tile (M360_OLDAPPS) and nowhere else. m360Apps leaves them out of M360_APPS, the PDF script skips them, and the Desk skips them.
- Late joiners: a full-price new membership that starts in October or later ends on Dec 31 of the next year, lender or not. dealDefaults applies it unless the terms are Dues Deal. deskSetupFor applies it when the item has no end date yet, unless it is a Square special or its price is below the level's list price (listPrice). The Desk's own application set-ups do the same (website applications are always list price).
