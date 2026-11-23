# Member 360 Changelog

One line per change people would notice. Newest first.

## How changes go live

- Every change goes to the test copy first: https://resources.mismo.org/member-360/test/ (`test/index.html`). The test copy reads the real data but saves nothing and sends no email.
- Page Checks runs on every save. Jonna makes the test copy live with Actions > Publish a Version, which runs the same checks first, keeps every version in `releases/` and can roll back to any of them. Nobody uploads `index.html` by hand. Full guide: DEVELOPING.md.

## 2026-11-23

- Contacts from Industry Events (live Nov 23, 2026; Change Notice CN-003, approved by Jonna): the people the team meets at industry events, kept on each event in Team HQ, now come into Member 360. A company Member 360 doesn't have yet becomes a prospect (source: Industry event); each person shows on the company's Activity as a note with the event, where and when, and whether to follow up. Member 360 only reads Team HQ, never changes it, and the notes never count as the team's Last Touch. System Health has a Team HQ Industry Events row. See Help, Contacts from Industry Events.
- 2027 Status (live Nov 23, 2026, so Strategic Growth can stop keeping the Membership Tracker): every organization now shows its status for the coming season in the Membership Tracker's own words: PAID - Renewed, PAID - New, PAID - 2026 New Member w 2027 Membership, 2 yr Membership Thru 2027 and Deals, Payment in Process - Renewal, Not Renewed Yet (Lender or Non-Lender), Comped, Subsidiary (Covered by Parent), LOST - and why, and Potential Member. It is worked out from Aptify, the Financial System and what the team already sets here, so nobody keeps it by hand. It is a column and a filter on Members and Prospects, a tag on each record, a filter in Targeted Lists and a column in the Excel download. Today it matches the Renewal Season exactly: 81 renewed, 8 paying now, 1 lost, 87 still to renew.
- Member Directory: each member's Lender or Industry on the website now follows Membership Stats. Paying members go by their Lender or Non-Lender kind; Free and Subsidiary members are listed as if they paid, from their own record (member type, then a Lender or IIF status or history). categories.json is now built from the same member list, so it no longer overrides members.json with Aptify company types. Today: 790 members, 539 Lender (536 + 3 Free) and 251 Industry (230 + 21 Free and Subsidiary).

## 2026-11-22

