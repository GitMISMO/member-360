# Member 360 Changelog

One line per change people would notice. Newest first.

## How changes go live

- Every change goes to the test copy first: https://resources.mismo.org/member-360/test/ (Membership Desk: https://resources.mismo.org/membership-desk/test/). The test copy reads the real data but saves nothing and sends no email.
- Once it works there, the same change is applied to the live page, after checking the live copy hasn't changed since (other Claude sessions also save to these repositories).

## 2026-11-07

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
