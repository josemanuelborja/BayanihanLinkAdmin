# BayanihanLink role and system architecture

## Application roles and separation

| Actor | Inside BayanihanLink? | Responsibilities |
| --- | --- | --- |
| App Admin | Yes | Manages the platform and user accounts (account management is not implemented in this prototype); reviews request completeness/consistency; assigns application priority; organizes records; reviews offers; coordinates assistance; manages overall request/offer statuses and progress. Does not make DSWD's external eligibility or donation-suitability decision. |
| DSWD Officer | Yes, limited workspace | Reviews reported disaster genuineness/eligibility and linked donation suitability, then records those two assessment outcomes. Does not manage platform users, assign priority, or manage overall distribution/status workflows. DSWD remains a government partner whose official systems/processes are not replaced. |

## Components

- Angular frontend: App Admin workspaces for platform administration and a separate DSWD validation queue/review page (`/dswd/login`, `/dswd/dashboard`, `/dswd/review/:id`). The DSWD page exposes only disaster eligibility and donation suitability decisions.
- External Partner Coordination: App Admin workspace for follow-up and coordination. It does not send messages or call DSWD systems.
- JavaScript/Express API: read-only dashboard/request/offer endpoints over the existing JSON file. There is no authentication/authorization middleware or DSWD API integration.
- Data: `bayanihanlink-be/data/db.json`; this is a JSON file, not MongoDB. See [data model](data-model.md).

## Important implementation boundary

Both login handlers are prototypes, not credential authentication. The DSWD route guard relies on a browser session marker and is not a security boundary. Validation decisions currently update only the in-memory demo array and are not persisted by the API. Before production, implement approved identities, server-side role authorization, decision persistence/audit, and least-privilege access; keep DSWD limited to validation operations. Do not connect to external DSWD systems without explicit authorization.