- Home: On Your Plate shows only the signed-in person's own follow-ups. A New Applications tile (this month, names, how many still to set up) replaces Outreach This Week, and Team Activity is off Home (it stays in Activity).
- Applications: each applicant gets a "We've received your application" email from Jonna's mailbox (replies go to membership@). Jonna, alone, gets an alert when an application doesn't save or the membership@ email doesn't send. The thank-you page now says the membership team sends the invoice to the Billing Contact.
- The Membership Desk gets its own copy of the applications and their PDFs, so a new application reaches its To Do without Member 360 open, and the team opens the PDF with Desk access only.
- New members: a full-price membership starting Oct 1 or later runs through Dec 31 of the next year, lender or not (deal defaults and Desk set-up dates). A deal (below list price, a dues deal or a Square special) keeps its own dates.
- Richey May and Vision VMC (old Smartsheet form, Nov 16 and 19) count on the New Applications tile; old-form entries get no prospect, Desk item or PDF.
- "Comped" instead of "Complimentary" on New Members, the membership journey and the Desk.
- IIF Cycle: the header line sits beside the intro, links to IIF Planning HQ and says invoices go out in late January; key dates fill their rows evenly; "Tomorrow" instead of "In 1 days".
- Membership applications: since Nov 20 every application failed after saving (the dues-deal lookup in the application flow broke), so membership@ got no email and the applicant was told it hadn't gone through. Fixed; a problem with the logo or the dues-deal lookup can no longer stop the membership email or the applicant's confirmation. Doss Docs' application was sent to membership@ again. Jonna and Vanessa are now copied on each application email.
- An application from a company Member 360 doesn't have yet is added as a prospect (source: Membership application) at 7 - Application Submitted. MISMO's and MBA's own domains never match an application to a company.
- Open the Application (PDF) on the company record (Logo, Website and Payments) and on the Membership Desk set-up: every application gets a PDF copy with its logo.
- New member set-ups no longer show an unpaid application's price as Amount Paid.
- Complimentary Membership on the record (Stage, owner and outreach settings): in kind, comped or subsidiary. It counts as Free, is never chased for payment, and shows as Complimentary on New Members and the Membership Desk. John Stoner and Thomas Sitzler marked Comped.
- Member 360 emails and the 360@ mailbox were down from Nov 20 (their GitHub key stopped working); the key was replaced Nov 22.
- IIF Invoice Copies: the invoice number is confirmed as the Aptify order ID of the lender's IIF quotation (from Erin's sample copies); the lender's email, then the company ID or name in the PDF's file name, are the fallbacks. Copies received before Jan 26, 2027 (IT's end-to-end test) count as test copies, kept out of the counts and payments.
- Elections HQ is now Leadership HQ: the one mention here, a style comment, is renamed. Nothing on the page changes; the elections-hq address stays.
- IIF Cycle: FY27 Invoice Copies. The invoice copies MERS sends to invfee@ (from Jan 27, 2027) are matched to each lender’s IIF quotation from the Aptify pull, by invoice number or by the lender’s email. The page shows what’s expected, received, missing, bounced and not matched, with a link to each Q Drive PDF, and Download This List. Upload Bounce Report takes IT’s export of failed messages. Matched invoices feed payment matching. Only the list comes in, never a PDF.
- Membership application (apply/): the header now matches the www.mismo.org Home page (no dark shading, no small blue label above the title) and the Log In link is gone from the top bar.

## 2026-11-21

- New Members: the whole page is now about who joined in the month you pick (it opens on this month). The table lists every new member by join date, not only deals logged here, with what each is worth, whether they've paid and an AP status (No AP Needed for members already in Aptify or set up through Square). Dollars by Level and Paid in the Financial System count the same members. The month list reads New Members in (not Committed in), All Months is now Last 12 Months, and the separate Joined In list is gone because the table shows them.

## 2026-11-09

- Forwarded emails: an email forwarded to 360@ no longer waits for the person who forwarded it to open Member 360. Anyone on the team who can make changes logs it when they open Member 360, still credited to whoever forwarded it. Home shows a Forwarded Emails tile, in place of Next Summit for people who can make changes, with the emails that need a company and a Pick button for each. Activity now says Waiting to be logged.

## 2026-11-08

- Reading copy for the president's Claude project: every morning the Member 360 Reading Copy job in member-360-data writes reading-copy/, plain CSV files with a README covering members, renewals, engagement and people, using this page's own code. It checks the files against Home and Membership Stats before saving and writes nothing if they differ. If a change renames a function it uses or changes what Home or Membership Stats say, run that job by hand after publishing. See DEVELOPING.md, Scheduled Jobs.
- Developer guide: DEVELOPING.md covers what Member 360 does and who uses it, where everything lives, how a change goes live, every scheduled job, every connection (matching the Connections Map), Jonna's rules and decisions, and what System Health watches. README points to it; Help stays the guide for the people who use the page.
- Publish a Version: changes go to the test copy, and Actions > Publish a Version makes them live only after Page Checks pass, saving every version in releases/ with one-run rollback. Page Checks now also fails if index.html is uploaded by hand or if the test copy couldn't be published.
- System Health opens from the menu every time (it sometimes only changed the page address).
- Issues Log: new automatic issue, Members with No Website (current member companies; individual Sole members left out), 109 at launch.
- The weekly Aptify pull is automatic: Reporting Services (report Member360_AptifyPull) emails one workbook every Monday at 6 AM to Jonna and 360@mba.org; the flow Member 360 - Aptify Weekly Pull saves it to member-360-data/data/aptify-pull/, the GitHub job Aptify Weekly Pull checks it (aptifypull/main), and Member 360 loads it by itself. First run Nov 8 (3,494 terms, 970 companies, 9,359 orders, contacts).
- The workbook now also carries new members' contacts (orders shipped in the last 45 days), so the InvFee Member Contacts export no longer has to be uploaded by hand.
- Settings > Aptify takes one workbook with several sheets as well as separate files. System Health has an Aptify Weekly Email row.
- Membership Desk: the MISMO Cases sheet in the same workbook loads the Desk's case numbers by itself when an administrator opens the Desk (first run Nov 8, 830 cases). Dropping a file still works.
- New monthly report MISMO_Monthly_Orders_With_Batch (reports.mba.org, Mismo folder): MISMO orders for the last two full months with each order's orders batch, emailed to Jonna on the 15th.

## 2026-11-07

- Aptify upload: membership terms are saved in their own file (aptify/terms) from the next weekly upload, cutting the main Aptify file from 85% of the 1 MB save limit to about 30%.
- Daily Health Check on GitHub (member-360-data): runs every morning even when nobody has Member 360 open; feeds, email flow, storage, restore points; emails Jonna when red; shown on System Health.
- Restore points checked daily: every data file as it stood a day ago must read back cleanly. Steps to restore a file are in the Technical Guide.
- The email flow accepts the daily check's report (step health-report).
- Membership Desk: version stamp on Help, update notice, and page safety list.
- Page Checks on every save (GitHub Actions): scripts must parse, no keys or tokens, test copy saving off and live on, safety list present.
- Version stamp on Settings and System Health; a bar asks to reload when a newer version is live.
- Page safety list (Content-Security-Policy): the page may only load code from and send data to the save relay, cdnjs, jsDelivr and Google Fonts.
- Technical guide and runbook: https://claude.ai/artifact/UJDU19Nwhz2TzQwKqvkjrV
- Rule Checks on System Health: 21 made-up examples and data checks run through the real code; a failure turns red and alerts. Storage shows data files against the 1 MB save limit.
- The IIF amount from Shared Rules is now used in benefit levels, stats and checks too (no more fixed $1,000 in the code); an unused duplicate of the champion-tier code removed.
- Test copies of Member 360 and the Membership Desk.
- System Health page (Jonna only): feed freshness, email flow, failed emails, failed saves; email alert to Jonna when anything turns red (at most one a day).
- Failed saves from any copy of Member 360 are logged to System Health.
- Membership Desk payments and terms match by Aptify Company ID first; a matching name never overrides two different IDs.
- Merged records show the merged record's notes; six duplicate Aptify ID pairs merged (old names still find the record).
- Placeholder Company IDs ("Not in Aptify") count as no ID, so those records no longer show as duplicates.
- Shared Rules under Settings: who can send email, the IIF amount that makes a lender a member when there's no deal, the start-date cutoff day, champion levels. The email flow reads the sender list from here.
- Playbooks: Preview for every email; every test email is copied to Jonna.
- Kelly can send from Member 360 in her own name; Targeted List Email in Playbooks; Sent from Targeted Lists history.
- Targeted Lists: filters, contact roles, saved lists, Copy Emails, Excel.
- Payment in Process sales stage, shown on Home and on the Membership Desk as new member or renewal.
