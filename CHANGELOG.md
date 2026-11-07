# Member 360 Changelog

One line per change people would notice. Newest first.

## How changes go live

- Every change goes to the test copy first: https://resources.mismo.org/member-360/test/ (Membership Desk: https://resources.mismo.org/membership-desk/test/). The test copy reads the real data but saves nothing and sends no email.
- Once it works there, the same change is applied to the live page, after checking the live copy hasn't changed since (other Claude sessions also save to these repositories).

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
