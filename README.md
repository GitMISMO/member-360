# member-360

Member 360: every member and prospect's full relationship with MISMO in one place.
Live at https://resources.mismo.org/member-360/ (sign-in required). This is the copy the team uses, and changes save
to the member data. The test copy is at https://resources.mismo.org/member-360/test/.

**Working on Member 360? Read [DEVELOPING.md](DEVELOPING.md) first.** It covers where everything lives, how a change
goes live, the scheduled jobs, every connection, Jonna's rules and decisions, and what System Health watches.
Help, inside the page, is the guide for the people who use it.

In short:

- Changes go to `test/index.html` only. Nobody uploads `index.html` by hand; Page Checks fails if anyone does.
- **Actions › Publish a Version** makes the test copy live once the checks pass. Run it again with an earlier version
  from `releases/index.json` to roll back.
- The member data lives in the private `member-360-data` repo and is read through the resources.mismo.org save relay
  under the project key `member-360`. No token, secret or member data is ever kept in this repo.
- Who can do what is set per person in People & Access: Admin and Staff can change records; View is read-only.
- Every change people would notice gets a line in [CHANGELOG.md](CHANGELOG.md).
