# BayanihanLink Admin

BayanihanLink has two application roles with deliberately separate permissions:

- **App Admin** manages the platform, request completeness and priority, donation/assistance offers, coordination, and overall workflow/status records.
- **DSWD Officer** uses a limited validation workspace to assess whether a reported disaster is genuine/eligible and whether an associated donation is suitable. DSWD does not manage platform users, assign request priority, or administer overall distribution/status workflows.

The DSWD validation workspace does not replace official DSWD systems. There is no external DSWD API, automatic integration, or automatic transfer to external systems. The current validation queue and decisions are prototype data held in browser memory.

## Development

```bash
npm install
npm start
```

The Angular app runs at `http://localhost:4200`. The companion JavaScript API is in `C:\Users\ASUS\OneDrive\Desktop\bayanihanlink-be`; start it with `npm run dev` from that folder (default port 3000). Its current data source is `data/db.json`.

## Documentation

- [Role and system architecture](docs/architecture.md)
- [Validation activity diagram](docs/activity-diagram.md)
- [Data model and ERD](docs/data-model.md)
- [Scope and delimitations](docs/scope-and-delimitations.md)

## Validation

Run `npm test -- --watch=false` and `npm run build`.

> **Prototype security/data limitation:** Both login handlers are front-end placeholders; the DSWD flow sets a browser session marker, not a verified identity. The Express API has no authentication/authorization middleware. The DSWD validation data is not persisted to the backend. Do not treat this as production-secure until identity, role enforcement, persistence, and audit requirements are implemented.
