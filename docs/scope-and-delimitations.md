# Scope and delimitations

## In scope

- App Admin platform administration and a separate least-privilege DSWD validation role.
- App Admin management and monitoring of application users, requests, priorities, offers, coordination records, and statuses (where those features are implemented).
- App Admin review of request completeness and consistency, priority assignment under application criteria, offer review, and monitoring of request/donation progress.
- DSWD validation of disaster genuineness/eligibility and donation suitability in its limited validation workspace. App Admin retains platform administration, priority assignment, and overall status/progress management.
- Existing request and offer data remain intact.

## Explicitly out of scope

- DSWD access to user administration, priority assignment, offer administration, general status monitoring, or App Admin-only functions.
- Automated DSWD API calls, system-to-system transfer, or automatic data sharing.
- Treating an App Admin-entered status as an official DSWD decision unless it was externally confirmed and authorized.

## Current prototype gaps (not silently represented as completed)

- Both login forms are navigation placeholders and do not authenticate credentials. The DSWD guard uses a client-side session marker only.
- The Express API has no authentication or authorization middleware. Server-side least-privilege role enforcement remains a production requirement.
- No user-account collection or management screen exists in the inspected files.
- The DSWD decision queue and saved assessment state are demo-only browser memory; the read-only API does not persist these changes.
- The current data store is `db.json`, not MongoDB. No MongoDB collections or models were found.
